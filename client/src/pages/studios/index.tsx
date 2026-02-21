import { useLocation } from "wouter";
import { useStudios } from "@/hooks/use-studios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MapPin, Building2 } from "lucide-react";
import { useState } from "react";

const LOCATIONS = ["Kuala Lumpur", "Selangor", "Penang", "Johor", "Sabah", "Sarawak"];

export default function StudiosPage() {
  const [filters, setFilters] = useState({
    search: "",
    state: "",
  });

  const { data: studios, isLoading } = useStudios(filters);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <h1 className="text-2xl font-display font-bold">Makeup Studios</h1>
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search studio name..." 
                  className="pl-9"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
              <Select 
                value={filters.state} 
                onValueChange={(val) => setFilters(prev => ({ ...prev, state: val === "all" ? "" : val }))}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {LOCATIONS.map(loc => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <Skeleton key={n} className="h-80 w-full rounded-xl" />
            ))}
          </div>
        ) : studios?.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold">No studios found</h3>
            <p className="text-muted-foreground">Try adjusting your search filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {studios?.map((studio) => (
              <a key={studio.id} href={`/studios/${studio.slug}`} className="group block">
                <Card className="overflow-hidden hover:shadow-lg transition-all border-border/50">
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={studio.profileImage || `https://source.unsplash.com/800x600/?salon,spa,beauty`}
                      alt={studio.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{studio.name}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mb-4">
                      <MapPin className="h-3 w-3 mr-1" />
                      {studio.city}, {studio.state}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{studio.description}</p>
                  </CardContent>
                  <CardFooter className="p-6 pt-0 flex justify-between items-center text-sm">
                    <Badge variant="secondary">Verified Studio</Badge>
                    <span className="text-primary font-medium">Book Now →</span>
                  </CardFooter>
                </Card>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
