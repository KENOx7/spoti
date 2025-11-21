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
    <div className="flex items-center gap-2 sm:gap-3">
      <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl shrink-0 flex items-center justify-center ${iconBgClass || "bg-primary/10"}`}>
        <div className="[&>svg]:h-5 [&>svg]:w-5 sm:[&>svg]:h-6 sm:[&>svg]:w-6 md:[&>svg]:h-8 md:[&>svg]:w-8">
          {icon}
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">{title}</h1>
        <p className="text-sm sm:text-base text-muted-foreground truncate">{subtitle}</p>
      </div>
    </div>
  );
}