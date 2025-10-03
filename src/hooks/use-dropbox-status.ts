import { useQuery } from "@tanstack/react-query";

import { fetchDropboxStatus, type DropboxStatus } from "@/lib/api";

export function useDropboxStatus(token: string | null) {
  return useQuery<DropboxStatus>({
    queryKey: ["integrations", "dropbox-status", token],
    queryFn: () => fetchDropboxStatus(token!),
    enabled: Boolean(token),
    staleTime: 60_000,
  });
}
