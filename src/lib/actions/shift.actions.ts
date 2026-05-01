'use server'

import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { sendEmail } from '@/lib/email'
import { format } from 'date-fns'

interface ActionResult {
  success: boolean
  error?: string
}

// ─── Book a shift ─────────────────────────────────────────────────────────────

export async function bookShiftAction(shiftId: string): Promise<ActionResult> {
  const session = await getSession()
  if (!session?.volunteerId) {
    return { success: false, error: 'Not authenticated' }
  }

  const volunteerId = session.volunteerId

  try {
    // Load the shift and volunteer details
    const [shift, volunteer] = await Promise.all([
      prisma.shift.findUnique({
        where: { id: shiftId },
        include: {
          location: true,
          assignments: {
            where: {
              status: { in: ['SCHEDULED', 'CONFIRMED', 'ATTENDED'] },
            },
          },
        },
      }),
      prisma.volunteerProfile.findUnique({
        where: { id: volunteerId },
        select: { firstName: true, lastName: true, email: true },
      }),
    ])

    if (!shift || !shift.isActive) {
      return { success: false, error: 'Shift not found or no longer available.' }
    }

    if (!volunteer) {
      return { success: false, error: 'Volunteer profile not found.' }
    }

    // Check volunteer isn't already booked
    const existing = await prisma.shiftAssignment.findUnique({
      where: { shiftId_volunteerId: { shiftId, volunteerId } },
    })

    if (existing && existing.status !== 'CANCELLED_BY_VOLUNTEER' && existing.status !== 'ADMIN_CANCELLED') {
      return { success: false, error: 'You are already booked for this shift.' }
    }

    // Check shift isn't full
    const activeCount = shift.assignments.length
    if (activeCount >= shift.capacity) {
      return { success: false, error: 'This shift is already full.' }
    }

    // Create or re-activate the assignment
    if (existing) {
      await prisma.shiftAssignment.update({
        where: { id: existing.id },
        data: { status: 'SCHEDULED', cancelledAt: null, cancelReason: null },
      })
    } else {
      await prisma.shiftAssignment.create({
        data: {
          shiftId,
          volunteerId,
          status: 'SCHEDULED',
        },
      })
    }

    // Send notification email to admin
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL
    if (adminEmail) {
      const shiftDate = format(new Date(shift.date), 'EEEE d MMMM yyyy')
      const shiftTime = `${format(new Date(shift.startTime), 'h:mmaaa')}–${format(new Date(shift.endTime), 'h:mmaaa')}`
      await sendEmail({
        to: adminEmail,
        subject: `Shift booking: ${volunteer.firstName} ${volunteer.lastName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Volunteer Shift Booking</h2>
            <p><strong>${volunteer.firstName} ${volunteer.lastName}</strong> has booked a shift.</p>
            <ul>
              <li><strong>Date:</strong> ${shiftDate}</li>
              <li><strong>Time:</strong> ${shiftTime}</li>
              <li><strong>Location:</strong> ${shift.location.name}</li>
              ${shift.title ? `<li><strong>Shift:</strong> ${shift.title}</li>` : ''}
            </ul>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? ''}/admin/volunteers/${volunteerId}">View volunteer profile</a></p>
          </div>
        `,
        text: `${volunteer.firstName} ${volunteer.lastName} has booked a shift on ${shiftDate} at ${shiftTime} — ${shift.location.name}.`,
        volunteerId,
      })
    }

    return { success: true }
  } catch (err) {
    console.error('[bookShiftAction]', err)
    return { success: false, error: 'Failed to book shift. Please try again.' }
  }
}

// ─── Cancel a shift booking ───────────────────────────────────────────────────

export async function cancelShiftAction(shiftId: string): Promise<ActionResult> {
  const session = await getSession()
  if (!session?.volunteerId) {
    return { success: false, error: 'Not authenticated' }
  }

  const volunteerId = session.volunteerId

  try {
    const [assignment, volunteer] = await Promise.all([
      prisma.shiftAssignment.findFirst({
        where: {
          shiftId,
          volunteerId,
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
        },
        include: {
          shift: { include: { location: true } },
        },
      }),
      prisma.volunteerProfile.findUnique({
        where: { id: volunteerId },
        select: { firstName: true, lastName: true },
      }),
    ])

    if (!assignment) {
      return { success: false, error: 'Shift booking not found.' }
    }

    if (!volunteer) {
      return { success: false, error: 'Volunteer profile not found.' }
    }

    await prisma.shiftAssignment.update({
      where: { id: assignment.id },
      data: {
        status: 'CANCELLED_BY_VOLUNTEER',
        cancelledAt: new Date(),
      },
    })

    // Send notification email to admin
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL
    if (adminEmail) {
      const shiftDate = format(new Date(assignment.shift.date), 'EEEE d MMMM yyyy')
      const shiftTime = `${format(new Date(assignment.shift.startTime), 'h:mmaaa')}–${format(new Date(assignment.shift.endTime), 'h:mmaaa')}`
      await sendEmail({
        to: adminEmail,
        subject: `Shift cancellation: ${volunteer.firstName} ${volunteer.lastName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Volunteer Shift Cancellation</h2>
            <p><strong>${volunteer.firstName} ${volunteer.lastName}</strong> has cancelled their shift.</p>
            <ul>
              <li><strong>Date:</strong> ${shiftDate}</li>
              <li><strong>Time:</strong> ${shiftTime}</li>
              <li><strong>Location:</strong> ${assignment.shift.location.name}</li>
              ${assignment.shift.title ? `<li><strong>Shift:</strong> ${assignment.shift.title}</li>` : ''}
            </ul>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? ''}/admin/volunteers/${volunteerId}">View volunteer profile</a></p>
          </div>
        `,
        text: `${volunteer.firstName} ${volunteer.lastName} has cancelled their shift on ${shiftDate} at ${shiftTime} — ${assignment.shift.location.name}.`,
        volunteerId,
      })
    }

    return { success: true }
  } catch (err) {
    console.error('[cancelShiftAction]', err)
    return { success: false, error: 'Failed to cancel shift. Please try again.' }
  }
}
