import { useLocation } from "wouter";
import { useArtists } from "@/hooks/use-artists";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MapPin, Filter } from "lucide-react";
import { useState, useEffect } from "react";

const LOCATIONS = ["Kuala Lumpur", "Selangor", "Penang", "Johor", "Sabah", "Sarawak"];
const SPECIALTIES = ["Wedding", "Dinner", "Photoshoot", "SFX", "Natural"];

export default function ArtistsPage() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    state: searchParams.get("state") || "",
    specialty: searchParams.get("specialty") || "",
  });

  const { data: artists, isLoading } = useArtists(filters);

  // Debounce search update
  const handleSearchChange = (val: string) => {
    setFilters(prev => ({ ...prev, search: val }));
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <h1 className="text-2xl font-display font-bold">Find Makeup Artists</h1>
            
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search name..." 
                  className="pl-9"
                  value={filters.search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
              
              <Select 
                value={filters.state} 
                onValueChange={(val) => setFilters(prev => ({ ...prev, state: val === "all" ? "" : val }))}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {LOCATIONS.map(loc => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={filters.specialty} 
                onValueChange={(val) => setFilters(prev => ({ ...prev, specialty: val === "all" ? "" : val }))}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Styles</SelectItem>
                  {SPECIALTIES.map(spec => (
                    <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-card rounded-xl p-4 space-y-4">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : artists?.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-muted mb-4">
              <Filter className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No artists found</h3>
            <p className="text-muted-foreground">Try adjusting your filters to see more results.</p>
            <Button 
              variant="link" 
              onClick={() => setFilters({ search: "", state: "", specialty: "" })}
              className="mt-4 text-primary"
            >
              Clear all filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {artists?.map((artist) => (
              <a key={artist.id} href={`/artists/${artist.slug}`} className="group block h-full">
                <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/20 bg-card">
                  <div className="relative h-64 overflow-hidden">
                    {/* beauty portrait */}
                    <img 
                      src={artist.profileImage || `https://source.unsplash.com/600x400/?makeup,portrait,${artist.specialties?.[0] || 'beauty'}`}
                      alt={artist.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3">
                      {artist.isVerified && (
                        <Badge className="bg-white/90 text-primary hover:bg-white backdrop-blur-sm shadow-sm">
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold font-display group-hover:text-primary transition-colors">
                        {artist.name}
                      </h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-1" />
                        {artist.city}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {artist.bio || "Professional Makeup Artist based in Malaysia."}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {artist.specialties?.slice(0, 3).map(spec => (
                        <Badge key={spec} variant="secondary" className="text-xs font-normal">
                          {spec}
                        </Badge>
                      ))}
                      {artist.specialties && artist.specialties.length > 3 && (
                        <Badge variant="secondary" className="text-xs font-normal">
                          +{artist.specialties.length - 3}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="p-6 pt-0 border-t bg-secondary/10 flex justify-between items-center text-sm text-muted-foreground">
                    <span>{artist.priceRange || "Contact for pricing"}</span>
                    <span className="font-medium text-primary">View Profile →</span>
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
