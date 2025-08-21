import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Check } from "lucide-react";
import type { Employee } from "@shared/schema";

interface SuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee;
  type?: string;
  hoursWorked?: string;
}

export function SuccessModal({ 
  open, 
  onOpenChange, 
  employee, 
  type, 
  hoursWorked = "0h 0m" 
}: SuccessModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="text-center p-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-12 h-12 text-green-600" />
          </div>
          
          {employee && (
            <div className="mb-6">
              {employee.photoUrl ? (
                <img 
                  src={employee.photoUrl} 
                  alt={employee.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-gray-600 text-sm font-semibold">
                    {employee.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </span>
                </div>
              )}
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{employee.name}</h3>
              <p className="text-lg text-jasana-blue font-semibold mb-1">{employee.area}</p>
              <p className="text-sm text-gray-500">ID: {employee.id}</p>
            </div>
          )}
          
          <h2 className="text-2xl font-bold text-green-600 mb-2">
            {type === 'check_in' ? '¡Check-in Exitoso!' : '¡Check-out Exitoso!'}
          </h2>
          <p className="text-gray-600 mb-4">
            Horas trabajadas hoy: <span className="font-semibold">{hoursWorked}</span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
