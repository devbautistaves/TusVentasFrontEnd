import { cn } from "@/lib/utils"

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Cargada",
    className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  },
  pending_appointment: {
    label: "Observada",
    className: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  },
  appointed: {
    label: "Turnada",
    className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  completed: {
    label: "Activada",
    className: "bg-green-500/20 text-green-400 border-green-500/30",
  },
  installed: {
    label: "Instalada",
    className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
  cancelled: {
    label: "Cancelada",
    className: "bg-red-500/20 text-red-400 border-red-500/30",
  },
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    className: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}

export function getStatusLabel(status: string): string {
  return statusConfig[status]?.label || status
}

export function getStatusOptions() {
  return Object.entries(statusConfig).map(([value, { label }]) => ({
    value,
    label,
  }))
}
