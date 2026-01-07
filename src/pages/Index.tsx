import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSummaries } from '@/hooks/useSummaries';
import MicButton from '@/components/MicButton';
import SummaryCard from '@/components/SummaryCard';
import HistorySidebar from '@/components/HistorySidebar';

interface Summary {
  id: string;
  title: string;
  summary: string;
  original_text?: string;
  created_at: string;
}

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState<Summary | null>(null);
  const { summaries, addSummary, deleteSummary } = useSummaries();
  const { toast } = useToast();

  const handleRecordingComplete = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      // Convert blob to base64
      const reader = new FileReader();
      const base64Audio = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });

      // Step 1: Transcribe
      toast({ title: 'Transcribing audio...' });
      const { data: transcribeData, error: transcribeError } = await supabase.functions.invoke('transcribe', {
        body: { audio: base64Audio },
      });

      if (transcribeError) throw new Error(transcribeError.message);
      
      const transcription = transcribeData?.text;
      if (!transcription || transcription === 'No speech detected.') {
        toast({
          title: 'No speech detected',
          description: 'Please try recording again with clear speech.',
          variant: 'destructive',
        });
        setIsProcessing(false);
        return;
      }

      // Step 2: Summarize
      toast({ title: 'Generating summary...' });
      const { data: summarizeData, error: summarizeError } = await supabase.functions.invoke('summarize', {
        body: { text: transcription },
      });

      if (summarizeError) throw new Error(summarizeError.message);
      
      const { summary, title } = summarizeData;
      
      // Step 3: Save to database
      const newSummary = await addSummary(title, summary, transcription);
      
      if (newSummary) {
        setSelectedSummary(newSummary);
        toast({
          title: 'Summary created!',
          description: 'Your recording has been summarized successfully.',
        });
      }

    } catch (error) {
      console.error('Error processing recording:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process recording',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = (summary: Summary) => {
    const content = `# ${summary.title}
Date: ${new Date(summary.created_at).toLocaleString()}

## Summary
${summary.summary}

${summary.original_text ? `## Original Transcription
${summary.original_text}` : ''}
`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${summary.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({ title: 'Downloaded!', description: 'Summary saved as markdown file.' });
  };

  const handleDelete = async (id: string) => {
    const success = await deleteSummary(id);
    if (success) {
      if (selectedSummary?.id === id) {
        setSelectedSummary(null);
      }
      toast({ title: 'Deleted', description: 'Summary removed from history.' });
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <HistorySidebar
        summaries={summaries}
        selectedId={selectedSummary?.id || null}
        onSelect={setSelectedSummary}
        onDownload={handleDownload}
        onDelete={handleDelete}
      />
      
      <main className="flex-1 flex flex-col items-center justify-center p-8 overflow-auto">
        <div className="w-full max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-display font-bold text-gradient mb-3">
              Voice Summarizer
            </h1>
            <p className="text-muted-foreground">
              Record your thoughts, get instant AI summaries
            </p>
          </div>

          {/* Mic Button */}
          <div className="flex justify-center mb-12">
            <MicButton 
              onRecordingComplete={handleRecordingComplete}
              isProcessing={isProcessing}
            />
          </div>

          {/* Selected Summary */}
          {selectedSummary && (
            <SummaryCard
              title={selectedSummary.title}
              summary={selectedSummary.summary}
              originalText={selectedSummary.original_text}
              createdAt={selectedSummary.created_at}
              onDownload={() => handleDownload(selectedSummary)}
            />
          )}

          {/* Empty state */}
          {!selectedSummary && summaries.length === 0 && (
            <div className="text-center text-muted-foreground">
              <p className="text-lg">No summaries yet</p>
              <p className="text-sm mt-1">
                Start by tapping the microphone button above
              </p>
            </div>
          )}

          {!selectedSummary && summaries.length > 0 && (
            <div className="text-center text-muted-foreground">
              <p>Select a recording from the sidebar or create a new one</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
