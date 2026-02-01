CREATE TABLE IF NOT EXISTS invoice_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  logo_url TEXT,
  company_name TEXT DEFAULT 'LST Travel Agency',
  contact_person TEXT DEFAULT 'Yodli Hagos Mebratu',
  address TEXT DEFAULT 'Düsseldorfer Straße 14',
  postal TEXT DEFAULT '60329 Frankfurt a/M',
  email TEXT DEFAULT 'info@lst-travel.de',
  phone TEXT DEFAULT '069/75848875',
  mobile TEXT DEFAULT '0160/2371650',
  tax_id TEXT DEFAULT 'DE340914297',
  website TEXT DEFAULT 'www.lsttravel.de',
  bank_name TEXT DEFAULT 'Commerzbank AG',
  iban TEXT DEFAULT 'DE28 5134 0013 0185 3597 00',
  bic TEXT DEFAULT 'COBADEFFXXX'
);

ALTER TABLE invoice_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Invoice settings read own"
  ON invoice_settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Invoice settings insert own"
  ON invoice_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Invoice settings update own"
  ON invoice_settings
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Invoice settings delete own"
  ON invoice_settings
  FOR DELETE
  USING (auth.uid() = user_id);
