
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

-- 8. INSERT SAMPLE DATA
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