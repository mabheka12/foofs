BEGIN;

-- ============================================================
-- CONTRACTORS: owner-enriched fields
-- ============================================================

ALTER TABLE public.contractors
ADD COLUMN IF NOT EXISTS price_range varchar(20);

ALTER TABLE public.contractors
ADD COLUMN IF NOT EXISTS pricing_notes text;

ALTER TABLE public.contractors
ADD COLUMN IF NOT EXISTS minimum_job_price numeric(10,2);

ALTER TABLE public.contractors
ADD COLUMN IF NOT EXISTS price_currency varchar(3) DEFAULT 'USD';

ALTER TABLE public.contractors
ADD COLUMN IF NOT EXISTS owner_updated_at timestamp without time zone;

ALTER TABLE public.contractors
ADD COLUMN IF NOT EXISTS ownership_verified boolean DEFAULT false;


-- ============================================================
-- BUSINESS CLAIMS: stable Supabase user identity
-- ============================================================

ALTER TABLE public.business_claims
ADD COLUMN IF NOT EXISTS user_id uuid;


-- Backfill claims from auth.users using email
UPDATE public.business_claims bc
SET user_id = au.id
FROM auth.users au
WHERE bc.user_id IS NULL
  AND lower(bc.user_email) = lower(au.email);


CREATE INDEX IF NOT EXISTS idx_business_claims_user_id
ON public.business_claims(user_id);


-- ============================================================
-- CONTRACTOR USERS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.contractor_users (
  id serial PRIMARY KEY,

  contractor_id integer NOT NULL
    REFERENCES public.contractors(id)
    ON DELETE CASCADE,

  user_id uuid NOT NULL,

  user_email varchar(255),

  role varchar(30) NOT NULL DEFAULT 'owner',

  status varchar(30) NOT NULL DEFAULT 'active',

  verified_at timestamp without time zone DEFAULT now(),

  created_at timestamp without time zone DEFAULT now(),

  CONSTRAINT contractor_users_contractor_user_unique
    UNIQUE (contractor_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_contractor_users_user
ON public.contractor_users(user_id);

CREATE INDEX IF NOT EXISTS idx_contractor_users_contractor
ON public.contractor_users(contractor_id);


-- ============================================================
-- PROFILE UPDATE REQUESTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.contractor_update_requests (
  id serial PRIMARY KEY,

  contractor_id integer NOT NULL
    REFERENCES public.contractors(id)
    ON DELETE CASCADE,

  submitted_by uuid NOT NULL,

  changes jsonb NOT NULL,

  previous_values jsonb,

  status varchar(30) NOT NULL DEFAULT 'pending',

  admin_notes text,

  reviewed_by uuid,

  created_at timestamp without time zone DEFAULT now(),

  reviewed_at timestamp without time zone
);

CREATE INDEX IF NOT EXISTS idx_contractor_updates_status
ON public.contractor_update_requests(status);

CREATE INDEX IF NOT EXISTS idx_contractor_updates_contractor
ON public.contractor_update_requests(contractor_id);

CREATE INDEX IF NOT EXISTS idx_contractor_updates_user
ON public.contractor_update_requests(submitted_by);


-- ============================================================
-- CONTRACTOR MEDIA
-- ============================================================

CREATE TABLE IF NOT EXISTS public.contractor_media (
  id serial PRIMARY KEY,

  contractor_id integer NOT NULL
    REFERENCES public.contractors(id)
    ON DELETE CASCADE,

  storage_path text NOT NULL,

  media_type varchar(30) DEFAULT 'gallery',

  alt_text varchar(255),

  caption text,

  sort_order integer DEFAULT 0,

  status varchar(30) DEFAULT 'pending',

  uploaded_by uuid,

  admin_notes text,

  reviewed_by uuid,

  reviewed_at timestamp without time zone,

  created_at timestamp without time zone DEFAULT now()
);

ALTER TABLE public.contractor_media
ADD COLUMN IF NOT EXISTS admin_notes text;

ALTER TABLE public.contractor_media
ADD COLUMN IF NOT EXISTS reviewed_by uuid;

ALTER TABLE public.contractor_media
ADD COLUMN IF NOT EXISTS reviewed_at timestamp without time zone;

CREATE INDEX IF NOT EXISTS idx_contractor_media_contractor
ON public.contractor_media(contractor_id);

CREATE INDEX IF NOT EXISTS idx_contractor_media_status
ON public.contractor_media(status);


-- ============================================================
-- BACKFILL OWNERSHIP FROM ALREADY APPROVED CLAIMS
-- ============================================================

INSERT INTO public.contractor_users (
  contractor_id,
  user_id,
  user_email,
  role,
  status,
  verified_at
)
SELECT
  bc.contractor_id,
  bc.user_id,
  bc.user_email,
  COALESCE(bc.role, 'owner'),
  'active',
  now()
FROM public.business_claims bc
WHERE bc.status = 'approved'
  AND bc.contractor_id IS NOT NULL
  AND bc.user_id IS NOT NULL
ON CONFLICT (contractor_id, user_id)
DO UPDATE SET
  user_email = EXCLUDED.user_email,
  role = EXCLUDED.role,
  status = 'active',
  verified_at = COALESCE(
    public.contractor_users.verified_at,
    now()
  );


UPDATE public.contractors c
SET ownership_verified = true
WHERE EXISTS (
  SELECT 1
  FROM public.contractor_users cu
  WHERE cu.contractor_id = c.id
    AND cu.status = 'active'
);


COMMIT;