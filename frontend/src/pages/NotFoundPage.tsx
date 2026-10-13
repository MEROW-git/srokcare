import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, ArrowLeft } from 'lucide-react'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md p-8 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-md shadow-xs space-y-4 transition-colors duration-150">
        <div className="w-12 h-12 rounded-xs bg-slate-900 dark:bg-slate-800 text-amber-400 flex items-center justify-center mx-auto border border-slate-800 dark:border-slate-700">
          <MapPin className="w-6 h-6" />
        </div>
        <div className="font-mono text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">404</div>
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Page Not Found</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          The requested page or civic report route does not exist in the public ledger.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-blue-900 hover:bg-blue-950 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition-colors uppercase tracking-wider border border-blue-950 dark:border-blue-500"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to FixKH Home</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
