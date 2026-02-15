import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, MapPin, Sparkles, Star, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useArtists } from "@/hooks/use-artists";

const LOCATIONS = ["Kuala Lumpur", "Selangor", "Penang", "Johor", "Sabah", "Sarawak"];
const SPECIALTIES = ["Wedding", "Dinner", "Photoshoot", "SFX", "Natural"];

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
        {/* Abstract Background */}
        <div className="absolute inset-0 bg-primary/5 z-0" />
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-background to-transparent z-10" />
        
        {/* Content */}
        <div className="container relative z-20 px-4 text-center max-w-4xl mx-auto">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground mb-6 leading-tight">
              Your Beauty, <br/>
              <span className="text-primary italic">Perfected.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Discover and book Malaysia's finest makeup artists for your wedding, event, or photoshoot.
            </p>
          </div>

          {/* Search Box */}
          <div className="bg-white p-4 rounded-2xl shadow-xl shadow-black/5 max-w-3xl mx-auto flex flex-col md:flex-row gap-4 animate-fade-in delay-100 border border-border/50">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search artist or style..." 
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

      {/* Featured Categories */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Explore by Style</h2>
            <p className="text-muted-foreground">Find the perfect look for your occasion</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {SPECIALTIES.map((spec, i) => (
              <Link key={spec} href={`/artists?specialty=${spec}`}>
                <div className="group cursor-pointer">
                  <div className="aspect-square rounded-2xl bg-secondary mb-4 overflow-hidden relative">
                    {/* Placeholder for category image - using Unsplash source with keywords */}
                    {/* makeup ${spec} */}
                    <img 
                      src={`https://source.unsplash.com/400x400/?makeup,${spec}`}
                      alt={spec}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-bold text-lg tracking-wide">{spec}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
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
              <p className="text-muted-foreground">Browse portfolios, read reviews, and find an artist that matches your style.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 text-primary">
                <Calendar className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">2. Book</h3>
              <p className="text-muted-foreground">Select your service, choose a date, and send a booking request directly.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 text-primary">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">3. Glow</h3>
              <p className="text-muted-foreground">Sit back, relax, and let the artist work their magic on your special day.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
