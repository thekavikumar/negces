import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '@/components/AuthForm';
import { CalendarDays } from 'lucide-react';
import { useAuthStore } from '@/hooks/useAuthStore';

const Login = () => {
  const navigate = useNavigate();
  const { user, token, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && user && token) {
      navigate('/dashboard');
    }
  }, [user, token, isLoading, navigate]);

  return (
    <div className="min-h-screen flex flex-col justify-center bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center space-y-4 mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <CalendarDays className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-center">
            Negces Lab Bookings
          </h1>
          <p className="text-muted-foreground text-center max-w-md">
            Lab scheduling and slot booking system for Amrita University
          </p>
        </div>

        <AuthForm />
      </div>
    </div>
  );
};

export default Login;
