import React from 'react'

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs animate-pulse space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200" />
          <div className="space-y-1.5">
            <div className="w-24 h-4 bg-slate-200 rounded-md" />
            <div className="w-16 h-3 bg-slate-100 rounded-md" />
          </div>
        </div>
        <div className="w-20 h-6 bg-slate-200 rounded-full" />
      </div>

      {/* Title & Description */}
      <div className="space-y-2">
        <div className="w-3/4 h-5 bg-slate-200 rounded-md" />
        <div className="w-full h-4 bg-slate-100 rounded-md" />
        <div className="w-2/3 h-4 bg-slate-100 rounded-md" />
      </div>

      {/* Image thumbnail skeleton */}
      <div className="w-full h-48 bg-slate-200 rounded-xl" />

      {/* Footer bar */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div className="w-28 h-4 bg-slate-100 rounded-md" />
        <div className="flex gap-2">
          <div className="w-16 h-8 bg-slate-200 rounded-lg" />
          <div className="w-16 h-8 bg-slate-200 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
