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

function buildEmailHtml({ header, body }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#F5FAFB;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5FAFB;padding:36px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Bordered email card -->
          <tr>
            <td style="border:2px solid #E8EFF5;border-radius:12px;overflow:hidden;background-color:#ffffff;box-shadow:0 4px 16px rgba(75,158,255,0.08);">

              <!-- Header -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#1A1E3F;padding:28px 32px 24px;border-bottom:3px solid #4B9EFF;">
                    <p style="margin:0 0 6px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#4B9EFF;font-weight:700;">
                      GOLDEN CITY MEMBER MANAGEMENT SYSTEM
                    </p>
                    <h1 style="margin:0;font-size:26px;color:#ffffff;font-weight:700;line-height:1.3;">
                      ${header}
                    </h1>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:32px;color:#1A1E3F;font-size:15px;line-height:1.8;background-color:#ffffff;">
                    ${body}
                  </td>
                </tr>

                <!-- Footer inside border -->
                <tr>
                  <td style="background-color:#F0F7FB;padding:16px 32px;border-top:1px solid #E8EFF5;">
                    <p style="margin:0;font-size:12px;color:#737B8F;">
                      This is an automated notification from the Golden City Member Management System. Please do not reply to this email.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Outside-border branding -->
          <tr>
            <td align="center" style="padding:20px 0 8px;">
              <p style="margin:0 0 2px;font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:#737B8F;font-weight:500;">
                POWERED BY
              </p>
              <p style="margin:0;font-size:14px;letter-spacing:1px;text-transform:uppercase;color:#4B9EFF;font-weight:700;">
                GOLDEN CITY MEMBER MANAGEMENT SYSTEM
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
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

    const header = isAssigned ? 'New Calling Assignment' : 'Calling Release'

    const bodyContent = isAssigned
      ? `<p><strong>${memberName}</strong> has been called as <strong>${position}</strong>, sustained on <strong>${date ?? 'TBD'}</strong>.</p>
         <p>Please record this calling in the system at your earliest convenience.</p>`
      : `<p><strong>${memberName}</strong> has been released from <strong>${position}</strong> (effective <strong>${date ?? 'TBD'}</strong>).</p>
         <p>Please update the records in the system at your earliest convenience.</p>`

    const text = isAssigned
      ? `${memberName} has been called as ${position}, sustained ${date ?? 'TBD'}. Please record this in the system.`
      : `${memberName} has been released from ${position} (released ${date ?? 'TBD'}). Please record this in the system.`

    const html = buildEmailHtml({ header, body: bodyContent })

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
    const dateStr = blessingDate ? `, blessed on ${blessingDate}` : ''

    const text = `A child blessing record has been submitted for ${childName}${dateStr}. Please record this in the system.`
    const bodyContent = `
      <p>A child blessing record has been submitted and requires your attention.</p>
      <table cellpadding="0" cellspacing="0" style="margin:16px 0;border-left:3px solid #4B9EFF;padding-left:16px;">
        <tr><td style="font-size:13px;color:#737B8F;padding:2px 0;">Child Name</td></tr>
        <tr><td style="font-size:16px;font-weight:700;color:#1A1E3F;">${childName}</td></tr>
        ${blessingDate ? `<tr><td style="font-size:13px;color:#737B8F;padding-top:8px;">Blessing Date</td></tr>
        <tr><td style="font-size:16px;font-weight:700;color:#1A1E3F;">${blessingDate}</td></tr>` : ''}
      </table>
      <p>Please record this in the system at your earliest convenience.</p>
    `

    const html = buildEmailHtml({ header: 'New Child Blessing Record', body: bodyContent })

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
    const bodyContent = `
      <p>A member has been added to the pending accounts list and requires an LDS Account to be created.</p>
      <table cellpadding="0" cellspacing="0" style="margin:16px 0;border-left:3px solid #4B9EFF;padding-left:16px;">
        <tr><td style="font-size:13px;color:#737B8F;padding:2px 0;">Member Name</td></tr>
        <tr><td style="font-size:16px;font-weight:700;color:#1A1E3F;">${memberName}</td></tr>
      </table>
      <p>Please create the LDS Account for this member and update the system accordingly.</p>
    `

    const html = buildEmailHtml({ header: 'New Pending LDS Account', body: bodyContent })

    await sendMail({ to, subject, html, text })
    res.json({ ok: true })
  } catch (err) {
    console.error('[email] /api/email/pending-account error:', err.message)
    res.status(500).json({ ok: false, error: err.message })
  }
})

