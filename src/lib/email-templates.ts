import prisma from '@/lib/prisma'
import type { EmailTemplateType } from '@prisma/client'

interface RenderedTemplate {
  subject: string
  html: string
  text: string
}

// ─── Default hardcoded templates ─────────────────────────────────────────────

export const defaultTemplates: Record<
  EmailTemplateType,
  { subject: string; html: string; text: string }
> = {
  SIGNUP_CONFIRMATION: {
    subject: 'Welcome to Lighthouse Care Volunteers, {{first_name}}!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e40af;">Welcome to {{organisation_name}} Volunteers!</h1>
        <p>Hi {{first_name}},</p>
        <p>Thank you for registering as a volunteer with Lighthouse Care. We're so glad you've decided to join our community!</p>
        <p>To get started, please complete your induction by visiting the volunteer portal:</p>
        <p><a href="{{portal_link}}" style="background: #1e40af; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">Go to Volunteer Portal</a></p>
        <p>Your induction covers our safety guidelines, values, and everything you need to know to make the most of your time volunteering with us.</p>
        <p>If you have any questions, please don't hesitate to get in touch — we're here to help.</p>
        <p>Warm regards,<br>The {{organisation_name}} Team</p>
      </div>
    `,
    text: `Welcome to {{organisation_name}} Volunteers, {{first_name}}!\n\nThank you for registering as a volunteer. To get started, please complete your induction at: {{portal_link}}\n\nWarm regards,\nThe {{organisation_name}} Team`,
  },

  INDUCTION_REMINDER: {
    subject: '{{first_name}}, your induction is still waiting for you',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e40af;">Your Induction Is Waiting</h1>
        <p>Hi {{first_name}},</p>
        <p>We noticed you haven't completed your volunteer induction yet. It only takes a short time and is an important step before your first shift.</p>
        <p><a href="{{portal_link}}" style="background: #1e40af; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">Complete My Induction</a></p>
        <p>If you have any trouble accessing the portal, please reach out and we'll help you get sorted.</p>
        <p>Warm regards,<br>The {{organisation_name}} Team</p>
      </div>
    `,
    text: `Hi {{first_name}},\n\nYour volunteer induction is still waiting to be completed. Visit {{portal_link}} to finish up.\n\nWarm regards,\nThe {{organisation_name}} Team`,
  },

  INDUCTION_COMPLETE: {
    subject: 'Congratulations {{first_name}} — induction complete!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e40af;">You're Ready to Volunteer!</h1>
        <p>Hi {{first_name}},</p>
        <p>Congratulations — you've completed your induction and you're now ready to start volunteering with {{organisation_name}}!</p>
        <p>Log in to your portal to view upcoming shifts and sign up for one that suits you:</p>
        <p><a href="{{portal_link}}" style="background: #1e40af; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">View Upcoming Shifts</a></p>
        <p>We can't wait to have you on the team. Thank you for giving your time to make a difference in our community.</p>
        <p>Warm regards,<br>The {{organisation_name}} Team</p>
      </div>
    `,
    text: `Hi {{first_name}},\n\nCongratulations — you've completed your induction and are ready to start volunteering!\n\nView upcoming shifts at: {{portal_link}}\n\nWarm regards,\nThe {{organisation_name}} Team`,
  },

  SHIFT_REMINDER: {
    subject: 'Reminder: Your volunteer shift is coming up',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e40af;">Shift Reminder</h1>
        <p>Hi {{first_name}},</p>
        <p>This is a friendly reminder that you have a volunteer shift coming up:</p>
        <table style="background: #f3f4f6; padding: 16px; border-radius: 8px; width: 100%;">
          <tr><td><strong>Date:</strong></td><td>{{shift_date}}</td></tr>
          <tr><td><strong>Time:</strong></td><td>{{shift_time}}</td></tr>
          <tr><td><strong>Location:</strong></td><td>{{location}}</td></tr>
        </table>
        <p>If you're unable to make it, please let us know as soon as possible through the volunteer portal so we can make arrangements.</p>
        <p><a href="{{portal_link}}" style="background: #1e40af; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">Manage My Shifts</a></p>
        <p>Thank you for your commitment — we look forward to seeing you!</p>
        <p>Warm regards,<br>The {{organisation_name}} Team</p>
      </div>
    `,
    text: `Hi {{first_name}},\n\nReminder: You have a shift on {{shift_date}} at {{shift_time}} — {{location}}.\n\nIf you can't make it, please update your status at: {{portal_link}}\n\nWarm regards,\nThe {{organisation_name}} Team`,
  },

  SHIFT_CANCELLED: {
    subject: 'Your volunteer shift has been cancelled',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e40af;">Shift Cancellation Notice</h1>
        <p>Hi {{first_name}},</p>
        <p>We wanted to let you know that the following shift has been cancelled:</p>
        <table style="background: #f3f4f6; padding: 16px; border-radius: 8px; width: 100%;">
          <tr><td><strong>Date:</strong></td><td>{{shift_date}}</td></tr>
          <tr><td><strong>Time:</strong></td><td>{{shift_time}}</td></tr>
          <tr><td><strong>Location:</strong></td><td>{{location}}</td></tr>
        </table>
        <p>We apologise for any inconvenience. Please check the portal for other available shifts.</p>
        <p><a href="{{portal_link}}" style="background: #1e40af; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">View Available Shifts</a></p>
        <p>Warm regards,<br>The {{organisation_name}} Team</p>
      </div>
    `,
    text: `Hi {{first_name}},\n\nYour shift on {{shift_date}} at {{shift_time}} ({{location}}) has been cancelled.\n\nView other shifts at: {{portal_link}}\n\nWarm regards,\nThe {{organisation_name}} Team`,
  },

  MISSED_SHIFT_FOLLOWUP: {
    subject: 'We missed you at your recent shift, {{first_name}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e40af;">We Missed You!</h1>
        <p>Hi {{first_name}},</p>
        <p>We noticed you weren't able to make your shift on {{shift_date}} at {{location}}. We hope everything is okay!</p>
        <p>If something came up, no worries at all — these things happen. We'd love to see you at a future shift when you're ready.</p>
        <p><a href="{{portal_link}}" style="background: #1e40af; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">View Upcoming Shifts</a></p>
        <p>If you're having any difficulties or need to discuss your availability, please feel free to reach out to us directly.</p>
        <p>Warm regards,<br>The {{organisation_name}} Team</p>
      </div>
    `,
    text: `Hi {{first_name}},\n\nWe missed you at your shift on {{shift_date}} at {{location}}. Hope all is well!\n\nView upcoming shifts at: {{portal_link}}\n\nWarm regards,\nThe {{organisation_name}} Team`,
  },

  INACTIVITY_CHECKIN: {
    subject: '{{first_name}}, we haven\'t seen you in a while — everything okay?',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e40af;">We're Thinking of You</h1>
        <p>Hi {{first_name}},</p>
        <p>It's been a little while since we've seen you volunteering with us, and we just wanted to check in.</p>
        <p>If life has been busy or things have changed, we completely understand. Whenever you're ready to return — even for an occasional shift — we'd love to have you back.</p>
        <p><a href="{{portal_link}}" style="background: #1e40af; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">Return to the Portal</a></p>
        <p>If you'd like to pause or update your volunteer status, you can do that through your portal too.</p>
        <p>Warm regards,<br>The {{organisation_name}} Team</p>
      </div>
    `,
    text: `Hi {{first_name}},\n\nWe haven't seen you in a while and wanted to check in. Whenever you're ready to return, we'd love to have you back.\n\nVisit your portal at: {{portal_link}}\n\nWarm regards,\nThe {{organisation_name}} Team`,
  },

  ADMIN_NEW_VOLUNTEER: {
    subject: 'New volunteer registration — {{first_name}} {{last_name}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e40af;">New Volunteer Registration</h1>
        <p>A new volunteer has registered and is awaiting induction:</p>
        <table style="background: #f3f4f6; padding: 16px; border-radius: 8px; width: 100%;">
          <tr><td><strong>Name:</strong></td><td>{{first_name}} {{last_name}}</td></tr>
        </table>
        <p><a href="{{portal_link}}" style="background: #1e40af; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">View in Admin Portal</a></p>
      </div>
    `,
    text: `New volunteer registration: {{first_name}} {{last_name}}\n\nView in admin portal: {{portal_link}}`,
  },

  ADMIN_REPEATED_NOSHOWS: {
    subject: 'Alert: Repeated no-shows — {{first_name}} {{last_name}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e40af;">Repeated No-Show Alert</h1>
        <p>Volunteer <strong>{{first_name}} {{last_name}}</strong> has had repeated no-shows and may require follow-up.</p>
        <p><a href="{{portal_link}}" style="background: #1e40af; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">View Volunteer Profile</a></p>
      </div>
    `,
    text: `Alert: {{first_name}} {{last_name}} has had repeated no-shows.\n\nView profile: {{portal_link}}`,
  },

  CUSTOM: {
    subject: 'Message from {{organisation_name}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <p>Hi {{first_name}},</p>
        <p>You have a message from {{organisation_name}}.</p>
        <p>Warm regards,<br>The {{organisation_name}} Team</p>
      </div>
    `,
    text: `Hi {{first_name}},\n\nYou have a message from {{organisation_name}}.\n\nWarm regards,\nThe {{organisation_name}} Team`,
  },
}

// ─── Template renderer ────────────────────────────────────────────────────────

function replacePlaceholders(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] ?? match
  })
}

export async function renderTemplate(
  templateType: string,
  variables: Record<string, string>
): Promise<RenderedTemplate> {
  // Merge in sensible defaults for common variables
  const mergedVars: Record<string, string> = {
    organisation_name: 'Lighthouse Care',
    portal_link: process.env.NEXT_PUBLIC_APP_URL ?? 'https://volunteers.lighthousecare.org.au',
    ...variables,
  }

  // Try to load from DB first
  try {
    const dbTemplate = await prisma.emailTemplate.findUnique({
      where: { type: templateType as EmailTemplateType },
    })

    if (dbTemplate && dbTemplate.isActive) {
      return {
        subject: replacePlaceholders(dbTemplate.subject, mergedVars),
        html: replacePlaceholders(dbTemplate.bodyHtml, mergedVars),
        text: replacePlaceholders(dbTemplate.bodyText ?? '', mergedVars),
      }
    }
  } catch {
    // DB lookup failed — fall through to defaults
  }

  // Fall back to hardcoded defaults
  const fallback = defaultTemplates[templateType as EmailTemplateType]
  if (!fallback) {
    return {
      subject: replacePlaceholders('Message from {{organisation_name}}', mergedVars),
      html: replacePlaceholders('<p>Hi {{first_name}},</p><p>You have a message from {{organisation_name}}.</p>', mergedVars),
      text: replacePlaceholders('Hi {{first_name}},\n\nYou have a message from {{organisation_name}}.', mergedVars),
    }
  }

  return {
    subject: replacePlaceholders(fallback.subject, mergedVars),
    html: replacePlaceholders(fallback.html, mergedVars),
    text: replacePlaceholders(fallback.text, mergedVars),
  }
}
