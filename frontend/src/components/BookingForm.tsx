import React, { useEffect, useState } from 'react';
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

interface Booking {
  startTime: string;
  endTime: string;
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
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Fetch available computers
  useEffect(() => {
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
        const filtered = data.filter(
          (computer: ComputerSystem) => computer.availability
        );
        setAvailableComputers(filtered);
      } catch (error) {
        console.error(error);
        toast.error('Error loading computers');
      }
    };

    fetchComputers();
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

  // Fetch bookings for selected computer and date
  useEffect(() => {
    const fetchBookings = async () => {
      if (!selectedComputer || !selectedDate) return;

      try {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        const resp = await fetch(
          `${
            import.meta.env.VITE_PUBLIC_BACKEND_URL
          }/api/bookings?computer=${selectedComputer}&date=${formattedDate}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!resp.ok) throw new Error('Failed to fetch bookings');
        const data = await resp.json();
        setBookings(data);
      } catch (error) {
        console.error(error);
        toast.error('Error fetching bookings');
      }
    };

    fetchBookings();
  }, [selectedComputer, selectedDate, token]);

  const generateTimeSlots = () => {
    const slots: string[] = [];
    for (let hour = 8; hour < 20; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const getAvailableTimeSlots = () => {
    const slots = generateTimeSlots();

    if (!bookings.length || !selectedDate) return slots;

    const slotToDate = (time: string) =>
      new Date(
        Date.UTC(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          Number(time.split(':')[0]),
          Number(time.split(':')[1])
        )
      );

    return slots.filter((slot) => {
      const slotStart = slotToDate(slot);
      const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000); // +30min

      const isConflict = bookings.some((b) => {
        const bStart = new Date(b.startTime);
        const bEnd = new Date(b.endTime);
        return slotStart < bEnd && slotEnd > bStart;
      });

      return !isConflict;
    });
  };

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

    if (!selectedDate) return toast.error('Please select a date');
    if (startTime >= endTime)
      return toast.error('End time must be after start time');

    setIsSubmitting(true);
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const computer = availableComputers.find(
        (c) => c._id === selectedComputer
      );
      if (!computer) return toast.error('Invalid computer');

      let studentId = selectedStudentId;

      if (mode === 'create') {
        const newStudentResp = await fetch(
          `${import.meta.env.VITE_PUBLIC_BACKEND_URL}/api/students`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: studentName.trim(),
              email: studentEmail.trim().toLowerCase(),
              rollNumber: studentRollNumber.trim(),
              phone: studentPhone.trim(),
              department: studentDepartment.trim(),
            }),
          }
        );

        if (!newStudentResp.ok) throw new Error('Failed to create student');
        const newStudent = await newStudentResp.json();
        studentId = newStudent.student._id;
      }

      if (!studentId) return toast.error('Please select or create a student');

      const startTimeUTC = new Date(
        Date.UTC(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          Number(startTime.split(':')[0]),
          Number(startTime.split(':')[1])
        )
      ).toISOString();

      const endTimeUTC = new Date(
        Date.UTC(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          Number(endTime.split(':')[0]),
          Number(endTime.split(':')[1])
        )
      ).toISOString();

      const payload = {
        student: studentId,
        computer: computer._id,
        startTime: startTimeUTC,
        endTime: endTimeUTC,
        admin: currentUser._id,
      };

      const bookingResp = await fetch(
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

      if (!bookingResp.ok) {
        const errorData = await bookingResp.json();
        throw new Error(errorData.message || 'Failed to create booking');
      }

      toast.success('Booking created');
      toast('Email notifications sent', {
        description: `To ${studentEmail}, ${currentUser.email}`,
      });

      setDummy(!dummy);
      resetForm();
      onBookingComplete();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'An error occurred');
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
    setBookings([]);
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
            mode === 'select' ? 'md:grid-cols-2' : 'grid-cols-1'
          } gap-4`}>
          <div className={mode === 'create' ? 'md:col-span-2' : ''}>
            <Label>Student Mode</Label>
            <Select
              value={mode}
              onValueChange={(v: 'create' | 'select') => setMode(v)}>
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
                onValueChange={handleStudentSelect}>
                <SelectTrigger id="studentSearch">
                  <SelectValue placeholder="Search by name or roll" />
                </SelectTrigger>
                <SelectContent>
                  <Input
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Type to search..."
                    className="mb-2"
                  />
                  {students.map((s) => (
                    <SelectItem key={s._id} value={s._id}>
                      {s.name} ({s.rollNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <InputField
            id="studentName"
            label="Student Name"
            value={studentName}
            setter={setStudentName}
            disabled={mode === 'select'}
            required={mode === 'create'}
          />
          <InputField
            id="studentEmail"
            type="email"
            label="Student Email"
            value={studentEmail}
            setter={setStudentEmail}
            disabled={mode === 'select'}
            required={mode === 'create'}
          />
          <InputField
            id="studentRollNumber"
            label="Roll Number"
            value={studentRollNumber}
            setter={setStudentRollNumber}
            disabled={mode === 'select'}
            required={mode === 'create'}
          />
          <InputField
            id="studentPhone"
            label="Phone Number"
            value={studentPhone}
            setter={setStudentPhone}
            disabled={mode === 'select'}
            required={mode === 'create'}
          />
          <InputField
            id="studentDepartment"
            label="Department"
            value={studentDepartment}
            setter={setStudentDepartment}
            disabled={mode === 'select'}
            required={mode === 'create'}
          />
          <div>
            <Label htmlFor="computer">Computer</Label>
            <Select
              value={selectedComputer}
              onValueChange={setSelectedComputer}
              required>
              <SelectTrigger id="computer">
                <SelectValue placeholder="Select computer" />
              </SelectTrigger>
              <SelectContent>
                {availableComputers.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.name} ({c.location})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <TimeSlotSelect
            id="startTime"
            label="Start Time"
            value={startTime}
            setValue={setStartTime}
            slots={getAvailableTimeSlots()}
          />
          <TimeSlotSelect
            id="endTime"
            label="End Time"
            value={endTime}
            setValue={setEndTime}
            slots={getAvailableTimeSlots().filter((t) => t > startTime)}
            disabled={!startTime}
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Creating booking...' : 'Create Booking'}
      </Button>
    </form>
  );
};

// 🧩 Helper components
const InputField = ({
  id,
  label,
  value,
  setter,
  disabled = false,
  required = false,
  type = 'text',
}: any) => (
  <div>
    <Label htmlFor={id}>{label}</Label>
    <Input
      id={id}
      type={type}
      value={value}
      onChange={(e) => setter(e.target.value)}
      disabled={disabled}
      required={required}
    />
  </div>
);

const TimeSlotSelect = ({
  id,
  label,
  value,
  setValue,
  slots,
  disabled = false,
}: any) => (
  <div>
    <Label htmlFor={id}>{label}</Label>
    <Select value={value} onValueChange={setValue} required>
      <SelectTrigger id={id} disabled={disabled}>
        <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
      </SelectTrigger>
      <SelectContent>
        {slots.map((time: string) => (
          <SelectItem key={`${id}-${time}`} value={time}>
            {time}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export default BookingForm;
