'use client'

import * as React from 'react'
import { Download, Loader2 } from 'lucide-react'

interface ReportExportButtonProps {
  range: string
}

export function ReportExportButton({ range }: ReportExportButtonProps) {
  const [loading, setLoading] = React.useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/reports/export?range=${range}`)
      if (!response.ok) {
        alert('Export failed. Please try again.')
        return
      }
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `lighthouse-care-report-${range}-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      alert('Export failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 transition-colors"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      Export Report
    </button>
  )
}
