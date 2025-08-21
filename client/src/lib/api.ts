import { apiRequest } from "./queryClient";
import type { Employee, InsertEmployee, Schedule, InsertSchedule, Attendance, InsertAttendance } from "@shared/schema";

export const api = {
  // Employee operations
  employees: {
    getAll: () => apiRequest("GET", "/api/employees"),
    getById: (id: string) => apiRequest("GET", `/api/employees/${id}`),
    create: (data: FormData) => apiRequest("POST", "/api/employees", data),
    update: (id: string, data: FormData) => apiRequest("PUT", `/api/employees/${id}`, data),
    delete: (id: string) => apiRequest("DELETE", `/api/employees/${id}`),
  },

  // Schedule operations
  schedules: {
    getAll: () => apiRequest("GET", "/api/schedules"),
    create: (data: InsertSchedule) => apiRequest("POST", "/api/schedules", data),
    update: (id: string, data: Partial<InsertSchedule>) => apiRequest("PUT", `/api/schedules/${id}`, data),
  },

  // Attendance operations
  attendance: {
    getAll: (params?: { startDate?: string; endDate?: string; employeeId?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.startDate) searchParams.set('startDate', params.startDate);
      if (params?.endDate) searchParams.set('endDate', params.endDate);
      if (params?.employeeId) searchParams.set('employeeId', params.employeeId);
      
      return apiRequest("GET", `/api/attendance?${searchParams}`);
    },
    getToday: () => apiRequest("GET", "/api/attendance/today"),
    getStats: () => apiRequest("GET", "/api/attendance/stats"),
    create: (data: InsertAttendance) => apiRequest("POST", "/api/attendance", data),
  },

  // Check-in/out
  checkin: (employeeId: string) => apiRequest("POST", "/api/checkin", { employeeId }),

  // System config
  config: {
    get: (key: string) => apiRequest("GET", `/api/config/${key}`),
    set: (key: string, value: any) => apiRequest("POST", "/api/config", { key, value }),
  },

  // Departments
  departments: {
    getAll: () => apiRequest("GET", "/api/departments"),
  },
};
