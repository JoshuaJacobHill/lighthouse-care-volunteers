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
import { Textarea } from '@/components/ui/textarea'
import { addAdminNoteAction } from '@/lib/actions/admin.actions'

interface AddNoteModalProps {
  volunteerId: string
  /** Renders the trigger as a Button with this label — defaults to "Add Note" */
  triggerLabel?: string
}

export function AddNoteModal({ volunteerId, triggerLabel = 'Add Note' }: AddNoteModalProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [content, setContent] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleSave() {
    if (!content.trim()) {
      setError('Please enter a note.')
      return
    }
    setLoading(true)
    setError(null)
    const result = await addAdminNoteAction(volunteerId, content)
    setLoading(false)
    if (result.success) {
      setContent('')
      setOpen(false)
      router.refresh()
    } else {
      setError(result.error ?? 'Failed to save note.')
    }
  }

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <ModalTrigger asChild>
        <Button variant="outline" size="sm">{triggerLabel}</Button>
      </ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Add Admin Note</ModalTitle>
          <ModalDescription>
            This note is internal and will not be visible to the volunteer.
          </ModalDescription>
        </ModalHeader>
        <ModalBody className="space-y-3">
          <Textarea
            label="Note"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            placeholder="Enter your note here…"
          />
          {error && (
            <p className="text-sm text-red-600" role="alert">{error}</p>
          )}
        </ModalBody>
        <ModalFooter>
          <ModalClose asChild>
            <Button variant="ghost" size="sm" disabled={loading}>Cancel</Button>
          </ModalClose>
          <Button size="sm" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving…' : 'Save Note'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
