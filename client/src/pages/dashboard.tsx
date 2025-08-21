import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, Users, UserCheck, UserX, QrCode, Scan } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SuccessModal } from "@/components/success-modal";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

export default function Dashboard() {
  const [employeeId, setEmployeeId] = useState("");
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [scannerBuffer, setScannerBuffer] = useState("");
  const [isScanning, setIsScanning] = useState(true);
  const [lastScanTime, setLastScanTime] = useState(0);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch attendance stats
  const { data: stats } = useQuery({
    queryKey: ["/api/attendance/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const statsData = stats || { checkIns: 0, checkOuts: 0, activeEmployees: 0 };

  // Check-in mutation
  const checkinMutation = useMutation({
    mutationFn: (employeeId: string) => api.checkin(employeeId),
    onSuccess: (data: any) => {
      setSuccessData(data);
      setSuccessModalOpen(true);
      setEmployeeId("");
      setScannerBuffer("");
      // Auto-close modal after 3 seconds
      setTimeout(() => {
        setSuccessModalOpen(false);
      }, 3000);
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/today"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process check-in/out",
        variant: "destructive",
      });
    },
  });

  // Automatic scanner functionality
  useEffect(() => {
    let currentBuffer = '';
    let lastKeyTime = 0;
    let timeoutId: NodeJS.Timeout | null = null;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isScanning || successModalOpen || checkinMutation.isPending) return;
      
      const now = Date.now();
      
      // If too much time has passed since last key, reset buffer
      if (now - lastKeyTime > 100) {
        currentBuffer = '';
      }
      
      lastKeyTime = now;
      
      // Handle Enter key (end of barcode) - immediate processing
      if (event.key === "Enter" || event.key === "Tab") {
        event.preventDefault();
        if (currentBuffer.trim().length >= 6) {
          setScannerBuffer(currentBuffer);
          handleAutoScan(currentBuffer.trim());
          currentBuffer = '';
        }
        return;
      }
      
      // Add character to buffer (alphanumeric and some special chars)
      if (event.key.match(/^[a-zA-Z0-9]$/)) {
        event.preventDefault(); // Prevent typing in other inputs
        currentBuffer += event.key;
        setScannerBuffer(currentBuffer);
        
        // Clear previous timeout
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        // Auto-process after very short timeout (for fast scanner input)
        timeoutId = setTimeout(() => {
          if (currentBuffer.length >= 8) { // Standard employee ID length like MOJV040815
            handleAutoScan(currentBuffer);
            currentBuffer = '';
            setScannerBuffer('');
          }
        }, 80); // Very short timeout for immediate processing
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isScanning, successModalOpen, checkinMutation.isPending]);

  const handleAutoScan = (scannedId: string) => {
    setEmployeeId(scannedId);
    checkinMutation.mutate(scannedId);
  };

  const handleCheckIn = () => {
    if (!employeeId.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu ID de empleado",
        variant: "destructive",
      });
      return;
    }
    checkinMutation.mutate(employeeId);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCheckIn();
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6">
      {/* Main Check-in/out Section */}
      <Card className="mb-8">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl lg:text-3xl text-jasana-blue flex items-center justify-center gap-3">
            <Clock className="w-8 h-8" />
            Control de Asistencias
          </CardTitle>
          <CardDescription>Sistema de registro de entradas y salidas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-2xl mx-auto">
            {/* Scanner Interface */}
            <div className="bg-jasana-light rounded-xl p-6 mb-6">
              <div className="text-center mb-4">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${
                  isScanning ? 'bg-jasana-blue animate-pulse' : 'bg-gray-400'
                }`}>
                  {isScanning ? (
                    <Scan className="w-12 h-12 text-white" />
                  ) : (
                    <QrCode className="w-12 h-12 text-white" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-jasana-blue mb-2">
                  {isScanning ? "Escáner Automático Activo" : "Escáner Inactivo"}
                </h3>
                <p className="text-gray-600">
                  {isScanning 
                    ? "Escanea tu código de barras - detección automática activada" 
                    : "Ingresa tu ID manualmente"
                  }
                </p>
                {scannerBuffer && (
                  <p className="text-sm text-green-600 mt-2">
                    Leyendo: {scannerBuffer}
                  </p>
                )}
              </div>
              
              {/* Manual ID Input */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID de Empleado
                  </label>
                  <Input
                    type="text"
                    placeholder="Escanea código o ingresa ID..."
                    className="text-lg p-4 h-12"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={checkinMutation.isPending}
                    ref={inputRef}
                  />
                </div>
                <Button 
                  onClick={handleCheckIn}
                  disabled={checkinMutation.isPending}
                  className="w-full bg-jasana-blue text-white py-4 h-12 text-lg font-semibold hover:bg-blue-700"
                >
                  <UserCheck className="w-5 h-5 mr-2" />
                  {checkinMutation.isPending ? "Procesando..." : "Registrar Asistencia"}
                </Button>
              </div>
            </div>

            {/* Status Display */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4 text-center">
                  <UserCheck className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-green-800">Entradas Hoy</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {statsData.checkIns}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4 text-center">
                  <UserX className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-red-800">Salidas Hoy</h4>
                  <p className="text-2xl font-bold text-red-600">
                    {statsData.checkOuts}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-blue-800">En Oficina</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {statsData.activeEmployees}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Modal */}
      <SuccessModal
        open={successModalOpen}
        onOpenChange={setSuccessModalOpen}
        employee={successData?.employee}
        type={successData?.type}
        hoursWorked={successData?.hoursWorked || "0h 0m"}
      />
    </div>
  );
}
