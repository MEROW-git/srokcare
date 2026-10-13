import React from 'react'

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-300 dark:border-slate-800 p-5 shadow-2xs animate-pulse space-y-4 transition-colors duration-150">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-sm bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-1.5">
            <div className="w-28 h-3.5 bg-slate-200 dark:bg-slate-800 rounded-xs" />
            <div className="w-20 h-3 bg-slate-100 dark:bg-slate-800/60 rounded-xs" />
          </div>
        </div>
        <div className="w-24 h-6 bg-slate-200 dark:bg-slate-800 rounded-xs" />
      </div>

      {/* Title & Description */}
      <div className="space-y-2">
        <div className="w-4/5 h-4.5 bg-slate-200 dark:bg-slate-800 rounded-xs" />
        <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-800/60 rounded-xs" />
        <div className="w-2/3 h-3.5 bg-slate-100 dark:bg-slate-800/60 rounded-xs" />
      </div>

      {/* Image thumbnail skeleton */}
      <div className="w-full h-44 bg-slate-100 dark:bg-slate-800/60 rounded-sm border border-slate-200 dark:border-slate-800" />

      {/* Footer bar */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
        <div className="w-32 h-3.5 bg-slate-100 dark:bg-slate-800/60 rounded-xs" />
        <div className="flex gap-2">
          <div className="w-18 h-7 bg-slate-200 dark:bg-slate-800 rounded-xs" />
          <div className="w-18 h-7 bg-slate-200 dark:bg-slate-800 rounded-xs" />
        </div>
      </div>
    </div>
  )
}
