import { Link, useLocation } from "react-router-dom";
import { Home, Leaf, Calendar, Settings, Sprout } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { TranslationKey } from "@/i18n/translations";

interface NavItem {
  path: string;
  labelKey: TranslationKey;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { path: "/", labelKey: "home", icon: Home },
  { path: "/advisory", labelKey: "advisory", icon: Leaf },
  { path: "/farms", labelKey: "myFarms", icon: Sprout },
  { path: "/crop-calendar", labelKey: "calendar", icon: Calendar },
  { path: "/settings", labelKey: "settings", icon: Settings },
];

const BottomNavigation = () => {
  const location = useLocation();
  const { t } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 glass-strong safe-area-bottom">
      <div className="mx-auto flex h-20 max-w-lg items-center justify-around px-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-all duration-300",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-primary/80"
              )}
            >
              <div
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-300",
                  isActive 
                    ? "bg-primary/15 shadow-sm" 
                    : "hover:bg-muted/50"
                )}
              >
                <Icon 
                  className={cn(
                    "h-6 w-6 transition-transform duration-300",
                    isActive && "icon-bounce"
                  )} 
                />
              </div>
              <span className={cn(
                "text-[11px] font-medium transition-all duration-300",
                isActive && "font-semibold text-primary"
              )}>
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;