import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import nodemailer from 'nodemailer'
import { createClient } from '@supabase/supabase-js'

const app = express()
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

async function getEmailsByRole(role) {
  const { data, error } = await supabase
    .from('app_users')
    .select('email')
    .eq('role', role)
    .eq('is_active', true)

  if (error) {
    console.error(`[email] Failed to fetch ${role} emails:`, error.message)
    return []
  }
  return data.map((u) => u.email).filter(Boolean)
}

async function sendMail({ to, subject, html, text }) {
  if (!to.length) {
    console.warn('[email] No recipients found, skipping send.')
    return
  }
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: to.join(', '),
    subject,
    text,
    html,
  })
}

// Calling assigned or released → clerk
app.post('/api/email/calling', async (req, res) => {
  try {
    const { type, memberName, position, date } = req.body

    const to = await getEmailsByRole('clerk')

    const isAssigned = type === 'assigned'
    const subject = isAssigned
      ? `New Calling Assignment — ${memberName}`
      : `Calling Release — ${memberName}`

    const actionLine = isAssigned
      ? `<strong>${memberName}</strong> has been called as <strong>${position}</strong>, sustained <strong>${date ?? 'TBD'}</strong>.`
      : `<strong>${memberName}</strong> has been released from <strong>${position}</strong> (released <strong>${date ?? 'TBD'}</strong>).`

    const text = isAssigned
      ? `${memberName} has been called as ${position}, sustained ${date ?? 'TBD'}. Please record this in the system.`
      : `${memberName} has been released from ${position} (released ${date ?? 'TBD'}). Please record this in the system.`

    const html = `
      <p>${actionLine}</p>
      <p>Please record this in the system.</p>
    `

    await sendMail({ to, subject, html, text })
    res.json({ ok: true })
  } catch (err) {
    console.error('[email] /api/email/calling error:', err.message)
    res.status(500).json({ ok: false, error: err.message })
  }
})

// Child record submitted → clerk
app.post('/api/email/child-record', async (req, res) => {
  try {
    const { childName, blessingDate } = req.body

    const to = await getEmailsByRole('clerk')

    const subject = `New Child Blessing Record — ${childName}`
    const dateStr = blessingDate ? `, blessed ${blessingDate}` : ''
    const text = `A child blessing record has been submitted for ${childName}${dateStr}. Please record this in the system.`
    const html = `
      <p>A child blessing record has been submitted for <strong>${childName}</strong>${dateStr}.</p>
      <p>Please record this in the system.</p>
    `

    await sendMail({ to, subject, html, text })
    res.json({ ok: true })
  } catch (err) {
    console.error('[email] /api/email/child-record error:', err.message)
    res.status(500).json({ ok: false, error: err.message })
  }
})

// Member added to pending accounts → account_specialist
app.post('/api/email/pending-account', async (req, res) => {
  try {
    const { memberName } = req.body

    const to = await getEmailsByRole('account_specialist')

    const subject = `New Pending LDS Account — ${memberName}`
    const text = `${memberName} has been added to the pending accounts list and needs an LDS Account created.`
    const html = `
      <p><strong>${memberName}</strong> has been added to the pending accounts list and needs an LDS Account created.</p>
    `

    await sendMail({ to, subject, html, text })
    res.json({ ok: true })
  } catch (err) {
    console.error('[email] /api/email/pending-account error:', err.message)
    res.status(500).json({ ok: false, error: err.message })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`[email server] Running on http://localhost:${PORT}`)
})
