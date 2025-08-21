import { 
  employees, 
  schedules, 
  attendance, 
  systemConfig,
  type Employee, 
  type InsertEmployee,
  type Schedule,
  type InsertSchedule,
  type Attendance,
  type InsertAttendance,
  type SystemConfig,
  type InsertSystemConfig
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, count, sql } from "drizzle-orm";

export interface IStorage {
  // Employee operations
  getEmployee(id: string): Promise<Employee | undefined>;
  getAllEmployees(): Promise<Employee[]>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: string, employee: Partial<InsertEmployee>): Promise<Employee>;
  deleteEmployee(id: string): Promise<void>;

  // Schedule operations
  getSchedule(id: string): Promise<Schedule | undefined>;
  getAllSchedules(): Promise<Schedule[]>;
  createSchedule(schedule: InsertSchedule): Promise<Schedule>;
  updateSchedule(id: string, schedule: Partial<InsertSchedule>): Promise<Schedule>;
  deleteSchedule(id: string): Promise<void>;

  // Attendance operations
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  getEmployeeAttendance(employeeId: string, startDate?: string, endDate?: string): Promise<Attendance[]>;
  getAllAttendance(startDate?: string, endDate?: string): Promise<Attendance[]>;
  getAttendanceByDate(date: string): Promise<Attendance[]>;
  getTodayStats(): Promise<{ checkIns: number; checkOuts: number; activeEmployees: number }>;

  // System config operations
  getConfig(key: string): Promise<SystemConfig | undefined>;
  setConfig(key: string, value: any): Promise<SystemConfig>;
}

export class DatabaseStorage implements IStorage {
  // Employee operations
  async getEmployee(id: string): Promise<Employee | undefined> {
    const [employee] = await db
      .select()
      .from(employees)
      .where(eq(employees.id, id))
      .limit(1);
    return employee || undefined;
  }

  async getAllEmployees(): Promise<Employee[]> {
    return await db
      .select()
      .from(employees)
      .orderBy(employees.name);
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const [created] = await db
      .insert(employees)
      .values(employee)
      .returning();
    return created;
  }

  async updateEmployee(id: string, employee: Partial<InsertEmployee>): Promise<Employee> {
    const [updated] = await db
      .update(employees)
      .set(employee)
      .where(eq(employees.id, id))
      .returning();
    return updated;
  }

  async deleteEmployee(id: string): Promise<void> {
    await db
      .delete(employees)
      .where(eq(employees.id, id));
  }

  // Schedule operations
  async getSchedule(id: string): Promise<Schedule | undefined> {
    const [schedule] = await db
      .select()
      .from(schedules)
      .where(eq(schedules.id, id))
      .limit(1);
    return schedule || undefined;
  }

  async getAllSchedules(): Promise<Schedule[]> {
    return await db
      .select()
      .from(schedules)
      .orderBy(schedules.name);
  }

  async createSchedule(schedule: InsertSchedule): Promise<Schedule> {
    const [created] = await db
      .insert(schedules)
      .values(schedule)
      .returning();
    return created;
  }

  async updateSchedule(id: string, schedule: Partial<InsertSchedule>): Promise<Schedule> {
    const [updated] = await db
      .update(schedules)
      .set(schedule)
      .where(eq(schedules.id, id))
      .returning();
    return updated;
  }

  async deleteSchedule(id: string): Promise<void> {
    await db
      .delete(schedules)
      .where(eq(schedules.id, id));
  }

  // System Configuration operations
  async getConfig(key: string): Promise<SystemConfig | undefined> {
    const [config] = await db
      .select()
      .from(systemConfig)
      .where(eq(systemConfig.key, key))
      .limit(1);
    return config || undefined;
  }

  async setConfig(key: string, value: any): Promise<SystemConfig> {
    const existingConfig = await this.getConfig(key);
    
    if (existingConfig) {
      const [updated] = await db
        .update(systemConfig)
        .set({ value, updatedAt: new Date() })
        .where(eq(systemConfig.key, key))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(systemConfig)
        .values({ key, value })
        .returning();
      return created;
    }
  }

