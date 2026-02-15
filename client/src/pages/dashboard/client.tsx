import { useBookings } from "@/hooks/use-bookings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";

export default function ClientDashboard() {
  const { data: bookings, isLoading } = useBookings();

  if (isLoading) return <div>Loading bookings...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold font-display">My Bookings</h2>
      </div>

      {!bookings?.length ? (
        <Card>
          <CardContent className="py-20 text-center text-muted-foreground">
            You haven't made any bookings yet.
            <div className="mt-4">
              <a href="/artists" className="text-primary hover:underline">Find an artist</a>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                       <h3 className="font-bold text-lg">{booking.artist?.name || "Unknown Artist"}</h3>
                       <Badge variant={
                         booking.status === 'confirmed' ? 'default' : 
                         booking.status === 'cancelled' ? 'destructive' : 'secondary'
                       }>
                         {booking.status.toUpperCase()}
                       </Badge>
                    </div>
                    <div className="text-muted-foreground text-sm flex flex-col sm:flex-row gap-2 sm:gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(booking.bookingDate), "MMM d, yyyy")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {booking.bookingTime}
                      </span>
                      {booking.service && (
                        <span className="font-medium text-foreground">
                           • {booking.service.name} (RM {(booking.service.price / 100).toFixed(2)})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
