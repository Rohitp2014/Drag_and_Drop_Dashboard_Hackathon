/*
  # Create users and sales tables with sample data

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `department` (text)
      - `region` (text)
      - `created_at` (timestamp)
    - `sales_records`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `date` (date)
      - `customer` (text)
      - `product` (text)
      - `category` (text)
      - `quantity` (integer)
      - `unit_price` (numeric)
      - `total_amount` (numeric)
      - `region` (text)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public access (for demo purposes)
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  department text NOT NULL,
  region text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create sales_records table
CREATE TABLE IF NOT EXISTS sales_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  date date NOT NULL,
  customer text NOT NULL,
  product text NOT NULL,
  category text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL,
  total_amount numeric(10,2) NOT NULL,
  region text NOT NULL,
  status text NOT NULL CHECK (status IN ('completed', 'pending', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_records ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for demo purposes)
CREATE POLICY "Allow public read access on users"
  ON users
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access on sales_records"
  ON sales_records
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert on sales_records"
  ON sales_records
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update on sales_records"
  ON sales_records
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow public delete on sales_records"
  ON sales_records
  FOR DELETE
  TO public
  USING (true);

-- Insert 10 sample users
INSERT INTO users (name, email, department, region) VALUES
  ('John Smith', 'john.smith@company.com', 'Sales', 'North America'),
  ('Sarah Johnson', 'sarah.johnson@company.com', 'Sales', 'Europe'),
  ('Mike Davis', 'mike.davis@company.com', 'Marketing', 'North America'),
  ('Emily Chen', 'emily.chen@company.com', 'Sales', 'Asia Pacific'),
  ('David Wilson', 'david.wilson@company.com', 'Operations', 'Europe'),
  ('Lisa Brown', 'lisa.brown@company.com', 'Sales', 'Latin America'),
  ('Robert Taylor', 'robert.taylor@company.com', 'Marketing', 'North America'),
  ('Jennifer Lee', 'jennifer.lee@company.com', 'Sales', 'Asia Pacific'),
  ('Michael Garcia', 'michael.garcia@company.com', 'Operations', 'Latin America'),
  ('Amanda White', 'amanda.white@company.com', 'Sales', 'Europe');

-- Insert sample sales data for each user
DO $$
DECLARE
  user_record RECORD;
  i INTEGER;
  sample_customers TEXT[] := ARRAY['Acme Corp', 'TechStart Inc', 'Global Solutions', 'Innovation Labs', 'Future Systems', 'Digital Dynamics', 'Smart Solutions', 'NextGen Tech'];
  sample_products TEXT[] := ARRAY['Pro Software License', 'Enterprise Suite', 'Mobile App', 'Cloud Storage', 'Analytics Platform', 'Security Package', 'API Access', 'Premium Support'];
  sample_categories TEXT[] := ARRAY['Software', 'Services', 'Hardware', 'Consulting'];
  sample_statuses TEXT[] := ARRAY['completed', 'pending', 'cancelled'];
  random_date DATE;
  random_quantity INTEGER;
  random_unit_price NUMERIC;
  random_total NUMERIC;
BEGIN
  FOR user_record IN SELECT id, region FROM users LOOP
    FOR i IN 1..15 LOOP
      random_date := CURRENT_DATE - (random() * 90)::INTEGER;
      random_quantity := (random() * 10 + 1)::INTEGER;
      random_unit_price := (random() * 500 + 50)::NUMERIC(10,2);
      random_total := random_quantity * random_unit_price;
      
      INSERT INTO sales_records (
        user_id, date, customer, product, category, quantity, 
        unit_price, total_amount, region, status
      ) VALUES (
        user_record.id,
        random_date,
        sample_customers[(random() * array_length(sample_customers, 1) + 1)::INTEGER],
        sample_products[(random() * array_length(sample_products, 1) + 1)::INTEGER],
        sample_categories[(random() * array_length(sample_categories, 1) + 1)::INTEGER],
        random_quantity,
        random_unit_price,
        random_total,
        user_record.region,
        sample_statuses[(random() * array_length(sample_statuses, 1) + 1)::INTEGER]
      );
    END LOOP;
  END LOOP;
END $$;