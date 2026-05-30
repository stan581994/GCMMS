import { useEffect } from 'react'

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} — Ward Records`
    return () => { document.title = 'Ward Records' }
  }, [title])
}
