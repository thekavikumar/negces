import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BookingSlot } from '@/types';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  CalendarPlus,
  Calendar as CalIcon,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/hooks/useAuthStore';

// Function to fetch bookings
const fetchBookings = async (): Promise<BookingSlot[]> => {
  try {
    const token = useAuthStore.getState().token;
    const response = await fetch(
      `${import.meta.env.VITE_PUBLIC_BACKEND_URL}/api/bookings`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching bookings: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

const fetchUser = async (): Promise<void> => {
  try {
    const token = useAuthStore.getState().token;
    const response = await fetch(
      `${import.meta.env.VITE_PUBLIC_BACKEND_URL}/api/admins/me`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }
    const data = await response.json();
    useAuthStore.setState({ user: data, isLoading: false });
  } catch (error) {
    console.error('Error fetching user:', error);
    useAuthStore.setState({ token: null, user: null, isLoading: false });
  }
};

const Dashboard = () => {
  const navigate = useNavigate();

  // ✅ Use selectors to avoid unnecessary re-renders
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [bookings, setBookings] = useState<BookingSlot[]>([]);
  const [todayBookings, setTodayBookings] = useState<BookingSlot[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<BookingSlot[]>([]);

  // Fetch bookings from API
  const loadBookings = useCallback(async () => {
    try {
      const data = await fetchBookings();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  }, []);

  // Fetch user data when component mounts
  useEffect(() => {
    fetchUser();
  }, []);

  // ✅ Handle user authentication
  useEffect(() => {
    console.log('User:', user);
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [isLoading, user]);

  // ✅ Load bookings only when user is available
  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user]);

  // ✅ Filter today's and upcoming bookings efficiently
  useEffect(() => {
    if (bookings.length === 0) return;

    const today = new Date().toISOString().split('T')[0];

    const todaysBookings = bookings.filter((booking) => booking.date === today);
    const upcoming = bookings
      .filter(
        (booking) => booking.date > today && booking.status === 'confirmed'
      )
      .slice(0, 5);

    // ✅ Prevent unnecessary re-renders by only updating state if values change
    setTodayBookings((prev) =>
      JSON.stringify(prev) !== JSON.stringify(todaysBookings)
        ? todaysBookings
        : prev
    );

    setUpcomingBookings((prev) =>
      JSON.stringify(prev) !== JSON.stringify(upcoming) ? upcoming : prev
    );
  }, [bookings]);

  // Count stats
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(
    (b) => b.status === 'confirmed'
  ).length;
  const cancelledBookings = bookings.filter(
    (b) => b.status === 'cancelled'
  ).length;

  if (isLoading) {
    return <p>Loading...</p>;
  }

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
                {todayBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{booking.studentName}</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.computerName} • {booking.startTime} -{' '}
                        {booking.endTime}
                      </p>
                    </div>
                    <div className="mt-2 sm:mt-0">
                      <Badge variant="outline">{booking.status}</Badge>
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
                {upcomingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{booking.studentName}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(booking.date), 'PP')} •{' '}
                        {booking.computerName} • {booking.startTime} -{' '}
                        {booking.endTime}
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
