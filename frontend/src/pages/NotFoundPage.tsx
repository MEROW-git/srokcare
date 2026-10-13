import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, ArrowLeft } from 'lucide-react'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md p-8 bg-white border border-slate-300 rounded-md shadow-xs space-y-4">
        <div className="w-12 h-12 rounded-xs bg-slate-900 text-amber-400 flex items-center justify-center mx-auto">
          <MapPin className="w-6 h-6" />
        </div>
        <div className="font-mono text-3xl font-black text-slate-900 tracking-tight">404</div>
        <h2 className="text-base font-bold text-slate-800 uppercase tracking-wider">Page Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested page or civic report route does not exist in the public ledger.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-slate-900 text-white font-bold text-xs shadow-xs hover:bg-slate-800 transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to FixKH Home</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

