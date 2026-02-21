import { useQuery } from "@tanstack/react-query";
import { type Studio } from "@shared/schema";
import { api } from "@shared/routes";

export function useStudios(filters?: { search?: string; state?: string; city?: string }) {
  return useQuery<Studio[]>({
    queryKey: [api.studios.list.path, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.state) params.append("state", filters.state);
      if (filters?.city) params.append("city", filters.city);
      
      const res = await fetch(`${api.studios.list.path}?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch studios");
      return res.json();
    },
  });
}

export function useStudio(slug: string) {
  return useQuery<Studio & { services: any[], portfolio: any[] }>({
    queryKey: [api.studios.get.path, slug],
    queryFn: async () => {
      const res = await fetch(api.studios.get.path.replace(":slug", slug));
      if (!res.ok) throw new Error("Failed to fetch studio");
      return res.json();
    },
    enabled: !!slug,
  });
}
