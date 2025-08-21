import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Settings as SettingsIcon, Plus, Edit, Save, Check, RefreshCw, Trash2, Building2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { insertScheduleSchema } from "@shared/schema";
import { api } from "@/lib/api";
import { z } from "zod";

type ScheduleFormData = z.infer<typeof insertScheduleSchema>;

const predefinedSchedules = [
  {
    name: "Horario Administrativo",
    startTime: "08:00",
    endTime: "18:00",
    breakfastStart: "10:30",
    breakfastEnd: "10:40",
    lunchStart: "14:30",
    lunchEnd: "15:10",
  },
  {
    name: "Horario 1",
    startTime: "08:00",
    endTime: "17:30",
    breakfastStart: "09:40",
    breakfastEnd: "10:00",
    lunchStart: "13:40",
    lunchEnd: "14:00",
  },
  {
    name: "Horario 2",
    startTime: "08:00",
    endTime: "17:30",
    breakfastStart: "10:05",
    breakfastEnd: "10:25",
    lunchStart: "14:05",
    lunchEnd: "14:25",
  },
];

export default function Settings() {
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [newDepartment, setNewDepartment] = useState("");
  const [systemSettings, setSystemSettings] = useState({
    autoScan: true,
    cameraFallback: false,
    lockoutTime: 60,
    soundAlerts: true,
    showPhoto: true,
    notificationDuration: 3,
    toleranceMinutes: 15,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ScheduleFormData>({
    resolver: zodResolver(insertScheduleSchema),
    defaultValues: {
      name: "",
      startTime: "08:00",
      endTime: "17:00",
      breakfastStart: "10:00",
      breakfastEnd: "10:20",
      lunchStart: "14:00",
      lunchEnd: "14:30",
      isDefault: false,
    },
  });

  // Fetch schedules
  const { data: schedules } = useQuery({
    queryKey: ["/api/schedules"],
  });

  // Fetch departments
  const { data: departments = [] } = useQuery({
    queryKey: ["/api/departments"],
  });

  // Load system settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await Promise.all([
          api.config.get("autoScan"),
          api.config.get("cameraFallback"),
          api.config.get("lockoutTime"),
          api.config.get("soundAlerts"),
          api.config.get("showPhoto"),
          api.config.get("notificationDuration"),
          api.config.get("toleranceMinutes"),
        ]);
        
        setSystemSettings({
          autoScan: settings[0]?.value ?? true,
          cameraFallback: settings[1]?.value ?? false,
          lockoutTime: settings[2]?.value ?? 60,
          soundAlerts: settings[3]?.value ?? true,
          showPhoto: settings[4]?.value ?? true,
          notificationDuration: settings[5]?.value ?? 3,
          toleranceMinutes: settings[6]?.value ?? 15,
        });
      } catch (error) {
        // Settings not found, use defaults
      }
    };
    loadSettings();
  }, []);

  // Create schedule mutation
  const createScheduleMutation = useMutation({
    mutationFn: (data: ScheduleFormData) => api.schedules.create(data),
    onSuccess: () => {
      toast({
        title: "Éxito",
        description: "Horario creado exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });
      setShowCustomForm(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create schedule",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ScheduleFormData) => {
    createScheduleMutation.mutate(data);
  };

  // Save system settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (settings: typeof systemSettings) => {
      await Promise.all([
        api.config.set("autoScan", settings.autoScan),
        api.config.set("cameraFallback", settings.cameraFallback),
        api.config.set("lockoutTime", settings.lockoutTime),
        api.config.set("soundAlerts", settings.soundAlerts),
        api.config.set("showPhoto", settings.showPhoto),
        api.config.set("notificationDuration", settings.notificationDuration),
        api.config.set("toleranceMinutes", settings.toleranceMinutes),
      ]);
    },
    onSuccess: () => {
      toast({
        title: "Éxito",
        description: "Configuración guardada exitosamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      });
    },
  });

  const handleSaveSettings = () => {
    saveSettingsMutation.mutate(systemSettings);
  };

  const handleAddDepartment = async () => {
    if (newDepartment.trim()) {
      try {
        // Since departments are derived from employees, we'll show a message
        toast({
          title: "Información",
          description: "Los departamentos se crean automáticamente al agregar empleados con nuevas áreas",
        });
        setShowDeptModal(false);
        setNewDepartment("");
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo agregar el departamento",
          variant: "destructive",
        });
      }
    }
  };

  const handleCreatePredefined = async (schedule: any) => {
    try {
      await api.schedules.create(schedule);
      toast({
        title: "Éxito",
        description: `${schedule.name} creado exitosamente`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create schedule",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl lg:text-3xl text-jasana-blue flex items-center gap-3">
            <SettingsIcon className="w-8 h-8" />
            Configuración del Sistema
          </CardTitle>
          <CardDescription>Gestiona horarios y configuraciones del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Schedule Configuration */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Horarios Laborales</h3>
              
              {/* Existing Schedules */}
              <div className="space-y-4">
                {schedules?.map((schedule: any) => (
                  <Card key={schedule.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{schedule.name}</h4>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <p>Entrada: {schedule.startTime}</p>
                        <p>Salida: {schedule.endTime}</p>
                        {schedule.breakfastStart && (
                          <p>Desayuno: {schedule.breakfastStart} - {schedule.breakfastEnd}</p>
                        )}
                        {schedule.lunchStart && (
                          <p>Comida: {schedule.lunchStart} - {schedule.lunchEnd}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )) || (
                  <div className="space-y-4">
                    {predefinedSchedules.map((schedule, index) => (
                      <Card key={index} className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{schedule.name}</h4>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleCreatePredefined(schedule)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                            <p>Entrada: {schedule.startTime}</p>
                            <p>Salida: {schedule.endTime}</p>
                            <p>Desayuno: {schedule.breakfastStart} - {schedule.breakfastEnd}</p>
                            <p>Comida: {schedule.lunchStart} - {schedule.lunchEnd}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Custom Schedule Form */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">Crear Horario Personalizado</h4>
                  <Button 
                    variant="outline"
                    onClick={() => setShowCustomForm(!showCustomForm)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {showCustomForm ? "Cancelar" : "Nuevo Horario"}
                  </Button>
                </div>

                {showCustomForm && (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre del horario</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej: Horario Especial" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="startTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Hora de Entrada</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="endTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Hora de Salida</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="breakfastStart"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Desayuno Inicio</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="breakfastEnd"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Desayuno Fin</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="lunchStart"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Comida Inicio</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lunchEnd"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Comida Fin</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-jasana-blue hover:bg-blue-700"
                        disabled={createScheduleMutation.isPending}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {createScheduleMutation.isPending ? "Creando..." : "Crear Horario"}
                      </Button>
                    </form>
                  </Form>
                )}
              </div>
            </div>

            {/* System Settings */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Configuración General</h3>
              
              {/* Departments Management */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      Departamentos/Áreas
                    </CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowDeptModal(true)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Agregar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {departments.length > 0 ? (
                      departments.map((dept: string) => (
                        <Badge key={dept} variant="secondary" className="px-3 py-1">
                          {dept}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No hay departamentos registrados</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Los departamentos se crean automáticamente al agregar empleados con nuevas áreas
                  </p>
                </CardContent>
              </Card>
              
              {/* Database Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Base de Datos PostgreSQL</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Servidor</label>
                    <Input value="localhost:5432" readOnly />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Base de Datos</label>
                    <Input value="jasana_attendance" readOnly />
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="bg-green-50 text-green-700 border-green-200">
                      <Check className="w-4 h-4 mr-1" />
                      Conectado
                    </Button>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Probar Conexión
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Scanner Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Configuración del Escáner</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="auto-scan" 
                      checked={systemSettings.autoScan}
                      onCheckedChange={(checked) => 
                        setSystemSettings(prev => ({ ...prev, autoScan: checked as boolean }))
                      }
                    />
                    <label htmlFor="auto-scan" className="text-sm text-gray-700">
                      Escáner automático siempre activo
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="camera-fallback" 
                      checked={systemSettings.cameraFallback}
                      onCheckedChange={(checked) => 
                        setSystemSettings(prev => ({ ...prev, cameraFallback: checked as boolean }))
                      }
                    />
                    <label htmlFor="camera-fallback" className="text-sm text-gray-700">
                      Usar cámara como respaldo
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Tiempo de bloqueo (segundos)
                    </label>
                    <Input 
                      type="number" 
                      value={systemSettings.lockoutTime} 
                      onChange={(e) => 
                        setSystemSettings(prev => ({ ...prev, lockoutTime: parseInt(e.target.value) || 60 }))
                      }
                      min="30" 
                      max="300" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Tolerancia de entrada (minutos)
                    </label>
                    <Input 
                      type="number" 
                      value={systemSettings.toleranceMinutes} 
                      onChange={(e) => 
                        setSystemSettings(prev => ({ ...prev, toleranceMinutes: parseInt(e.target.value) || 15 }))
                      }
                      min="0" 
                      max="60" 
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notificaciones</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="sound-alerts" 
                      checked={systemSettings.soundAlerts}
                      onCheckedChange={(checked) => 
                        setSystemSettings(prev => ({ ...prev, soundAlerts: checked as boolean }))
                      }
                    />
                    <label htmlFor="sound-alerts" className="text-sm text-gray-700">
                      Alertas sonoras
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="show-photo" 
                      checked={systemSettings.showPhoto}
                      onCheckedChange={(checked) => 
                        setSystemSettings(prev => ({ ...prev, showPhoto: checked as boolean }))
                      }
                    />
                    <label htmlFor="show-photo" className="text-sm text-gray-700">
                      Mostrar foto en check-in/out
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Duración de notificación (segundos)
                    </label>
                    <Input 
                      type="number" 
                      value={systemSettings.notificationDuration} 
                      onChange={(e) => 
                        setSystemSettings(prev => ({ ...prev, notificationDuration: parseInt(e.target.value) || 3 }))
                      }
                      min="1" 
                      max="10" 
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Save Settings */}
              <Button 
                className="w-full bg-jasana-blue hover:bg-blue-700"
                onClick={handleSaveSettings}
                disabled={saveSettingsMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {saveSettingsMutation.isPending ? "Guardando..." : "Guardar Configuración"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Department Management Modal */}
      <Dialog open={showDeptModal} onOpenChange={setShowDeptModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-jasana-blue">
              Agregar Departamento/Área
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Departamento
            </label>
            <Input
              value={newDepartment}
              onChange={(e) => setNewDepartment(e.target.value)}
              placeholder="Ej: Recursos Humanos, Producción..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddDepartment();
                }
              }}
            />
            <p className="text-xs text-gray-500 mt-2">
              Nota: Los departamentos se crean automáticamente cuando agregas empleados con nuevas áreas.
            </p>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDeptModal(false);
                setNewDepartment("");
              }}
            >
              Cancelar
            </Button>
            <Button 
              className="bg-jasana-blue hover:bg-blue-700"
              onClick={handleAddDepartment}
              disabled={!newDepartment.trim()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
