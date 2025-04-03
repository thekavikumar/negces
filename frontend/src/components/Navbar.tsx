import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CalendarDays, LogOut, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  user: User | null;
}

export const Navbar = ({ user }: NavbarProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  return (
    <header className="bg-background border-b sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CalendarDays className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Negces Lab Bookings</h1>
        </div>

        {user ? (
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground hidden md:inline-block">
              Logged in as{' '}
              <span className="font-medium text-foreground">{user.name}</span>
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <UserIcon className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {user.name}
                  <p className="text-xs text-muted-foreground">{user.role}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/calendar')}>
                  Calendar
                </DropdownMenuItem>
                {user.role === 'super_admin' && (
                  <DropdownMenuItem onClick={() => navigate('/admins')}>
                    Manage Admins
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <Button onClick={() => navigate('/login')}>Log In</Button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
