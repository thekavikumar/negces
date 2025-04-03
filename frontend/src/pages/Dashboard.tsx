
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookingSlot, User, mockBookings } from '@/types';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { CalendarPlus, Calendar as CalIcon, CheckCircle, XCircle } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<BookingSlot[]>([]);
  const [todayBookings, setTodayBookings] = useState<BookingSlot[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<BookingSlot[]>([]);
  
  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/login');
      return;
    }
    
    // In a real app, fetch bookings from API
    setBookings(mockBookings);
  }, [navigate]);
  
  useEffect(() => {
    if (!bookings.length) return;
    
    const today = new Date().toISOString().split('T')[0];
    const filtered = bookings.filter(booking => booking.date === today);
    setTodayBookings(filtered);
    
    const upcoming = bookings.filter(
      booking => booking.date > today && booking.status === 'confirmed'
    ).slice(0, 5);
    setUpcomingBookings(upcoming);
  }, [bookings]);
  
  // Count stats
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
  
  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of lab bookings and slot availability
            </p>
          </div>
          <Button onClick={() => navigate('/calendar')}>
            <CalendarPlus className="mr-2 h-4 w-4" />
            New Booking
          </Button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Bookings</CardDescription>
              <CardTitle className="text-3xl">{totalBookings}</CardTitle>
            </CardHeader>
            <CardContent>
              <CalIcon className="text-primary h-4 w-4" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Confirmed Bookings</CardDescription>
              <CardTitle className="text-3xl">{confirmedBookings}</CardTitle>
            </CardHeader>
            <CardContent>
              <CheckCircle className="text-green-500 h-4 w-4" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Cancelled Bookings</CardDescription>
              <CardTitle className="text-3xl">{cancelledBookings}</CardTitle>
            </CardHeader>
            <CardContent>
              <XCircle className="text-red-500 h-4 w-4" />
            </CardContent>
          </Card>
        </div>
        
        {/* Today's Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Bookings</CardTitle>
            <CardDescription>
              Bookings scheduled for {format(new Date(), 'PPP')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todayBookings.length > 0 ? (
              <div className="divide-y">
                {todayBookings.map(booking => (
                  <div key={booking.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between">
                    <div>
                      <p className="font-medium">{booking.studentName}</p>
                      <p className="text-sm text-muted-foreground">{booking.computerName} • {booking.startTime} - {booking.endTime}</p>
                    </div>
                    <div className="mt-2 sm:mt-0">
                      <Badge variant="outline" className="ml-2">
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No bookings scheduled for today
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Upcoming Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
            <CardDescription>
              Next {upcomingBookings.length} upcoming bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingBookings.length > 0 ? (
              <div className="divide-y">
                {upcomingBookings.map(booking => (
                  <div key={booking.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between">
                    <div>
                      <p className="font-medium">{booking.studentName}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(booking.date), 'PP')} • {booking.computerName} • {booking.startTime} - {booking.endTime}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No upcoming bookings
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

// Make Badge available in this file
import { Badge } from "@/components/ui/badge";
