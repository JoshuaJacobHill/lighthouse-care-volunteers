'use client'

import * as React from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { exportVolunteersCSVAction } from '@/lib/actions/admin.actions'

export function ExportCSVButton() {
  const [loading, setLoading] = React.useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      const result = await exportVolunteersCSVAction()
      if (!result.success || !result.csv) {
        alert(result.error ?? 'Export failed. Please try again.')
        return
      }
      const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `volunteers-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={loading}
    >
      <Download className="h-4 w-4" aria-hidden="true" />
      {loading ? 'Exporting…' : 'Export CSV'}
    </Button>
  )
}
