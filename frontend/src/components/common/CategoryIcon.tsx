import React from 'react'
import type { ReportCategory } from '@/types/report'
import {
  AlertTriangle,
  Lightbulb,
  Trash2,
  CloudRain,
  Waves,
  ShieldAlert,
  Building2,
  HelpCircle,
} from 'lucide-react'

interface CategoryIconProps {
  category: ReportCategory
  className?: string
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ category, className = 'w-4 h-4' }) => {
  switch (category) {
    case 'ROAD_DAMAGE':
      return <AlertTriangle className={className} />
    case 'STREETLIGHT':
      return <Lightbulb className={className} />
    case 'GARBAGE':
      return <Trash2 className={className} />
    case 'FLOODING':
      return <CloudRain className={className} />
    case 'DRAINAGE':
      return <Waves className={className} />
    case 'TRAFFIC_SAFETY':
      return <ShieldAlert className={className} />
    case 'PUBLIC_FACILITY':
      return <Building2 className={className} />
    case 'OTHER':
    default:
      return <HelpCircle className={className} />
  }
}
