import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const environmentSchema = z.enum(["development", "staging", "production"]);
const appInput = z.object({
  name: z.string().trim().min(1).max(80),
  applicationId: z.string().trim().regex(/^app_[a-z0-9][a-z0-9_-]{2,63}$/i),
  description: z.string().trim().max(500).default(""),
  environment: environmentSchema,
  apiBaseUrl: z.string().url().max(500),
  apiVersion: z.string().trim().min(1).max(30),
  apiKey: z.string().min(8).max(4096),
  centralWebhookUrl: z.string().url().max(500).optional().or(z.literal("")),
  webhookSigningSecret: z.string().min(16).max(4096).optional().or(z.literal("")),
});

type AuthContext = {
  supabase: Parameters<Parameters<typeof requireSupabaseAuth>["options"]["server"]>[0] extends never ? never : never;
};

function requestId() { return crypto.randomUUID(); }

async function getOrganization(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.from("memberships").select("organization_id").eq("user_id", context.userId).maybeSingle();
  if (error) throw new Error("Unable to verify access");
  if (!data) throw new Error("OWNER_REQUIRED");
  return data.organization_id as string;
}

async function audit(organizationId: string, userId: string, action: string, resourceType: string, resourceId: string | null, metadata: Record<string, unknown>, id: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("audit_logs").insert({ organization_id: organizationId, actor_user_id: userId, action, resource_type: resourceType, resource_id: resourceId, metadata, request_id: id });
  if (error) console.error("Audit write failed", { requestId: id, action });
}

export const claimOwner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const id = requestId();
    const { data, error } = await context.supabase.rpc("claim_owner");
    if (error) throw new Error(`OWNER_UNAVAILABLE:${id}`);
    return { organizationId: data, requestId: id };
  });

export const getOwnerAvailability = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { count, error } = await supabaseAdmin.from("memberships").select("id", { count: "exact", head: true });
  if (error) throw new Error("Unable to verify registration availability");
  return { available: count === 0 };
});

export const getHubState = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const organizationId = await getOrganization(context);
    const [applications, environments, integrations, connections, permissions] = await Promise.all([
      context.supabase.from("applications").select("*").eq("organization_id", organizationId).order("visual_order"),
      context.supabase.from("application_environments").select("*").eq("organization_id", organizationId),
      context.supabase.from("integrations").select("*").eq("organization_id", organizationId),
      context.supabase.from("connections").select("*").eq("organization_id", organizationId).order("created_at"),
      context.supabase.from("integration_permissions").select("*").eq("organization_id", organizationId),
    ]);
    const firstError = [applications, environments, integrations, connections, permissions].find((result) => result.error)?.error;
    if (firstError) throw new Error("Unable to load the ecosystem");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: credentials, error: credentialError } = await supabaseAdmin.from("credentials")
      .select("id,integration_id,credential_type,masked_value,status,rotated_at,revoked_at,version")
      .eq("organization_id", organizationId);
    if (credentialError) throw new Error("Unable to load credential metadata");
    return { organizationId, applications: applications.data ?? [], environments: environments.data ?? [], integrations: integrations.data ?? [], credentials: credentials ?? [], connections: connections.data ?? [], permissions: permissions.data ?? [] };
  });

