import { useState, useEffect, useRef } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { Member } from '@/types'

interface MemberSearchInputProps {
  members: Member[]
  value: string | null
  onChange: (memberId: string | null) => void
  placeholder?: string
}

export function MemberSearchInput({ members, value, onChange, placeholder }: MemberSearchInputProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Populate display text when value changes externally
  useEffect(() => {
    if (value) {
      const m = members.find((m) => m.id === value)
      if (m) setQuery(`${m.last_name}, ${m.first_name}`)
    } else {
      setQuery('')
    }
  }, [value, members])

  // Close dropdown on outside click
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [])

  const filtered = query.trim()
    ? members
        .filter((m) => {
          const q = query.toLowerCase()
          return (
            `${m.last_name}, ${m.first_name}`.toLowerCase().includes(q) ||
            `${m.first_name} ${m.last_name}`.toLowerCase().includes(q)
          )
        })
        .slice(0, 8)
    : []

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    onChange(null)
    setOpen(true)
  }

  const handleSelect = (m: Member) => {
    setQuery(`${m.last_name}, ${m.first_name}`)
    onChange(m.id)
    setOpen(false)
  }

  return (
    <div className="relative" ref={containerRef}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        className="pl-9"
        placeholder={placeholder ?? 'Search member…'}
        value={query}
        onChange={handleChange}
        onFocus={() => { if (filtered.length > 0) setOpen(true) }}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border bg-popover shadow-md">
          {filtered.map((m) => (
            <button
              key={m.id}
              type="button"
              className="flex w-full items-center px-3 py-2 text-sm hover:bg-accent"
              onMouseDown={() => handleSelect(m)}
            >
              {m.last_name}, {m.first_name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
