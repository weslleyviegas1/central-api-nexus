CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE public.app_status AS ENUM ('active','disabled','pending','error','archived');
CREATE TYPE public.environment_name AS ENUM ('development','staging','production');
CREATE TYPE public.health_status AS ENUM ('not_tested','operational','degraded','unstable','offline','auth_required','disabled','revoked');
CREATE TYPE public.connection_status AS ENUM ('active','disabled','pending','error','revoked');
CREATE TYPE public.permission_scope AS ENUM ('read','write','events','webhooks','health');
CREATE TYPE public.credential_status AS ENUM ('active','disabled','revoked');

CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Central API Hub',
  singleton boolean NOT NULL DEFAULT true CHECK (singleton),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.organizations TO authenticated;
GRANT ALL ON public.organizations TO service_role;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX organizations_single_owner_idx ON public.organizations(singleton);

CREATE TABLE public.memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'owner' CHECK (role = 'owner'),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(organization_id)
);
GRANT SELECT ON public.memberships TO authenticated;
GRANT ALL ON public.memberships TO service_role;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY memberships_read_self ON public.memberships FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.current_organization_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT organization_id FROM public.memberships WHERE user_id = auth.uid() LIMIT 1
$$;
GRANT EXECUTE ON FUNCTION public.current_organization_id() TO authenticated;

CREATE POLICY organizations_owner_read ON public.organizations FOR SELECT TO authenticated USING (id = public.current_organization_id());
CREATE POLICY organizations_owner_update ON public.organizations FOR UPDATE TO authenticated USING (id = public.current_organization_id()) WITH CHECK (id = public.current_organization_id());

CREATE OR REPLACE FUNCTION public.claim_owner()
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_org uuid; v_user uuid := auth.uid();
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'authentication_required' USING ERRCODE = '42501'; END IF;
  PERFORM pg_advisory_xact_lock(70421001);
  SELECT organization_id INTO v_org FROM public.memberships WHERE user_id = v_user;
  IF v_org IS NOT NULL THEN RETURN v_org; END IF;
  IF EXISTS (SELECT 1 FROM public.memberships) THEN RAISE EXCEPTION 'owner_already_exists' USING ERRCODE = '42501'; END IF;
  INSERT INTO public.organizations DEFAULT VALUES RETURNING id INTO v_org;
  INSERT INTO public.memberships(organization_id,user_id) VALUES(v_org,v_user);
  RETURN v_org;
END $$;
GRANT EXECUTE ON FUNCTION public.claim_owner() TO authenticated;

CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  application_id text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  status public.app_status NOT NULL DEFAULT 'pending',
  api_version text NOT NULL DEFAULT 'v1',
  visible_on_map boolean NOT NULL DEFAULT true,
  position_x numeric(6,3) NOT NULL DEFAULT 20 CHECK (position_x BETWEEN 0 AND 100),
  position_y numeric(6,3) NOT NULL DEFAULT 20 CHECK (position_y BETWEEN 0 AND 100),
  visual_order integer NOT NULL DEFAULT 0,
  version integer NOT NULL DEFAULT 1,
  created_by uuid NOT NULL,
  updated_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id, application_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY applications_owner_all ON public.applications FOR ALL TO authenticated USING (organization_id = public.current_organization_id()) WITH CHECK (organization_id = public.current_organization_id() AND created_by = auth.uid() AND updated_by = auth.uid());

CREATE TABLE public.application_environments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  environment public.environment_name NOT NULL,
  api_base_url text NOT NULL,
  api_version text NOT NULL DEFAULT 'v1',
  health_path text NOT NULL DEFAULT '/api/integration/v1/health',
  status public.health_status NOT NULL DEFAULT 'not_tested',
  last_checked_at timestamptz,
  latency_ms integer,
  last_http_status integer,
  last_error text,
  last_request_id uuid,
  version integer NOT NULL DEFAULT 1,
  created_by uuid NOT NULL,
  updated_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(application_id, environment)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.application_environments TO authenticated;
