import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricsCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
  gradient?: {
    from: string
    to: string
  }
}

export function MetricsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  gradient = {
    from: "from-blue-500/10",
    to: "to-blue-600/10"
  }
}: MetricsCardProps) {
  return (
    <Card className={cn(
      "hover:shadow-md transition-all duration-200 cursor-pointer",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium font-mono">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <span className={cn(
              "text-xs font-medium",
              trend.isPositive ? "text-primary" : "text-destructive"
            )}>
              {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
            </span>
            <span className="text-xs text-muted-foreground ml-1">
              from last month
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function NetworkMetricsCard({
  title,
  value,
  description,
  icon: Icon,
  status = "default",
  className
}: MetricsCardProps & {
  status?: "default" | "success" | "warning" | "error"
}) {
  return (
    <MetricsCard
      title={title}
      value={value}
      description={description}
      icon={Icon}
      className={className}
    />
  )
} 