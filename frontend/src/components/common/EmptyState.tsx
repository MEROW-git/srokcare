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
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-md border border-slate-300 shadow-2xs">
      <div className="w-12 h-12 mb-3.5 rounded-sm bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-300">
        {icon || <FolderSearch className="w-6 h-6 text-slate-700" />}
      </div>
      <h3 className="text-base font-bold text-slate-900 tracking-tight mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-600 max-w-sm mb-5 leading-relaxed">{description}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-blue-800 hover:bg-blue-900 rounded-sm transition-colors border border-blue-950"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

