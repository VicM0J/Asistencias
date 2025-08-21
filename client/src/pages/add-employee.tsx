import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserPlus, Camera, Save, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { insertEmployeeSchema } from "@shared/schema";
import { api } from "@/lib/api";
import { z } from "zod";

const formSchema = insertEmployeeSchema.extend({
  photo: z.any().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function AddEmployee() {
  const [, setLocation] = useLocation();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
      name: "",
      area: "",
      scheduleId: undefined,
      barcode: "",
    },
  });

  // Fetch schedules for selection
  const { data: schedules = [] } = useQuery({
    queryKey: ["/api/schedules"],
  });

  // Create employee mutation
  const createEmployeeMutation = useMutation({
    mutationFn: (data: FormData) => {
      const formData = new FormData();
      formData.append('id', data.id);
      formData.append('name', data.name);
      formData.append('area', data.area);
      formData.append('barcode', data.barcode);
      
      if (data.scheduleId && data.scheduleId.trim() !== '') {
        formData.append('scheduleId', data.scheduleId);
      }
      
      if (data.photo && data.photo[0]) {
        formData.append('photo', data.photo[0]);
      }
      
      return fetch('/api/employees', {
        method: 'POST',
        body: formData
      }).then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: "Éxito",
        description: "Empleado creado exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      setLocation("/employees");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create employee",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createEmployeeMutation.mutate(data);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue('photo', e.target.files);
    }
  };


  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl lg:text-3xl text-jasana-blue flex items-center gap-3">
            <UserPlus className="w-8 h-8" />
            Agregar Nuevo Empleado
          </CardTitle>
          <CardDescription>Complete la información del empleado</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Employee Information */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre Completo *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Juan Pérez García" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID de Empleado *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: JUPE123456" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="area"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Área/Departamento *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar departamento" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Sistemas">Sistemas</SelectItem>
                            <SelectItem value="Administrativo">Administrativo</SelectItem>
                            <SelectItem value="Ventas">Ventas</SelectItem>
                            <SelectItem value="Recursos Humanos">Recursos Humanos</SelectItem>
                            <SelectItem value="Contabilidad">Contabilidad</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="scheduleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horario Laboral</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar horario" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(schedules as any[]).map((schedule: any) => (
                              <SelectItem key={schedule.id} value={schedule.id || ""}>
                                {schedule.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="barcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código de Barras *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ej: MOJV040815" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Photo Upload */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fotografía del Empleado
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-jasana-blue transition-colors">
                      {photoPreview ? (
                        <div className="mb-4">
                          <img 
                            src={photoPreview} 
                            alt="Preview"
                            className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                          />
                        </div>
                      ) : (
                        <div className="mb-4">
                          <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 mb-2">Arrastra una foto aquí o haz clic para seleccionar</p>
                          <p className="text-sm text-gray-400">Formatos: JPG, PNG (máx. 5MB)</p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                        id="employee-photo"
                      />
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => document.getElementById('employee-photo')?.click()}
                      >
                        Seleccionar Foto
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex space-x-4 pt-6 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setLocation("/employees")}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-jasana-blue hover:bg-blue-700"
                  disabled={createEmployeeMutation.isPending}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {createEmployeeMutation.isPending ? "Guardando..." : "Guardar Empleado"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
