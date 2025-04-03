import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { ComputerSystem, mockComputers, mockBookings } from '@/types';
import {
  Plus,
  Edit,
  Trash2,
  Calendar as CalendarIcon,
  Download,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  generateComputerBookingsReport,
  downloadCSV,
  formatDateForFileName,
} from '@/utils/reportUtils';
import { useAuthStore } from '@/hooks/useAuthStore';

const Computers = () => {
  const { user, token } = useAuthStore();
  const [computers, setComputers] = useState<ComputerSystem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingComputer, setEditingComputer] = useState<ComputerSystem | null>(
    null
  );
  const [newComputer, setNewComputer] = useState<Partial<ComputerSystem>>({
    name: '',
    location: '',
    specifications: '',
    availability: true,
  });
  // const [loading, setLoading] = useState(true);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());

  const { toast } = useToast();

  const isSuperAdmin = user?.role === 'super_admin';

  useEffect(() => {
    const fetchComputers = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_PUBLIC_BACKEND_URL}/api/computers`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        setComputers(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load computers',
          variant: 'destructive',
        });
      }
    };

    fetchComputers();
  }, [computers]);

  const checkSuperAdminPermission = () => {
    if (!isSuperAdmin) {
      toast({
        title: 'Permission Denied',
        description: 'Only Super Admins can manage computer systems.',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const handleAddComputer = async () => {
    if (!checkSuperAdminPermission()) return;

    const computerToAdd = {
      name:
        newComputer.name ||
        `PC-${(computers.length + 1).toString().padStart(3, '0')}`,
      location: newComputer.location || '',
      specifications: newComputer.specifications || '',
      availability: true,
    };
    const resp = await fetch(
      `${import.meta.env.VITE_PUBLIC_BACKEND_URL}/api/computers`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(computerToAdd),
      }
    );
    if (!resp.ok) {
      toast({
        title: 'Error',
        description: 'Failed to add computer',
        variant: 'destructive',
      });
      return;
    }
    const data = await resp.json();
    setComputers((prev) => [...prev, data]);
    setNewComputer({
      name: '',
      location: '',
      specifications: '',
      availability: true,
    });
    setIsDialogOpen(false);

    toast({
      title: 'Computer Added',
      description: `${computerToAdd.name} has been added successfully.`,
    });
  };

  const handleUpdateComputer = async () => {
    if (!checkSuperAdminPermission()) return;
    if (!editingComputer) return;

    const updatedComputers = computers.map((computer) =>
      computer._id === editingComputer._id ? editingComputer : computer
    );

    const resp = await fetch(
      `${import.meta.env.VITE_PUBLIC_BACKEND_URL}/api/computers/${
        editingComputer._id
      }`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editingComputer),
      }
    );
    if (!resp.ok) {
      toast({
        title: 'Error',
        description: 'Failed to update computer',
        variant: 'destructive',
      });
      return;
    }

    setComputers(updatedComputers);
    setEditingComputer(null);
    setIsDialogOpen(false);

    toast({
      title: 'Computer Updated',
      description: `${editingComputer.name} has been updated successfully.`,
    });
  };

  const handleToggleAvailability = async (id: string) => {
    if (!checkSuperAdminPermission()) return;

    const updatedComputers = computers.map((computer) =>
      computer._id === id
        ? { ...computer, isAvailable: !computer.availability }
        : computer
    );

    const resp = await fetch(
      `${import.meta.env.VITE_PUBLIC_BACKEND_URL}/api/computers/${id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          availability: !computers.find((c) => c._id === id)?.availability,
        }),
      }
    );
    if (!resp.ok) {
      toast({
        title: 'Error',
        description: 'Failed to update availability',
        variant: 'destructive',
      });
      return;
    }
    const data = await resp.json();
    setComputers(updatedComputers);
    const computer = updatedComputers.find((c) => c._id === id);
    // const status = computer?.availability ? 'available' : 'unavailable';
    setEditingComputer(null);

    toast({
      title: 'Availability Updated',
      description: `${computer?.name} is now ${
        data.availability ? 'available' : 'unavailable'
      }.`,
    });
  };

  const handleDeleteComputer = async (id: string) => {
    if (!checkSuperAdminPermission()) return;

    const computerToDelete = computers.find((c) => c._id === id);
    const updatedComputers = computers.filter(
      (computer) => computer._id !== id
    );

    const resp = await fetch(
      `${import.meta.env.VITE_PUBLIC_BACKEND_URL}/api/computers/${id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    if (!resp.ok) {
      toast({
        title: 'Error',
        description: 'Failed to delete computer',
        variant: 'destructive',
      });
      return;
    }

    setComputers(updatedComputers);

    toast({
      title: 'Computer Removed',
      description: `${computerToDelete?.name} has been removed.`,
      variant: 'destructive',
    });
  };

  const openAddDialog = () => {
    if (!checkSuperAdminPermission()) return;
    setEditingComputer(null);
    setNewComputer({
      name: '',
      location: '',
      specifications: '',
      availability: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (computer: ComputerSystem) => {
    if (!checkSuperAdminPermission()) return;
    setEditingComputer(computer);
    setIsDialogOpen(true);
  };

  const handleGenerateReport = () => {
    if (!checkSuperAdminPermission()) return;

    if (endDate < startDate) {
      toast({
        title: 'Invalid Date Range',
        description: 'End date cannot be before start date.',
        variant: 'destructive',
      });
      return;
    }

    const csvContent = generateComputerBookingsReport(
      computers,
      mockBookings,
      startDate,
      endDate
    );
    const fileName = `computer-bookings-${formatDateForFileName(
      startDate
    )}-to-${formatDateForFileName(endDate)}.csv`;
    downloadCSV(csvContent, fileName);

    setIsReportDialogOpen(false);

    toast({
      title: 'Report Generated',
      description: 'Your report has been downloaded.',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Computer Systems
            </h2>
            <p className="text-muted-foreground">
              Manage computer systems available for booking.
            </p>
          </div>
          {isSuperAdmin && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsReportDialogOpen(true)}
              >
                <Download className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
              <Button onClick={openAddDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add Computer
              </Button>
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Available Systems</CardTitle>
            <CardDescription>
              All computer systems in the lab that can be booked.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>List of computer systems</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Specifications</TableHead>
                  <TableHead>Availability</TableHead>
                  {isSuperAdmin && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {computers.length > 0 &&
                  computers.map((computer) => (
                    <TableRow key={computer._id}>
                      <TableCell className="font-medium">
                        {computer.name}
                      </TableCell>
                      <TableCell>{computer.location}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {computer.specifications}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            computer.availability
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {computer.availability ? 'Available' : 'Unavailable'}
                        </span>
                      </TableCell>
                      {isSuperAdmin && (
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleToggleAvailability(computer._id)
                            }
                          >
                            {computer.availability
                              ? 'Mark Unavailable'
                              : 'Mark Available'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(computer)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteComputer(computer._id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingComputer ? 'Edit Computer' : 'Add New Computer'}
            </DialogTitle>
            <DialogDescription>
              {editingComputer
                ? 'Update the computer system details below.'
                : 'Enter the computer system details below.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={
                  editingComputer ? editingComputer.name : newComputer.name
                }
                onChange={(e) => {
                  if (editingComputer) {
                    setEditingComputer({
                      ...editingComputer,
                      name: e.target.value,
                    });
                  } else {
                    setNewComputer({ ...newComputer, name: e.target.value });
                  }
                }}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input
                id="location"
                value={
                  editingComputer
                    ? editingComputer.location
                    : newComputer.location
                }
                onChange={(e) => {
                  if (editingComputer) {
                    setEditingComputer({
                      ...editingComputer,
                      location: e.target.value,
                    });
                  } else {
                    setNewComputer({
                      ...newComputer,
                      location: e.target.value,
                    });
                  }
                }}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="specifications" className="text-right">
                Specifications
              </Label>
              <Input
                id="specifications"
                value={
                  editingComputer
                    ? editingComputer.specifications || ''
                    : newComputer.specifications || ''
                }
                onChange={(e) => {
                  if (editingComputer) {
                    setEditingComputer({
                      ...editingComputer,
                      specifications: e.target.value,
                    });
                  } else {
                    setNewComputer({
                      ...newComputer,
                      specifications: e.target.value,
                    });
                  }
                }}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={
                editingComputer ? handleUpdateComputer : handleAddComputer
              }
            >
              {editingComputer ? 'Save Changes' : 'Add Computer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Generate Computer Bookings Report</DialogTitle>
            <DialogDescription>
              Select a date range for the report. The report will include all
              computer systems and their bookings within this range.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                Start Date
              </Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="startDate"
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !startDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? (
                        format(startDate, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => date && setStartDate(date)}
                      initialFocus
                      className={cn('p-3 pointer-events-auto')}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">
                End Date
              </Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="endDate"
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !endDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? (
                        format(endDate, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => date && setEndDate(date)}
                      initialFocus
                      className={cn('p-3 pointer-events-auto')}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsReportDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleGenerateReport}>
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Computers;
