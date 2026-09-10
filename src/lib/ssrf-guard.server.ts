import { z } from "zod";

const blockedNames = new Set(["localhost", "localhost.localdomain", "metadata.google.internal"]);

function isBlockedIpv4(ip: string) {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return false;
  const [a, b] = parts;
  return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127) || a >= 224;
}

function isBlockedAddress(address: string) {
  const normalized = address.toLowerCase().replace(/^\[|\]$/g, "");
  return isBlockedIpv4(normalized) || normalized === "::1" || normalized === "::" ||
    normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") || normalized.startsWith("fea") || normalized.startsWith("feb") ||
    normalized.startsWith("::ffff:127.") || normalized.startsWith("::ffff:10.") || normalized.startsWith("::ffff:192.168.");
}

async function resolvePublicAddresses(hostname: string) {
  if (isBlockedAddress(hostname)) throw new Error("Destination is not allowed");
  const answers: string[] = [];
  for (const type of ["A", "AAAA"]) {
    const response = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=${type}`, {
      headers: { accept: "application/dns-json" },
      signal: AbortSignal.timeout(4_000),
    });
    if (!response.ok) continue;
    const body = z.object({ Answer: z.array(z.object({ data: z.string() })).optional() }).parse(await response.json());
    for (const answer of body.Answer ?? []) {
      if (/^[0-9a-f:.]+$/i.test(answer.data)) answers.push(answer.data);
    }
  }
  if (answers.length === 0 || answers.some(isBlockedAddress)) throw new Error("Destination is not publicly reachable");
}

export async function validateExternalUrl(rawUrl: string, environment: "development" | "staging" | "production") {
  const url = new URL(rawUrl);
  if (url.username || url.password) throw new Error("URLs with embedded credentials are not allowed");
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error("Only HTTP and HTTPS URLs are allowed");
  if (environment === "production" && url.protocol !== "https:") throw new Error("Production requires HTTPS");
  const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
  if (!hostname || blockedNames.has(hostname) || hostname.endsWith(".local") || hostname.endsWith(".internal")) {
    throw new Error("Destination is not allowed");
  }
  await resolvePublicAddresses(hostname);
  return url;
}

export async function safeHealthFetch(baseUrl: string, healthPath: string, environment: "development" | "staging" | "production", apiKey: string) {
  const base = await validateExternalUrl(baseUrl, environment);
  const target = new URL(healthPath.replace(/^\/+/, ""), `${base.toString().replace(/\/+$/, "")}/`);
  if (target.origin !== base.origin) throw new Error("Health endpoint must use the configured API origin");
  await validateExternalUrl(target.toString(), environment);
  return fetch(target, {
    method: "GET",
    redirect: "manual",
    signal: AbortSignal.timeout(10_000),
    headers: {
      accept: "application/json",
      authorization: `Bearer ${apiKey}`,
      "x-request-id": crypto.randomUUID(),
    },
  });
}