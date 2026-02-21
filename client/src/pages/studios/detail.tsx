import { useRoute } from "wouter";
import { useStudio } from "@/hooks/use-studios";
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
import { MapPin, Phone, CheckCircle, Clock, Building2 } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

export default function StudioDetailPage() {
  const [_, params] = useRoute("/studios/:slug");
  const slug = params?.slug || "";
  const { data: studio, isLoading } = useStudio(slug);
  const { isAuthenticated } = useAuth();
  
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [notes, setNotes] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const { mutate: createBooking, isPending } = useCreateBooking();

  const handleBooking = () => {
    if (!studio || !date || !time || !serviceId) return;
    createBooking({
      studioId: studio.id,
      serviceId: parseInt(serviceId),
      bookingDate: format(date, "yyyy-MM-dd"),
      bookingTime: time,
      notes
    }, { onSuccess: () => setIsOpen(false) });
  };

  if (isLoading) return <div className="container mx-auto p-8"><Skeleton className="h-96 w-full" /></div>;
  if (!studio) return <div className="text-center py-20">Studio not found</div>;

  return (
    <div className="bg-background min-h-screen pb-20">
      <div className="h-64 bg-secondary relative overflow-hidden">
        <img src="https://source.unsplash.com/1600x400/?beauty-salon,spa" alt="Banner" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 flex items-end p-8">
           <div className="container mx-auto">
             <h1 className="text-4xl font-bold text-white mb-2">{studio.name}</h1>
             <p className="text-white/80 flex items-center gap-2"><MapPin className="h-4 w-4" /> {studio.address}, {studio.city}</p>
           </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Tabs defaultValue="services">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                <TabsTrigger value="about">About</TabsTrigger>
              </TabsList>
              <TabsContent value="services" className="pt-6 space-y-4">
                {studio.services.map(s => (
                  <div key={s.id} className="p-6 border rounded-xl flex justify-between items-center bg-card">
                    <div>
                      <h3 className="font-bold">{s.name}</h3>
                      <p className="text-sm text-muted-foreground">{s.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2"><Clock className="h-3 w-3" /> {s.duration} mins</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary mb-2">RM {(s.price / 100).toFixed(2)}</div>
                      <Button size="sm" onClick={() => { setServiceId(s.id.toString()); setIsOpen(true); }}>Book</Button>
                    </div>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="portfolio" className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {studio.portfolio.map(p => (
                    <img key={p.id} src={p.imageUrl} className="aspect-square object-cover rounded-lg" alt="Work" />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="about" className="pt-6">
                <p className="text-muted-foreground leading-relaxed">{studio.description}</p>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <div className="p-6 border rounded-xl bg-card space-y-4">
               <h3 className="font-bold text-lg">Location & Contact</h3>
               <div className="space-y-2 text-sm">
                 <p className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-1" /> {studio.address}</p>
                 <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> {studio.contactNumber}</p>
               </div>
               <Dialog open={isOpen} onOpenChange={setIsOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">Book Appointment</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader><DialogTitle>Book at {studio.name}</DialogTitle></DialogHeader>
                    {!isAuthenticated ? (
                      <div className="py-4 text-center"><p className="mb-4">Log in to book.</p><a href="/api/login"><Button>Log In</Button></a></div>
                    ) : (
                      <div className="space-y-4 py-4">
                        <Label>Service</Label>
                        <Select onValueChange={setServiceId} value={serviceId}>
                          <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
                          <SelectContent>{studio.services.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}</SelectContent>
                        </Select>
                        <Label>Date</Label>
                        <Calendar mode="single" selected={date} onSelect={setDate} disabled={(d) => d < new Date()} />
                        <Label>Time</Label>
                        <Input type="time" value={time} onChange={e => setTime(e.target.value)} />
                        <Button className="w-full" onClick={handleBooking} disabled={isPending}>Confirm Booking</Button>
                      </div>
                    )}
                  </DialogContent>
               </Dialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
