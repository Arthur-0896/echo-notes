import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SummaryCardProps {
  title: string;
  summary: string;
  originalText?: string;
  createdAt: string;
  onDownload: () => void;
}

const SummaryCard = ({ title, summary, createdAt, onDownload }: SummaryCardProps) => {
  return (
    <div className="glass rounded-xl p-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-display font-semibold text-foreground">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date(createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDownload}
          className="shrink-0 hover:bg-primary/10 hover:text-primary"
        >
          <Download className="w-5 h-5" />
        </Button>
      </div>
      
      <div className="prose prose-invert prose-sm max-w-none">
        <div className="whitespace-pre-wrap text-secondary-foreground leading-relaxed">
          {summary.split('\n').slice(1).join('\n').trim() || summary}
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
