import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import ArtistDashboard from "./artist";
import ClientDashboard from "./client";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const [_, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = "/api/login";
    }
  }, [isLoading, user]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // NOTE: In a real app we'd check the user's role from the DB.
  // Since the schema implies a user can be an artist (if they have an artist record),
  // we'll need a way to determine this. 
  // For simplicity: We will show a role selector if it's not clear, 
  // or default to client dashboard with a "Become an Artist" button.
  
  // Here we'll create a simple toggle for demonstration purposes or check a stored preference.
  // But ideally, we fetch if the user has an artist profile.
  // Let's assume we pass this logic to sub-components or a switcher.
  
  return <RoleSwitcher />;
}

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function RoleSwitcher() {
  return (
    <div className="min-h-screen bg-secondary/20">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold font-display">Dashboard</h1>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="client" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="client">Client View</TabsTrigger>
            <TabsTrigger value="artist">Artist View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="client">
            <ClientDashboard />
          </TabsContent>
          
          <TabsContent value="artist">
            <ArtistDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
