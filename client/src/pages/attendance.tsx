import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, Filter, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Attendance, Employee } from "@shared/schema";

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedEmployee, setSelectedEmployee] = useState("all");

  // Fetch attendance data
  const { data: attendance = [] } = useQuery({
    queryKey: ["/api/attendance", { startDate: selectedDate, endDate: selectedDate }],
  });

  // Fetch employees for filter
  const { data: employees = [] } = useQuery({
    queryKey: ["/api/employees"],
  });

  // Generate timeline hours (8 AM to 6 PM)
  const timelineHours = Array.from({ length: 11 }, (_, i) => {
    const hour = i + 8;
    return {
      hour,
      label: hour <= 12 ? `${hour} AM` : `${hour - 12} PM`,
      display: hour === 12 ? "12 PM" : (hour <= 12 ? `${hour} AM` : `${hour - 12} PM`)
    };
  });

  // Filter attendance records
  const filteredAttendance = (attendance as Attendance[]).filter((record: Attendance) => {
    if (selectedEmployee === "all") return true;
    return record.employeeId === selectedEmployee;
  });

  // Get attendance status for timeline
  const getTimelineStatus = (hour: number) => {
    const hourString = hour.toString().padStart(2, '0') + ':00';
    const hasRecord = filteredAttendance.some((record: Attendance) => {
      const recordHour = new Date(record.timestamp).getHours();
      return recordHour === hour;
    });

    if (hasRecord) {
      const record = filteredAttendance.find((r: Attendance) => 
        new Date(r.timestamp).getHours() === hour
      );
      if (record?.type === 'check_in') return 'present';
      if (record?.type === 'check_out') return 'absent';
      if (record?.type.includes('break')) return 'break';
    }
    return 'no-record';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-500';
      case 'break': return 'bg-yellow-500';
      case 'absent': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl lg:text-3xl text-jasana-blue flex items-center gap-3">
            <CalendarCheck className="w-8 h-8" />
            Registro de Asistencias
          </CardTitle>
          <CardDescription>Visualiza y gestiona los registros de asistencia</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            
            <Select value={selectedDate.slice(0, 7)} onValueChange={(value) => setSelectedDate(value + '-01')}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar mes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024-12">Diciembre 2024</SelectItem>
                <SelectItem value="2024-11">Noviembre 2024</SelectItem>
                <SelectItem value="2024-10">Octubre 2024</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value="2024">
              <SelectTrigger>
                <SelectValue placeholder="Año" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los Empleados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Empleados</SelectItem>
                {(employees as Employee[]).map((employee: Employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Timeline View */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Línea de Tiempo - {selectedDate}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4 overflow-x-auto">
                <div className="flex space-x-4 min-w-max">
                  {timelineHours.map(({ hour, display }) => {
                    const status = getTimelineStatus(hour);
                    return (
                      <div key={hour} className="text-center">
                        <div className="text-xs text-gray-500 mb-1">{display}</div>
                        <div className={`w-2 h-8 rounded mx-auto ${getStatusColor(status)}`} />
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="flex space-x-4 text-xs">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded" />
                  <span>Presente</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded" />
                  <span>Descanso</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-red-500 rounded" />
                  <span>Salida</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-gray-300 rounded" />
                  <span>Sin registro</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Records */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Registros del Día</h3>
            
            {filteredAttendance.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No hay registros para la fecha seleccionada.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAttendance.map((record: Attendance & { employee?: Employee }) => (
                  <Card key={record.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-gray-500 text-sm">
                              {record.employeeId.slice(-2)}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{record.employeeId}</h4>
                            <p className="text-sm text-gray-500 capitalize">
                              {record.type.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {new Date(record.timestamp).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(record.timestamp).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                        
                        <div className={`w-3 h-3 rounded-full ${
                          record.type === 'check_in' ? 'bg-green-500' : 
                          record.type === 'check_out' ? 'bg-red-500' : 'bg-yellow-500'
                        }`} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
