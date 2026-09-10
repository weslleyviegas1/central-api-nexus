ALTER TABLE public.organizations ADD COLUMN owner_user_id uuid;
ALTER TABLE public.organizations ALTER COLUMN owner_user_id SET NOT NULL;
GRANT INSERT ON public.organizations TO authenticated;
GRANT INSERT ON public.memberships TO authenticated;

DROP POLICY organizations_owner_read ON public.organizations;
DROP POLICY organizations_owner_update ON public.organizations;
DROP POLICY memberships_read_self ON public.memberships;

ALTER FUNCTION public.current_organization_id() SECURITY INVOKER;
ALTER FUNCTION public.claim_owner() SECURITY INVOKER;
REVOKE ALL ON FUNCTION public.current_organization_id() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.claim_owner() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_organization_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_owner() TO authenticated;

CREATE POLICY memberships_read_self ON public.memberships FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY memberships_first_owner_insert ON public.memberships FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid()
  AND role = 'owner'
  AND EXISTS (SELECT 1 FROM public.organizations o WHERE o.id = organization_id AND o.owner_user_id = auth.uid())
  AND NOT EXISTS (SELECT 1 FROM public.memberships)
);
CREATE POLICY organizations_owner_read ON public.organizations FOR SELECT TO authenticated USING (owner_user_id = auth.uid());
CREATE POLICY organizations_first_owner_insert ON public.organizations FOR INSERT TO authenticated WITH CHECK (
  owner_user_id = auth.uid() AND singleton = true AND NOT EXISTS (SELECT 1 FROM public.organizations)
);
CREATE POLICY organizations_owner_update ON public.organizations FOR UPDATE TO authenticated USING (owner_user_id = auth.uid()) WITH CHECK (owner_user_id = auth.uid());
CREATE POLICY credentials_no_direct_access ON public.credentials FOR ALL TO authenticated USING (false) WITH CHECK (false);

CREATE OR REPLACE FUNCTION public.claim_owner()
RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE v_org uuid; v_user uuid := auth.uid();
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'authentication_required' USING ERRCODE = '42501'; END IF;
  SELECT organization_id INTO v_org FROM public.memberships WHERE user_id = v_user;
  IF v_org IS NOT NULL THEN RETURN v_org; END IF;
  IF EXISTS (SELECT 1 FROM public.organizations) THEN RAISE EXCEPTION 'owner_already_exists' USING ERRCODE = '42501'; END IF;
  INSERT INTO public.organizations(owner_user_id) VALUES(v_user) RETURNING id INTO v_org;
  INSERT INTO public.memberships(organization_id,user_id) VALUES(v_org,v_user);
  RETURN v_org;
END $$;
REVOKE ALL ON FUNCTION public.claim_owner() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_owner() TO authenticated;