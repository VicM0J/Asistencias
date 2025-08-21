# Employee Attendance Management System

## Overview

This is a comprehensive employee attendance management system designed for tablet interfaces with barcode scanning capabilities. The system allows employees to check in and out using barcode scanners or camera-based QR code reading, while providing administrators with tools to manage employees, schedules, and generate attendance reports. Built with modern web technologies, it features a responsive design optimized for tablet use in workplace environments.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom color scheme (Jasana branding)
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for full-stack type safety
- **API Design**: RESTful API architecture
- **File Uploads**: Multer middleware for employee photo handling
- **Validation**: Zod schemas shared between client and server
- **Development**: Hot Module Replacement (HMR) with Vite integration

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL with Neon serverless hosting
- **Schema**: Structured tables for employees, schedules, attendance, and system configuration
- **Migrations**: Drizzle Kit for database schema management

### Key Data Models
- **Employees**: ID, name, area/department, schedule assignment, barcode, photo
- **Schedules**: Configurable work schedules with break times
- **Attendance**: Time-stamped check-in/out records with various event types
- **System Config**: Key-value store for application settings

### Authentication & Security
- Session-based authentication using connect-pg-simple
- File upload validation and size limits
- CORS and security middleware configuration
- Environment-based configuration management

### Tablet-Optimized Features
- Responsive design targeting tablet form factors
- Large touch-friendly interface elements
- Barcode scanning integration (camera and physical scanners)
- Success modals with employee photos and work hour tracking
- Real-time attendance statistics dashboard

### Reporting & Analytics
- Employee attendance history with flexible date filtering
- Department-based filtering and reporting
- Work hours calculation and overtime tracking
- Export capabilities for attendance reports
- Visual timeline representations of daily attendance

### Configuration Management
- Predefined work schedule templates
- Custom schedule creation and modification
- Credential card design customization
- Company branding and logo management
- System-wide settings persistence

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React, React DOM, React Router (Wouter)
- **TypeScript**: Full TypeScript support across the stack
- **Vite**: Build tool and development server
- **Express.js**: Backend web framework

### Database & ORM
- **Drizzle ORM**: Database toolkit and ORM
- **@neondatabase/serverless**: Neon PostgreSQL serverless client
- **connect-pg-simple**: PostgreSQL session store

### UI Components & Styling
- **Radix UI**: Comprehensive component library primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: Pre-built component library
- **Lucide React**: Icon library

### Form & Validation
- **React Hook Form**: Form state management
- **Zod**: Schema validation library
- **@hookform/resolvers**: Form validation resolvers

### State Management & Data Fetching
- **TanStack Query**: Server state management and caching
- **React Query**: Data synchronization and caching

### File Upload & Processing
- **Multer**: File upload middleware
- **File system operations**: Node.js native modules

### Development Tools
- **Replit Integration**: Development environment optimization
- **ESBuild**: Fast JavaScript bundler for production
- **PostCSS**: CSS processing and optimization

### Utility Libraries
- **date-fns**: Date manipulation and formatting
- **clsx**: Conditional className utility
- **class-variance-authority**: Component variant management
- **nanoid**: Unique ID generation