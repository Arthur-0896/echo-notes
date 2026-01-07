import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Summary {
  id: string;
  title: string;
  summary: string;
  original_text?: string;
  created_at: string;
}

export const useSummaries = () => {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchSummaries = async () => {
    const { data, error } = await supabase
      .from('summaries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching summaries:', error);
      toast({
        title: 'Error',
        description: 'Failed to load summaries',
        variant: 'destructive',
      });
    } else {
      setSummaries(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSummaries();
  }, []);

  const addSummary = async (title: string, summary: string, originalText?: string) => {
    const { data, error } = await supabase
      .from('summaries')
      .insert({
        title,
        summary,
        original_text: originalText,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving summary:', error);
      toast({
        title: 'Error',
        description: 'Failed to save summary',
        variant: 'destructive',
      });
      return null;
    }

    setSummaries(prev => [data, ...prev]);
    return data;
  };

  const deleteSummary = async (id: string) => {
    const { error } = await supabase
      .from('summaries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting summary:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete summary',
        variant: 'destructive',
      });
      return false;
    }

    setSummaries(prev => prev.filter(s => s.id !== id));
    return true;
  };

  return {
    summaries,
    isLoading,
    addSummary,
    deleteSummary,
    refetch: fetchSummaries,
  };
};
