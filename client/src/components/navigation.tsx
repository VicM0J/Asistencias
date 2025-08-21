import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Clock, 
  Users, 
  CalendarCheck, 
  BarChart3, 
  IdCard, 
  Settings, 
  Menu, 
  X 
} from "lucide-react";

const navItems = [
  { href: "/", label: "Check In/Out", icon: Clock },
  { href: "/employees", label: "Empleados", icon: Users },
  { href: "/attendance", label: "Asistencias", icon: CalendarCheck },
  { href: "/reports", label: "Reportes", icon: BarChart3 },
  { href: "/credentials", label: "Credenciales", icon: IdCard },
  { href: "/settings", label: "Configuración", icon: Settings },
];

export function Navigation() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-white shadow-lg border-b-4 border-jasana-blue">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-jasana-blue rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">J</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-jasana-blue">JASANA</h1>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Uniforme Corporativo</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link key={item.href} href={item.href}>
                  <div className={cn(
                    "flex items-center space-x-2 px-4 py-2 font-medium transition-colors cursor-pointer",
                    isActive 
                      ? "text-jasana-blue border-b-2 border-jasana-blue" 
                      : "text-gray-600 hover:text-jasana-blue"
                  )}>
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Mobile/Tablet Menu Button */}
          <button 
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 text-jasana-blue"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile/Tablet Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t">
            <div className="py-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                
                return (
                  <Link key={item.href} href={item.href}>
                    <div 
                      className={cn(
                        "flex items-center space-x-3 px-4 py-3 transition-colors cursor-pointer",
                        isActive 
                          ? "text-jasana-blue font-medium bg-jasana-light" 
                          : "text-gray-600 hover:bg-gray-50"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
