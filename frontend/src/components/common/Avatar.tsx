import React, { useState } from 'react'

interface AvatarProps {
  nickname: string
  avatarUrl?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  className?: string
}

// Consistent civic palette pairings: solid background + crisp text + subtle border
const CIVIC_COLOR_PAIRS = [
  { bg: 'bg-slate-800 text-slate-100 border-slate-700' },
  { bg: 'bg-blue-900 text-blue-100 border-blue-800' },
  { bg: 'bg-stone-800 text-stone-100 border-stone-700' },
  { bg: 'bg-sky-900 text-sky-100 border-sky-800' },
  { bg: 'bg-amber-900 text-amber-100 border-amber-800' },
  { bg: 'bg-teal-900 text-teal-100 border-teal-800' },
]

function getHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

export const Avatar: React.FC<AvatarProps> = ({
  nickname,
  avatarUrl,
  size = 'md',
  className = '',
}) => {
  const [imgError, setImgError] = useState(false)
  const cleanNick = (nickname || 'Anonymous').trim()
  const initials =
    cleanNick
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || cleanNick.slice(0, 2).toUpperCase()

  const colorPair = CIVIC_COLOR_PAIRS[getHash(cleanNick) % CIVIC_COLOR_PAIRS.length]

  const sizeClasses = {
    sm: 'w-7 h-7 text-[11px] rounded-xs',
    md: 'w-9 h-9 text-xs rounded-sm',
    lg: 'w-11 h-11 text-sm rounded-sm',
    xl: 'w-16 h-16 text-lg font-bold rounded-sm',
    '2xl': 'w-24 h-24 text-2xl font-bold rounded-sm',
    '3xl': 'w-32 h-32 text-3xl font-bold rounded-sm',
  }[size]

  if (avatarUrl && !imgError) {
    return (
      <div
        className={`inline-flex items-center justify-center overflow-hidden shrink-0 border border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800 ${sizeClasses} ${className}`}
        title={cleanNick}
      >
        <img
          src={avatarUrl}
          alt={cleanNick}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  return (
    <div
      className={`inline-flex items-center justify-center font-bold tracking-tight select-none shrink-0 border ${colorPair.bg} ${sizeClasses} ${className}`}
      title={cleanNick}
    >
      <span>{initials}</span>
    </div>
  )
}
