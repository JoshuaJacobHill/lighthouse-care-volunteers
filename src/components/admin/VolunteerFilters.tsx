'use client'

import * as React from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { LOCATIONS, VOLUNTEER_STATUSES } from '@/lib/constants'

export function VolunteerFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [search, setSearch] = React.useState(searchParams.get('search') ?? '')
  const [status, setStatus] = React.useState(searchParams.get('status') ?? '')
  const [location, setLocation] = React.useState(searchParams.get('location') ?? '')

  function applyFilters(overrides: Record<string, string> = {}) {
    const params = new URLSearchParams()
    const s = overrides.search ?? search
    const st = overrides.status ?? status
    const lo = overrides.location ?? location

    if (s) params.set('search', s)
    if (st) params.set('status', st)
    if (lo) params.set('location', lo)

    router.push(`${pathname}?${params.toString()}`)
  }

  function handleStatusChange(value: string) {
    const next = value === 'ALL' ? '' : value
    setStatus(next)
    applyFilters({ status: next })
  }

  function handleLocationChange(value: string) {
    const next = value === 'ALL' ? '' : value
    setLocation(next)
    applyFilters({ location: next })
  }

  function clearFilters() {
    setSearch('')
    setStatus('')
    setLocation('')
    router.push(pathname)
  }

  const hasFilters = search || status || location

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:flex-wrap">
      {/* Search */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          applyFilters()
        }}
        className="flex gap-2 flex-1 min-w-[220px] max-w-sm"
      >
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or mobile…"
            className="block w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <Button type="submit" size="sm">Search</Button>
      </form>

      {/* Status filter */}
      <div className="w-44">
        <Select value={status || 'ALL'} onValueChange={handleStatusChange}>
          <SelectTrigger label="Status">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {(Object.entries(VOLUNTEER_STATUSES) as [string, string][]).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Location filter */}
      <div className="w-44">
        <Select value={location || 'ALL'} onValueChange={handleLocationChange}>
          <SelectTrigger label="Location">
            <SelectValue placeholder="All locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All locations</SelectItem>
            {LOCATIONS.map((loc) => (
              <SelectItem key={loc} value={loc}>{loc}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear filters
        </Button>
      )}
    </div>
  )
}
