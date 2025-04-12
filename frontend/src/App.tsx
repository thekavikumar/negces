import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Pages
import Index from './pages/Index';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BookingCalendar from './pages/BookingCalendar';
import Computers from './pages/Computers';
import ManageAdmins from './pages/ManageAdmins';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/calendar" element={<BookingCalendar />} />
          <Route path="/computers" element={<Computers />} />
          <Route path="/admins" element={<ManageAdmins />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      {/* <BrowserRouter basename="/negces">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/calendar" element={<BookingCalendar />} />
          <Route path="/computers" element={<Computers />} />
          <Route path="/admins" element={<ManageAdmins />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter> */}
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
