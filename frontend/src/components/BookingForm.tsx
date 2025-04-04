import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { ComputerSystem, User } from '@/types';
import { format } from 'date-fns';

interface BookingFormProps {
  selectedDate: Date | null;
  onBookingComplete: () => void;
  currentUser: User;
  token: string;
  dummy: boolean;
  setDummy: (value: boolean) => void;
}

interface Student {
  _id: string;
  name: string;
  email: string;
  rollNumber: string;
  phone: string;
  department: string;
}

export const BookingForm = ({
  selectedDate,
  onBookingComplete,
  currentUser,
  token,
  dummy,
  setDummy,
}: BookingFormProps) => {
  const [mode, setMode] = useState<'create' | 'select'>('select');
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentRollNumber, setStudentRollNumber] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [studentDepartment, setStudentDepartment] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedComputer, setSelectedComputer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableComputers, setAvailableComputers] = useState<
    ComputerSystem[]
  >([]);

  // Fetch computers
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const fetchComputers = async () => {
      try {
        const resp = await fetch(
          `${import.meta.env.VITE_PUBLIC_BACKEND_URL}/api/computers`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!resp.ok) throw new Error('Failed to fetch computers');
        const data = await resp.json();
        const filtered =
          data.filter((computer: ComputerSystem) => computer.availability) ||
          [];
        setAvailableComputers(filtered);
      } catch (error) {
        console.error(error);
        toast.error('Error loading computers, please refresh the page.');
      }
    };

    timeoutId = setTimeout(() => fetchComputers(), 300);
    return () => clearTimeout(timeoutId);
  }, [token]);

  // Fetch students for search
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const resp = await fetch(
          `${
            import.meta.env.VITE_PUBLIC_BACKEND_URL
          }/api/students?search=${studentSearch}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!resp.ok) throw new Error('Failed to fetch students');
        const data = await resp.json();
        setStudents(data);
      } catch (error) {
        console.error(error);
        toast.error('Error loading students');
      }
    };

    if (mode === 'select' && studentSearch.length > 2) {
      fetchStudents();
    }
  }, [studentSearch, mode, token]);

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 20; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleStudentSelect = (studentId: string) => {
    const student = students.find((s) => s._id === studentId);
    if (student) {
      setSelectedStudentId(studentId);
      setStudentName(student.name);
      setStudentEmail(student.email);
      setStudentRollNumber(student.rollNumber);
      setStudentPhone(student.phone);
      setStudentDepartment(student.department);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate) {
      toast.error('Please select a date');
      return;
    }

    if (startTime >= endTime) {
      toast.error('End time must be after start time');
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const computer = availableComputers.find(
        (c) => c._id === selectedComputer
      );

      if (!computer) {
        toast.error('Invalid computer selected');
        return;
      }

      let studentId = selectedStudentId;

      // Create a new student if in "create" mode
      if (mode === 'create') {
        const sanitizedName = studentName.trim();
        const sanitizedEmail = studentEmail.trim().toLowerCase();
        const sanitizedRollNumber = studentRollNumber.trim();
        const sanitizedPhone = studentPhone.trim();
        const sanitizedDepartment = studentDepartment.trim();

        const studentResponse = await fetch(
          `${import.meta.env.VITE_PUBLIC_BACKEND_URL}/api/students`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: sanitizedName,
              email: sanitizedEmail,
              rollNumber: sanitizedRollNumber,
              phone: sanitizedPhone,
              department: sanitizedDepartment,
            }),
          }
        );

        if (!studentResponse.ok) {
          throw new Error('Failed to create student');
        }

        const newStudent = await studentResponse.json();
        // console.log('New student created:', newStudent);
        studentId = newStudent.student._id;
      }

      // console.log('Selected student ID:', studentId);
      if (!studentId) {
        toast.error('Please select or create a student');
        return;
      }

      // Simulate delay

      // Proceed with booking creation
      const startISO = `${formattedDate}T${startTime}:00.000Z`;
      const endISO = `${formattedDate}T${endTime}:00.000Z`;

      const payload = {
        student: studentId,
        computer: computer._id,
        startTime: startISO,
        endTime: endISO,
        admin: currentUser._id,
      };

      const bookingResponse = await fetch(
        `${import.meta.env.VITE_PUBLIC_BACKEND_URL}/api/bookings`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!bookingResponse.ok) {
        const errorData = await bookingResponse.json();
        throw new Error(errorData.message || 'Failed to create booking');
      }

      toast.success('Booking created successfully');
      toast('Email notifications sent', {
        description: `Notifications sent to ${studentEmail}, ${currentUser.email}, and super@codelab.edu`,
      });
      setDummy(!dummy);
      resetForm();
      onBookingComplete();
    } catch (error: any) {
      console.error('Booking error:', error);
      toast.error(
        error.message || 'An error occurred while creating the booking'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setMode('select');
    setStudentSearch('');
    setSelectedStudentId('');
    setStudentName('');
    setStudentEmail('');
    setStudentRollNumber('');
    setStudentPhone('');
    setStudentDepartment('');
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
            value={
              selectedDate ? format(selectedDate, 'PPPP') : 'No date selected'
            }
            disabled
            className="bg-muted/50"
          />
        </div>

        <div
          className={`grid ${
            mode === 'select' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
          } gap-4`}
        >
          <div className={mode === 'create' ? 'md:col-span-2' : ''}>
            <Label>Student Mode</Label>
            <Select
              value={mode}
              onValueChange={(value: 'create' | 'select') => setMode(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="select">Select Existing Student</SelectItem>
                <SelectItem value="create">Create New Student</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {mode === 'select' && (
            <div>
              <Label htmlFor="studentSearch">Search Student</Label>
              <Select
                value={selectedStudentId}
                onValueChange={handleStudentSelect}
              >
                <SelectTrigger id="studentSearch">
                  <SelectValue placeholder="Search by name or roll number" />
                </SelectTrigger>
                <SelectContent>
                  <Input
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Type to search..."
                    className="mb-2"
                  />
                  {students.map((student) => (
                    <SelectItem key={student._id} value={student._id}>
                      {student.name} ({student.rollNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="studentName">Student Name</Label>
            <Input
              id="studentName"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="John Doe"
              required={mode === 'create'}
              disabled={mode === 'select'}
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
              required={mode === 'create'}
              disabled={mode === 'select'}
            />
          </div>

          <div>
            <Label htmlFor="studentRollNumber">Roll Number</Label>
            <Input
              id="studentRollNumber"
              value={studentRollNumber}
              onChange={(e) => setStudentRollNumber(e.target.value)}
              placeholder="CS12345"
              required={mode === 'create'}
              disabled={mode === 'select'}
            />
          </div>

          <div>
            <Label htmlFor="studentPhone">Phone Number</Label>
            <Input
              id="studentPhone"
              value={studentPhone}
              onChange={(e) => setStudentPhone(e.target.value)}
              placeholder="+1234567890"
              required={mode === 'create'}
              disabled={mode === 'select'}
            />
          </div>

          <div>
            <Label htmlFor="studentDepartment">Department</Label>
            <Input
              id="studentDepartment"
              value={studentDepartment}
              onChange={(e) => setStudentDepartment(e.target.value)}
              placeholder="Computer Science"
              required={mode === 'create'}
              disabled={mode === 'select'}
            />
          </div>

          <div>
            <Label htmlFor="computer">Computer System</Label>
            <Select
              value={selectedComputer}
              onValueChange={setSelectedComputer}
              required
            >
              <SelectTrigger id="computer">
                <SelectValue placeholder="Select computer" />
              </SelectTrigger>
              <SelectContent>
                {availableComputers.map((computer) => (
                  <SelectItem key={computer._id} value={computer._id}>
                    {computer.name} ({computer.location})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                  <SelectItem key={`start-${time}`} value={time}>
                    {time}
                  </SelectItem>
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
                  .filter((time) => time > startTime)
                  .map((time) => (
                    <SelectItem key={`end-${time}`} value={time}>
                      {time}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Creating booking...' : 'Create Booking'}
      </Button>
    </form>
  );
};

export default BookingForm;
