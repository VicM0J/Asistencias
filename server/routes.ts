import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEmployeeSchema, insertScheduleSchema, insertAttendanceSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Employee routes
  app.get("/api/employees", async (req, res) => {
    try {
      const employees = await storage.getAllEmployees();
      res.json(employees);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.get("/api/employees/:id", async (req, res) => {
    try {
      const employee = await storage.getEmployee(req.params.id);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch employee" });
    }
  });

  app.post("/api/employees", upload.single('photo'), async (req, res) => {
    try {      
      // Clean up the request body - remove empty strings for optional fields
      const cleanBody = { ...req.body };
      if (cleanBody.scheduleId === '') {
        delete cleanBody.scheduleId;
      }
      
      const employeeData = insertEmployeeSchema.parse(cleanBody);
      
      // Handle photo upload
      if (req.file) {
        const photoUrl = `/uploads/${req.file.filename}`;
        employeeData.photoUrl = photoUrl;
      }

      const employee = await storage.createEmployee(employeeData);
      res.status(201).json(employee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid employee data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create employee" });
    }
  });

  app.put("/api/employees/:id", upload.single('photo'), async (req, res) => {
    try {
      const employeeData = insertEmployeeSchema.partial().parse(req.body);
      
      // Handle photo upload
      if (req.file) {
        const photoUrl = `/uploads/${req.file.filename}`;
        employeeData.photoUrl = photoUrl;
      }

      const employee = await storage.updateEmployee(req.params.id, employeeData);
      res.json(employee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid employee data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update employee" });
    }
  });

  app.delete("/api/employees/:id", async (req, res) => {
    try {
      await storage.deleteEmployee(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete employee" });
    }
  });

  // Schedule routes
  app.get("/api/schedules", async (req, res) => {
    try {
      const schedules = await storage.getAllSchedules();
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch schedules" });
    }
  });

  app.post("/api/schedules", async (req, res) => {
    try {
      const scheduleData = insertScheduleSchema.parse(req.body);
      const schedule = await storage.createSchedule(scheduleData);
      res.status(201).json(schedule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid schedule data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create schedule" });
    }
  });

  app.put("/api/schedules/:id", async (req, res) => {
    try {
      const scheduleData = insertScheduleSchema.partial().parse(req.body);
      const schedule = await storage.updateSchedule(req.params.id, scheduleData);
      res.json(schedule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid schedule data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update schedule" });
    }
  });

  // Attendance routes
  app.post("/api/attendance", async (req, res) => {
    try {
      const attendanceData = insertAttendanceSchema.parse({
        ...req.body,
        date: new Date().toISOString().split('T')[0]
      });
      
      const attendance = await storage.createAttendance(attendanceData);
      res.status(201).json(attendance);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid attendance data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create attendance record" });
    }
  });

  app.get("/api/attendance", async (req, res) => {
    try {
      const { startDate, endDate, employeeId } = req.query;
      
      let attendance;
      if (employeeId) {
        attendance = await storage.getEmployeeAttendance(
          employeeId as string, 
          startDate as string, 
          endDate as string
        );
      } else {
        attendance = await storage.getAllAttendance(
          startDate as string, 
          endDate as string
        );
      }
      
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  app.get("/api/attendance/today", async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const attendance = await storage.getAttendanceByDate(today);
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch today's attendance" });
    }
  });

  app.get("/api/attendance/stats", async (req, res) => {
    try {
      const stats = await storage.getTodayStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch attendance stats" });
    }
  });

  // System Configuration routes
  app.get("/api/config/:key", async (req, res) => {
    try {
      const config = await storage.getConfig(req.params.key);
      if (!config) {
        return res.status(404).json({ message: "Configuration not found" });
      }
      res.json(config);
    } catch (error) {
      res.status(500).json({ message: "Failed to get configuration" });
    }
  });

  app.post("/api/config", async (req, res) => {
    try {
      const { key, value } = req.body;
      const config = await storage.setConfig(key, value);
      res.json(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid config data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to save configuration" });
    }
  });

  app.get("/api/departments", async (req, res) => {
    try {
      const employees = await storage.getAllEmployees();
      const departments = Array.from(new Set(employees.map(emp => emp.area))).filter(Boolean);
      res.json(departments);
    } catch (error) {
      res.status(500).json({ message: "Failed to get departments" });
    }
  });

  // Check-in/out route
  app.post("/api/checkin", async (req, res) => {
    try {
      const { employeeId } = req.body;
      
      if (!employeeId) {
        return res.status(400).json({ message: "Employee ID is required" });
      }

      // Verify employee exists
      const employee = await storage.getEmployee(employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      const today = new Date().toISOString().split('T')[0];
      
      // Get today's attendance for this employee
      const todayAttendance = await storage.getEmployeeAttendance(employeeId, today, today);
      
      // Check for 30-second cooldown period
      const lastRecord = todayAttendance[0];
      if (lastRecord) {
        const now = new Date();
        const lastRecordTime = new Date(lastRecord.timestamp);
        const timeDiffSeconds = (now.getTime() - lastRecordTime.getTime()) / 1000;
        
        if (timeDiffSeconds < 30) {
          const remainingSeconds = Math.ceil(30 - timeDiffSeconds);
          return res.status(400).json({ 
            message: `Por favor espera ${remainingSeconds} segundos antes de registrar nuevamente`
          });
        }
      }
      
      // Determine attendance type based on record count
      const recordCount = todayAttendance.length;
      let type: string;
      let typeDisplay: string;
      
      switch (recordCount) {
        case 0:
          type = 'entrada';
          typeDisplay = 'Entrada';
          break;
        case 1:
          type = 'salida_desayuno';
          typeDisplay = 'Salida desayuno';
          break;
        case 2:
          type = 'entrada_desayuno';
          typeDisplay = 'Entrada desayuno';
          break;
        case 3:
          type = 'salida_comida';
          typeDisplay = 'Salida comida';
          break;
        case 4:
          type = 'entrada_comida';
          typeDisplay = 'Entrada comida';
          break;
        case 5:
          type = 'salida_general';
          typeDisplay = 'Salida general';
          break;
        default:
          return res.status(400).json({ message: "Ya se han completado todos los registros del día" });
      }

      const attendance = await storage.createAttendance({
        employeeId,
        type,
        date: today,
        notes: `${typeDisplay} via scanner`,
        isAutomatic: false
      });

      // Calculate hours worked for final checkout
      let hoursWorked = "0h 0m";
      if (type === 'salida_general') {
        const entradaRecord = todayAttendance.find(r => r.type === 'entrada');
        if (entradaRecord) {
          const entradaTime = new Date(entradaRecord.timestamp);
          const salidaTime = new Date(attendance.timestamp);
          const diffMs = salidaTime.getTime() - entradaTime.getTime();
          const hours = Math.floor(diffMs / (1000 * 60 * 60));
          const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          hoursWorked = `${hours}h ${minutes}m`;
        }
      }

      res.status(201).json({ 
        attendance, 
        employee,
        type,
        hoursWorked,
        message: `${typeDisplay} exitosa`
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to process check-in/out" });
    }
  });

  // System config routes
  app.get("/api/config/:key", async (req, res) => {
    try {
      const config = await storage.getConfig(req.params.key);
      if (!config) {
        return res.status(404).json({ message: "Configuration not found" });
      }
      res.json(config);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch configuration" });
    }
  });

  app.post("/api/config", async (req, res) => {
    try {
      const { key, value } = req.body;
      if (!key || value === undefined) {
        return res.status(400).json({ message: "Key and value are required" });
      }
      
      const config = await storage.setConfig(key, value);
      res.json(config);
    } catch (error) {
      res.status(500).json({ message: "Failed to save configuration" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static(uploadDir));

  const httpServer = createServer(app);
  return httpServer;
}
