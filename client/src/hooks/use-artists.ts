import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";
import { 
  type InsertArtist, 
  type InsertService, 
  type InsertPortfolio,
  type ArtistWithDetails 
} from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// === ARTISTS ===

export function useArtists(filters?: { search?: string; state?: string; specialty?: string }) {
  // Construct query string manually since URLSearchParams handles undefined poorly sometimes
  const queryParams = new URLSearchParams();
  if (filters?.search) queryParams.append("search", filters.search);
  if (filters?.state) queryParams.append("state", filters.state);
  if (filters?.specialty) queryParams.append("specialty", filters.specialty);
  
  const queryString = queryParams.toString();
  const url = `${api.artists.list.path}${queryString ? `?${queryString}` : ''}`;

  return useQuery({
    queryKey: [api.artists.list.path, filters],
    queryFn: async () => {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch artists");
      return api.artists.list.responses[200].parse(await res.json());
    },
  });
}

export function useArtist(slug: string) {
  return useQuery({
    queryKey: [api.artists.get.path, slug],
    queryFn: async () => {
      const url = buildUrl(api.artists.get.path, { slug });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch artist");
      return api.artists.get.responses[200].parse(await res.json());
    },
    enabled: !!slug,
  });
}

export function useCreateArtist() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Omit<InsertArtist, 'userId' | 'id' | 'createdAt' | 'isVerified'>) => {
      const res = await fetch(api.artists.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create artist profile");
      }
      return api.artists.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.artists.list.path] });
      toast({
        title: "Profile Created",
        description: "Your artist profile has been successfully created.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateArtist() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertArtist>) => {
      const url = buildUrl(api.artists.update.path, { id });
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update profile");
      return api.artists.update.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.artists.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.artists.get.path, data.slug] });
      toast({ title: "Updated", description: "Profile updated successfully." });
    },
  });
}

// === SERVICES ===

export function useServices(artistId: number) {
  return useQuery({
    queryKey: [api.services.list.path, artistId],
    queryFn: async () => {
      const url = buildUrl(api.services.list.path, { artistId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch services");
      return api.services.list.responses[200].parse(await res.json());
    },
    enabled: !!artistId,
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Omit<InsertService, 'id' | 'createdAt'>) => {
      const res = await fetch(api.services.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to add service");
      return api.services.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.services.list.path, variables.artistId] });
      toast({ title: "Service Added", description: "New service listed successfully." });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      const url = buildUrl(api.services.delete.path, { id });
      const res = await fetch(url, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete service");
    },
    onSuccess: () => {
      // Invalidate all services queries since we don't know the artist ID easily here without passing it
      queryClient.invalidateQueries({ queryKey: [api.services.list.path] });
      toast({ title: "Service Removed", description: "Service deleted successfully." });
    },
  });
}

// === PORTFOLIO ===

export function usePortfolio(artistId: number) {
  return useQuery({
    queryKey: [api.portfolios.list.path, artistId],
    queryFn: async () => {
      const url = buildUrl(api.portfolios.list.path, { artistId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch portfolio");
      return api.portfolios.list.responses[200].parse(await res.json());
    },
    enabled: !!artistId,
  });
}

export function useCreatePortfolioItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Omit<InsertPortfolio, 'id' | 'createdAt'>) => {
      const res = await fetch(api.portfolios.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to add portfolio item");
      return api.portfolios.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.portfolios.list.path, variables.artistId] });
      toast({ title: "Portfolio Updated", description: "Image added to portfolio." });
    },
  });
}

export function useDeletePortfolioItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      const url = buildUrl(api.portfolios.delete.path, { id });
      const res = await fetch(url, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete item");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.portfolios.list.path] });
      toast({ title: "Removed", description: "Image removed from portfolio." });
    },
  });
}
