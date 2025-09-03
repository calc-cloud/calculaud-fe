import React from "react";

import { cn } from "@/lib/utils";

export const chartBlockThemes = {
  orange: {
    primary: "border-orange-500",
    secondary: "bg-orange-50",
    accent: "text-orange-700",
    hover: "hover:bg-orange-100",
  },
  blue: {
    primary: "border-blue-500",
    secondary: "bg-blue-50",
    accent: "text-blue-700",
    hover: "hover:bg-blue-100",
  },
  green: {
    primary: "border-green-500",
    secondary: "bg-green-50",
    accent: "text-green-700",
    hover: "hover:bg-green-100",
  },
  purple: {
    primary: "border-purple-500",
    secondary: "bg-purple-50",
    accent: "text-purple-700",
    hover: "hover:bg-purple-100",
  },
  teal: {
    primary: "border-teal-500",
    secondary: "bg-teal-50",
    accent: "text-teal-700",
    hover: "hover:bg-teal-100",
  },
  red: {
    primary: "border-red-500",
    secondary: "bg-red-50",
    accent: "text-red-700",
    hover: "hover:bg-red-100",
  },
} as const;

export type ChartBlockTheme = keyof typeof chartBlockThemes;

interface ChartBlockProps {
  title: string;
  themeColor: ChartBlockTheme;
  children: React.ReactNode;
  className?: string;
  description?: string | React.ReactNode;
}

export const ChartBlock: React.FC<ChartBlockProps> = ({ title, themeColor, children, className = "", description }) => {
  const theme = chartBlockThemes[themeColor];

  return (
    <div
      className={cn(
        "bg-white rounded-lg border-2 transition-all duration-200 overflow-visible",
        theme.primary,
        theme.secondary,
        className
      )}
    >
      {/* Block Header */}
      <div className={cn("px-6 py-4 border-b border-gray-200 rounded-t-lg", theme.secondary)}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={cn("text-lg font-semibold", theme.accent)}>{title}</h3>
            {description && (
              <div className="text-sm text-gray-600 mt-1">
                {typeof description === "string" ? <p className="whitespace-pre-line">{description}</p> : description}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Block Content */}
      <div className="grid grid-cols-3 gap-6 p-6">{children}</div>
    </div>
  );
};
