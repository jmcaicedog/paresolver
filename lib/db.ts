import { neon } from '@neondatabase/serverless'
import bcrypt from 'bcryptjs'

const DATABASE_URL = process.env.DATABASE_URL
export const sql = DATABASE_URL ? neon(DATABASE_URL) : null

export async function ensureSchema() {
  if (!sql) {
    return false
  }

  await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto;`

  await sql`
    CREATE TABLE IF NOT EXISTS admin_users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      is_admin BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `

  await sql`
    CREATE TABLE IF NOT EXISTS form_submissions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      form_type TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      payload JSONB NOT NULL DEFAULT '{}'::jsonb,
      source TEXT DEFAULT 'web',
      country TEXT DEFAULT 'unknown',
      device_type TEXT DEFAULT 'desktop',
      os TEXT DEFAULT 'unknown',
      browser TEXT DEFAULT 'unknown',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `

  await sql`
    CREATE TABLE IF NOT EXISTS page_views (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      path TEXT NOT NULL,
      referrer TEXT,
      user_agent TEXT,
      ip_address TEXT,
      country TEXT DEFAULT 'unknown',
      device_type TEXT DEFAULT 'desktop',
      os TEXT DEFAULT 'unknown',
      browser TEXT DEFAULT 'unknown',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `

  await sql`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `

  await sql`CREATE INDEX IF NOT EXISTS idx_form_submissions_created_at ON form_submissions (created_at DESC);`
  await sql`CREATE INDEX IF NOT EXISTS idx_form_submissions_name ON form_submissions (name);`
  await sql`CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views (created_at DESC);`

  return true
}

export async function getSiteSetting(key: string) {
  if (!sql) {
    return null
  }

  try {
    const rows = await sql`SELECT value FROM site_settings WHERE key = ${key} LIMIT 1`
    return typeof rows[0]?.value === 'string' ? rows[0].value : null
  } catch {
    return null
  }
}

export async function setSiteSetting(key: string, value: string) {
  if (!sql) {
    throw new Error('DATABASE_URL no configurada')
  }

  await ensureSchema()
  const rows = await sql`
    INSERT INTO site_settings (key, value)
    VALUES (${key}, ${value})
    ON CONFLICT (key) DO UPDATE
    SET value = EXCLUDED.value, updated_at = NOW()
    RETURNING key, value, updated_at
  `

  return rows[0]
}

export async function ensureDefaultAdmin() {
  if (!sql) {
    return null
  }

  await ensureSchema()

  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim()
  const password = process.env.ADMIN_PASSWORD

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL y ADMIN_PASSWORD deben configurarse en el entorno de producción.')
  }

  const existing = await sql`SELECT id FROM admin_users WHERE email = ${email} LIMIT 1`
  if (existing.length > 0) {
    const passwordHash = await bcrypt.hash(password, 10)
    const updated = await sql`
      UPDATE admin_users
      SET password_hash = ${passwordHash}, updated_at = NOW()
      WHERE email = ${email}
      RETURNING id, email, is_admin, created_at, updated_at
    `

    return updated[0] ?? existing[0]
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const created = await sql`
    INSERT INTO admin_users (email, password_hash, is_admin)
    VALUES (${email}, ${passwordHash}, true)
    RETURNING id, email, is_admin, created_at, updated_at
  `

  return created[0]
}

export async function getAdminUserByEmail(email: string) {
  if (!sql) {
    return null
  }

  const rows = await sql`SELECT * FROM admin_users WHERE email = ${email.toLowerCase().trim()} LIMIT 1`
  return rows[0] ?? null
}

export async function getAdminUserById(id: string) {
  if (!sql) {
    return null
  }

  const rows = await sql`SELECT * FROM admin_users WHERE id = ${id} LIMIT 1`
  return rows[0] ?? null
}

export async function listAdminUsers() {
  if (!sql) {
    return []
  }

  const rows = await sql`
    SELECT id, email, is_admin, created_at, updated_at
    FROM admin_users
    ORDER BY created_at DESC
  `
  return rows
}

export async function createAdminUser(email: string, password: string) {
  if (!sql) {
    throw new Error('DATABASE_URL no configurada')
  }

  const normalizedEmail = email.toLowerCase().trim()
  const passwordHash = await bcrypt.hash(password, 10)

  const created = await sql`
    INSERT INTO admin_users (email, password_hash, is_admin)
    VALUES (${normalizedEmail}, ${passwordHash}, true)
    RETURNING id, email, is_admin, created_at, updated_at
  `

  return created[0]
}

export async function updateAdminUser(id: string, email: string) {
  if (!sql) {
    throw new Error('DATABASE_URL no configurada')
  }

  const normalizedEmail = email.toLowerCase().trim()
  const rows = await sql`
    UPDATE admin_users
    SET email = ${normalizedEmail}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, email, is_admin, created_at, updated_at
  `

  return rows[0] ?? null
}

export async function deleteAdminUser(id: string) {
  if (!sql) {
    throw new Error('DATABASE_URL no configurada')
  }

  await sql`DELETE FROM admin_users WHERE id = ${id}`
}

export async function setAdminPassword(id: string, password: string) {
  if (!sql) {
    throw new Error('DATABASE_URL no configurada')
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const rows = await sql`
    UPDATE admin_users
    SET password_hash = ${passwordHash}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, email, is_admin, created_at, updated_at
  `

  return rows[0] ?? null
}

export async function saveFormSubmission(input: {
  formType: 'lead_nuevo' | 'pre_calificacion' | 'agente'
  name: string
  email?: string
  phone?: string
  payload: Record<string, unknown>
  source?: string
  country?: string
  deviceType?: string
  os?: string
  browser?: string
}) {
  if (!sql) {
    return null
  }

  const rows = await sql`
    INSERT INTO form_submissions (
      form_type,
      name,
      email,
      phone,
      payload,
      source,
      country,
      device_type,
      os,
      browser
    )
    VALUES (
      ${input.formType},
      ${input.name},
      ${input.email ?? null},
      ${input.phone ?? null},
      ${JSON.stringify(input.payload)},
      ${input.source ?? 'web'},
      ${input.country ?? 'unknown'},
      ${input.deviceType ?? 'desktop'},
      ${input.os ?? 'unknown'},
      ${input.browser ?? 'unknown'}
    )
    RETURNING *
  `

  return rows[0] ?? null
}

export async function savePageView(input: {
  path: string
  referrer?: string
  userAgent?: string
  ipAddress?: string
  country?: string
  deviceType?: string
  os?: string
  browser?: string
}) {
  if (!sql) {
    return null
  }

  const rows = await sql`
    INSERT INTO page_views (
      path,
      referrer,
      user_agent,
      ip_address,
      country,
      device_type,
      os,
      browser
    )
    VALUES (
      ${input.path},
      ${input.referrer ?? null},
      ${input.userAgent ?? null},
      ${input.ipAddress ?? 'unknown'},
      ${input.country ?? 'unknown'},
      ${input.deviceType ?? 'desktop'},
      ${input.os ?? 'unknown'},
      ${input.browser ?? 'unknown'}
    )
    RETURNING *
  `

  return rows[0] ?? null
}

export async function getFormSubmissions(options: {
  from?: string
  to?: string
  type?: string
  search?: string
}) {
  if (!sql) {
    return []
  }

  const from = options.from ?? ''
  const to = options.to ?? ''
  const type = options.type ?? 'all'
  const search = (options.search ?? '').trim()
  const fromDate = from ? new Date(`${from}T00:00:00`) : null
  const toDate = to ? new Date(`${to}T23:59:59.999`) : null

  const rows = await sql`
    SELECT *
    FROM form_submissions
    WHERE (
      (${fromDate}::timestamptz IS NULL OR created_at >= ${fromDate})
      AND (${toDate}::timestamptz IS NULL OR created_at <= ${toDate})
      AND (${type} = 'all' OR form_type = ${type})
      AND (${search} = '' OR LOWER(name) LIKE ${`%${search.toLowerCase()}%`})
    )
    ORDER BY created_at DESC
    LIMIT 200
  `

  return rows
}

export async function getMetrics(options: {
  from?: string
  to?: string
}) {
  if (!sql) {
    return {
      totalVisits: 0,
      totalForms: 0,
      byCountry: [],
      byDevice: [],
      byOs: [],
      byFormType: [],
      formsByDay: [],
    }
  }

  const from = options.from ?? ''
  const to = options.to ?? ''
  const fromDate = from ? new Date(`${from}T00:00:00`) : null
  const toDate = to ? new Date(`${to}T23:59:59.999`) : null

  const views = await sql`
    SELECT COUNT(*)::int AS total_visits
    FROM page_views
    WHERE (${fromDate}::timestamptz IS NULL OR created_at >= ${fromDate})
      AND (${toDate}::timestamptz IS NULL OR created_at <= ${toDate})
  `

  const submissions = await sql`
    SELECT COUNT(*)::int AS total_forms
    FROM form_submissions
    WHERE (${fromDate}::timestamptz IS NULL OR created_at >= ${fromDate})
      AND (${toDate}::timestamptz IS NULL OR created_at <= ${toDate})
  `

  const byCountry = await sql`
    SELECT country, COUNT(*)::int AS total
    FROM page_views
    WHERE (${fromDate}::timestamptz IS NULL OR created_at >= ${fromDate})
      AND (${toDate}::timestamptz IS NULL OR created_at <= ${toDate})
    GROUP BY country
    ORDER BY total DESC
    LIMIT 8
  `

  const byDevice = await sql`
    SELECT device_type, COUNT(*)::int AS total
    FROM page_views
    WHERE (${fromDate}::timestamptz IS NULL OR created_at >= ${fromDate})
      AND (${toDate}::timestamptz IS NULL OR created_at <= ${toDate})
    GROUP BY device_type
    ORDER BY total DESC
  `

  const byOs = await sql`
    SELECT os, COUNT(*)::int AS total
    FROM page_views
    WHERE (${fromDate}::timestamptz IS NULL OR created_at >= ${fromDate})
      AND (${toDate}::timestamptz IS NULL OR created_at <= ${toDate})
    GROUP BY os
    ORDER BY total DESC
  `

  const byFormType = await sql`
    SELECT form_type, COUNT(*)::int AS total
    FROM form_submissions
    WHERE (${fromDate}::timestamptz IS NULL OR created_at >= ${fromDate})
      AND (${toDate}::timestamptz IS NULL OR created_at <= ${toDate})
    GROUP BY form_type
    ORDER BY total DESC
  `

  const formsByDay = await sql`
    SELECT
      TO_CHAR(local_date, 'YYYY-MM-DD') AS date,
      COUNT(*)::int AS total
    FROM (
      SELECT DATE(created_at AT TIME ZONE 'America/Puerto_Rico') AS local_date
      FROM form_submissions
      WHERE (${fromDate}::timestamptz IS NULL OR created_at >= ${fromDate})
        AND (${toDate}::timestamptz IS NULL OR created_at <= ${toDate})
    ) AS daily_forms
    GROUP BY local_date
    ORDER BY local_date ASC
  `

  return {
    totalVisits: Number(views[0]?.total_visits ?? 0),
    totalForms: Number(submissions[0]?.total_forms ?? 0),
    byCountry: byCountry ?? [],
    byDevice: byDevice ?? [],
    byOs: byOs ?? [],
    byFormType: byFormType ?? [],
    formsByDay: formsByDay ?? [],
  }
}
