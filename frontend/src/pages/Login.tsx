
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '@/components/AuthForm';
import { CalendarDays } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if already logged in
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      navigate('/dashboard');
    }
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex flex-col justify-center bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center space-y-4 mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <CalendarDays className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-center">CodeLab Bookings</h1>
          <p className="text-muted-foreground text-center max-w-md">
            Lab scheduling and slot booking system for computer science department
          </p>
        </div>
        
        <AuthForm />
      </div>
      
      <footer className="mt-16 text-center text-sm text-muted-foreground p-4">
        <p>For demo, use:</p>
        <p><strong>Super Admin:</strong> super@codelab.edu / password</p>
        <p><strong>Regular Admin:</strong> admin1@codelab.edu / password</p>
      </footer>
    </div>
  );
};

export default Login;
