'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  Modal,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  ModalClose,
} from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { updateVolunteerStatusAction } from '@/lib/actions/admin.actions'
import { VOLUNTEER_STATUSES } from '@/lib/constants'

interface ChangeStatusModalProps {
  volunteerId: string
  currentStatus: string
}

export function ChangeStatusModal({ volunteerId, currentStatus }: ChangeStatusModalProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [status, setStatus] = React.useState(currentStatus)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleSave() {
    if (status === currentStatus) {
      setOpen(false)
      return
    }
    setLoading(true)
    setError(null)
    const result = await updateVolunteerStatusAction(volunteerId, status)
    setLoading(false)
    if (result.success) {
      setOpen(false)
      router.refresh()
    } else {
      setError(result.error ?? 'Failed to update status.')
    }
  }

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <ModalTrigger asChild>
        <Button variant="outline" size="sm">Change Status</Button>
      </ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Change Volunteer Status</ModalTitle>
          <ModalDescription>
            Update this volunteer's status. An audit note will be added automatically.
          </ModalDescription>
        </ModalHeader>
        <ModalBody className="space-y-4">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger label="New status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(VOLUNTEER_STATUSES) as [string, string][]).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && (
            <p className="text-sm text-red-600" role="alert">{error}</p>
          )}
        </ModalBody>
        <ModalFooter>
          <ModalClose asChild>
            <Button variant="ghost" size="sm" disabled={loading}>Cancel</Button>
          </ModalClose>
          <Button size="sm" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving…' : 'Save'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
