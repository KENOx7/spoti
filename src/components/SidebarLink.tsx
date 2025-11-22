// src/components/SidebarLink.tsx
import { cn } from "@/lib/utils";
import { NavLink, useLocation } from "react-router-dom";

type SidebarLinkProps = {
  href: string;
  children: React.ReactNode;
  icon: React.ReactNode;
};

export function SidebarLink({ href, children, icon }: SidebarLinkProps) {
  const location = useLocation();
  const isActive = location.pathname === href;

  return (
    <NavLink
      to={href}
      // 'end' propertisi anasəhifə linkinin (/) digər linklərlə
      // eyni vaxtda aktiv olmasının qarşısını alır
      end={href === "/"}
      className={({ isActive: navIsActive }) =>
        cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]",
          (isActive || navIsActive)
            ? "bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] hover:bg-[hsl(var(--sidebar-primary))] hover:text-[hsl(var(--sidebar-primary-foreground))]"
            : "text-[hsl(var(--sidebar-foreground))]"
        )
      }
    >
      {icon}
      {children}
    </NavLink>
  );
}