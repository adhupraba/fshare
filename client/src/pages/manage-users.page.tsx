import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import api from "@/lib/api";
import { TGetUsersResponse, TRole, TUpdateUserRequest, TUpdateUserResponse, TUser } from "@/types/auth";
import RoleSelect from "@/components/manage-users/role-select";
import { DynamicPagination } from "@/components/dynamic-pagination";
import { useSearchParams } from "react-router-dom";
import { TPageInfo } from "@/types/api";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

const ManageUsers = () => {
  const [searchParams] = useSearchParams();

  const [isUpdating, setIsUpdating] = useState(false);
  const [search, setSearch] = useState("");
  const [pageInfo, setPageInfo] = useState<TPageInfo>();
  const [usersData, setUsersData] = useState<TUser[]>([]);
  const [currPage, setCurrPage] = useState(parseInt(searchParams.get("page") || "1"));

  const { user } = useSelector((state: RootState) => state.auth);
  const [debouncedSearch] = useDebounce(search, 500);
  const { toast } = useToast();

  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1");
    setCurrPage(page);
  }, [searchParams.get("page")]);

  useEffect(() => {
    fetchUsers();
  }, [debouncedSearch, currPage]);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get<TGetUsersResponse>("/api/auth/admin/search-users", {
        params: {
          q: debouncedSearch || null,
          page: currPage,
        },
      });

      setUsersData(data.results);
      setPageInfo(data.page_info);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const isYou = (id: number) => {
    return user?.id === id;
  };

  const updateUser = async (idx: number, payload: Partial<{ role?: TRole; is_active?: boolean }>) => {
    try {
      if (payload.role === undefined && payload.is_active === undefined) {
        throw new Error("Role or Active status data needs to be selected properly.");
      }

      const updId = usersData[idx].id;

      if (isYou(updId)) {
        throw new Error("You cannot update your own data.");
      }

      setIsUpdating(true);

      const { data } = await api.post<TUpdateUserResponse>("/api/auth/admin/update-user", {
        id: updId,
        ...payload,
      } satisfies TUpdateUserRequest);

      setUsersData((prev) => {
        const newPrev = [...prev];
        newPrev[idx] = data.user;
        return newPrev;
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="py-12 space-y-4">
      <Input
        className="w-full"
        type="search"
        placeholder="Search using email, name or username"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        disabled={isUpdating}
      />

      <Table>
        <TableCaption className="py-3">Manage users here. Change role, account active status here.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-44 max-w-72">Email</TableHead>
            <TableHead className="min-w-36 max-w-60">Name</TableHead>
            <TableHead className="min-w-32 max-w-52">Username</TableHead>
            <TableHead className="min-w-28 max-w-40">Role</TableHead>
            <TableHead className="min-w-28 max-w-40">Account Active</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usersData.map((data, idx) => (
            <TableRow key={data.email} className={isYou(data.id) ? "pointer-events-none opacity-50" : undefined}>
              <TableCell className="font-medium">
                {data.email} {isYou(data.id) ? "(You)" : undefined}
              </TableCell>
              <TableCell>{data.name} asdfasdf asdf asdf </TableCell>
              <TableCell>{data.username}</TableCell>
              <TableCell>
                <RoleSelect id={data.email} value={data.role} onChange={(value) => updateUser(idx, { role: value })} />
              </TableCell>
              <TableCell>
                <Switch
                  checked={data.is_active}
                  onCheckedChange={(checked) => updateUser(idx, { is_active: checked })}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {!!pageInfo && (
        <DynamicPagination
          disabled={isUpdating}
          page={currPage}
          pageSize={pageInfo.limit}
          totalCount={pageInfo.total}
        />
      )}
    </div>
  );
};

export default ManageUsers;
