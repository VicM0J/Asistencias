import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { IdCard, Download, Printer, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CredentialCard } from "@/components/credential-card";
import type { Employee } from "@shared/schema";

const designColors = [
  { value: "blue", color: "bg-jasana-blue", border: "border-jasana-blue" },
  { value: "red", color: "bg-red-600", border: "border-red-600" },
  { value: "green", color: "bg-green-600", border: "border-green-600" },
  { value: "purple", color: "bg-purple-600", border: "border-purple-600" },
];

export default function Credentials() {
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState("blue");
  const [generateAll, setGenerateAll] = useState(false);

  // Fetch employees
  const { data: employees } = useQuery({
    queryKey: ["/api/employees"],
  });

  // Get selected employee data
  const selectedEmployeeData = employees?.find((emp: Employee) => emp.id === selectedEmployee);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // TODO: Implement PDF download
    console.log("Downloading PDF...");
  };

  const handleGenerateAll = () => {
    // TODO: Implement batch generation
    console.log("Generating all credentials...");
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: Handle logo upload
      console.log("Logo uploaded:", file.name);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl lg:text-3xl text-jasana-blue flex items-center gap-3">
            <IdCard className="w-8 h-8" />
            Generador de Credenciales
          </CardTitle>
          <CardDescription>Diseña y genera credenciales de empleados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Credential Preview */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Vista Previa</h3>
              
              {/* Credential Card */}
              {selectedEmployeeData ? (
                <CredentialCard employee={selectedEmployeeData} />
              ) : (
                <div className="mx-auto" style={{ width: '340px', height: '216px' }}>
                  <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg h-full flex items-center justify-center">
                    <div className="text-center">
                      <IdCard className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Selecciona un empleado para ver la vista previa</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Print Options */}
              <div className="space-y-4">
                <Button 
                  onClick={handlePrint}
                  className="w-full bg-jasana-blue hover:bg-blue-700"
                  disabled={!selectedEmployeeData}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir Credencial
                </Button>
                <Button 
                  onClick={handleDownloadPDF}
                  variant="outline" 
                  className="w-full"
                  disabled={!selectedEmployeeData}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar PDF
                </Button>
              </div>
            </div>

            {/* Credential Configuration */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Configuración</h3>
              
              {/* Employee Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar Empleado
                </label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un empleado" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees?.map((employee: Employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Design Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Colores del Diseño
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {designColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setSelectedColor(color.value)}
                      className={`w-12 h-12 ${color.color} rounded-lg border-2 transition-all ${
                        selectedColor === color.value 
                          ? color.border 
                          : 'border-gray-300 hover:' + color.border
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo de la Empresa
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-jasana-blue transition-colors">
                  <div className="mb-4">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm text-gray-500">Arrastra el logo aquí o haz clic para seleccionar</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                  >
                    Seleccionar Logo
                  </Button>
                </div>
              </div>

              {/* Batch Generation */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-4">Generación en Lote</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="all-employees" 
                      checked={generateAll}
                      onCheckedChange={setGenerateAll}
                    />
                    <label htmlFor="all-employees" className="text-sm text-gray-700">
                      Generar para todos los empleados
                    </label>
                  </div>
                  <Button 
                    onClick={handleGenerateAll}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={!employees || employees.length === 0}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Generar Todas las Credenciales
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
