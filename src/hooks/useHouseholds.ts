import { useState } from 'react'
import { mockHouseholds } from '@/data/mock'
import type { Household } from '@/types'

export function useHouseholds() {
  const [households, setHouseholds] = useState<Household[]>(mockHouseholds)

  const updateHousehold = (id: string, updates: Partial<Household>) => {
    setHouseholds((prev) =>
      prev.map((h) => (h.id === id ? { ...h, ...updates } : h))
    )
  }

  return { households, updateHousehold }
}
