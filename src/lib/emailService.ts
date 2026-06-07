const EMAIL_API = 'http://localhost:3001'

function post(path: string, body: Record<string, unknown>) {
  fetch(`${EMAIL_API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch((err) => console.error(`[emailService] ${path} failed:`, err))
}

export function sendCallingEmail(payload: {
  type: 'assigned' | 'released'
  memberName: string
  position: string
  date?: string | null
}) {
  post('/api/email/calling', payload)
}

export function sendChildRecordEmail(payload: {
  childName: string
  blessingDate?: string | null
}) {
  post('/api/email/child-record', payload)
}

export function sendPendingAccountEmail(payload: { memberName: string }) {
  post('/api/email/pending-account', payload)
}
