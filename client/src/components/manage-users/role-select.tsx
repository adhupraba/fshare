import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TRole } from "@/types/auth";

interface IRoleSelectProps {
  id: string;
  value: TRole;
  onChange: (value: TRole) => void;
}

const RoleSelect: React.FC<IRoleSelectProps> = ({ id, value, onChange }) => {
  return (
    <Select key={id} onValueChange={onChange} defaultValue={value} value={value}>
      <SelectTrigger>
        <SelectValue placeholder="Select a role" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="admin">Admin</SelectItem>
        <SelectItem value="user">User</SelectItem>
        <SelectItem value="guest">Guest</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default RoleSelect;
