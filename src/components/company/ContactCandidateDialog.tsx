import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ContactCandidateDialogProps {
  candidateEmail: string;
  candidateName: string;
  jobTitle?: string;
  companyName: string;
}

export const ContactCandidateDialog = ({
  candidateEmail,
  candidateName,
  jobTitle,
  companyName,
}: ContactCandidateDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [subject, setSubject] = useState(
    jobTitle ? `Regarding Your Application for ${jobTitle}` : "Message from " + companyName
  );
  const [message, setMessage] = useState("");

  const handleSend = async () => {
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    setSending(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          candidateEmail,
          candidateName,
          subject,
          message,
          companyName,
          jobTitle,
        },
      });

      if (error) throw error;

      toast({
        title: "Email Sent!",
        description: `Your message has been sent to ${candidateName}`,
      });

      setOpen(false);
      setMessage("");
      setSubject(jobTitle ? `Regarding Your Application for ${jobTitle}` : "Message from " + companyName);
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Failed to Send",
        description: "Could not send the email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <Mail className="w-4 h-4" />
          Contact
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Contact {candidateName}</DialogTitle>
          <DialogDescription>
            Send an email directly to the candidate's inbox
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              rows={8}
              className="resize-none"
            />
          </div>
          <div className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground">
            <p><strong>To:</strong> {candidateEmail}</p>
            {jobTitle && <p><strong>Job:</strong> {jobTitle}</p>}
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={sending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending}>
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
