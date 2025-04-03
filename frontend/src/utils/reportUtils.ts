
import { ComputerSystem, BookingSlot } from '@/types';
import { format } from 'date-fns';

// Helper function to format date for file naming
export const formatDateForFileName = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

// Function to generate CSV content for Excel
export const generateComputerBookingsReport = (
  computers: ComputerSystem[],
  bookings: BookingSlot[],
  startDate: Date,
  endDate: Date
): string => {
  // Filter bookings within date range
  const filteredBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.date);
    return bookingDate >= startDate && bookingDate <= endDate;
  });

  // Create headers for the CSV
  let csvContent = "Computer ID,Computer Name,Location,Specifications,Is Available,Date,Start Time,End Time,Student Name,Student Email,Admin Name\n";
  
  // Add computer data with associated bookings
  computers.forEach((computer) => {
    const computerBookings = filteredBookings.filter(
      (booking) => booking.computerId === computer.id
    );
    
    if (computerBookings.length > 0) {
      // Computer has bookings in the specified range
      computerBookings.forEach((booking) => {
        csvContent += `${computer.id},${computer.name},${computer.location},${computer.specifications || ''},${computer.isAvailable ? 'Yes' : 'No'},`;
        csvContent += `${booking.date},${booking.startTime},${booking.endTime},${booking.studentName},${booking.studentEmail},${booking.adminName}\n`;
      });
    } else {
      // Computer has no bookings in the range - just output computer info
      csvContent += `${computer.id},${computer.name},${computer.location},${computer.specifications || ''},${computer.isAvailable ? 'Yes' : 'No'},,,,,,\n`;
    }
  });
  
  return csvContent;
};

// Function to trigger download of CSV file
export const downloadCSV = (csvContent: string, fileName: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

