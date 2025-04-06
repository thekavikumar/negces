import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import { BookingForm } from '@/components/BookingForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { BookingSlot } from '@/types';
import { format, isSameDay } from 'date-fns';
import { useAuthStore } from '@/hooks/useAuthStore';

const toIST = (date: Date) => {
  const utcDate = new Date(date.toUTCString().slice(0, -3) + '+00:00');
  return new Date(utcDate.getTime() + utcDate.getTimezoneOffset() * 60000);
};

const BookingCalendar = () => {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [bookingsForDate, setBookingsForDate] = useState<BookingSlot[]>([]);
  const [bookings, setBookings] = useState<BookingSlot[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dummy, setDummy] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const resp = await fetch(
          `${import.meta.env.VITE_PUBLIC_BACKEND_URL}/api/bookings`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        if (!resp.ok) {
          console.error('Failed to fetch bookings');
          return;
        }

        const data = await resp.json();
        console.log('Fetched bookings:', data);

        // Transform raw response
        const transformed = data.map((booking: any) => ({
          id: booking._id,
          studentName: booking.student?.name || 'Unknown',
          studentEmail: booking.student?.email || 'N/A',
          computerName: booking.computer?.name || 'N/A',
          adminName: booking.admin?.name || 'N/A',
          startTime: booking.startTime,
          endTime: booking.endTime,
        }));

        setBookings(transformed);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    };

    fetchBookings();
  }, [dummy]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [navigate, user]);

  useEffect(() => {
    if (selectedDate) {
      const filtered = bookings.filter((booking) =>
        isSameDay(new Date(booking.startTime), selectedDate)
      );
      setBookingsForDate(filtered);
    } else {
      setBookingsForDate([]);
    }
  }, [selectedDate, bookings, dialogOpen]);

  const isDateBooked = (date: Date) => {
    return bookings.some((booking) =>
      isSameDay(new Date(booking.startTime), date)
    );
  };

  const handleNewBooking = () => {
    if (selectedDate) {
      setDialogOpen(true);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Booking Calendar</h1>
            <p className="text-muted-foreground">
              View and manage lab slot bookings
            </p>
          </div>
          <Button onClick={handleNewBooking} disabled={!selectedDate}>
            <Plus className="mr-2 h-4 w-4" />
            New Booking
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Select Date</CardTitle>
              <CardDescription>
                Choose a day to view or create bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                modifiers={{
                  booked: (date) => isDateBooked(date),
                }}
                modifiersStyles={{
                  booked: {
                    fontWeight: 'bold',
                    backgroundColor: 'hsl(var(--primary) / 0.1)',
                  },
                }}
              />
            </CardContent>
          </Card>

          {/* Bookings for selected date */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>
                {selectedDate
                  ? format(selectedDate, 'PPPP')
                  : 'No date selected'}
              </CardTitle>
              <CardDescription>
                {bookingsForDate.length} bookings scheduled
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bookingsForDate.length > 0 ? (
                <div className="divide-y">
                  {bookingsForDate.map((booking) => (
                    <div key={booking.id} className="py-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                        <h3 className="font-medium">{booking.studentName}</h3>
                        <div className="text-sm text-muted-foreground">
                          {format(
                            toIST(new Date(booking.startTime)),
                            'hh:mm aa'
                          )}{' '}
                          -{' '}
                          {format(toIST(new Date(booking.endTime)), 'hh:mm aa')}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row text-sm gap-x-4 text-muted-foreground">
                        <div>PC: {booking.computerName}</div>
                        <div>Email: {booking.studentEmail}</div>
                        <div>Created by: {booking.adminName}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : selectedDate ? (
                <div className="text-center py-8 text-muted-foreground">
                  No bookings for this date. Create a new booking to get
                  started.
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Select a date to view bookings.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* New Booking Dialog */}
      {user && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Booking</DialogTitle>
            </DialogHeader>
            <BookingForm
              token={token}
              dummy={dummy}
              setDummy={setDummy}
              selectedDate={selectedDate}
              onBookingComplete={handleDialogClose}
              currentUser={user}
            />
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
};

export default BookingCalendar;
