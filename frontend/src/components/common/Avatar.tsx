import React from 'react'

interface AvatarProps {
  nickname: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

// Generate consistent background gradient based on nickname string hash
const GRADIENTS = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-violet-500 to-purple-600',
  'from-cyan-500 to-blue-600',
]

function getHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

export const Avatar: React.FC<AvatarProps> = ({ nickname, size = 'md', className = '' }) => {
  const cleanNick = (nickname || 'Anonymous').trim()
  const initials = cleanNick
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || cleanNick.slice(0, 2).toUpperCase()

  const gradientIdx = getHash(cleanNick) % GRADIENTS.length
  const gradient = GRADIENTS[gradientIdx]

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
    xl: 'w-16 h-16 text-xl font-bold',
  }[size]

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full bg-gradient-to-tr ${gradient} text-white font-semibold shadow-xs select-none shrink-0 ${sizeClasses} ${className}`}
      title={cleanNick}
    >
      <span>{initials}</span>
    </div>
  )
}
