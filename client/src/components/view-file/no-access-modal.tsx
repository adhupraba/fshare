import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const NoAccessModal = () => {
  return (
    <div>
      <Dialog open>
        <DialogContent aria-describedby="Master Password Validate Dialog">
          <DialogHeader>
            <DialogTitle>No Access 🥲</DialogTitle>
            <DialogDescription>Sorry. You do not have access to this file. Please contact the owner.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NoAccessModal;
