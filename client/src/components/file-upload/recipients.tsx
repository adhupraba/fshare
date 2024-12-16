import { TRecipient } from "@/types/file";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { Input } from "../ui/input";
import { useState } from "react";
import { validators } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

interface IRecipientsProps {
  recipients: TRecipient[];
  onAddRecipient: (recipient: TRecipient) => void;
  onUpdateRecipient: (idx: number, recipient: TRecipient) => void;
  onDeleteRecipient: (idx: number) => void;
}

const Recipients: React.FC<IRecipientsProps> = ({
  recipients,
  onAddRecipient,
  onUpdateRecipient,
  onDeleteRecipient,
}) => {
  const { user } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState("");

  const { toast } = useToast();

  const handleAddEmail = () => {
    let errorMessage = "";

    if (!validators("email").test(email)) {
      errorMessage = "Please enter a valid email address";
    } else if (recipients.some((rec) => rec.email === email)) {
      errorMessage = "Email addresses must not repeat";
    } else if (email === user?.email) {
      errorMessage = "Your email cannot appear in the recipients list. It is shared with you by default.";
    }

    if (errorMessage) {
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      return;
    }

    setEmail("");
    onAddRecipient({ email, can_view: true, can_download: false });
  };

  const handleUpdate = (idx: number, recipient: TRecipient) => {
    const prevRecipient = recipients[idx];

    if (!recipient.can_view && prevRecipient.can_download) {
      // download was enabled previously but now user has turned off view for the recipient
      // so download also should be turned off
      recipient.can_download = false;
    } else if (recipient.can_download && !prevRecipient.can_view) {
      // view was turned off previously but now user has turned on download for the recipient
      // so view also should be turned on
      recipient.can_view = true;
    }

    onUpdateRecipient(idx, recipient);
  };

  return (
    <div className="my-8">
      <div className="mb-5 flex flex-col md:flex-row justify-between items-center gap-3">
        <Input
          className="w-full md:w-3/4"
          type="email"
          placeholder="Add recipient email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button className="w-full md:w-1/4" onClick={handleAddEmail}>
          Add Recipient
        </Button>
      </div>

      <Table>
        {!recipients.length && (
          <TableCaption>If no recipients are selected, only you would be able to access the shared file.</TableCaption>
        )}
        <TableHeader>
          <TableRow>
            <TableHead className="w-72">Email</TableHead>
            <TableHead>Can View</TableHead>
            <TableHead>Can Download</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recipients.map((recipient, idx) => (
            <TableRow key={recipient.email}>
              <TableCell className="font-medium">{recipient.email}</TableCell>
              <TableCell>
                <Switch
                  checked={recipient.can_view}
                  onCheckedChange={(checked) => handleUpdate(idx, { ...recipient, can_view: checked })}
                />
              </TableCell>
              <TableCell>
                <Switch
                  checked={recipient.can_download}
                  onCheckedChange={(checked) => handleUpdate(idx, { ...recipient, can_download: checked })}
                />
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" onClick={() => onDeleteRecipient(idx)}>
                  <Trash2 className="text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Recipients;
