// ============================================================
//  PaintForge — Paint Catalog Seeding Script
//
//  Run once from your project root:
//    SUPABASE_URL=https://xxxx.supabase.co \
//    SUPABASE_SERVICE_KEY=eyJh... \
//    node seed_paints.mjs
//
//  Safe to re-run — uses upsert, won't duplicate rows.
//  Needs: @supabase/supabase-js (already in your project)
// ============================================================

import { createClient } from '@supabase/supabase-js'
import { COLORS } from './src/data/paints.js'

const SUPABASE_URL = 'https://cxpydnchumwvemvhyetm.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4cHlkbmNodW13dmVtdmh5ZXRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzA3OTY1OCwiZXhwIjoyMDk4NjU1NjU4fQ.qbS8GfvpbI4fjqOaqZOmRbhmoNBjpNgwmcCF3G_JX54'

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing env vars. Set SUPABASE_URL and SUPABASE_SERVICE_KEY.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Flatten COLORS object into rows
const rows = []
for (const [sectionKey, paints] of Object.entries(COLORS)) {
  for (const p of paints) {
    rows.push({
      id:          p.id,
      section_key: sectionKey,
      name:        p.name,
      hex:         p.hex || null,
    })
  }
}

console.log(`\n🎨 PaintForge Catalog Seeder`)
console.log(`   ${rows.length} paint entries across ${Object.keys(COLORS).length} sections\n`)

const BATCH_SIZE = 500
const totalBatches = Math.ceil(rows.length / BATCH_SIZE)
let inserted = 0

for (let i = 0; i < rows.length; i += BATCH_SIZE) {
  const batch = rows.slice(i, i + BATCH_SIZE)
  const batchNum = Math.floor(i / BATCH_SIZE) + 1

  const { error } = await supabase
    .from('paints')
    .upsert(batch, { onConflict: 'id,section_key' })

  if (error) {
    console.error(`\n❌ Batch ${batchNum}/${totalBatches} failed:`, error.message)
    console.error('   Partial seed — fix the error and re-run. Upsert is safe to repeat.')
    process.exit(1)
  }

  inserted += batch.length
  const pct = Math.round(inserted / rows.length * 100)
  console.log(`   ✓ Batch ${batchNum}/${totalBatches} — ${inserted}/${rows.length} rows (${pct}%)`)
}

console.log(`\n✅ Done. ${rows.length} rows seeded into paints table.\n`)
