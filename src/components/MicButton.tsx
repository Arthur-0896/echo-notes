import { useState, useRef, useEffect } from 'react';
import { Mic, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MicButtonProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  isProcessing: boolean;
}

const MicButton = ({ onRecordingComplete, isProcessing }: MicButtonProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setTimeLeft(60);

      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    setIsRecording(false);
    setTimeLeft(60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((60 - timeLeft) / 60) * 100;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        {/* Pulsing rings when recording */}
        {isRecording && (
          <>
            <div className="absolute inset-0 rounded-full bg-accent/30 animate-pulse-ring" />
            <div className="absolute inset-0 rounded-full bg-accent/20 animate-pulse-ring [animation-delay:0.5s]" />
          </>
        )}
        
        {/* Progress ring */}
        {isRecording && (
          <svg className="absolute -inset-3 w-[calc(100%+24px)] h-[calc(100%+24px)] -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="48%"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="3"
            />
            <circle
              cx="50%"
              cy="50%"
              r="48%"
              fill="none"
              stroke="hsl(var(--accent))"
              strokeWidth="3"
              strokeDasharray={`${2 * Math.PI * 48}`}
              strokeDashoffset={`${2 * Math.PI * 48 * (1 - progress / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
        )}
        
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={cn(
            "relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300",
            isRecording 
              ? "bg-accent glow-recording" 
              : "bg-primary glow-idle hover:scale-105",
            isProcessing && "opacity-50 cursor-not-allowed"
          )}
        >
          {isRecording ? (
            <Square className="w-8 h-8 text-accent-foreground" />
          ) : (
            <Mic className="w-10 h-10 text-primary-foreground" />
          )}
        </button>
      </div>

      {/* Timer display */}
      <div className="text-center">
        {isRecording ? (
          <div className="space-y-1">
            <p className="text-3xl font-display font-semibold text-accent">
              {formatTime(timeLeft)}
            </p>
            <p className="text-sm text-muted-foreground">Recording...</p>
          </div>
        ) : isProcessing ? (
          <div className="space-y-1">
            <div className="w-8 h-8 mx-auto border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Processing...</p>
          </div>
        ) : (
          <p className="text-muted-foreground">
            Tap to record (60 seconds)
          </p>
        )}
      </div>
    </div>
  );
};

export default MicButton;
