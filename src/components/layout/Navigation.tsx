import { Train, BarChart3, Settings, Upload, Home, MapPin } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

const Navigation = () => {
  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/dashboard", icon: Train, label: "Live Dashboard" },
    { to: "/map", icon: MapPin, label: "Map" },
    { to: "/analytics", icon: BarChart3, label: "Analytics" },
    { to: "/upload", icon: Upload, label: "Data Upload" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and branding */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
                <Train className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Railway Traffic Control</h1>
                <p className="text-xs text-muted-foreground">Indian Railways Operations Center</p>
              </div>
            </div>
          </div>

          {/* Navigation links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-status"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )
                }
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-sm">
              <div className="live-indicator text-success-foreground">LIVE</div>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="md:hidden pb-4">
          <div className="flex space-x-1 overflow-x-auto">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center space-y-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )
                }
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;