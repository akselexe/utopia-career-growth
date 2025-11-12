-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to create notification on application status change
CREATE OR REPLACE FUNCTION public.notify_application_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  job_title TEXT;
  company_name TEXT;
  notification_title TEXT;
  notification_message TEXT;
BEGIN
  -- Only notify on status changes (not on initial creation)
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    -- Get job title
    SELECT title INTO job_title
    FROM jobs
    WHERE id = NEW.job_id;
    
    -- Get company name
    SELECT p.full_name INTO company_name
    FROM profiles p
    JOIN jobs j ON j.company_id = p.id
    WHERE j.id = NEW.job_id;
    
    -- Set notification based on status
    IF NEW.status = 'accepted' THEN
      notification_title := 'Application Accepted! 🎉';
      notification_message := 'Your application for ' || job_title || ' at ' || company_name || ' has been accepted!';
    ELSIF NEW.status = 'rejected' THEN
      notification_title := 'Application Update';
      notification_message := 'Your application for ' || job_title || ' at ' || company_name || ' has been reviewed.';
    ELSE
      notification_title := 'Application Status Updated';
      notification_message := 'Your application for ' || job_title || ' status has been updated to: ' || NEW.status;
    END IF;
    
    -- Create notification
    INSERT INTO notifications (user_id, title, message, type, application_id)
    VALUES (
      NEW.seeker_id,
      notification_title,
      notification_message,
      CASE 
        WHEN NEW.status = 'accepted' THEN 'success'
        WHEN NEW.status = 'rejected' THEN 'warning'
        ELSE 'info'
      END,
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER on_application_status_change
  AFTER UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_application_status_change();