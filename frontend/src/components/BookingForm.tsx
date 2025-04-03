
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';
import { ComputerSystem, BookingSlot, User } from '@/types';
import { mockComputers, mockBookings } from '@/types';
import { format } from 'date-fns';

interface BookingFormProps {
  selectedDate: Date | null;
  onBookingComplete: () => void;
  currentUser: User;
}

export const BookingForm = ({ selectedDate, onBookingComplete, currentUser }: BookingFormProps) => {
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedComputer, setSelectedComputer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const availableComputers = mockComputers.filter(computer => computer.isAvailable);
  
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 20; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };
  
  const timeSlots = generateTimeSlots();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate) {
      toast.error('Please select a date');
      return;
    }
    
    setIsSubmitting(true);
    
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    const computer = mockComputers.find(c => c.id === selectedComputer);
    
    // Create new booking
    const newBooking: BookingSlot = {
      id: (mockBookings.length + 1).toString(),
      date: formattedDate,
      startTime,
      endTime,
      computerId: selectedComputer,
      computerName: computer?.name || '',
      studentName,
      studentEmail,
      adminId: currentUser.id,
      adminName: currentUser.name,
      createdAt: new Date().toISOString(),
      status: 'confirmed',
    };
    
    // Simulate API call
    setTimeout(() => {
      mockBookings.push(newBooking);
      
      toast.success('Booking created successfully');
      toast('Email notifications sent', {
        description: `Notifications sent to ${studentEmail}, ${currentUser.email}, and super@codelab.edu`,
      });
      
      setIsSubmitting(false);
      resetForm();
      onBookingComplete();
    }, 1500);
  };
  
  const resetForm = () => {
    setStudentName('');
    setStudentEmail('');
    setStartTime('');
    setEndTime('');
    setSelectedComputer('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="date">Selected Date</Label>
          <Input 
            id="date" 
            value={selectedDate ? format(selectedDate, 'PPPP') : 'No date selected'} 
            disabled 
            className="bg-muted/50"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="studentName">Student Name</Label>
            <Input 
              id="studentName" 
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="studentEmail">Student Email</Label>
            <Input 
              id="studentEmail"
              type="email"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              placeholder="student@example.com"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startTime">Start Time</Label>
            <Select value={startTime} onValueChange={setStartTime} required>
              <SelectTrigger id="startTime">
                <SelectValue placeholder="Select start time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={`start-${time}`} value={time}>{time}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="endTime">End Time</Label>
            <Select value={endTime} onValueChange={setEndTime} required>
              <SelectTrigger id="endTime" disabled={!startTime}>
                <SelectValue placeholder="Select end time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots
                  .filter(time => time > startTime)
                  .map((time) => (
                    <SelectItem key={`end-${time}`} value={time}>{time}</SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <Label htmlFor="computer">Computer System</Label>
          <Select value={selectedComputer} onValueChange={setSelectedComputer} required>
            <SelectTrigger id="computer">
              <SelectValue placeholder="Select computer" />
            </SelectTrigger>
            <SelectContent>
              {availableComputers.map((computer) => (
                <SelectItem key={computer.id} value={computer.id}>
                  {computer.name} ({computer.location})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Creating booking...' : 'Create Booking'}
      </Button>
    </form>
  );
};

export default BookingForm;
