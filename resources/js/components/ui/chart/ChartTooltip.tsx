import * as React from "react";
import { Tooltip as RechartsTooltip } from "recharts";
import { useChartConfig } from "./ChartContainer";

export function ChartTooltip({ content, ...props }: any) {
  return <RechartsTooltip {...props} content={content} />;
}

export function ChartTooltipContent({ active, payload, label, hideLabel }: any) {
  const config = useChartConfig();
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg bg-background px-3 py-2 shadow-xl border border-border/50 text-xs">
      {!hideLabel && <div className="font-medium mb-1">{label}</div>}
      {payload.map((entry: any, idx: number) => {
        const color = config[entry.dataKey]?.color || entry.color || '#2563eb';
        return (
          <div key={idx} className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span>{config[entry.dataKey]?.label || entry.name}</span>
            <span className="ml-auto font-mono">{entry.value}</span>
          </div>
        );
      })}
    </div>
  );
} 