-- YourFin database schema for Supabase PostgreSQL.
-- Run through database.py using the project DATABASE_URL.
--
-- Destructive reset requested: this permanently removes all existing financial
-- profile rows and replaces the table with only the current profile fields.
DROP TABLE IF EXISTS public.financial_profiles;

CREATE TABLE public.financial_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email_address TEXT,
    full_name TEXT,
    age INTEGER,
    employment_status TEXT,
    monthly_income NUMERIC(14, 2),
    total_expenses NUMERIC(14, 2),
    total_debt NUMERIC(14, 2),
    financial_goal TEXT,
    country TEXT,
    currency TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Loan applications are submitted by the public React application through the
-- FastAPI service. They are intentionally separate from financial_profiles,
-- which is reserved for authenticated Supabase users.
CREATE TABLE IF NOT EXISTS public.loan_applications (
    id UUID PRIMARY KEY,
    first_name TEXT NOT NULL CHECK (char_length(trim(first_name)) >= 2),
    last_name TEXT NOT NULL CHECK (char_length(trim(last_name)) >= 2),
    email_address TEXT NOT NULL CHECK (char_length(trim(email_address)) > 0),
    phone_number TEXT NOT NULL CHECK (char_length(trim(phone_number)) >= 7),
    loan_amount NUMERIC(14, 2) NOT NULL CHECK (loan_amount > 0 AND loan_amount <= 100000),
    loan_term_months INTEGER NOT NULL CHECK (loan_term_months > 0 AND loan_term_months <= 360),
    loan_purpose TEXT NOT NULL CHECK (loan_purpose IN ('home', 'car', 'education', 'medical', 'debt', 'business', 'other')),
    approved BOOLEAN NOT NULL,
    decision_reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS loan_applications_created_at_idx
    ON public.loan_applications (created_at DESC);

-- Financial-plan submissions come from the public React onboarding flow. They
-- are not tied to Supabase Auth because the current frontend uses demo login.
CREATE TABLE IF NOT EXISTS public.financial_plan_submissions (
    id UUID PRIMARY KEY,
    email_address TEXT NOT NULL CHECK (char_length(trim(email_address)) > 0),
    full_name TEXT NOT NULL CHECK (char_length(trim(full_name)) >= 2),
    age INTEGER NOT NULL CHECK (age BETWEEN 18 AND 120),
    employment_status TEXT NOT NULL,
    country TEXT NOT NULL,
    currency TEXT NOT NULL,
    monthly_income NUMERIC(14, 2) NOT NULL CHECK (monthly_income > 0),
    financial_details JSONB NOT NULL,
    goals JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS financial_plan_submissions_created_at_idx
    ON public.financial_plan_submissions (created_at DESC);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.financial_profiles (id, email_address)
    VALUES (NEW.id, NEW.email)
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auth users remain after the profile reset, so recreate their blank profiles.
INSERT INTO public.financial_profiles (id, email_address)
SELECT auth_user.id, auth_user.email
FROM auth.users AS auth_user
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_financial_profiles_updated_at ON public.financial_profiles;
CREATE TRIGGER set_financial_profiles_updated_at
    BEFORE UPDATE ON public.financial_profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.financial_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own financial profile" ON public.financial_profiles;
CREATE POLICY "Users can view their own financial profile"
    ON public.financial_profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own financial profile" ON public.financial_profiles;
CREATE POLICY "Users can insert their own financial profile"
    ON public.financial_profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own financial profile" ON public.financial_profiles;
CREATE POLICY "Users can update their own financial profile"
    ON public.financial_profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);