// New account welcome email with confirmation link
app.post('/api/email/welcome', async (req, res) => {
  try {
    const { userId, email, fullName, role } = req.body

    const token = crypto.randomUUID()
    const { error: tokenError } = await supabase
      .from('confirmation_tokens')
      .insert({ token, user_id: userId })

    if (tokenError) throw new Error(tokenError.message)

    const confirmUrl = `${process.env.APP_URL || 'http://localhost:5173'}/confirm?token=${token}`

    const roleDisplay = {
      account_specialist: 'Account Specialist',
      clerk: 'Clerk',
      ministering: 'Ministering',
      admin: 'Admin',
    }[role] ?? role

    const subject = `Your GCMMS Account Has Been Created`
    const text = `Hello ${fullName}, your account has been created. Role: ${roleDisplay}. Temporary password: GCMembers. Confirm your account at: ${confirmUrl} (link expires in 48 hours).`
    const bodyContent = `
      <p style="margin:0 0 16px;">Hello <strong>${fullName}</strong>,</p>
      <p style="margin:0 0 20px;">An account has been created for you in the <strong>Golden City Member Management System</strong>. Below are your login details:</p>

      <table cellpadding="0" cellspacing="0" style="margin:0 0 20px;border-left:3px solid #4B9EFF;padding-left:16px;">
        <tr><td style="font-size:13px;color:#737B8F;padding:2px 0;">Assigned Role</td></tr>
        <tr><td style="font-size:16px;font-weight:700;color:#1A1E3F;">${roleDisplay}</td></tr>
        <tr><td style="font-size:13px;color:#737B8F;padding-top:12px;">Temporary Password</td></tr>
        <tr><td style="font-size:16px;font-weight:700;color:#1A1E3F;letter-spacing:1px;">GCMembers</td></tr>
      </table>

      <p style="margin:0 0 24px;">To activate your account and gain access to the system, please click the button below:</p>

      <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
        <tr>
          <td style="border-radius:8px;background-color:#4B9EFF;">
            <a href="${confirmUrl}" target="_blank"
               style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:8px;letter-spacing:0.3px;">
              Confirm My Account
            </a>
          </td>
        </tr>
      </table>

      <p style="margin:0;font-size:13px;color:#737B8F;">This link expires in <strong>48 hours</strong>. If you did not expect this email, please ignore it or contact your administrator.</p>
    `

    const html = buildEmailHtml({ header: 'Welcome to GCMMS', body: bodyContent })
    await sendMail({ to: [email], subject, html, text })
    res.json({ ok: true })
  } catch (err) {
    console.error('[email] /api/email/welcome error:', err.message)
    res.status(500).json({ ok: false, error: err.message })
  }
})

