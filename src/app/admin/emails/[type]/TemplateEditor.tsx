'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Save, Eye, EyeOff, Loader2, RotateCcw } from 'lucide-react'

interface Template {
  id: string | null
  type: string
  name: string
  subject: string
  bodyHtml: string
  bodyText: string
  isActive: boolean
}

interface TemplateEditorProps {
  template: Template
}

const SAMPLE_VARS: Record<string, string> = {
  first_name: 'Sarah',
  last_name: 'Mitchell',
  shift_date: '12/05/2025',
  shift_time: '9:00 am – 1:00 pm',
  location: 'Loganholme',
  portal_link: 'https://volunteers.lighthousecare.org.au',
  org_name: 'Lighthouse Care',
  organisation_name: 'Lighthouse Care',
}

const AVAILABLE_VARS = [
  { key: '{{first_name}}', desc: 'Volunteer first name' },
  { key: '{{last_name}}', desc: 'Volunteer last name' },
  { key: '{{shift_date}}', desc: 'Shift date' },
  { key: '{{shift_time}}', desc: 'Shift time range' },
  { key: '{{location}}', desc: 'Location name' },
  { key: '{{portal_link}}', desc: 'Volunteer portal URL' },
  { key: '{{org_name}}', desc: 'Organisation name' },
]

function replaceSampleVars(text: string): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => SAMPLE_VARS[key] ?? match)
}

export function TemplateEditor({ template }: TemplateEditorProps) {
  const router = useRouter()
  const [subject, setSubject] = React.useState(template.subject)
  const [bodyHtml, setBodyHtml] = React.useState(template.bodyHtml)
  const [bodyText, setBodyText] = React.useState(template.bodyText)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)
  const [previewOpen, setPreviewOpen] = React.useState(false)

  const previewSubject = replaceSampleVars(subject)
  const previewHtml = replaceSampleVars(bodyHtml)

  async function handleSave() {
    setError(null)
    setSuccess(false)
    setSaving(true)

    try {
      const response = await fetch(`/api/admin/email-templates/${template.type}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          bodyHtml,
          bodyText,
        }),
      })
      const result = await response.json()
      if (!result.success) {
        setError(result.error ?? 'Failed to save template.')
      } else {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
        router.refresh()
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Subject */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject Line</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
        />
      </div>

      {/* HTML body */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          HTML Body
        </label>
        <textarea
          value={bodyHtml}
          onChange={(e) => setBodyHtml(e.target.value)}
          rows={16}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-mono text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 resize-y"
          spellCheck={false}
        />
      </div>

      {/* Plain text body */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Plain Text Body{' '}
          <span className="text-gray-400 font-normal">(optional — used as email fallback)</span>
        </label>
        <textarea
          value={bodyText}
          onChange={(e) => setBodyText(e.target.value)}
          rows={6}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-mono text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 resize-y"
          spellCheck={false}
        />
      </div>

      {/* Available variables */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Available Variables</h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {AVAILABLE_VARS.map(({ key, desc }) => (
            <div key={key} className="flex items-center gap-2">
              <code className="rounded bg-white border border-gray-200 px-2 py-0.5 text-xs font-mono text-teal-700">
                {key}
              </code>
              <span className="text-xs text-gray-500">{desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Error / success */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          Template saved successfully.
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Template
        </button>

        <button
          onClick={() => setPreviewOpen(true)}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <Eye className="h-4 w-4" />
          Preview
        </button>

        <a
          href="/admin/emails"
          className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          Cancel
        </a>
      </div>

      {/* Preview modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Email Preview</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Subject: {previewSubject}
                </p>
              </div>
              <button
                onClick={() => setPreviewOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                aria-label="Close preview"
              >
                <EyeOff className="h-5 w-5" />
              </button>
            </div>
            <div
              className="flex-1 overflow-y-auto p-6"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
