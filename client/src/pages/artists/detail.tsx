import { useRoute, Link } from "wouter";
import { useArtist } from "@/hooks/use-artists";
import { useCreateBooking } from "@/hooks/use-bookings";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Instagram, Phone, Share2, CheckCircle, Clock } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

export default function ArtistDetailPage() {
  const [match, params] = useRoute("/artists/:slug");
  const slug = params?.slug || "";
  const { data: artist, isLoading } = useArtist(slug);
  const { isAuthenticated } = useAuth();
  
  // Booking Form State
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [notes, setNotes] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const { mutate: createBooking, isPending } = useCreateBooking();

  const handleBooking = () => {
    if (!artist || !date || !time || !serviceId) return;

    createBooking({
      artistId: artist.id,
      serviceId: parseInt(serviceId),
      bookingDate: format(date, "yyyy-MM-dd"),
      bookingTime: time,
      location: artist.state, // Or allow user input
      notes
    }, {
      onSuccess: () => setIsOpen(false)
    });
  };

  if (isLoading) return <DetailSkeleton />;
  if (!artist) return <div className="text-center py-20">Artist not found</div>;

  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Header Image */}
      <div className="h-64 md:h-80 bg-secondary overflow-hidden relative">
        <div className="absolute inset-0 bg-black/30 z-10" />
        {/* makeup tools banner */}
        <img 
          src="https://source.unsplash.com/1600x400/?makeup,cosmetics,brushes" 
          alt="Banner" 
          className="w-full h-full object-cover"
        />
      </div>

      <div className="container mx-auto px-4 -mt-20 relative z-20">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar / Info Card */}
          <div className="w-full md:w-1/3 lg:w-1/4">
            <div className="bg-card rounded-2xl shadow-xl p-6 border border-border">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-md mx-auto -mt-16 mb-4 overflow-hidden bg-white">
                 <img 
                    src={artist.profileImage || `https://source.unsplash.com/400x400/?woman,portrait`}
                    alt={artist.name}
                    className="w-full h-full object-cover"
                  />
              </div>
              
              <div className="text-center mb-6">
                <h1 className="text-2xl font-display font-bold mb-1">{artist.name}</h1>
                <div className="flex items-center justify-center text-muted-foreground text-sm gap-1">
                  <MapPin className="h-3 w-3" />
                  {artist.city}, {artist.state}
                </div>
              </div>

              <div className="space-y-4 mb-6">
                 {artist.isVerified && (
                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-lg">
                    <CheckCircle className="h-4 w-4" /> Verified Artist
                  </div>
                 )}
                 
                 <div className="flex flex-wrap gap-2 justify-center">
                   {artist.specialties?.map(s => (
                     <Badge key={s} variant="outline" className="bg-background">{s}</Badge>
                   ))}
                 </div>
              </div>

              <div className="space-y-3">
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20" size="lg">
                      Book Now
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle className="font-display text-2xl">Book {artist.name}</DialogTitle>
                    </DialogHeader>
                    
                    {!isAuthenticated ? (
                      <div className="py-8 text-center space-y-4">
                        <p className="text-muted-foreground">Please log in to book an appointment.</p>
                        <a href="/api/login">
                          <Button>Log In to Continue</Button>
                        </a>
                      </div>
                    ) : (
                      <div className="space-y-6 py-4">
                        <div className="space-y-2">
                          <Label>Select Service</Label>
                          <Select onValueChange={setServiceId}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a service" />
                            </SelectTrigger>
                            <SelectContent>
                              {artist.services.map(s => (
                                <SelectItem key={s.id} value={s.id.toString()}>
                                  {s.name} - RM {(s.price / 100).toFixed(2)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                             <Label>Date</Label>
                             <div className="border rounded-md p-2">
                               <Calendar
                                  mode="single"
                                  selected={date}
                                  onSelect={setDate}
                                  className="rounded-md border-0 w-full"
                                  disabled={(date) => date < new Date()}
                               />
                             </div>
                           </div>
                           <div className="space-y-4">
                             <div className="space-y-2">
                               <Label>Time</Label>
                               <Input 
                                 type="time" 
                                 value={time} 
                                 onChange={e => setTime(e.target.value)} 
                               />
                             </div>
                             <div className="space-y-2">
                               <Label>Notes (Optional)</Label>
                               <Textarea 
                                 placeholder="Location details, specific requests..." 
                                 value={notes}
                                 onChange={e => setNotes(e.target.value)}
                                 className="h-24"
                               />
                             </div>
                           </div>
                        </div>

                        <Button 
                          className="w-full" 
                          onClick={handleBooking}
                          disabled={!serviceId || !date || !time || isPending}
                        >
                          {isPending ? "Sending Request..." : "Confirm Booking Request"}
                        </Button>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
                
                <Button variant="outline" className="w-full gap-2">
                  <Share2 className="h-4 w-4" /> Share Profile
                </Button>
              </div>

              <div className="mt-8 pt-6 border-t flex justify-center gap-4 text-muted-foreground">
                {artist.instagram && <Instagram className="h-5 w-5 hover:text-primary cursor-pointer" />}
                {artist.whatsapp && <Phone className="h-5 w-5 hover:text-primary cursor-pointer" />}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 mt-8 md:mt-0">
             <Tabs defaultValue="portfolio" className="w-full">
               <TabsList className="w-full justify-start bg-transparent border-b rounded-none h-12 p-0 space-x-8">
                 <TabsTrigger 
                    value="portfolio" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2 text-base"
                 >
                   Portfolio
                 </TabsTrigger>
                 <TabsTrigger 
                    value="services" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2 text-base"
                 >
                   Services & Pricing
                 </TabsTrigger>
                 <TabsTrigger 
                    value="about" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2 text-base"
                 >
                   About
                 </TabsTrigger>
               </TabsList>

               <TabsContent value="portfolio" className="mt-8 animate-fade-in">
                 {artist.portfolio.length === 0 ? (
                   <p className="text-muted-foreground italic">No portfolio items yet.</p>
                 ) : (
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                     {artist.portfolio.map((item) => (
                       <div key={item.id} className="group relative aspect-square rounded-xl overflow-hidden cursor-zoom-in bg-secondary">
                         <img 
                           src={item.imageUrl} 
                           alt={item.description || "Portfolio"} 
                           className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                         />
                         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                       </div>
                     ))}
                   </div>
                 )}
               </TabsContent>

               <TabsContent value="services" className="mt-8 animate-fade-in space-y-4">
                 {artist.services.length === 0 ? (
                   <p className="text-muted-foreground italic">No services listed yet.</p>
                 ) : (
                   <div className="grid gap-4">
                     {artist.services.map((service) => (
                       <div key={service.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-card border rounded-xl hover:shadow-md transition-shadow">
                         <div>
                           <h3 className="font-bold text-lg mb-1">{service.name}</h3>
                           <p className="text-muted-foreground text-sm max-w-xl">{service.description}</p>
                           {service.duration && (
                             <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                               <Clock className="h-3 w-3" />
                               {service.duration} mins
                             </div>
                           )}
                         </div>
                         <div className="mt-4 sm:mt-0 text-right">
                           <div className="text-xl font-bold text-primary mb-2">
                             RM {(service.price / 100).toFixed(2)}
                           </div>
                           <Button size="sm" onClick={() => {
                             setServiceId(service.id.toString());
                             setIsOpen(true);
                           }}>
                             Book
                           </Button>
                         </div>
                       </div>
                     ))}
                   </div>
                 )}
               </TabsContent>

               <TabsContent value="about" className="mt-8 animate-fade-in">
                 <div className="prose max-w-none text-muted-foreground">
                   <p className="whitespace-pre-line leading-relaxed">
                     {artist.bio || "No bio available."}
                   </p>
                 </div>
               </TabsContent>
             </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-64 w-full rounded-2xl mb-8" />
      <div className="flex gap-8">
        <Skeleton className="h-96 w-1/4 rounded-2xl" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
