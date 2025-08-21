-- Habilitar extensión para usar gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabla: schedules
CREATE TABLE public.schedules (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    breakfast_start TIME,
    breakfast_end TIME,
    lunch_start TIME,
    lunch_end TIME,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tolerance_minutes INTEGER DEFAULT 15
);

-- Tabla: employees
CREATE TABLE public.employees (
    id VARCHAR PRIMARY KEY,
    name TEXT NOT NULL,
    area TEXT NOT NULL,
    schedule_id VARCHAR,
    barcode TEXT UNIQUE NOT NULL,
    photo_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT employees_schedule_id_schedules_id_fk FOREIGN KEY (schedule_id)
        REFERENCES public.schedules(id),
    CONSTRAINT employees_barcode_unique UNIQUE (barcode)
);

-- Tabla: attendance
CREATE TABLE public.attendance (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR NOT NULL,
    "timestamp" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    type TEXT NOT NULL,
    date TEXT NOT NULL,
    notes TEXT,
    is_automatic BOOLEAN DEFAULT false,
    CONSTRAINT attendance_employee_id_employees_id_fk FOREIGN KEY (employee_id)
        REFERENCES public.employees(id)
);

-- Tabla: system_config
CREATE TABLE public.system_config (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT system_config_key_unique UNIQUE (key)
);
