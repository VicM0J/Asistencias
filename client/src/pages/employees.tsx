import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Plus, Eye, Search, Edit, Trash2, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { Employee } from "@shared/schema";

export default function Employees() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch employees
  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["/api/employees"],
  });

  // Filter employees
  const filteredEmployees = (employees as Employee[]).filter((employee: Employee) => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === "all" || employee.area === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  // Get unique departments
  const departments = Array.from(new Set((employees as Employee[]).map((emp: Employee) => emp.area)));

  // Delete employee mutation
  const deleteEmployeeMutation = useMutation({
    mutationFn: (employeeId: string) => api.employees.delete(employeeId),
    onSuccess: () => {
      toast({
        title: "Éxito",
        description: "Empleado eliminado exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      setDeleteModalOpen(false);
      setSelectedEmployee(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el empleado",
        variant: "destructive",
      });
    },
  });

  const handleViewDetails = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDetailModalOpen(true);
  };

  const handleDeleteClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedEmployee) {
      deleteEmployeeMutation.mutate(selectedEmployee.id);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Cargando empleados...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <CardTitle className="text-2xl lg:text-3xl text-jasana-blue flex items-center gap-3">
                <Users className="w-8 h-8" />
                Gestión de Empleados
              </CardTitle>
              <CardDescription>Administra la información de todos los empleados</CardDescription>
            </div>
            <Link href="/add-employee">
              <Button className="bg-jasana-blue hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Empleado
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
            
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Última Semana" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Última Semana</SelectItem>
                <SelectItem value="month">Este Mes</SelectItem>
                <SelectItem value="year">Este Año</SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              type="text"
              placeholder="Buscar empleado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <Button variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
          </div>

          {/* Employee List */}
          {filteredEmployees.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron empleados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredEmployees.map((employee: Employee) => (
                <Card key={employee.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4 mb-4">
                      {employee.photoUrl ? (
                        <img 
                          src={employee.photoUrl} 
                          alt={employee.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                          <Users className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                        <Badge variant="secondary" className="text-xs">{employee.area}</Badge>
                        <p className="text-xs text-gray-400 mt-1">ID: {employee.id}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-gray-500">Código:</span>
                        <p className="font-semibold">{employee.barcode}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Estado:</span>
                        <p className="font-semibold text-green-600">Activo</p>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full text-jasana-blue border-jasana-blue hover:bg-jasana-light"
                      onClick={() => handleViewDetails(employee)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalles
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Employee Details Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="sm:max-w-lg">
          {selectedEmployee && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl text-jasana-blue">
                  Detalles del Empleado
                </DialogTitle>
              </DialogHeader>
              
              <div className="py-4">
                <div className="flex items-center space-x-6 mb-6">
                  {selectedEmployee.photoUrl ? (
                    <img 
                      src={selectedEmployee.photoUrl} 
                      alt={selectedEmployee.name}
                      className="w-20 h-20 rounded-full object-cover border-4 border-jasana-blue"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-jasana-light rounded-full flex items-center justify-center">
                      <span className="text-jasana-blue text-lg font-bold">
                        {selectedEmployee.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedEmployee.name}</h3>
                    <Badge className="bg-jasana-blue text-white mb-1">{selectedEmployee.area}</Badge>
                    <p className="text-sm text-gray-500">ID: {selectedEmployee.id}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Código de Barras</label>
                    <p className="text-lg font-semibold">{selectedEmployee.barcode}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Estado</label>
                    <p className="text-lg font-semibold text-green-600">Activo</p>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setDetailModalOpen(false)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cerrar
                </Button>
                <Button 
                  variant="outline"
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  onClick={() => {
                    setDetailModalOpen(false);
                    // TODO: Navigate to edit page
                    window.location.href = `/employees/${selectedEmployee.id}/edit`;
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    setDetailModalOpen(false);
                    handleDeleteClick(selectedEmployee);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-red-600">
              Confirmar Eliminación
            </DialogTitle>
          </DialogHeader>
          
          {selectedEmployee && (
            <div className="py-4">
              <p className="text-gray-700 mb-4">
                ¿Estás seguro que deseas eliminar al empleado?
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold text-gray-900">{selectedEmployee.name}</p>
                <p className="text-sm text-gray-600">{selectedEmployee.area} - ID: {selectedEmployee.id}</p>
              </div>
              <p className="text-red-600 text-sm mt-4">
                Esta acción no se puede deshacer.
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleteEmployeeMutation.isPending}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteEmployeeMutation.isPending}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deleteEmployeeMutation.isPending ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
