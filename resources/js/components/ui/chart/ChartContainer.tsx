import * as React from "react";

export type ChartConfig = Record<string, { label: string; color: string }>;

const ChartConfigContext = React.createContext<ChartConfig>({});

export function ChartContainer({ config, children, className = "" }: { config: ChartConfig; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <ChartConfigContext.Provider value={config}>{children}</ChartConfigContext.Provider>
    </div>
  );
}

export function useChartConfig() {
  return React.useContext(ChartConfigContext);
} 