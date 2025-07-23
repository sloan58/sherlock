import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, RefreshCw, AlertCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'syncing' | 'error' | 'warning' | 'never-synced'
  label?: string
  className?: string
  showIcon?: boolean
}

const statusConfig = {
  online: {
    icon: CheckCircle,
    className: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    iconClassName: "text-green-600"
  },
  offline: {
    icon: XCircle,
    className: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    iconClassName: "text-red-600"
  },
  syncing: {
    icon: RefreshCw,
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    iconClassName: "text-yellow-600"
  },
  error: {
    icon: AlertCircle,
    className: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    iconClassName: "text-red-600"
  },
  warning: {
    icon: AlertCircle,
    className: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
    iconClassName: "text-orange-600"
  },
  'never-synced': {
    icon: Clock,
    className: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
    iconClassName: "text-gray-600"
  }
}

export function StatusIndicator({ 
  status, 
  label, 
  className,
  showIcon = true 
}: StatusIndicatorProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge 
      variant="secondary" 
      className={cn(
        config.className,
        "inline-flex items-center gap-1",
        className
      )}
    >
      {showIcon && (
        <Icon 
          className={cn(
            "w-3 h-3",
            status === 'syncing' && "animate-spin",
            config.iconClassName
          )} 
        />
      )}
      {label || status.replace('-', ' ')}
    </Badge>
  )
}

export function DeviceStatusIndicator({ 
  device, 
  className 
}: { 
  device: { 
    last_sync_completed?: string | null
    last_sync_history?: {
      id: number;
      result: string;
      error_message?: string;
      completed_at: string;
    } | null
    syncing?: boolean
    error?: string
  }
  className?: string 
}) {
  let status: StatusIndicatorProps['status'] = 'never-synced'
  let label = 'Never Synced'

  if (device.syncing) {
    status = 'syncing'
    label = 'Syncing'
  } else if (device.error) {
    status = 'error'
    label = 'Error'
  } else if (device.last_sync_history) {
    if (device.last_sync_history.result === 'completed') {
      status = 'online'
      label = 'Synced'
    } else {
      status = 'error'
      label = 'Failed'
    }
  }

  return (
    <StatusIndicator 
      status={status} 
      label={label} 
      className={className}
    />
  )
} 