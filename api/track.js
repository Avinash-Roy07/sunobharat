import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

async function ensureTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS sb_visits (
      id BIGSERIAL PRIMARY KEY,
      world TEXT,
      device TEXT,
      browser TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`
  await sql`
    CREATE TABLE IF NOT EXISTS sb_song_plays (
      id BIGSERIAL PRIMARY KEY,
      world TEXT,
      title TEXT,
      video_id TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`
  await sql`
    CREATE TABLE IF NOT EXISTS sb_live_viewers (
      tab_key TEXT PRIMARY KEY,
      world TEXT,
      device TEXT,
      song TEXT,
      video_id TEXT,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`
  await sql`
    CREATE TABLE IF NOT EXISTS sb_time_spent (
      id BIGSERIAL PRIMARY KEY,
      seconds INT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  try {
    await ensureTables()
    const { type, ...data } = req.body

    if (type === 'visit') {
      await sql`INSERT INTO sb_visits (world, device, browser) VALUES (${data.world}, ${data.device}, ${data.browser})`
    } else if (type === 'song_play') {
      await sql`INSERT INTO sb_song_plays (world, title, video_id) VALUES (${data.world}, ${data.title}, ${data.video_id})`
    } else if (type === 'time_spent') {
      await sql`INSERT INTO sb_time_spent (seconds) VALUES (${data.seconds})`
    } else if (type === 'ping_live') {
      await sql`
        INSERT INTO sb_live_viewers (tab_key, world, device, song, video_id, updated_at)
        VALUES (${data.tab_key}, ${data.world}, ${data.device}, ${data.song}, ${data.video_id}, NOW())
        ON CONFLICT (tab_key) DO UPDATE SET
          world = EXCLUDED.world, device = EXCLUDED.device,
          song = EXCLUDED.song, video_id = EXCLUDED.video_id,
          updated_at = NOW()`
    } else if (type === 'remove_live') {
      await sql`DELETE FROM sb_live_viewers WHERE tab_key = ${data.tab_key}`
    }

    res.status(200).json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
