import * as React from 'react'
import { Badge, type BadgeProps } from '@/components/ui/badge'

/**
 * Matches the VolunteerStatus enum in the Prisma schema.
 */
export type VolunteerStatus =
  | 'PENDING_INDUCTION'
  | 'INDUCTED'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'PAUSED'
  | 'REMOVED'

const STATUS_LABELS: Record<VolunteerStatus, string> = {
  PENDING_INDUCTION: 'Pending Induction',
  INDUCTED: 'Inducted',
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  PAUSED: 'Paused',
  REMOVED: 'Removed',
}

interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: VolunteerStatus
}

export function StatusBadge({ status, ...props }: StatusBadgeProps) {
  return (
    <Badge variant={status} {...props}>
      {STATUS_LABELS[status]}
    </Badge>
  )
}
