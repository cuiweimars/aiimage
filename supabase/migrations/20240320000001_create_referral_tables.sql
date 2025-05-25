-- Create referral_codes table
CREATE TABLE IF NOT EXISTS public.referral_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) NOT NULL,
    code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create referrals table
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id UUID REFERENCES public.users(id) NOT NULL,
    referred_id UUID REFERENCES public.users(id) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(referrer_id, referred_id)
);

-- Enable Row Level Security
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Create policies for referral_codes
CREATE POLICY "Users can view their own referral codes" ON public.referral_codes
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own referral codes" ON public.referral_codes
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create policies for referrals
CREATE POLICY "Users can view their own referrals" ON public.referrals
    FOR SELECT
    USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Anyone can create a referral" ON public.referrals
    FOR INSERT
    WITH CHECK (true);

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.referral_codes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.referrals
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at(); 