  // Attendance operations
  async createAttendance(attendanceData: InsertAttendance): Promise<Attendance> {
    const [created] = await db
      .insert(attendance)
      .values(attendanceData)
      .returning();
    return created;
  }

  async getEmployeeAttendance(employeeId: string, startDate?: string, endDate?: string): Promise<Attendance[]> {
    if (startDate && endDate) {
      return await db
        .select()
        .from(attendance)
        .where(
          and(
            eq(attendance.employeeId, employeeId),
            gte(attendance.date, startDate),
            lte(attendance.date, endDate)
          )
        )
        .orderBy(desc(attendance.timestamp));
    } else {
      return await db
        .select()
        .from(attendance)
        .where(eq(attendance.employeeId, employeeId))
        .orderBy(desc(attendance.timestamp));
    }
  }

  async getAllAttendance(startDate?: string, endDate?: string): Promise<Attendance[]> {
    let query = db
      .select()
      .from(attendance);

    if (startDate && endDate) {
      query = query.where(
        and(
          gte(attendance.date, startDate),
          lte(attendance.date, endDate)
        )
      );
    }

    return await query.orderBy(desc(attendance.timestamp));
  }

  async getAttendanceByDate(date: string): Promise<Attendance[]> {
    return await db
      .select()
      .from(attendance)
      .where(eq(attendance.date, date))
      .orderBy(desc(attendance.timestamp));
  }

  async getTodayStats(): Promise<{ checkIns: number; checkOuts: number; activeEmployees: number }> {
    const today = new Date().toISOString().split('T')[0];
    
    const [checkInsResult] = await db
      .select({ count: count() })
      .from(attendance)
      .where(
        and(
          eq(attendance.date, today),
          eq(attendance.type, 'entrada')
        )
      );

    const [checkOutsResult] = await db
      .select({ count: count() })
      .from(attendance)
      .where(
        and(
          eq(attendance.date, today),
          sql`type IN ('salida_general', 'auto_checkout')`
        )
      );

    const activeEmployees = Math.max(0, checkInsResult.count - checkOutsResult.count);

    return {
      checkIns: checkInsResult.count,
      checkOuts: checkOutsResult.count,
      activeEmployees
    };
  }

  // Auto checkout functionality
  async processAutoCheckouts(): Promise<void> {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.getHours() * 100 + now.getMinutes(); // Format: HHMM

    // Only run after 22:00 (10:00 PM)
    if (currentTime < 2200) return;

    // Get all employees who have an 'entrada' today but no 'salida_general' or 'auto_checkout'
    const todayAttendance = await db
      .select()
      .from(attendance)
      .where(eq(attendance.date, today));

    // Group by employee
    const employeeRecords = new Map();
    for (const record of todayAttendance) {
      if (!employeeRecords.has(record.employeeId)) {
        employeeRecords.set(record.employeeId, []);
      }
      employeeRecords.get(record.employeeId).push(record);
    }

    // Check each employee for missing checkout
    for (const [employeeId, records] of Array.from(employeeRecords.entries())) {
      const hasEntrada = records.some((r: any) => r.type === 'entrada');
      const hasSalidaGeneral = records.some((r: any) => r.type === 'salida_general' || r.type === 'auto_checkout');
      
      if (hasEntrada && !hasSalidaGeneral) {
        // Get employee schedule for checkout time
        const employee = await this.getEmployee(employeeId);
        if (employee && employee.scheduleId) {
          const schedule = await this.getSchedule(employee.scheduleId);
          if (schedule) {
            // Create auto checkout at end time
            await this.createAttendance({
              employeeId,
              type: 'auto_checkout',
              date: today,
              notes: 'Registro automático generado por el sistema',
              isAutomatic: true
            });
          }
        }
      }
    }
  }

}

export const storage = new DatabaseStorage();
