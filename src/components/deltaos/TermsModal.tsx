import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface TermsModalProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const TermsModal = ({ open, onAccept, onDecline }: TermsModalProps) => {
  const [accepted, setAccepted] = useState(false);

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Delta OS Terms & Conditions</DialogTitle>
          <DialogDescription>
            Please read and accept the terms and conditions to continue using Delta OS
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-96 overflow-y-auto space-y-4 p-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">1. No Sharing Without Permission</h3>
            <p className="text-muted-foreground">You may not share access links to Delta OS without explicit permission from the administrators.</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">2. User Responsibility</h3>
            <p className="text-muted-foreground">By using this website, you acknowledge that owning or operating this website may have potential legal consequences, and the website creators are not responsible for any issues that arise from your use.</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">3. Content Policy</h3>
            <p className="text-muted-foreground">No NSFW (Not Safe For Work) content is allowed. Any violation will result in immediate termination of access.</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">4. Acceptance</h3>
            <p className="text-muted-foreground">By checking the box below and clicking Accept, you agree to all terms and conditions outlined above.</p>
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <div className="flex items-center space-x-2 mb-2 sm:mb-0">
            <Checkbox
              id="accept-terms"
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked as boolean)}
            />
            <label htmlFor="accept-terms" className="text-sm cursor-pointer">
              I accept the terms and conditions
            </label>
          </div>
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={onDecline}>
              Decline
            </Button>
            <Button onClick={onAccept} disabled={!accepted}>
              Accept
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