GRANT ALL ON public.application_environments TO service_role;
ALTER TABLE public.application_environments ENABLE ROW LEVEL SECURITY;
CREATE POLICY app_env_owner_all ON public.application_environments FOR ALL TO authenticated USING (organization_id = public.current_organization_id()) WITH CHECK (organization_id = public.current_organization_id() AND created_by = auth.uid() AND updated_by = auth.uid());

CREATE TABLE public.integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  environment_id uuid NOT NULL REFERENCES public.application_environments(id) ON DELETE CASCADE,
  status public.app_status NOT NULL DEFAULT 'pending',
  central_webhook_url text,
  webhook_status public.health_status NOT NULL DEFAULT 'not_tested',
  version integer NOT NULL DEFAULT 1,
  created_by uuid NOT NULL,
  updated_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(application_id, environment_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.integrations TO authenticated;
GRANT ALL ON public.integrations TO service_role;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY integrations_owner_all ON public.integrations FOR ALL TO authenticated USING (organization_id = public.current_organization_id()) WITH CHECK (organization_id = public.current_organization_id() AND created_by = auth.uid() AND updated_by = auth.uid());

CREATE TABLE public.credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  integration_id uuid NOT NULL REFERENCES public.integrations(id) ON DELETE CASCADE,
  credential_type text NOT NULL CHECK (credential_type IN ('api_key','webhook_signing_secret')),
  encrypted_value text NOT NULL,
  masked_value text NOT NULL,
  status public.credential_status NOT NULL DEFAULT 'active',
  rotated_at timestamptz,
  revoked_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  created_by uuid NOT NULL,
  updated_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(integration_id, credential_type)
);
GRANT ALL ON public.credentials TO service_role;
ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  source_application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  destination_application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  environment public.environment_name NOT NULL,
  status public.connection_status NOT NULL DEFAULT 'pending',
  last_activity_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  created_by uuid NOT NULL,
  updated_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK(source_application_id <> destination_application_id),
  UNIQUE(source_application_id,destination_application_id,environment)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.connections TO authenticated;
GRANT ALL ON public.connections TO service_role;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY connections_owner_all ON public.connections FOR ALL TO authenticated USING (organization_id = public.current_organization_id()) WITH CHECK (organization_id = public.current_organization_id() AND created_by = auth.uid() AND updated_by = auth.uid());

CREATE TABLE public.integration_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  connection_id uuid NOT NULL REFERENCES public.connections(id) ON DELETE CASCADE,
  scope public.permission_scope NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(connection_id,scope)
);
GRANT SELECT, INSERT, DELETE ON public.integration_permissions TO authenticated;
GRANT ALL ON public.integration_permissions TO service_role;
ALTER TABLE public.integration_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY permissions_owner_all ON public.integration_permissions FOR ALL TO authenticated USING (organization_id = public.current_organization_id()) WITH CHECK (organization_id = public.current_organization_id() AND created_by = auth.uid());

CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  actor_user_id uuid NOT NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  request_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_owner_read ON public.audit_logs FOR SELECT TO authenticated USING (organization_id = public.current_organization_id());

CREATE OR REPLACE FUNCTION public.set_updated_at_version()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); NEW.version = OLD.version + 1; RETURN NEW; END $$;
CREATE TRIGGER applications_updated BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_version();
CREATE TRIGGER app_env_updated BEFORE UPDATE ON public.application_environments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_version();
CREATE TRIGGER integrations_updated BEFORE UPDATE ON public.integrations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_version();
CREATE TRIGGER credentials_updated BEFORE UPDATE ON public.credentials FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_version();
CREATE TRIGGER connections_updated BEFORE UPDATE ON public.connections FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_version();

CREATE INDEX applications_org_idx ON public.applications(organization_id);
CREATE INDEX app_env_org_app_idx ON public.application_environments(organization_id,application_id);
CREATE INDEX integrations_org_app_idx ON public.integrations(organization_id,application_id);
CREATE INDEX credentials_integration_idx ON public.credentials(integration_id);
CREATE INDEX connections_org_source_idx ON public.connections(organization_id,source_application_id);
CREATE INDEX connections_org_destination_idx ON public.connections(organization_id,destination_application_id);
CREATE INDEX audit_org_created_idx ON public.audit_logs(organization_id,created_at DESC);