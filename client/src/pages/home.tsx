import { useLocation } from "wouter";
import { useStudios } from "@/hooks/use-studios";
import { useArtists } from "@/hooks/use-artists";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin, Sparkles, Calendar, Building2, Users } from "lucide-react";
import { useState } from "react";

const LOCATIONS = ["Kuala Lumpur", "Selangor", "Penang", "Johor", "Sabah", "Sarawak"];

export default function Home() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [_, setLocationPath] = useLocation();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (location) params.append("state", location);
    setLocationPath(`/artists?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 z-0" />
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-background to-transparent z-10" />
        
        <div className="container relative z-20 px-4 text-center max-w-4xl mx-auto">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground mb-6 leading-tight">
              Your Beauty, <br/>
              <span className="text-primary italic">Perfected.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Malaysia's premium platform to book professional makeup artists and luxury beauty studios.
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-xl shadow-black/5 max-w-3xl mx-auto flex flex-col md:flex-row gap-4 animate-fade-in delay-100 border border-border/50">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search artists, studios, or styles..." 
                className="pl-10 h-12 border-transparent bg-secondary/30 focus-visible:ring-primary/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="h-12 border-transparent bg-secondary/30 focus:ring-primary/20">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <SelectValue placeholder="Location" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map(loc => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              size="lg" 
              className="h-12 px-8 bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/25"
              onClick={handleSearch}
            >
              Search
            </Button>
          </div>
        </div>
      </section>

      {/* Booking Options */}
      <section className="py-20 bg-background border-y">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <a href="/artists" className="group">
              <Card className="p-8 h-full hover:border-primary/50 transition-all hover:shadow-xl bg-card">
                <div className="flex items-start gap-6">
                  <div className="p-4 bg-primary/10 rounded-2xl group-hover:bg-primary group-hover:text-white transition-colors">
                    <Users className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Freelance Artists</h3>
                    <p className="text-muted-foreground mb-4">Book independent professional makeup artists for house calls or events.</p>
                    <span className="text-primary font-semibold flex items-center gap-1">Browse Artists <Sparkles className="h-4 w-4" /></span>
                  </div>
                </div>
              </Card>
            </a>
            <a href="/studios" className="group">
              <Card className="p-8 h-full hover:border-primary/50 transition-all hover:shadow-xl bg-card">
                <div className="flex items-start gap-6">
                  <div className="p-4 bg-primary/10 rounded-2xl group-hover:bg-primary group-hover:text-white transition-colors">
                    <Building2 className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Makeup Studios</h3>
                    <p className="text-muted-foreground mb-4">Experience premium beauty services at luxury studios across Malaysia.</p>
                    <span className="text-primary font-semibold flex items-center gap-1">Book a Studio <Sparkles className="h-4 w-4" /></span>
                  </div>
                </div>
              </Card>
            </a>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-10">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 text-primary">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">1. Discover</h3>
              <p className="text-muted-foreground">Browse portfolios of top freelancers or explore luxury studio amenities.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 text-primary">
                <Calendar className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">2. Book</h3>
              <p className="text-muted-foreground">Choose your service and time, then book instantly with secure confirmation.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 text-primary">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">3. Glow</h3>
              <p className="text-muted-foreground">Get ready for your big day with Malaysia's most trusted beauty professionals.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