// Validate confirmation token and activate account
app.post('/api/email/confirm-token', async (req, res) => {
  try {
    const { token } = req.body

    // Look up the token
    const { data: rec, error: fetchErr } = await supabase
      .from('confirmation_tokens')
      .select('user_id, used_at, expires_at')
      .eq('token', token)
      .single()

    if (fetchErr || !rec) {
      return res.status(400).json({ ok: false, error: 'Invalid confirmation link.' })
    }
    if (rec.used_at) {
      return res.status(400).json({ ok: false, error: 'This confirmation link has already been used.' })
    }
    if (new Date(rec.expires_at) < new Date()) {
      return res.status(400).json({ ok: false, error: 'This confirmation link has expired.' })
    }

    // Activate the user
    const { error: activateErr } = await supabase
      .from('app_users')
      .update({ is_active: true })
      .eq('id', rec.user_id)

    if (activateErr) throw new Error(activateErr.message)

    // Mark token as used
    await supabase
      .from('confirmation_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('token', token)

    res.json({ ok: true })
  } catch (err) {
    console.error('[email] /api/email/confirm-token error:', err.message)
    res.status(400).json({ ok: false, error: err.message })
  }
})

// Send password reset email
app.post('/api/email/reset-password', async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ ok: false, error: 'Email is required.' })

    // Look up the user in app_users (only registered accounts can reset)
    const { data: userRow, error: lookupErr } = await supabase
      .from('app_users')
      .select('id, full_name, is_active')
      .eq('email', email)
      .single()

    // Always respond OK to avoid leaking which emails are registered
    if (lookupErr || !userRow || !userRow.is_active) {
      return res.json({ ok: true })
    }

    const token = crypto.randomUUID()
    const { error: insertErr } = await supabase
      .from('password_reset_tokens')
      .insert({ token, user_id: userRow.id })

    if (insertErr) throw new Error(insertErr.message)

    const resetUrl = `${process.env.APP_URL || 'http://localhost:5173'}/reset-password?token=${token}`

    const subject = 'Password Reset Request — GCMMS'
    const text = `Hello ${userRow.full_name}, click the link to reset your password: ${resetUrl} (expires in 1 hour).`
    const bodyContent = `
      <p style="margin:0 0 16px;">Hello <strong>${userRow.full_name}</strong>,</p>
      <p style="margin:0 0 24px;">We received a request to reset your password for the <strong>Golden City Member Management System</strong>. Click the button below to choose a new password:</p>

      <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
        <tr>
          <td style="border-radius:8px;background-color:#4B9EFF;">
            <a href="${resetUrl}" target="_blank"
               style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:8px;letter-spacing:0.3px;">
              Reset Password
            </a>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 12px;font-size:13px;color:#737B8F;">This link expires in <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email — your password will not change.</p>
    `

    const html = buildEmailHtml({ header: 'Password Reset Request', body: bodyContent })
    await sendMail({ to: [email], subject, html, text })
    res.json({ ok: true })
  } catch (err) {
    console.error('[email] /api/email/reset-password error:', err.message)
    res.status(500).json({ ok: false, error: err.message })
  }
})

// Check reset token validity without consuming it (called on page load)
app.post('/api/email/check-reset-token', async (req, res) => {
  try {
    const { token } = req.body
    if (!token) return res.status(400).json({ ok: false, error: 'Token is required.' })

    const { data: rec, error: fetchErr } = await supabase
      .from('password_reset_tokens')
      .select('used_at, expires_at')
      .eq('token', token)
      .single()

    if (fetchErr || !rec) {
      return res.status(400).json({ ok: false, error: 'Invalid or expired reset link.' })
    }
    if (rec.used_at) {
      return res.status(400).json({ ok: false, error: 'This reset link has already been used.' })
    }
    if (new Date(rec.expires_at) < new Date()) {
      return res.status(400).json({ ok: false, error: 'This reset link has expired. Please request a new one.' })
    }

    res.json({ ok: true })
  } catch (err) {
    console.error('[email] /api/email/check-reset-token error:', err.message)
    res.status(400).json({ ok: false, error: err.message })
  }
})

// Apply new password using reset token (consumes the token server-side — no client session needed)
app.post('/api/email/apply-reset-password', async (req, res) => {
  try {
    const { token, password } = req.body
    if (!token || !password) {
      return res.status(400).json({ ok: false, error: 'Token and password are required.' })
    }

    const { data: rec, error: fetchErr } = await supabase
      .from('password_reset_tokens')
      .select('user_id, used_at, expires_at')
      .eq('token', token)
      .single()

    if (fetchErr || !rec) {
      return res.status(400).json({ ok: false, error: 'Invalid or expired reset link.' })
    }
    if (rec.used_at) {
      return res.status(400).json({ ok: false, error: 'This reset link has already been used.' })
    }
    if (new Date(rec.expires_at) < new Date()) {
      return res.status(400).json({ ok: false, error: 'This reset link has expired. Please request a new one.' })
    }

    // Update the password directly via service role — no client session required
    const { error: updateErr } = await supabase.auth.admin.updateUserById(rec.user_id, { password })
    if (updateErr) throw new Error(updateErr.message)

    // Mark token as used only after the password is successfully changed
    await supabase
      .from('password_reset_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('token', token)

    res.json({ ok: true })
  } catch (err) {
    console.error('[email] /api/email/apply-reset-password error:', err.message)
    res.status(400).json({ ok: false, error: err.message })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`[email server] Running on http://localhost:${PORT}`)
})
