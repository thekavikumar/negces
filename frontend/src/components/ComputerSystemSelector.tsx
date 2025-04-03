
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ComputerSystem, mockComputers } from '@/types';

interface ComputerSystemSelectorProps {
  onComputerSelect: (computerId: string) => void;
  selectedComputerId?: string;
}

export const ComputerSystemSelector = ({ onComputerSelect, selectedComputerId }: ComputerSystemSelectorProps) => {
  const [computers, setComputers] = useState<ComputerSystem[]>([]);
  const [selectedLab, setSelectedLab] = useState<string | null>(null);
  
  useEffect(() => {
    // In a real application, fetch from API
    setComputers(mockComputers);
    
    // Get unique labs
    const labs = [...new Set(mockComputers.map(computer => computer.location.split(' - ')[0]))];
    if (labs.length > 0) {
      setSelectedLab(labs[0]);
    }
  }, []);
  
  // Get unique labs
  const labs = [...new Set(computers.map(computer => computer.location.split(' - ')[0]))];

  // Filter computers by selected lab
  const filteredComputers = selectedLab
    ? computers.filter(computer => computer.location.startsWith(selectedLab))
    : computers;

  return (
    <div className="space-y-4">
      {/* Lab filter */}
      <div className="flex flex-wrap gap-2">
        {labs.map(lab => (
          <Badge 
            key={lab}
            variant={selectedLab === lab ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedLab(lab)}
          >
            {lab}
          </Badge>
        ))}
      </div>
      
      {/* Computer grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredComputers.map(computer => (
          <Card 
            key={computer.id}
            className={cn(
              "cursor-pointer transition-all hover:border-primary",
              computer.isAvailable ? "opacity-100" : "opacity-60",
              selectedComputerId === computer.id && "border-primary"
            )}
            onClick={() => {
              if (computer.isAvailable) {
                onComputerSelect(computer.id);
              }
            }}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{computer.name}</CardTitle>
                <Badge variant={computer.isAvailable ? "outline" : "secondary"}>
                  {computer.isAvailable ? 'Available' : 'In Use'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>{computer.location}</p>
              {computer.specifications && (
                <p className="text-xs mt-2">{computer.specifications}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ComputerSystemSelector;
