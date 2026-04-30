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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { sendEmailToVolunteerAction } from '@/lib/actions/admin.actions'

interface SendEmailModalProps {
  volunteerId: string
  volunteerName: string
}

export function SendEmailModal({ volunteerId, volunteerName }: SendEmailModalProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [subject, setSubject] = React.useState('')
  const [body, setBody] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [sent, setSent] = React.useState(false)

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      setSubject('')
      setBody('')
      setError(null)
      setSent(false)
    }
  }

  async function handleSend() {
    if (!subject.trim() || !body.trim()) {
      setError('Subject and message are required.')
      return
    }
    setLoading(true)
    setError(null)
    const html = body.split('\n').map((line) => `<p>${line}</p>`).join('')
    const result = await sendEmailToVolunteerAction(volunteerId, subject, html)
    setLoading(false)
    if (result.success) {
      setSent(true)
      router.refresh()
    } else {
      setError(result.error ?? 'Failed to send email.')
    }
  }

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalTrigger asChild>
        <Button variant="outline" size="sm">Send Email</Button>
      </ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Send Email to {volunteerName}</ModalTitle>
          <ModalDescription>
            This will be sent from the Lighthouse Care email address.
          </ModalDescription>
        </ModalHeader>
        {sent ? (
          <ModalBody>
            <p className="text-sm text-green-700 font-medium">
              Email sent successfully to {volunteerName}.
            </p>
          </ModalBody>
        ) : (
          <ModalBody className="space-y-4">
            <Input
              label="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Following up on your induction"
            />
            <Textarea
              label="Message"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              placeholder="Type your message here…"
              hint="Plain text only — each line will become a paragraph."
            />
            {error && (
              <p className="text-sm text-red-600" role="alert">{error}</p>
            )}
          </ModalBody>
        )}
        <ModalFooter>
          <ModalClose asChild>
            <Button variant="ghost" size="sm" disabled={loading}>
              {sent ? 'Close' : 'Cancel'}
            </Button>
          </ModalClose>
          {!sent && (
            <Button size="sm" onClick={handleSend} disabled={loading}>
              {loading ? 'Sending…' : 'Send Email'}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
