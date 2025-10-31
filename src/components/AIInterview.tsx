import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Mic, Square, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const AIInterview = ({ userId }: { userId: string }) => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);

  const startInterview = () => {
    if (!jobTitle.trim()) {
      toast({
        title: "Job title required",
        description: "Please enter the job title you're preparing for",
        variant: "destructive",
      });
      return;
    }

    setHasStarted(true);
    setTranscript(["AI: Hello! Let's practice your interview for a " + jobTitle + " position. Can you tell me about yourself?"]);
    
    toast({
      title: "Interview Started!",
      description: "Voice recording feature coming soon. For now, practice with text responses.",
    });
  };

  const stopInterview = () => {
    setIsRecording(false);
    setHasStarted(false);
    
    toast({
      title: "Interview Complete!",
      description: "Full feedback and scoring will be available soon.",
    });
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-accent" />
          AI Interview Practice
        </h2>
        <p className="text-muted-foreground">
          Practice your interview skills with our AI interviewer
        </p>
      </div>

      {!hasStarted ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="job-title">Job Title You're Preparing For</Label>
            <Input
              id="job-title"
              placeholder="e.g. Software Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
              <Mic className="w-8 h-8 text-accent" />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold">Voice Interview Practice</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Get real-time feedback on your answers, communication style, and confidence level
              </p>
            </div>
            <Button 
              size="lg" 
              onClick={startInterview}
              className="gap-2"
              disabled={!jobTitle.trim()}
            >
              <Sparkles className="w-5 h-5" />
              Start Interview Practice
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-muted rounded-lg p-4 max-h-96 overflow-y-auto space-y-3">
            {transcript.map((message, i) => (
              <div key={i} className={`p-3 rounded-lg ${message.startsWith('AI:') ? 'bg-primary/10' : 'bg-accent/10'}`}>
                <p className="text-sm">{message}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input 
              placeholder="Type your response..." 
              className="flex-1"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  setTranscript([...transcript, "You: " + e.currentTarget.value]);
                  e.currentTarget.value = "";
                }
              }}
            />
            <Button 
              variant="destructive" 
              onClick={stopInterview}
              className="gap-2"
            >
              <Square className="w-4 h-4" />
              End Interview
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Full voice interview with real-time AI feedback coming soon!
          </p>
        </div>
      )}
    </Card>
  );
};