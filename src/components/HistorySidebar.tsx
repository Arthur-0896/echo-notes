import { FileText, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Summary {
  id: string;
  title: string;
  summary: string;
  original_text?: string;
  created_at: string;
}

interface HistorySidebarProps {
  summaries: Summary[];
  selectedId: string | null;
  onSelect: (summary: Summary) => void;
  onDownload: (summary: Summary) => void;
  onDelete: (id: string) => void;
}

const HistorySidebar = ({ 
  summaries, 
  selectedId, 
  onSelect, 
  onDownload,
  onDelete 
}: HistorySidebarProps) => {
  return (
    <div className="w-80 h-full bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="font-display font-semibold text-lg text-sidebar-foreground">
          History
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {summaries.length} recording{summaries.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {summaries.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No recordings yet.
              <br />
              Start by tapping the mic button.
            </div>
          ) : (
            summaries.map((summary) => (
              <div
                key={summary.id}
                className={cn(
                  "group relative rounded-lg p-3 cursor-pointer transition-all duration-200",
                  selectedId === summary.id
                    ? "bg-sidebar-accent"
                    : "hover:bg-sidebar-accent/50"
                )}
                onClick={() => onSelect(summary)}
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-sidebar-foreground truncate">
                      {summary.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(summary.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 hover:bg-primary/10 hover:text-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownload(summary);
                    }}
                  >
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 hover:bg-destructive/10 hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(summary.id);
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default HistorySidebar;
