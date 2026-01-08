

-- 1. DROP old policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Customers can view own data" ON customers;

-- 2. CREATE new policies - CHO PHÉP INSERT
CREATE POLICY "Users can insert own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- 3. Customers policies
CREATE POLICY "Customers can insert own data" 
ON customers FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Customers can view own data" 
ON customers FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Customers can update own data" 
ON customers FOR UPDATE 
USING (auth.uid() = id);