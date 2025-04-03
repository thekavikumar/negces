import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CalendarDays, Users, Clock, Computer, Mail } from 'lucide-react';
import { useAuthStore } from '@/hooks/useAuthStore';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  useEffect(() => {
    // Check if already logged in

    if (user) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const features = [
    {
      icon: CalendarDays,
      title: 'Easy Scheduling',
      description: 'Book lab slots with an intuitive calendar interface.',
    },
    {
      icon: Computer,
      title: 'System Assignment',
      description: 'Assign specific computer systems to students.',
    },
    {
      icon: Users,
      title: 'Admin Management',
      description: 'Super admin can manage all booking admins.',
    },
    {
      icon: Clock,
      title: 'Real-time Availability',
      description: 'See computer and time slot availability in real-time.',
    },
    {
      icon: Mail,
      title: 'Email Notifications',
      description: 'Automatic email notifications for all bookings.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero section */}
      <div className="container mx-auto px-4 pt-20 pb-16 flex flex-col items-center text-center">
        <div className="inline-block p-4 bg-primary/10 rounded-full mb-6">
          <CalendarDays className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold max-w-3xl mb-6">
          Computer Science Lab Booking System
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mb-8">
          Efficiently manage lab resources, schedule student sessions, and
          optimize computer usage
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button size="lg" onClick={() => navigate('/login')}>
            Log In
          </Button>
        </div>
      </div>

      {/* Features grid */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Streamline Your Lab Management
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card shadow-sm rounded-lg p-6 border"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto bg-accent/10 rounded-lg p-8 border border-accent/20">
          <h2 className="text-2xl font-bold mb-4">
            Ready to optimize your lab management?
          </h2>
          <p className="mb-6 text-muted-foreground">
            Start booking computer lab slots efficiently and securely.
          </p>
          <Button size="lg" onClick={() => navigate('/login')}>
            Get Started
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()} CodeLab Bookings. All rights reserved.
        </p>
        <p className="mt-2">Demo credentials: super@codelab.edu / password</p>
      </footer>
    </div>
  );
};

export default Index;
