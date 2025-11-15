import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Shield, Eye, Camera } from "lucide-react";

interface ConsentModalProps {
  open: boolean;
  onConsent: () => void;
  onDecline: () => void;
  type: "behavioral" | "footprint";
}
// A modal dialog that requests user consent for either behavioral analysis during interviews or public profile scanning.
export default function ConsentModal({ open, onConsent, onDecline, type }: ConsentModalProps) {
  const content = {
    behavioral: {
      icon: Camera,
      title: "Behavioral Analysis Consent",
      description: (
        <>
          <p className="mb-3">
            We'd like to analyze your facial expressions, body language, and engagement during the interview to provide personalized feedback.
          </p>
          <div className="bg-muted p-3 rounded-lg mb-3 text-sm">
            <p className="font-semibold mb-2">What we analyze:</p>
            <ul className="space-y-1 ml-4 list-disc">
              <li>Facial expressions and eye contact</li>
              <li>Posture and body language</li>
              <li>Confidence and engagement levels</li>
            </ul>
          </div>
          <div className="bg-muted p-3 rounded-lg text-sm">
            <p className="font-semibold mb-2">Your privacy:</p>
            <ul className="space-y-1 ml-4 list-disc">
              <li>Images are analyzed in real-time and not permanently stored</li>
              <li>Only brief feedback is saved, not video recordings</li>
              <li>You can opt-out anytime in Privacy Settings</li>
            </ul>
          </div>
        </>
      ),
    },
    footprint: {
      icon: Eye,
      title: "Public Profile Scanning Consent",
      description: (
        <>
          <p className="mb-3">
            We'd like to scan your public contributions on GitHub and StackOverflow to enhance your profile and provide better job matches.
          </p>
          <div className="bg-muted p-3 rounded-lg mb-3 text-sm">
            <p className="font-semibold mb-2">What we analyze:</p>
            <ul className="space-y-1 ml-4 list-disc">
              <li>GitHub repositories and contributions</li>
              <li>StackOverflow reputation and answers</li>
              <li>Technical skills and expertise areas</li>
            </ul>
          </div>
          <div className="bg-muted p-3 rounded-lg text-sm">
            <p className="font-semibold mb-2">Your privacy:</p>
            <ul className="space-y-1 ml-4 list-disc">
              <li>We only access publicly available information</li>
              <li>Data is used solely for job matching</li>
              <li>You can disable this anytime in Privacy Settings</li>
            </ul>
          </div>
        </>
      ),
    },
  };

  const { icon: Icon, title, description } = content[type];

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <AlertDialogTitle className="text-xl">{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onDecline}>
            Decline
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConsent} className="gap-2">
            <Shield className="h-4 w-4" />
            I Consent
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
