import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, time, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const employees = pgTable("employees", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  area: text("area").notNull(),
  scheduleId: varchar("schedule_id").references(() => schedules.id),
  barcode: text("barcode").notNull().unique(),
  photoUrl: text("photo_url"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const schedules = pgTable("schedules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  breakfastStart: time("breakfast_start"),
  breakfastEnd: time("breakfast_end"),
  lunchStart: time("lunch_start"),
  lunchEnd: time("lunch_end"),
  isDefault: boolean("is_default").default(false),
  toleranceMinutes: integer("tolerance_minutes").default(15), // Tolerancia de entrada en minutos
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const attendance = pgTable("attendance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => employees.id),
  timestamp: timestamp("timestamp").notNull().default(sql`CURRENT_TIMESTAMP`),
  type: text("type").notNull(), // 'entrada', 'salida_desayuno', 'entrada_desayuno', 'salida_comida', 'entrada_comida', 'salida_general', 'auto_checkout'
  date: text("date").notNull(), // YYYY-MM-DD format
  notes: text("notes"),
  isAutomatic: boolean("is_automatic").default(false), // Para registros automáticos
});

export const systemConfig = pgTable("system_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Relations
export const employeesRelations = relations(employees, ({ one, many }) => ({
  schedule: one(schedules, {
    fields: [employees.scheduleId],
    references: [schedules.id],
  }),
  attendanceRecords: many(attendance),
}));

export const schedulesRelations = relations(schedules, ({ many }) => ({
  employees: many(employees),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  employee: one(employees, {
    fields: [attendance.employeeId],
    references: [employees.id],
  }),
}));

// Insert schemas
export const insertEmployeeSchema = createInsertSchema(employees).omit({
  createdAt: true,
});

export const insertScheduleSchema = createInsertSchema(schedules).omit({
  id: true,
  createdAt: true,
});

export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
  timestamp: true,
});

export const insertSystemConfigSchema = createInsertSchema(systemConfig).omit({
  id: true,
  updatedAt: true,
});

// Types
export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Schedule = typeof schedules.$inferSelect;
export type InsertSchedule = z.infer<typeof insertScheduleSchema>;
export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type SystemConfig = typeof systemConfig.$inferSelect;
export type InsertSystemConfig = z.infer<typeof insertSystemConfigSchema>;
