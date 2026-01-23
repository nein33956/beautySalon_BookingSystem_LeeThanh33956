

-- 1. PROFILES TABLE
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  role TEXT CHECK (role IN ('admin', 'customer')) DEFAULT 'customer',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CUSTOMERS TABLE
CREATE TABLE customers (
  id UUID REFERENCES profiles(id) PRIMARY KEY,
  date_of_birth DATE,
  address TEXT,
  total_visits INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. STAFF TABLE
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  specialization TEXT,
  avatar_url TEXT,
  bio TEXT,
  years_of_experience INTEGER,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. SERVICES TABLE
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. BOOKINGS TABLE
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id),
  staff_id UUID REFERENCES staff(id),
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancel_reason TEXT
);

-- 6. ENABLE ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- 7. RLS POLICIES
-- Services: Everyone can read
CREATE POLICY "Services are viewable by everyone" 
ON services FOR SELECT 
USING (true);

-- Profiles: Users can view their own
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- Profiles: Users can update their own
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- Customers: Users can view their own
CREATE POLICY "Customers can view own data" 
ON customers FOR SELECT 
USING (auth.uid() = id);

-- Bookings: Customers can view their own
CREATE POLICY "Customers can view own bookings" 
ON bookings FOR SELECT 
USING (auth.uid() = customer_id);

-- Bookings: Customers can create bookings
CREATE POLICY "Customers can create bookings" 
ON bookings FOR INSERT 
WITH CHECK (auth.uid() = customer_id);

-- ============================================
-- 8. INSERT SAMPLE DATA
-- ============================================

-- Sample Services
INSERT INTO services (name, description, duration, price, category, is_active) VALUES
('Haircut', 'Professional haircuts for men and women', 70, 200000, 'Hair', true),
('Hair Coloring', 'Full hair coloring with premium products', 120, 500000, 'Hair', true),
('Hair Styling', 'Special occasion hairstyling', 75, 180000, 'Hair', true),
('Nail Art', 'Custom nail designs and art', 100, 400000, 'Nails', true),
('Manicure & Pedicure', 'Complete nail care', 120, 300000, 'Nails', true),
('Massage', 'Full body relaxation massage', 120, 800000, 'Spa', true);

-- Sample Staff
INSERT INTO staff (name, phone, specialization, years_of_experience, is_available) VALUES
('Võ Lê Thành', '0901234567', 'Hair Stylist', 5, true),
('Hoàng Thanh Trà', '0912345678', 'Nail Artist', 3, true),
('Andrey Santos', '0912345678', 'Massage Therapist', 3, true),
('Mason Mount', '0912345678', 'Hair Stylistt', 3, true),
('Bryan Mbeumo', '0912345678', 'Nail Artist', 3, true),
('Le Van C', '0923456789', 'Massage Therapist', 4, true);

-- Chạy trong Supabase SQL Editor
CREATE OR REPLACE FUNCTION get_server_date()
RETURNS DATE AS $$
BEGIN
  RETURN CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;






-- bật lại RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- xóa policy cũ (an toàn)
DROP POLICY IF EXISTS profiles_select ON profiles;
DROP POLICY IF EXISTS profiles_insert ON profiles;
DROP POLICY IF EXISTS profiles_update ON profiles;

DROP POLICY IF EXISTS customers_select ON customers;
DROP POLICY IF EXISTS customers_insert ON customers;
DROP POLICY IF EXISTS customers_update ON customers;

DROP POLICY IF EXISTS bookings_select ON bookings;
DROP POLICY IF EXISTS bookings_insert ON bookings;
DROP POLICY IF EXISTS bookings_update ON bookings;

DROP POLICY IF EXISTS services_select ON services;
DROP POLICY IF EXISTS services_insert ON services;
DROP POLICY IF EXISTS services_update ON services;
DROP POLICY IF EXISTS services_delete ON services;

-- ai cũng xem được profile của chính mình
CREATE POLICY profiles_select
ON profiles
FOR SELECT
USING (id = auth.uid());

-- tạo profile khi signup
CREATE POLICY profiles_insert
ON profiles
FOR INSERT
WITH CHECK (id = auth.uid());

-- update profile của chính mình
CREATE POLICY profiles_update
ON profiles
FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- admin xem tất cả, customer chỉ xem mình
CREATE POLICY customers_select
ON customers
FOR SELECT
TO authenticated
USING (
  -- admin xem tất cả
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
  )
  -- customer chỉ xem chính mình
  OR id = auth.uid()
);

CREATE POLICY customers_insert
ON customers
FOR INSERT
TO authenticated
WITH CHECK (
  id = auth.uid()
);


CREATE POLICY customers_update
ON customers
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
  )
  OR id = auth.uid()
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
  )
  OR id = auth.uid()
);




CREATE POLICY bookings_select
ON bookings
FOR SELECT
TO authenticated
USING (
  -- admin thấy hết
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
  )
  -- customer chỉ thấy booking của mình
  OR customer_id = auth.uid()
);
CREATE POLICY bookings_insert
ON bookings
FOR INSERT
TO authenticated
WITH CHECK (
  customer_id = auth.uid()
);

-- UPDATE (admin hoặc chủ booking)
CREATE POLICY bookings_update
ON bookings
FOR UPDATE
TO authenticated
USING (
  -- admin update tất cả
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
  )
  -- customer chỉ update booking của mình
  OR customer_id = auth.uid()
)
WITH CHECK (
  -- đảm bảo không đổi booking sang người khác
  customer_id = auth.uid()
);







-- SELECT: ai cũng xem được
CREATE POLICY services_select
ON services
FOR SELECT
USING (true);

-- admin CRUD
CREATE POLICY services_insert
ON services
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY services_update
ON services
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY services_delete
ON services
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);




CREATE POLICY staff_all
ON staff
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);













DELETE FROM customers
WHERE id IN (
  SELECT id FROM profiles WHERE role = 'admin'
);


CREATE POLICY customers_only_customer_role
ON customers
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'customer'
  )
);
