ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS vat_percent numeric,
  ADD COLUMN IF NOT EXISTS payment_method text;