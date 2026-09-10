import { Buffer } from "node:buffer";

async function encryptionKey() {
  const secret = process.env["CENTRAL_CREDENTIAL_ENCRYPTION_KEY"];
  if (!secret) throw new Error("Credential encryption is unavailable");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt", "decrypt"]);
}

export async function encryptCredential(value: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    await encryptionKey(),
    new TextEncoder().encode(value),
  );
  return `${Buffer.from(iv).toString("base64")}.${Buffer.from(encrypted).toString("base64")}`;
}

export async function decryptCredential(value: string) {
  const [ivPart, payloadPart] = value.split(".");
  if (!ivPart || !payloadPart) throw new Error("Invalid encrypted credential");
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: Buffer.from(ivPart, "base64") },
    await encryptionKey(),
    Buffer.from(payloadPart, "base64"),
  );
  return new TextDecoder().decode(decrypted);
}

export function maskCredential(value: string) {
  const prefix = value.includes("_") ? `${value.split("_")[0]}_` : "key_";
  return `${prefix}••••••••••••••••`;
}