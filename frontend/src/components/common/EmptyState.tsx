import React from 'react'
import { FolderSearch } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  icon?: React.ReactNode
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs">
      <div className="w-14 h-14 mb-4 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
        {icon || <FolderSearch className="w-7 h-7" />}
      </div>
      <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
