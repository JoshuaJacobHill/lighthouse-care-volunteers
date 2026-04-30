import nodemailer from 'nodemailer'
import { Resend } from 'resend'
import prisma from '@/lib/prisma'
import type { EmailTemplateType } from '@prisma/client'

export type EmailProvider = 'resend' | 'smtp' | 'mock'

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
  templateType?: EmailTemplateType
  volunteerId?: string
}

interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
}

function getProvider(): EmailProvider {
  const provider = process.env.EMAIL_PROVIDER as EmailProvider
  if (provider === 'resend' || provider === 'smtp' || provider === 'mock') {
    return provider
  }
  return 'mock'
}

function getFromAddress(): string {
  const name = process.env.EMAIL_FROM_NAME ?? 'Lighthouse Care Volunteers'
  const address = process.env.EMAIL_FROM_ADDRESS ?? 'volunteers@lighthousecare.org.au'
  return `${name} <${address}>`
}

async function sendViaMock(options: SendEmailOptions): Promise<SendEmailResult> {
  if (process.env.NODE_ENV === 'development') {
    console.log('\n📧 [Mock Email]')
    console.log(`  To:      ${options.to}`)
    console.log(`  Subject: ${options.subject}`)
    console.log(`  Text:    ${options.text?.slice(0, 100) ?? '(html only)'}`)
    console.log('')
  }
  return { success: true, messageId: `mock-${Date.now()}` }
}

async function sendViaResend(options: SendEmailOptions): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set')
  }

  const resend = new Resend(apiKey)

  const { data, error } = await resend.emails.send({
    from: getFromAddress(),
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, messageId: data?.id }
}

async function sendViaSMTP(options: SendEmailOptions): Promise<SendEmailResult> {
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT ?? '587', 10)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host) {
    throw new Error('SMTP_HOST environment variable is not set')
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
  })

  const info = await transporter.sendMail({
    from: getFromAddress(),
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  })

  return { success: true, messageId: info.messageId }
}

export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const provider = getProvider()

  // Create a pending log entry first
  const logEntry = await prisma.emailLog.create({
    data: {
      to: options.to,
      subject: options.subject,
      templateType: options.templateType ?? null,
      status: 'PENDING',
      volunteerId: options.volunteerId ?? null,
    },
  })

  let result: SendEmailResult

  try {
    switch (provider) {
      case 'resend':
        result = await sendViaResend(options)
        break
      case 'smtp':
        result = await sendViaSMTP(options)
        break
      case 'mock':
      default:
        result = await sendViaMock(options)
        break
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    result = { success: false, error: errorMessage }
  }

  // Update the log entry with outcome
  await prisma.emailLog.update({
    where: { id: logEntry.id },
    data: {
      status: result.success ? 'SENT' : 'FAILED',
      sentAt: result.success ? new Date() : null,
      errorMsg: result.error ?? null,
      metadata: result.messageId ? { messageId: result.messageId } : undefined,
    },
  })

  return result
}
