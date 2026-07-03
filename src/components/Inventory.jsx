import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase.js'
import { COLORS, SECTION_LABELS, SECTION_ACCENTS } from '../data/paints.js'

const FILTERS = [
  ['all', 'All'], ['owned', 'Owned ✓'], ['missing', 'Missing'],
  ['myset', 'My Set ♦'], ['need-restock', 'Need Restock'], ['low-stock', 'Low Stock ⚠'],
]

export default function Inventory({ user }) {
  const [checked,   setChecked]   = useState({})
  const [mySet,     setMySet]     = useState({})
  const [extras,    setExtras]    = useState({})
  const [targets,   setTargets]   = useState({})
  const [loaded,    setLoaded]    = useState(false)
  const [filter,    setFilter]    = useState('all')
  const [collapsed, setCollapsed] = useState({})
  const [saving,    setSaving]    = useState(false)
  const [search,    setSearch]    = useState('')
  const [showExport, setShowExport] = useState(false)
  const [exportText, setExportText] = useState('')
  const [exportTitle, setExportTitle] = useState('')

  // ── Load ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('user_paints').select('*').eq('user_id', user.id)
      if (!error && data) {
        const c = {}, m = {}, e = {}, t = {}
        for (const row of data) {
          if (row.owned)            c[row.paint_id] = true
          if (row.in_my_set)        m[row.paint_id] = true
          if (row.extras > 0)       e[row.paint_id] = row.extras
          if (row.target_count > 0) t[row.paint_id] = row.target_count
        }
        setChecked(c); setMySet(m); setExtras(e); setTargets(t)
      }
      setLoaded(true)
    }
    load()
  }, [user.id])

  // ── Save ──────────────────────────────────────────────────────────────────
  const savePaint = useCallback(async (id, patch) => {
    setSaving(true)
    const current = {
      owned: !!checked[id], in_my_set: !!mySet[id],
      extras: extras[id] || 0, target_count: targets[id] || 0,
      ...patch,
    }
    const isEmpty = !current.owned && !current.in_my_set
                 && current.extras === 0 && current.target_count === 0
    if (isEmpty) {
      await supabase.from('user_paints').delete().eq('user_id', user.id).eq('paint_id', id)
    } else {
      await supabase.from('user_paints').upsert(
        { user_id: user.id, paint_id: id, ...current, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,paint_id' }
      )
    }
    setSaving(false)
  }, [checked, mySet, extras, targets, user.id])

  // ── Toggles ───────────────────────────────────────────────────────────────
  function toggleOwned(id) {
    const next = !checked[id]
    setChecked(p => { const n = { ...p }; if (next) n[id] = true; else delete n[id]; return n })
    savePaint(id, { owned: next })
  }
  function toggleMySet(id) {
    const next = !mySet[id]
    setMySet(p => { const n = { ...p }; if (next) n[id] = true; else delete n[id]; return n })
    savePaint(id, { in_my_set: next })
  }
  function setExtraCount(id, n) {
    const next = extras[id] === n ? 0 : n
    setExtras(p => { const e = { ...p }; if (next) e[id] = next; else delete e[id]; return e })
    savePaint(id, { extras: next })
  }
  function setTargetCount(id, n) {
    const next = targets[id] === n ? 0 : n
    setTargets(p => { const t = { ...p }; if (next) t[id] = next; else delete t[id]; return t })
    savePaint(id, { target_count: next })
  }
  function toggleCollapse(key) {
    setCollapsed(p => ({ ...p, [key]: !p[key] }))
  }
  async function handleSignOut() { await supabase.auth.signOut() }

  // ── Export: Inventory ─────────────────────────────────────────────────────
  function exportOwned() {
    const allPaints = Object.values(COLORS).flat()
    const ownedCount = allPaints.filter(c => checked[c.id]).length
    const total = allPaints.length
    const setTracked = allPaints.filter(c => mySet[c.id])
    const setOwned = setTracked.filter(c => checked[c.id]).length

    const lines = ['VALLEJO PAINT INVENTORY', '=======================', '']
    for (const [key, label] of Object.entries(SECTION_LABELS)) {
      if (!COLORS[key] || COLORS[key].length === 0) continue
      const relevant = COLORS[key].filter(c => checked[c.id] || mySet[c.id] || extras[c.id])
        .sort((a, b) => parseFloat(a.id) - parseFloat(b.id))
      if (relevant.length === 0) continue
      lines.push(label)
      lines.push('-'.repeat(label.length + 4))
      relevant.forEach(c => {
        const own = checked[c.id] ? ' ✓' : ''
        const ms  = mySet[c.id]   ? ' ♦' : ''
        const ex  = extras[c.id]  ? ` [+${extras[c.id]}]` : ''
        lines.push(`  ${c.id}  ${c.name}${own}${ms}${ex}`)
      })
      lines.push('')
    }
    lines.push(`Owned: ${ownedCount} / ${total}  |  My Set: ${setOwned}/${setTracked.length}`)
    const text = lines.join('\n')
    setExportTitle('Inventory Export')
    setExportText(text)
    setShowExport(true)
    try { navigator.clipboard.writeText(text) } catch (_) {}
  }

  // ── Export: Shopping List ─────────────────────────────────────────────────
  function exportShoppingList() {
    const lines = ['PAINTFORGE — SHOPPING LIST', '==========================', '']
    let totalItems = 0

    lines.push('MISSING — in My Set but not owned')
    lines.push('-----------------------------------')
    let missingCount = 0
    for (const [key, label] of Object.entries(SECTION_LABELS)) {
      if (!COLORS[key]) continue
      const needed = COLORS[key]
        .filter(c => mySet[c.id] && !checked[c.id])
        .sort((a, b) => parseFloat(a.id) - parseFloat(b.id))
      if (needed.length === 0) continue
      lines.push(`  ${label}`)
      needed.forEach(c => {
        const t = targets[c.id] || 0
        const qty = t > 0 ? t + 1 : 1
        const note = t > 0 ? `  (1 in use + ${t} backup${t > 1 ? 's' : ''})` : ''
        lines.push(`    ${c.id}  ${c.name}  ×${qty}${note}`)
      })
      missingCount += needed.length
    }
    if (missingCount === 0) lines.push('  (none)')
    lines.push('')
    totalItems += missingCount

    lines.push('RESTOCK — owned but below backup target')
    lines.push('----------------------------------------')
    let restockCount = 0
    for (const [key, label] of Object.entries(SECTION_LABELS)) {
      if (!COLORS[key]) continue
      const needed = COLORS[key]
        .filter(c => checked[c.id] && (targets[c.id] || 0) > 0 && (extras[c.id] || 0) < (targets[c.id] || 0))
        .sort((a, b) => parseFloat(a.id) - parseFloat(b.id))
      if (needed.length === 0) continue
      lines.push(`  ${label}`)
      needed.forEach(c => {
        const need = (targets[c.id] || 0) - (extras[c.id] || 0)
        lines.push(`    ${c.id}  ${c.name}  ×${need}  (have ${extras[c.id] || 0}, want ${targets[c.id] || 0})`)
      })
      restockCount += needed.length
    }
    if (restockCount === 0) lines.push('  (none)')
    lines.push('')
    totalItems += restockCount
    lines.push(`Total items to order: ${totalItems}`)

    const text = lines.join('\n')
    setExportTitle('Shopping List')
    setExportText(text)
    setShowExport(true)
    try { navigator.clipboard.writeText(text) } catch (_) {}
  }

  // ── Stats ─────────────────────────────────────────────────────────────────
  const allPaints  = Object.values(COLORS).flat()
  const ownedCount = allPaints.filter(c => checked[c.id]).length
  const total      = allPaints.length
  const pct        = Math.round((ownedCount / total) * 100)
  const setTracked = allPaints.filter(c => mySet[c.id])
  const setOwned   = setTracked.filter(c => checked[c.id]).length
  const setPct     = setTracked.length > 0 ? Math.round((setOwned / setTracked.length) * 100) : 0

  // ── Filter ────────────────────────────────────────────────────────────────
  function filterColors(list) {
    let result = [...list].sort((a, b) => {
      const na = parseFloat(a.id), nb = parseFloat(b.id)
      if (!isNaN(na) && !isNaN(nb)) return na - nb
      return a.id.localeCompare(b.id)
    })
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(c => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q))
    }
    if (filter === 'owned')        return result.filter(c =>  checked[c.id])
    if (filter === 'missing')      return result.filter(c => !checked[c.id])
    if (filter === 'myset')        return result.filter(c =>  mySet[c.id])
    if (filter === 'need-restock') return result.filter(c =>  mySet[c.id] && !checked[c.id])
    if (filter === 'low-stock')    return result.filter(c => {
      const t = targets[c.id] || 0
      if (checked[c.id] && t > 0 && (extras[c.id] || 0) < t) return true
      if (!checked[c.id] && mySet[c.id] && t > 0) return true
      return false
    })
    return result
  }

  if (!loaded) return (
    <div style={{ background: '#141414', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: '#555' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⚒</div>
        <p style={{ fontFamily: 'system-ui', fontSize: 14 }}>Loading your collection…</p>
      </div>
    </div>
  )

  return (
    <div style={{ background: '#141414', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif", color: '#e8e8e8' }}>

      {/* Export modal */}
      {showExport && (
        <div style={{ position: 'fixed', inset: 0, background: '#000a', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#1e1e2e', borderRadius: 12, padding: 24, width: '100%', maxWidth: 480, border: '1px solid #3a3a4a' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 16, color: '#f0f0f0' }}>{exportTitle}</h3>
            <p style={{ margin: '0 0 12px', fontSize: 12, color: '#888' }}>Copied to clipboard. Select all and save to a text file for safekeeping.</p>
            <textarea readOnly value={exportText} onFocus={e => e.target.select()}
              style={{ width: '100%', height: 220, background: '#141414', border: '1px solid #3a3a4a', borderRadius: 6, color: '#ccc', fontSize: 11, fontFamily: 'monospace', padding: 10, resize: 'none', boxSizing: 'border-box' }}
            />
            <button onClick={() => { setShowExport(false); setExportText('') }}
              style={{ marginTop: 12, width: '100%', padding: '8px 0', borderRadius: 8, border: '1px solid #3a3a4a', background: 'transparent', color: '#888', fontSize: 13, cursor: 'pointer' }}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1e1e2e 0%, #2a1a2e 100%)', borderBottom: '1px solid #2e2e3e', padding: '16px 20px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>

          {/* Title */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>⚒</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#f0f0f0' }}>
                Paint<span style={{ color: '#e94560' }}>Forge</span>
              </span>
              {saving && <span style={{ fontSize: 11, color: '#555' }}>saving…</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, color: '#444' }}>{user.email}</span>
              <button onClick={handleSignOut} style={{ padding: '3px 8px', borderRadius: 6, border: '1px solid #3a3a4a', background: 'transparent', color: '#666', fontSize: 11, cursor: 'pointer' }}>out</button>
            </div>
          </div>

          {/* Progress bars */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Collection</span>
              <span style={{ fontSize: 12, color: '#aaa' }}>
                <span style={{ color: '#f0f0f0', fontWeight: 600 }}>{ownedCount}</span>
                <span style={{ color: '#444' }}>/{total}</span>
                <span style={{ color: '#554' }}> · {pct}%</span>
              </span>
            </div>
            <div style={{ height: 5, background: '#2e2e3e', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #f07030, #e03060)', borderRadius: 3, transition: 'width 0.3s' }} />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em' }}>My Set ♦</span>
              <span style={{ fontSize: 12, color: '#aaa' }}>
                <span style={{ color: '#c090f0', fontWeight: 600 }}>{setOwned}</span>
                <span style={{ color: '#444' }}>/{setTracked.length}</span>
              </span>
            </div>
            <div style={{ height: 5, background: '#2e2e3e', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${setPct}%`, height: '100%', background: 'linear-gradient(90deg, #9040d0, #6020a0)', borderRadius: 3, transition: 'width 0.3s' }} />
            </div>
          </div>

          {/* Search */}
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search paints…"
            style={{ width: '100%', padding: '7px 12px', borderRadius: 8, marginBottom: 8, background: '#141414', border: '1px solid #2e2e3e', color: '#e8e8e8', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
          />

          {/* Filters row 1 */}
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 5 }}>
            {FILTERS.slice(0, 3).map(([val, label]) => (
              <button key={val} onClick={() => setFilter(val)} style={{
                padding: '4px 10px', borderRadius: 20, border: 'none', cursor: 'pointer',
                fontSize: 11, fontWeight: 600,
                background: filter === val ? '#e94560' : '#2a2a3a',
                color: filter === val ? '#fff' : '#888',
              }}>{label}</button>
            ))}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 5 }}>
              <button onClick={exportOwned} style={{ padding: '4px 10px', borderRadius: 20, border: '1px solid #2a3a2a', background: 'transparent', color: '#4a7a4a', fontSize: 11, cursor: 'pointer' }}>Export</button>
              <button onClick={exportShoppingList} style={{ padding: '4px 10px', borderRadius: 20, border: '1px solid #3a2a10', background: 'transparent', color: '#a06020', fontSize: 11, cursor: 'pointer' }}>Shop 🛒</button>
            </div>
          </div>

          {/* Filters row 2 */}
          <div style={{ display: 'flex', gap: 5 }}>
            {FILTERS.slice(3).map(([val, label]) => (
              <button key={val} onClick={() => setFilter(val)} style={{
                padding: '4px 10px', borderRadius: 20, border: 'none', cursor: 'pointer',
                fontSize: 11, fontWeight: 600,
                background: filter === val ? '#a060e0' : '#2a2a3a',
                color: filter === val ? '#fff' : '#888',
              }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '16px 20px 60px' }}>
        {Object.entries(SECTION_LABELS).map(([key]) => {
          if (!COLORS[key] || COLORS[key].length === 0) return null
          const accent = SECTION_ACCENTS[key] || '#f07030'
          const colors = filterColors(COLORS[key])
          if (colors.length === 0) return null
          return (
            <Section key={key} title={SECTION_LABELS[key]} colors={colors}
              checked={checked} mySet={mySet} extras={extras} targets={targets}
              accent={accent} isCollapsed={!!collapsed[key]}
              onToggleCollapse={() => toggleCollapse(key)}
              toggleOwned={toggleOwned} toggleMySet={toggleMySet}
              setExtraCount={setExtraCount} setTargetCount={setTargetCount}
            />
          )
        })}
      </div>
    </div>
  )
}

function Section({ title, colors, checked, mySet, extras, targets, accent, isCollapsed, onToggleCollapse, toggleOwned, toggleMySet, setExtraCount, setTargetCount }) {
  const owned = colors.filter(c => checked[c.id]).length
  return (
    <div style={{ marginBottom: 24 }}>
      <div onClick={onToggleCollapse} style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: isCollapsed ? 0 : 8,
        paddingBottom: isCollapsed ? 0 : 6,
        borderBottom: isCollapsed ? 'none' : `2px solid ${accent}33`,
        cursor: 'pointer', userSelect: 'none',
      }}>
        <span style={{ fontSize: 10, color: accent, transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', display: 'inline-block', transition: 'transform 0.2s' }}>▼</span>
        <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: accent }}>{title}</span>
        <span style={{ fontSize: 11, color: '#444', marginLeft: 'auto' }}>{owned}/{colors.length}</span>
      </div>
      {!isCollapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {colors.map(c => (
            <ColorRow key={c.id} color={c}
              isChecked={!!checked[c.id]} inMySet={!!mySet[c.id]}
              extraCount={extras[c.id] || 0} targetCount={targets[c.id] || 0}
              toggleOwned={toggleOwned} toggleMySet={toggleMySet}
              setExtraCount={setExtraCount} setTargetCount={setTargetCount}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const ROLE_COLORS = {
  L: { bg: '#1e2a38', color: '#90c0e8' },
  B: { bg: '#2a2010', color: '#c0a060' },
  S: { bg: '#101820', color: '#6090a8' },
}

function ColorRow({ color, isChecked, inMySet, extraCount, targetCount, toggleOwned, toggleMySet, setExtraCount, setTargetCount }) {
  const isLow = (isChecked && targetCount > 0 && extraCount < targetCount)
             || (!isChecked && inMySet && targetCount > 0)
  const need = isChecked ? Math.max(0, targetCount - extraCount) : targetCount + 1

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', borderRadius: 6,
      background: isLow ? '#2a1a00' : isChecked ? '#1a2a1a' : inMySet ? '#1e1a28' : 'transparent',
      border: isLow ? '1px solid #805010' : isChecked ? '1px solid #2a4a2a' : inMySet ? '1px solid #3a2a4a' : '1px solid transparent',
    }}>
      <button onClick={() => toggleMySet(color.id)} title="My Set" style={{ width: 15, height: 15, borderRadius: 3, border: 'none', cursor: 'pointer', flexShrink: 0, background: inMySet ? '#9060d0' : '#2a2a3a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 8, color: inMySet ? '#fff' : '#444' }}>♦</span>
      </button>
      <button onClick={() => toggleOwned(color.id)} title="Owned" style={{ width: 15, height: 15, borderRadius: 3, border: 'none', cursor: 'pointer', flexShrink: 0, background: isChecked ? '#4caf50' : '#2a2a3a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isChecked && <span style={{ color: '#fff', fontSize: 9 }}>✓</span>}
      </button>
      {color.role && (() => {
        const s = ROLE_COLORS[color.role] || { bg: '#2a2a2a', color: '#888' }
        return <span style={{ fontSize: 8, fontWeight: 800, padding: '1px 4px', borderRadius: 2, background: s.bg, color: s.color, flexShrink: 0 }}>{color.role}</span>
      })()}
      <span style={{ fontSize: 10, color: isChecked ? '#6a8a6a' : '#444', fontFamily: 'monospace', minWidth: 50, flexShrink: 0 }}>{color.id}</span>
      <span style={{ fontSize: 13, flex: 1, minWidth: 0, color: isLow ? '#e0a040' : isChecked ? '#c8e8c8' : inMySet ? '#c0b0e0' : '#bbb', fontWeight: isChecked ? 500 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{color.name}</span>
      {isLow && <span style={{ fontSize: 10, fontWeight: 700, color: '#e0a040', flexShrink: 0 }}>+{need}</span>}
      <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
        {[1,2,3,4,5].map(n => (
          <button key={n} onClick={() => setExtraCount(color.id, n)} title={`${n} extra owned`} style={{ width: 9, height: 9, borderRadius: '50%', border: 'none', cursor: 'pointer', padding: 0, background: n <= extraCount ? '#f07030' : '#2a2a3a' }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 2, flexShrink: 0, marginLeft: 3, paddingLeft: 3, borderLeft: '1px solid #2a2a3a' }}>
        {[1,2,3,4,5].map(n => (
          <button key={n} onClick={() => setTargetCount(color.id, n)} title={`Target ${n} backups`} style={{ width: 9, height: 9, borderRadius: '50%', cursor: 'pointer', padding: 0, background: n <= targetCount ? '#20a080' : 'transparent', border: `1px solid ${n <= targetCount ? '#20a080' : '#3a3a4a'}` }} />
        ))}
      </div>
    </div>
  )
}
