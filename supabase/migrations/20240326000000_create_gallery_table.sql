-- Create gallery table
CREATE TABLE IF NOT EXISTS public.gallery (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    image_url TEXT NOT NULL,
    prompt TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES public.users(id) NULL
);

-- Enable Row Level Security
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view gallery items" ON public.gallery
    FOR SELECT
    USING (true);

CREATE POLICY "Anyone can insert gallery items" ON public.gallery
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can delete their own gallery items" ON public.gallery
    FOR DELETE
    USING (auth.uid() = user_id); 