export const createApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => appInput.parse(data))
  .handler(async ({ data, context }) => {
    const id = requestId();
    const organizationId = await getOrganization(context);
    const { validateExternalUrl } = await import("./ssrf-guard.server");
    await validateExternalUrl(data.apiBaseUrl, data.environment);
    if (data.centralWebhookUrl) await validateExternalUrl(data.centralWebhookUrl, data.environment);
    const actor = context.userId;
    const { data: application, error: appError } = await context.supabase.from("applications").insert({
      organization_id: organizationId, application_id: data.applicationId, name: data.name, description: data.description,
      api_version: data.apiVersion, created_by: actor, updated_by: actor, visual_order: Date.now(), position_x: 18, position_y: 18,
    }).select().single();
    if (appError || !application) throw new Error(`APPLICATION_CREATE_FAILED:${id}`);
    const { data: env, error: envError } = await context.supabase.from("application_environments").insert({
      organization_id: organizationId, application_id: application.id, environment: data.environment,
      api_base_url: data.apiBaseUrl, api_version: data.apiVersion, created_by: actor, updated_by: actor,
    }).select().single();
    if (envError || !env) throw new Error(`ENVIRONMENT_CREATE_FAILED:${id}`);
    const { data: integration, error: integrationError } = await context.supabase.from("integrations").insert({
      organization_id: organizationId, application_id: application.id, environment_id: env.id,
      central_webhook_url: data.centralWebhookUrl || null, created_by: actor, updated_by: actor,
    }).select().single();
    if (integrationError || !integration) throw new Error(`INTEGRATION_CREATE_FAILED:${id}`);
    const { encryptCredential, maskCredential } = await import("./credential-crypto.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const credentials = [{ type: "api_key", value: data.apiKey }, ...(data.webhookSigningSecret ? [{ type: "webhook_signing_secret", value: data.webhookSigningSecret }] : [])];
    const rows = await Promise.all(credentials.map(async (credential) => ({
      organization_id: organizationId, integration_id: integration.id, credential_type: credential.type,
      encrypted_value: await encryptCredential(credential.value), masked_value: maskCredential(credential.value), created_by: actor, updated_by: actor,
    })));
    const { error: credentialError } = await supabaseAdmin.from("credentials").insert(rows);
    if (credentialError) throw new Error(`CREDENTIAL_CREATE_FAILED:${id}`);
    await audit(organizationId, actor, "application.created", "application", application.id, { environment: data.environment, application_id: data.applicationId }, id);
    await audit(organizationId, actor, "integration.created", "integration", integration.id, { environment: data.environment }, id);
    await audit(organizationId, actor, "credential.created", "credential", integration.id, { types: credentials.map((item) => item.type) }, id);
    return { id: application.id, requestId: id };
  });

export const updateMapPosition = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ applicationId: z.string().uuid(), x: z.number().min(0).max(100), y: z.number().min(0).max(100) }).parse(data))
  .handler(async ({ data, context }) => {
    const organizationId = await getOrganization(context);
    const { error } = await context.supabase.from("applications").update({ position_x: data.x, position_y: data.y, updated_by: context.userId }).eq("id", data.applicationId).eq("organization_id", organizationId);
    if (error) throw new Error(`MAP_UPDATE_FAILED:${requestId()}`);
    return { ok: true };
  });

export const setMapVisibility = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ applicationId: z.string().uuid(), visible: z.boolean() }).parse(data))
  .handler(async ({ data, context }) => {
    const id = requestId();
    const organizationId = await getOrganization(context);
    const { error } = await context.supabase.from("applications").update({ visible_on_map: data.visible, updated_by: context.userId }).eq("id", data.applicationId).eq("organization_id", organizationId);
    if (error) throw new Error(`MAP_VISIBILITY_FAILED:${id}`);
    await audit(organizationId, context.userId, data.visible ? "application.restored_to_map" : "application.removed_from_map", "application", data.applicationId, {}, id);
    return { ok: true, requestId: id };
  });

export const createConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ sourceApplicationId: z.string().uuid(), destinationApplicationId: z.string().uuid(), environment: environmentSchema, permissions: z.array(z.enum(["read","write","events","webhooks","health"])).min(1) }).parse(data))
  .handler(async ({ data, context }) => {
    const id = requestId();
    if (data.sourceApplicationId === data.destinationApplicationId) throw new Error(`SELF_CONNECTION_NOT_ALLOWED:${id}`);
    const organizationId = await getOrganization(context);
    const { data: existing } = await context.supabase.from("connections").select("*").eq("source_application_id", data.sourceApplicationId).eq("destination_application_id", data.destinationApplicationId).eq("environment", data.environment).maybeSingle();
    if (existing) return { connection: existing, existing: true, requestId: id };
    const { data: connection, error } = await context.supabase.from("connections").insert({ organization_id: organizationId, source_application_id: data.sourceApplicationId, destination_application_id: data.destinationApplicationId, environment: data.environment, status: "active", created_by: context.userId, updated_by: context.userId }).select().single();
    if (error || !connection) throw new Error(`CONNECTION_CREATE_FAILED:${id}`);
    const { error: permissionError } = await context.supabase.from("integration_permissions").insert(data.permissions.map((scope) => ({ organization_id: organizationId, connection_id: connection.id, scope, created_by: context.userId })));
    if (permissionError) throw new Error(`PERMISSION_CREATE_FAILED:${id}`);
    await audit(organizationId, context.userId, "connection.created", "connection", connection.id, { environment: data.environment, permissions: data.permissions }, id);
    return { connection, existing: false, requestId: id };
  });

