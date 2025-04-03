import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { User } from '@/types';
import {
  CalendarDays,
  LayoutDashboard,
  Users,
  Computer,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/hooks/useAuthStore';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [navigate]);

  if (!user) {
    return <div>Loading...</div>;
  }

  const navItems = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Calendar',
      path: '/calendar',
      icon: CalendarDays,
    },
    {
      title: 'Computers',
      path: '/computers',
      icon: Computer,
    },
    ...(user.role === 'super_admin'
      ? [{ title: 'Manage Admins', path: '/admins', icon: Users }]
      : []),
    {
      title: 'Settings',
      path: '/settings',
      icon: Settings,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} />
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 border-r hidden md:block">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.path}
                className={cn(
                  'w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-colors',
                  'hover:bg-accent/10',
                  location.pathname === item.path
                    ? 'bg-accent/10 text-accent-foreground font-medium'
                    : 'text-muted-foreground'
                )}
                onClick={() => navigate(item.path)}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
