import { fetch } from "@/lib/api";
import type { Admin } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchAdmin = async () => {
  return await fetch<Admin>("/admin");
};

const EMPTY_ADMIN: Admin = {
  discord_webook: "",
  is_sudo: false,
  telegram_id: "",
  username: "",
};

export const AdminQueryKey = ["admin-query-key"];

const useAdmin = () => {
  const query = useQuery<Admin, Error>({
    queryKey: AdminQueryKey,
    queryFn: fetchAdmin,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  return {
    admin: query.data ?? EMPTY_ADMIN,
    isAdminPending: query.isPending,
    isAdminSuccess: query.isSuccess,
  };
};

export default useAdmin;
