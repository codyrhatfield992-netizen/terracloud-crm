-- Leads stage
ALTER TABLE public.leads ALTER COLUMN stage SET DEFAULT 'new';
UPDATE public.leads SET stage = LOWER(stage);
UPDATE public.leads SET stage = 'new' WHERE stage NOT IN ('new','contacted','tour','offer','contract','closed','dead');

-- Leads priority
ALTER TABLE public.leads ALTER COLUMN priority SET DEFAULT 'medium';
UPDATE public.leads SET priority = LOWER(priority);
UPDATE public.leads SET priority = 'medium' WHERE priority NOT IN ('low','medium','high','urgent');

-- Properties status
ALTER TABLE public.properties ALTER COLUMN status SET DEFAULT 'available';
UPDATE public.properties SET status = CASE
  WHEN LOWER(status) IN ('new','available') THEN 'available'
  WHEN LOWER(status) = 'under contract' OR LOWER(status) = 'under_contract' THEN 'under_contract'
  WHEN LOWER(status) = 'sold' THEN 'sold'
  WHEN LOWER(status) = 'off market' OR LOWER(status) = 'off_market' THEN 'off_market'
  ELSE 'available'
END;

-- Tasks priority
ALTER TABLE public.tasks ALTER COLUMN priority SET DEFAULT 'medium';
UPDATE public.tasks SET priority = LOWER(priority);
UPDATE public.tasks SET priority = 'medium' WHERE priority NOT IN ('low','medium','high','urgent');

-- Contacts type
ALTER TABLE public.contacts ALTER COLUMN type SET DEFAULT 'seller';
UPDATE public.contacts SET type = LOWER(type);
UPDATE public.contacts SET type = 'seller' WHERE type NOT IN ('seller','buyer','agent','other');