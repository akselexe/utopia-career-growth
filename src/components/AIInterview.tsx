import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Send, Square, Loader2, Mic, Video, MicOff, VideoOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Message = { role: "user" | "assistant"; content: string };

export const AIInterview = ({ userId }: { userId: string }) => {
  const { toast } = useToast();
  const [jobTitle, setJobTitle] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [behavioralFeedback, setBehavioralFeedback] = useState<string[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      stopCamera();
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        }, 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      mediaStreamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = async () => {
          try {
            await videoRef.current?.play();
            console.log("Video playing successfully");
            setIsCameraOn(true);
          } catch (playError) {
            console.error("Error playing video:", playError);
            toast({
              title: "Video Error",
              description: "Could not start video playback.",
              variant: "destructive",
            });
          }
        };
      }
      
      // Start periodic behavioral analysis
      analysisIntervalRef.current = setInterval(() => {
        captureAndAnalyzeFrame();
      }, 10000);
      
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
    window.speechSynthesis.cancel();
    setIsCameraOn(false);
  };

  const captureAndAnalyzeFrame = async () => {
    if (!videoRef.current || !isCameraOn) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      canvas.toBlob(async (blob) => {
        if (blob) {
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64Image = reader.result as string;
            
            try {
              const { data, error } = await supabase.functions.invoke('analyze-behavior', {
                body: { image: base64Image.split(',')[1] }
              });
              
              if (data?.feedback) {
                setBehavioralFeedback(prev => [...prev, data.feedback].slice(-5));
              }
            } catch (error) {
              console.error("Behavioral analysis error:", error);
            }
          };
          reader.readAsDataURL(blob);
        }
      });
    }
  };

  const startVoiceRecording = async () => {
    console.log("startVoiceRecording called");
    console.log("mediaStreamRef.current:", mediaStreamRef.current);
    console.log("isCameraOn:", isCameraOn);
    
    if (!mediaStreamRef.current) {
      console.error("No media stream available");
      toast({
        title: "Camera Required",
        description: "Please enable camera first to use voice recording.",
        variant: "destructive",
      });
      return;
    }

    try {
      audioChunksRef.current = [];
      
      // Create a new MediaRecorder with the audio track from the stream
      const audioTracks = mediaStreamRef.current.getAudioTracks();
      console.log("Audio tracks:", audioTracks.length);
      
      if (audioTracks.length === 0) {
        throw new Error("No audio track available");
      }
      
      const mediaRecorder = new MediaRecorder(mediaStreamRef.current, {
        mimeType: 'audio/webm',
      });
      
      console.log("MediaRecorder created");
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log("Audio chunk received:", event.data.size, "bytes");
        }
      };
      
      mediaRecorder.onstop = async () => {
        console.log("Recording stopped, total chunks:", audioChunksRef.current.length);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        console.log("Audio blob size:", audioBlob.size, "bytes");
        
        if (audioBlob.size > 0) {
          await processVoiceInput(audioBlob);
        } else {
          toast({
            title: "No Audio",
            description: "No audio was recorded. Please try again.",
            variant: "destructive",
          });
        }
      };
      
      // Start recording with time slices for better chunking
      mediaRecorder.start(100);
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      
      console.log("Recording started successfully");
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Recording Error",
        description: error instanceof Error ? error.message : "Could not start voice recording.",
        variant: "destructive",
      });
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processVoiceInput = async (audioBlob: Blob) => {
    setIsLoading(true);
    
    try {
      console.log("Processing audio blob...");
      
      // Convert audio to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        console.log("Base64 audio length:", base64Audio.length);
        
        // Transcribe audio
        console.log("Calling transcribe-audio function...");
        const { data: transcriptData, error: transcriptError } = await supabase.functions.invoke('transcribe-audio', {
          body: { audio: base64Audio.split(',')[1] }
        });
        
        console.log("Transcription response:", transcriptData, transcriptError);
        
        if (transcriptError) {
          throw new Error(transcriptError.message || "Transcription service error");
        }
        
        if (!transcriptData?.text) {
          throw new Error("No transcription returned");
        }
        
        const transcribedText = transcriptData.text.trim();
        console.log("Transcribed text:", transcribedText);
        
        if (!transcribedText) {
          toast({
            title: "No speech detected",
            description: "Please speak clearly and try again.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        // Send as message
        const userMessage: Message = { role: "user", content: transcribedText };
        setMessages((prev) => [...prev, userMessage]);
        
        toast({
          title: "You said:",
          description: transcribedText,
        });
        
        await streamChat([...messages, userMessage]);
      };
      
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error("Error processing voice:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process voice input",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const startInterview = async () => {
    if (!jobTitle.trim()) {
      toast({
        title: "Job title required",
        description: "Please enter the job title you're preparing for",
        variant: "destructive",
      });
      return;
    }

    setHasStarted(true);
    setIsLoading(true);

    try {
      // Start camera first
      await startCamera();
      
      toast({
        title: "Interview Started",
        description: "AI will greet you shortly. Hold the mic button to respond.",
      });
      
      // Then start the interview with AI greeting
      await streamChat([]);
    } catch (error) {
      console.error("Error starting interview:", error);
      toast({
        title: "Error",
        description: "Failed to start interview. Please try again.",
        variant: "destructive",
      });
      setHasStarted(false);
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = (text: string) => {
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) || voices[0];
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    speechSynthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const streamChat = async (currentMessages: Message[]) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/interview-chat`;
    
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: currentMessages, jobTitle }),
      });

      if (!resp.ok) {
        if (resp.status === 429 || resp.status === 402) {
          const errorData = await resp.json();
          throw new Error(errorData.error);
        }
        throw new Error("Failed to start stream");
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;
      let assistantContent = "";

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                  );
                }
                return [...prev, { role: "assistant", content: assistantContent }];
              });
              scrollToBottom();
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
      
      // Speak the complete response
      if (assistantContent) {
        speakText(assistantContent);
      }
    } catch (error) {
      throw error;
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      await streamChat([...messages, userMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stopInterview = () => {
    stopCamera();
    setHasStarted(false);
    setMessages([]);
    setInputValue("");
    setBehavioralFeedback([]);
    
    toast({
      title: "Interview Complete!",
      description: "Good job practicing!",
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
              <h3 className="font-bold">Voice-Only AI Interview</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Speak naturally with our AI interviewer. Camera tracks your body language and facial expressions for behavioral feedback.
              </p>
            </div>
            <Button 
              size="lg" 
              onClick={startInterview}
              className="gap-2"
              disabled={!jobTitle.trim()}
            >
              <Sparkles className="w-5 h-5" />
              Start Voice Interview
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Video Feed */}
            <div className="lg:col-span-2 space-y-3">
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                {isCameraOn ? (
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="w-full h-full object-cover mirror"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <div className="text-center space-y-2">
                      <VideoOff className="w-12 h-12 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Camera will start automatically</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="bg-muted rounded-lg p-4 max-h-64 overflow-y-auto space-y-3">
                {messages.map((message, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg ${
                      message.role === "assistant" ? "bg-primary/10" : "bg-accent/10"
                    }`}
                  >
                    <p className="text-sm font-medium mb-1">
                      {message.role === "assistant" ? "Interviewer" : "You"}
                    </p>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Interviewer is thinking...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Behavioral Feedback Sidebar */}
            <div className="space-y-3">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  Behavioral Analysis
                </h3>
                <div className="space-y-2">
                  {behavioralFeedback.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Enable camera to receive real-time behavioral feedback
                    </p>
                  ) : (
                    behavioralFeedback.map((feedback, i) => (
                      <div key={i} className="text-sm p-2 bg-background rounded border border-border">
                        {feedback}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Voice Control */}
          <div className="flex flex-col items-center gap-4">
            <div className="text-center space-y-2">
              <p className="text-sm font-medium">
                {isRecording ? "🎤 Recording... Click to stop and send" : isLoading ? "🤖 AI is responding..." : "Click microphone to start speaking"}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                size="lg"
                variant={isRecording ? "destructive" : "default"}
                onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                disabled={!isCameraOn || isLoading}
                className="gap-2 h-20 w-20 rounded-full"
              >
                {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </Button>
              <Button 
                variant="outline" 
                onClick={stopInterview} 
                className="gap-2"
                size="lg"
              >
                <Square className="w-4 h-4" />
                End Interview
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};