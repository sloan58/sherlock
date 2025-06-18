import * as React from "react";

export function ChartLegend({ content, className = "", ...props }: any) {
  return (
    <div className={`flex flex-wrap gap-2 mt-4 justify-center ${className}`} {...props}>
      {content}
    </div>
  );
}

export function ChartLegendContent({ data, nameKey = "name" }: any) {
  if (!data) return null;
  return data.map((entry: any) => {
    const color = entry.fill || '#8884d8';
    const label = entry[nameKey];
    return (
      <div key={label} className="flex items-center gap-2 min-w-[80px] justify-center">
        <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
        <span className="truncate max-w-[60px]" title={label}>{label}</span>
      </div>
    );
  });
} 