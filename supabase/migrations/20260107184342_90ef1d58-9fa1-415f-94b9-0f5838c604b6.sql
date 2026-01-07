-- Create summaries table
CREATE TABLE public.summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Untitled Recording',
  original_text TEXT,
  summary TEXT NOT NULL,
  duration_seconds INTEGER DEFAULT 60,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (no auth required for this simple app)
CREATE POLICY "Anyone can view summaries" 
ON public.summaries 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create summaries" 
ON public.summaries 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can delete summaries" 
ON public.summaries 
FOR DELETE 
USING (true);