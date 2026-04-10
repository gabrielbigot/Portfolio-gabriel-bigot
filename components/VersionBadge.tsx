'use client'

/**
 * VersionBadge Component
 * Small badge showing the current version number
 */

import React from 'react'
import { Tag } from 'lucide-react'

interface VersionBadgeProps {
  versionLabel: string
  className?: string
}

export default function VersionBadge({ versionLabel, className = '' }: VersionBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-primary/10 text-primary border border-primary/20 rounded-full ${className}`}
    >
      <Tag className="h-3 w-3" />
      {versionLabel}
    </span>
  )
}
