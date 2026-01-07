import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    
    if (!text || text.trim() === '') {
      throw new Error('No text provided for summarization');
    }

    console.log('Summarizing text:', text.substring(0, 100));
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a professional summarizer. Create concise, well-structured summaries that capture the key points and main ideas. 
            
Format your response with:
- A brief title (max 5 words) on the first line
- A blank line
- The summary in clear paragraphs or bullet points

Keep summaries focused and actionable. If the text is very short or unclear, do your best to summarize what's there.`
          },
          {
            role: 'user',
            content: `Please summarize the following text:\n\n${text}`
          }
        ],
        max_tokens: 1024,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Summarization API error:', errorText);
      throw new Error(`Summarization failed: ${errorText}`);
    }

    const result = await response.json();
    const summary = result.choices?.[0]?.message?.content || 'Unable to generate summary.';
    
    // Extract title from first line
    const lines = summary.split('\n').filter((l: string) => l.trim());
    const title = lines[0]?.replace(/^#+\s*/, '').substring(0, 50) || 'Recording Summary';
    
    console.log('Summary generated:', title);

    return new Response(
      JSON.stringify({ summary, title }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in summarize function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
