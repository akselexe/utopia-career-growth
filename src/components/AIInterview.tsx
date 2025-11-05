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
  const [showReport, setShowReport] = useState(false);
  
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
      console.log("Starting camera...");

      // Stop any existing stream first
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: "user",
          frameRate: { ideal: 30, min: 15 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      console.log("Camera stream obtained successfully");
      // Enable all tracks
      stream.getTracks().forEach(track => track.enabled = true);
      mediaStreamRef.current = stream;

      if (videoRef.current) {
        console.log("Setting up video element...");

        // Clear any existing srcObject
        videoRef.current.srcObject = null;

        // Set new stream
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        videoRef.current.autoplay = true;

        console.log("Video element configured, stream assigned");

        // Set up event listeners for debugging
        const onLoadedMetadata = () => {
          console.log("Video metadata loaded, dimensions:", videoRef.current?.videoWidth, "x", videoRef.current?.videoHeight);
        };

        const onCanPlay = () => {
          console.log("Video can play");
        };

        const onPlay = () => {
          console.log("Video started playing");
          console.log("Video element dimensions:", videoRef.current?.clientWidth, "x", videoRef.current?.clientHeight);
          console.log("Video natural dimensions:", videoRef.current?.videoWidth, "x", videoRef.current?.videoHeight);
          console.log("Video readyState:", videoRef.current?.readyState);
          console.log("Video networkState:", videoRef.current?.networkState);
          console.log("Video srcObject:", videoRef.current?.srcObject);
          console.log("Video currentTime:", videoRef.current?.currentTime);
          console.log("Video paused:", videoRef.current?.paused);
          console.log("Video ended:", videoRef.current?.ended);

          // Check computed styles
          if (videoRef.current) {
            const computedStyle = window.getComputedStyle(videoRef.current);
            console.log("Video computed styles:", {
              display: computedStyle.display,
              visibility: computedStyle.visibility,
              opacity: computedStyle.opacity,
              width: computedStyle.width,
              height: computedStyle.height,
              position: computedStyle.position,
              zIndex: computedStyle.zIndex
            });

            // Check if video element is actually visible in DOM
            const rect = videoRef.current.getBoundingClientRect();
            console.log("Video bounding rect:", rect);
            console.log("Video is visible:", rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.left >= 0);
          }

          // Start behavioral analysis after video is confirmed playing
          console.log("Setting up behavioral analysis interval...");
          if (analysisIntervalRef.current) {
            clearInterval(analysisIntervalRef.current);
          }
          
          // Set camera on BEFORE starting analysis
          setIsCameraOn(true);
          
          // Start first capture after a short delay to ensure state is updated
          setTimeout(() => {
            console.log("Running first behavioral analysis...");
            captureAndAnalyzeFrame();
          }, 3000);
          
          // Then continue every 15 seconds
          analysisIntervalRef.current = setInterval(() => {
            console.log("Interval triggered - calling captureAndAnalyzeFrame");
            captureAndAnalyzeFrame();
          }, 15000);
          
          console.log("Behavioral analysis interval set up successfully");
        };

        const onError = (e: Event) => {
          console.error("Video element error:", e);
          setIsCameraOn(false);
          toast({
            title: "Video Error",
            description: "Could not start video playback. Audio recording will still work.",
            variant: "destructive",
          });
        };

        // Add event listeners
        videoRef.current.addEventListener('loadedmetadata', onLoadedMetadata);
        videoRef.current.addEventListener('canplay', onCanPlay);
        videoRef.current.addEventListener('play', onPlay);
        videoRef.current.addEventListener('error', onError);

        // Try to play immediately
        try {
          const playPromise = videoRef.current.play();
          console.log("Play promise created");

          if (playPromise !== undefined) {
            playPromise.then(() => {
              console.log("Play promise resolved");
            }).catch((playError) => {
              console.error("Play promise rejected:", playError);
              // Fallback: try playing after a short delay
              setTimeout(() => {
                if (videoRef.current) {
                  videoRef.current.play().catch((fallbackError) => {
                    console.error("Fallback play also failed:", fallbackError);
                    setIsCameraOn(false);
                    toast({
                      title: "Video Error",
                      description: "Could not start video playback. Audio recording will still work.",
                      variant: "destructive",
                    });
                  });
                }
              }, 100);
            });
          }
        } catch (immediatePlayError) {
          console.error("Immediate play failed:", immediatePlayError);
          setIsCameraOn(false);
        }

        // Cleanup function to remove event listeners
        const cleanup = () => {
          if (videoRef.current) {
            videoRef.current.removeEventListener('loadedmetadata', onLoadedMetadata);
            videoRef.current.removeEventListener('canplay', onCanPlay);
            videoRef.current.removeEventListener('play', onPlay);
            videoRef.current.removeEventListener('error', onError);
          }
        };

        // Store cleanup for later use
        (videoRef.current as any)._cleanup = cleanup;
      }

    } catch (error) {
      console.error("Error accessing camera:", error);

      // Try to get audio-only permissions as fallback
      try {
        console.log("Trying audio-only fallback...");
        const audioOnlyStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        mediaStreamRef.current = audioOnlyStream;
        console.log("Audio-only stream obtained successfully");

        toast({
          title: "Camera Unavailable",
          description: "Video camera not available, but audio recording will work.",
          variant: "default",
        });
      } catch (audioError) {
        console.error("Audio permissions also failed:", audioError);
        toast({
          title: "Media Access Error",
          description: "Could not access camera or microphone. Please check permissions.",
          variant: "destructive",
        });
      }
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
    console.log("captureAndAnalyzeFrame called, videoRef:", !!videoRef.current);
    
    if (!videoRef.current || !videoRef.current.srcObject) {
      console.log("Early return - no video or no stream");
      return;
    }
    
    const videoWidth = videoRef.current.videoWidth;
    const videoHeight = videoRef.current.videoHeight;
    
    console.log("Video dimensions:", videoWidth, "x", videoHeight);
    
    if (videoWidth === 0 || videoHeight === 0) {
      console.log("Video dimensions invalid, skipping analysis");
      return;
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      console.error("Could not get canvas context");
      return;
    }
    
    try {
      ctx.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);
      console.log("Image drawn to canvas");
      
      canvas.toBlob(async (blob) => {
        if (!blob) {
          console.error("Failed to create blob from canvas");
          return;
        }
        
        console.log("Blob created, size:", blob.size);
        
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Image = reader.result as string;
          console.log("Base64 image length:", base64Image.length);
          
          try {
            console.log("Calling analyze-behavior function...");
            const { data, error } = await supabase.functions.invoke('analyze-behavior', {
              body: { image: base64Image.split(',')[1] }
            });
            
            console.log("Behavioral analysis response:", data, error);
            
            if (error) {
              console.error("Behavioral analysis error:", error);
              return;
            }
            
            if (data?.feedback) {
              console.log("Adding behavioral feedback:", data.feedback);
              // Store feedback silently during interview
              setBehavioralFeedback(prev => [...prev, data.feedback]);
            }
          } catch (error) {
            console.error("Behavioral analysis exception:", error);
          }
        };
        
        reader.onerror = (error) => {
          console.error("FileReader error:", error);
        };
        
        reader.readAsDataURL(blob);
      }, 'image/jpeg', 0.8);
    } catch (error) {
      console.error("Error in captureAndAnalyzeFrame:", error);
    }
  };

  const startVoiceRecording = async () => {
    console.log("startVoiceRecording called");
    
    // Cancel any ongoing AI speech
    if (speechSynthesisRef.current) {
      window.speechSynthesis.cancel();
    }

    console.log("mediaStreamRef.current:", mediaStreamRef.current);
    console.log("isCameraOn:", isCameraOn);

    // If no media stream, try to get audio permissions on demand
    if (!mediaStreamRef.current) {
      console.log("No media stream available, trying to get audio permissions...");
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        // Enable all tracks
        audioStream.getTracks().forEach(track => track.enabled = true);
        mediaStreamRef.current = audioStream;
        console.log("Audio permissions granted on demand, tracks enabled");
      } catch (audioError) {
        console.error("Audio permissions denied:", audioError);
        toast({
          title: "Microphone Access Required",
          description: "Please allow microphone access to use voice recording.",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      // Clean up any existing MediaRecorder
      if (mediaRecorderRef.current) {
        console.log("Cleaning up existing MediaRecorder, state:", mediaRecorderRef.current.state);
        if (mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
        mediaRecorderRef.current = null;
      }

      audioChunksRef.current = [];

      // Check if MediaRecorder is supported
      if (!window.MediaRecorder) {
        throw new Error("MediaRecorder is not supported in this browser");
      }

      // Create a new MediaRecorder with the audio track from the stream
      const audioTracks = mediaStreamRef.current.getAudioTracks();
      console.log("Audio tracks:", audioTracks.length);

      if (audioTracks.length === 0) {
        throw new Error("No audio track available. Please check microphone permissions.");
      }

      // Log supported MIME types for debugging
      const supportedTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/wav'];
      console.log("Checking supported MIME types:");
      supportedTypes.forEach(type => {
        console.log(`${type}: ${MediaRecorder.isTypeSupported(type)}`);
      });

      // Try to create MediaRecorder without specifying MIME type first
      let mediaRecorder: MediaRecorder;
      let mimeType = ''; // Declare mimeType here so it's accessible in onstop handler
      try {
        mediaRecorder = new MediaRecorder(mediaStreamRef.current);
        console.log("MediaRecorder created without MIME type");
      } catch (noMimeError) {
        console.error("Failed to create MediaRecorder without MIME type:", noMimeError);

        // Fallback: try with supported MIME types
        for (const type of supportedTypes) {
          if (MediaRecorder.isTypeSupported(type)) {
            mimeType = type;
            break;
          }
        }

        if (!mimeType) {
          throw new Error("No supported audio MIME types found in this browser");
        }

        console.log("Trying with MIME type:", mimeType);
        mediaRecorder = new MediaRecorder(mediaStreamRef.current, { mimeType });
      }

      console.log("MediaRecorder created with state:", mediaRecorder.state);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log("Audio chunk received:", event.data.size, "bytes");
        }
      };

      mediaRecorder.onstop = async () => {
        console.log("Recording stopped, total chunks:", audioChunksRef.current.length);
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
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

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        toast({
          title: "Recording Error",
          description: "An error occurred during recording.",
          variant: "destructive",
        });
        setIsRecording(false);
      };

      // Wait for MediaRecorder to be ready
      await new Promise(resolve => {
        const checkState = () => {
          if (mediaRecorder.state === 'inactive') {
            resolve(void 0);
          } else if (mediaRecorder.state === 'recording') {
            // If somehow already recording, stop it first
            mediaRecorder.stop();
            setTimeout(checkState, 50);
          } else {
            setTimeout(checkState, 50);
          }
        };
        checkState();
      });

      try {
        // Start recording without time slices for simplicity
        mediaRecorder.start();
        mediaRecorderRef.current = mediaRecorder;
        setIsRecording(true);
        console.log("Recording started successfully");
      } catch (startError) {
        console.error("Failed to start MediaRecorder:", startError);
        toast({
          title: "Recording Failed",
          description: "Could not start audio recording. Please try again.",
          variant: "destructive",
        });
        return;
      }
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
      // Start camera (which includes fallback to audio-only)
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
    setIsLoading(true);
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/interview-chat`;
    
    try {
      // Cancel any ongoing speech
      if (speechSynthesisRef.current) {
        window.speechSynthesis.cancel();
      }

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
    
    // Show report if we have behavioral feedback
    if (behavioralFeedback.length > 0) {
      setShowReport(true);
    }
    
    toast({
      title: "Interview Complete!",
      description: behavioralFeedback.length > 0 
        ? "Check your behavioral analysis report below!" 
        : "Good job practicing!",
    });
  };

  const closeReport = () => {
    setShowReport(false);
    setBehavioralFeedback([]);
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
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="w-full h-full object-cover mirror"
                />
                {!isCameraOn && (
                  <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-muted">
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

            {/* Behavioral Analysis Sidebar */}
            <div className="space-y-3">
              {/* Show status during interview */}
              {hasStarted && !showReport && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent" />
                    Behavioral Analysis
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isCameraOn 
                      ? `Analyzing your body language... (${behavioralFeedback.length} analysis${behavioralFeedback.length !== 1 ? 'es' : ''} captured)` 
                      : "Enable camera for behavioral analysis"}
                  </p>
                </div>
              )}
              
              {/* Show report after interview */}
              {showReport && behavioralFeedback.length > 0 && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-accent" />
                      Behavioral Analysis Report
                    </h3>
                    <Button size="sm" variant="ghost" onClick={closeReport}>
                      Close
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {behavioralFeedback.map((feedback, i) => (
                      <div key={i} className="text-sm p-3 bg-background rounded border border-border">
                        <span className="font-medium text-primary">Analysis {i + 1}:</span>
                        <p className="mt-1 whitespace-pre-wrap">{feedback}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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