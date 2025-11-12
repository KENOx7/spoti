// components/PageHeader.tsx
import React from "react";

interface PageHeaderProps {
  icon: React.ReactNode;
  iconBgClass?: string;
  title: string;
  subtitle: string | React.ReactNode;
}

/**
 * Səhifələrin yuxarısındakı ikon, başlıq və alt-başlıq üçün
 * təkrar istifadə edilə bilən başlıq komponenti.
 */
export function PageHeader({ icon, iconBgClass, title, subtitle }: PageHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <div className={`p-3 rounded-xl ${iconBgClass || "bg-primary/10"}`}>
        {icon}
      </div>
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}