export const setConnectionStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ connectionId: z.string().uuid(), enabled: z.boolean() }).parse(data))
  .handler(async ({ data, context }) => {
    const id = requestId();
    const organizationId = await getOrganization(context);
    const status = data.enabled ? "active" : "disabled";
    const { error } = await context.supabase.from("connections").update({ status, updated_by: context.userId }).eq("id", data.connectionId).eq("organization_id", organizationId);
    if (error) throw new Error(`CONNECTION_UPDATE_FAILED:${id}`);
    await audit(organizationId, context.userId, data.enabled ? "connection.enabled" : "connection.disabled", "connection", data.connectionId, {}, id);
    return { ok: true, requestId: id };
  });

export const testConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ applicationId: z.string().uuid(), environment: environmentSchema }).parse(data))
  .handler(async ({ data, context }) => {
    const id = requestId();
    const organizationId = await getOrganization(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: env } = await supabaseAdmin.from("application_environments").select("*").eq("organization_id", organizationId).eq("application_id", data.applicationId).eq("environment", data.environment).maybeSingle();
    if (!env) throw new Error(`ENVIRONMENT_NOT_FOUND:${id}`);
    const { data: integration } = await supabaseAdmin.from("integrations").select("id").eq("organization_id", organizationId).eq("environment_id", env.id).maybeSingle();
    if (!integration) throw new Error(`INTEGRATION_NOT_FOUND:${id}`);
    const { data: credential } = await supabaseAdmin.from("credentials").select("encrypted_value,status").eq("organization_id", organizationId).eq("integration_id", integration.id).eq("credential_type", "api_key").maybeSingle();
    if (!credential || credential.status !== "active") throw new Error(`CREDENTIAL_UNAVAILABLE:${id}`);
    const started = Date.now();
    let status: "operational" | "degraded" | "offline" | "auth_required" = "offline";
    let httpStatus: number | null = null;
    let safeError: string | null = null;
    let responseBody: Record<string, unknown> = {};
    try {
      const { decryptCredential } = await import("./credential-crypto.server");
      const { safeHealthFetch } = await import("./ssrf-guard.server");
      const response = await safeHealthFetch(env.api_base_url, env.health_path, data.environment, await decryptCredential(credential.encrypted_value));
      httpStatus = response.status;
      if (response.status === 401 || response.status === 403) status = "auth_required";
      else if (response.ok) status = "operational";
      else if (response.status >= 500) status = "offline";
      else status = "degraded";
      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) responseBody = z.record(z.unknown()).catch({}).parse(await response.json());
      if (responseBody.application_id && responseBody.application_id !== (await supabaseAdmin.from("applications").select("application_id").eq("id", data.applicationId).single()).data?.application_id) status = "degraded";
    } catch (error) {
      safeError = error instanceof Error && error.message.includes("allowed") ? error.message : "Connection could not be established";
    }
    const latency = Date.now() - started;
    await supabaseAdmin.from("application_environments").update({ status, last_checked_at: new Date().toISOString(), latency_ms: latency, last_http_status: httpStatus, last_error: safeError, last_request_id: id, updated_by: context.userId }).eq("id", env.id).eq("organization_id", organizationId);
    await audit(organizationId, context.userId, "integration.tested", "integration", integration.id, { environment: data.environment, status, http_status: httpStatus, latency_ms: latency }, id);
    return { status, httpStatus, latencyMs: latency, error: safeError, requestId: id };
  });