import { useState } from 'react'
import { mockMembers } from '@/data/mock'
import type { Member } from '@/types'

export function useMembers() {
  const [members, setMembers] = useState<Member[]>(mockMembers)

  const updateMember = (id: string, updates: Partial<Member>) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, ...updates, updated_at: new Date().toISOString() } : m
      )
    )
  }

  return { members, updateMember }
}
