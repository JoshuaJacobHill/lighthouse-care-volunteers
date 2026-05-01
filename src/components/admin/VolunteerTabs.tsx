'use client'

import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { clsx } from 'clsx'

interface Tab {
  id: string
  label: string
  content: React.ReactNode
}

interface VolunteerTabsProps {
  tabs: Tab[]
  defaultTab?: string
}

export function VolunteerTabs({ tabs, defaultTab }: VolunteerTabsProps) {
  return (
    <TabsPrimitive.Root defaultValue={defaultTab ?? tabs[0]?.id}>
      <TabsPrimitive.List className="flex overflow-x-auto border-b border-gray-200 gap-0">
        {tabs.map((tab) => (
          <TabsPrimitive.Trigger
            key={tab.id}
            value={tab.id}
            className={clsx(
              'shrink-0 px-4 py-3 text-sm font-medium text-gray-500 border-b-2 border-transparent transition-colors',
              'hover:text-gray-700 hover:border-gray-300',
              'data-[state=active]:border-orange-500 data-[state=active]:text-orange-600',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-inset'
            )}
          >
            {tab.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {tabs.map((tab) => (
        <TabsPrimitive.Content
          key={tab.id}
          value={tab.id}
          className="pt-6 focus-visible:outline-none"
        >
          {tab.content}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  )
}
