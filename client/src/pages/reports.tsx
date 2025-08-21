import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, FileSpreadsheet, FileText, Mail, Users, Clock, AlertTriangle, UserX } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Employee, Attendance } from "@shared/schema";

export default function Reports() {
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  // Fetch data
  const { data: employees } = useQuery({
    queryKey: ["/api/employees"],
  });

  const { data: attendance } = useQuery({
    queryKey: ["/api/attendance", { startDate, endDate }],
  });

  // Calculate statistics
  const stats = {
    totalEmployees: employees?.length || 0,
    totalHours: "1,245h", // Would calculate from attendance data
    overtimeHours: "45h", // Would calculate from attendance data
    absences: 3, // Would calculate from attendance data
  };

  // Filter employees by department
  const filteredEmployees = employees?.filter((emp: Employee) => 
    selectedDepartment === "all" || emp.area === selectedDepartment
  ) || [];

  // Get unique departments
  const departments = [...new Set(employees?.map((emp: Employee) => emp.area) || [])];

  // Mock report data (would be calculated from real attendance data)
  const reportData = filteredEmployees.map((employee: Employee) => ({
    id: employee.id,
    name: employee.name,
    department: employee.area,
    checkIns: 20,
    checkOuts: 20,
    totalHours: "160h",
    overtimeHours: "8h",
  }));

  const handleExportExcel = () => {
    // TODO: Implement Excel export
    console.log("Exporting to Excel...");
  };

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    console.log("Exporting to PDF...");
  };

  const handleSendEmail = () => {
    // TODO: Implement email functionality
    console.log("Sending email...");
  };

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl lg:text-3xl text-jasana-blue flex items-center gap-3">
            <BarChart3 className="w-8 h-8" />
            Reportes y Análisis
          </CardTitle>
          <CardDescription>Genera reportes detallados de asistencias</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Departamento</label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los Departamentos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Departamentos</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full bg-jasana-blue hover:bg-blue-700">
                <BarChart3 className="w-4 h-4 mr-2" />
                Filtrar
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={handleExportExcel}
              className="bg-green-600 hover:bg-green-700 h-auto p-4 flex-col"
            >
              <FileSpreadsheet className="w-8 h-8 mb-2" />
              <div className="text-center">
                <div className="font-semibold">Exportar a Excel</div>
                <div className="text-sm opacity-90">Reporte completo (.xlsx)</div>
              </div>
            </Button>
            
            <Button 
              onClick={handleExportPDF}
              className="bg-blue-600 hover:bg-blue-700 h-auto p-4 flex-col"
            >
              <FileText className="w-8 h-8 mb-2" />
              <div className="text-center">
                <div className="font-semibold">Generar PDF</div>
                <div className="text-sm opacity-90">Hoja de asistencias</div>
              </div>
            </Button>
            
            <Button 
              onClick={handleSendEmail}
              className="bg-purple-600 hover:bg-purple-700 h-auto p-4 flex-col"
            >
              <Mail className="w-8 h-8 mb-2" />
              <div className="text-center">
                <div className="font-semibold">Enviar por Email</div>
                <div className="text-sm opacity-90">A supervisores</div>
              </div>
            </Button>
          </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold text-blue-800">Total Empleados</h4>
                <p className="text-2xl font-bold text-blue-600">{stats.totalEmployees}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-green-800">Horas Trabajadas</h4>
                <p className="text-2xl font-bold text-green-600">{stats.totalHours}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4 text-center">
                <AlertTriangle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <h4 className="font-semibold text-yellow-800">Horas Extra</h4>
                <p className="text-2xl font-bold text-yellow-600">{stats.overtimeHours}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4 text-center">
                <UserX className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <h4 className="font-semibold text-red-800">Ausencias</h4>
                <p className="text-2xl font-bold text-red-600">{stats.absences}</p>
              </CardContent>
            </Card>
          </div>

          {/* Report Preview Table */}
          <Card>
            <CardHeader>
              <CardTitle>Vista Previa del Reporte</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Empleado</TableHead>
                      <TableHead>Nombre Completo</TableHead>
                      <TableHead>Departamento</TableHead>
                      <TableHead>Entradas</TableHead>
                      <TableHead>Salidas</TableHead>
                      <TableHead>Horas Trabajadas</TableHead>
                      <TableHead>Horas Extra</TableHead>
                      <TableHead>Firma</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <p className="text-gray-500">No hay datos disponibles para el período seleccionado.</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      reportData.map((employee) => (
                        <TableRow key={employee.id} className="hover:bg-gray-50">
                          <TableCell>{employee.id}</TableCell>
                          <TableCell>{employee.name}</TableCell>
                          <TableCell>{employee.department}</TableCell>
                          <TableCell>{employee.checkIns}</TableCell>
                          <TableCell>{employee.checkOuts}</TableCell>
                          <TableCell>{employee.totalHours}</TableCell>
                          <TableCell>{employee.overtimeHours}</TableCell>
                          <TableCell className="text-center">
                            <div className="w-16 h-8 border border-gray-400 bg-gray-50 rounded"></div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
