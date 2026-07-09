import { useState, useMemo, useEffect, useCallback } from 'react'
import { rankSubstitutes } from '../deltaE.js'
import { SECTION_LABELS }   from '../data/paints.js'
import SwatchPair            from './SwatchPair.jsx'

const BRAND_CYAN = '#36E2DD'
const TIERS = [
  { id:'owned',  label:'Owned'          },
  { id:'brands', label:'Custom Brands'  },
  { id:'all',    label:'All'            },
]

// Grade chip colours (cool/neutral ramp — warm hues reserved for warnings)
function gradeChip(dE) {
  if (dE < 1)  return { label:'Identical',            bg:'#0e3535', color: BRAND_CYAN }
  if (dE < 2)  return { label:'Excellent',            bg:'#0d2e2e', color:'#2BABA8'   }
  if (dE < 5)  return { label:'Close',                bg:'#0e1e2e', color:'#6B89A8'   }
  if (dE < 10) return { label:'Usable',               bg:'#1a2028', color:'#6E7F8A'   }
  return             { label:'Distant',               bg:'#181c20', color:'#4A5560'   }
}

function Chip({ label, bg, color, border }) {
  return (
    <span style={{
      fontSize:9, padding:'2px 6px', borderRadius:20,
      background: bg, color, border: border || `1px solid ${color}33`,
      whiteSpace:'nowrap', flexShrink:0,
    }}>{label}</span>
  )
}

function WarningChips({ chips }) {
  return chips.map((chip, i) => {
    if (chip === 'yellow')
      return <Chip key={i} label='⚠ diff. section' bg='#2a2200' color='#E8C840' />
    if (chip === 'orange')
      return <Chip key={i} label='⚠ diff. chemistry' bg='#2a1400' color='#E8A838' />
    if (chip.startsWith('sheen:'))
      return <Chip key={i} label={`finish: ${chip.slice(6)}`} bg='#1a1e28' color='#8AABAB' />
    return null
  })
}

function ResultRow({ target, result, isOwned, isInSet }) {
  const { paint: p, deltaE: dE, grade, chips } = result
  const gChip = gradeChip(dE)
  const sectionLabel = SECTION_LABELS[p.section_key] || p.section_key
  const [, line] = sectionLabel.includes(' — ') ? sectionLabel.split(' — ') : ['', sectionLabel]

  return (
    <div style={{
      display:'flex', alignItems:'center', gap:8, padding:'8px 0',
      borderBottom:'1px solid #1a2428',
    }}>
      {/* Swatch pair */}
      <SwatchPair target={target} candidate={p} size={22} />

      {/* Name + brand */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{
          fontSize:13, color:'#d0d0d0',
          fontFamily:"'Barlow Condensed','Montserrat',system-ui",
          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
        }}>{p.name}</div>
        <div style={{ fontSize:10, color:'#4a6060', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {line}
          {p.id && <span style={{ marginLeft:4, color:'#3a5050', fontFamily:'monospace' }}>{p.id}</span>}
        </div>
      </div>

      {/* ΔE + grade */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:3, flexShrink:0 }}>
        <span style={{ fontSize:12, fontWeight:700, color: gChip.color }}>
          {dE.toFixed(1)}
        </span>
        <Chip label={gChip.label} bg={gChip.bg} color={gChip.color} />
      </div>

      {/* Warning chips + badges */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:2, flexShrink:0, minWidth:0 }}>
        <WarningChips chips={chips} />
        {isOwned && <Chip label='✓ owned' bg='#1a2a1a' color='#6aba6a' />}
        {isInSet  && <Chip label='♦ set'   bg='#1e1a28' color='#9060d0' />}
      </div>
    </div>
  )
}

export default function SubstitutePanel({ paint, catalog, checked, mySet, hiddenSections, onClose }) {
  const [tier,         setTier]         = useState('all')
  const [finishExpand, setFinishExpand] = useState(false)
  const [noteDismissed, setNoteDismissed] = useState(false)

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640

  // Build userPaints map for rankSubstitutes
  const userPaints = useMemo(() => {
    const m = {}
    Object.keys(checked || {}).forEach(id => {
      if (checked[id]) { m[id] = m[id] || {}; m[id].owned = true }
    })
    Object.keys(mySet || {}).forEach(id => {
      if (mySet[id]) { m[id] = m[id] || {}; m[id].inSet = true }
    })
    return m
  }, [checked, mySet])

  // Run substitution engine
  const results = useMemo(() => {
    if (!paint || paint.lab_l == null) return []
    return rankSubstitutes(paint, {
      tier,
      finishExpand,
      userPaints,
      catalog,
      brandFilter: hiddenSections,
    })
  }, [paint, tier, finishExpand, userPaints, catalog, hiddenSections])

  // PostHog instrumentation
  useEffect(() => {
    if (!paint) return
    window.posthog?.capture('match_run', {
      target_id:        paint.id,
      tier,
      finish_expand:    finishExpand,
      top_result_deltaE: results[0]?.deltaE ?? null,
    })
  }, [tier, finishExpand]) // eslint-disable-line

  // Close on Escape
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!paint) return null

  const panelStyle = isMobile ? {
    position:'fixed', bottom:0, left:0, right:0,
    height:'78vh', borderRadius:'14px 14px 0 0',
    overflow:'hidden', display:'flex', flexDirection:'column',
  } : {
    position:'fixed', top:0, right:0, bottom:0,
    width:420, borderRadius:0,
    overflow:'hidden', display:'flex', flexDirection:'column',
  }

  const sectionLabel = SECTION_LABELS[paint.section_key] || paint.section_key

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', zIndex:1100,
      fontFamily:"'Montserrat',system-ui,sans-serif",
    }}>
      <div onClick={e=>e.stopPropagation()} style={{
        ...panelStyle,
        background:'#171B1B', color:'#e8e8e8',
        borderLeft: isMobile ? 'none' : '1px solid #2a3535',
        borderTop:  isMobile ? '1px solid #2a3535' : 'none',
      }}>

        {/* ── Header ── */}
        <div style={{ padding:'16px 20px 12px', borderBottom:'1px solid #1E2428', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
            <span style={{ fontSize:11, color:'#4a6060', textTransform:'uppercase', letterSpacing:'0.1em' }}>
              Find a Substitute
            </span>
            <button onClick={onClose} style={{ background:'none', border:'none', color:'#4a6060', fontSize:18, cursor:'pointer' }}>✕</button>
          </div>

          {/* Target paint summary */}
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <SwatchPair target={paint} candidate={null} size={28} />
            <div style={{ minWidth:0 }}>
              <div style={{
                fontSize:15, fontWeight:700,
                fontFamily:"'Barlow Condensed','Montserrat',system-ui",
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
              }}>{paint.name}</div>
              <div style={{ fontSize:10, color:'#4a6060' }}>
                {sectionLabel}
                {paint.finish_family && <span style={{ marginLeft:6, color:'#6B8080' }}>{paint.finish_family}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* ── Controls ── */}
        <div style={{ padding:'10px 20px', borderBottom:'1px solid #1E2428', flexShrink:0 }}>

          {/* Tier pills */}
          <div style={{ display:'flex', gap:6, marginBottom:10 }}>
            {TIERS.map(t => (
              <button key={t.id} onClick={()=>setTier(t.id)} style={{
                padding:'5px 12px', borderRadius:20, border:'none', cursor:'pointer',
                fontSize:11, fontWeight:600,
                background: tier===t.id ? BRAND_CYAN : '#1E2428',
                color:       tier===t.id ? '#0A1414'  : '#6b8080',
              }}>{t.label}</button>
            ))}
          </div>

          {/* finishExpand + hidden brands info */}
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <button onClick={()=>setFinishExpand(v=>!v)} style={{
              padding:'4px 10px', borderRadius:20, border:'none', cursor:'pointer',
              fontSize:10, fontWeight:600,
              background: finishExpand ? '#0e2a2a' : '#1E2428',
              color:       finishExpand ? BRAND_CYAN  : '#6b8080',
              border: finishExpand ? `1px solid ${BRAND_CYAN}44` : '1px solid transparent',
            }}>
              {finishExpand ? '✓ ' : ''}expand flat↔satin↔gloss
            </button>
            {tier === 'brands' && hiddenSections.size > 0 && (
              <span style={{ fontSize:10, color:'#4a6060' }}>
                {hiddenSections.size} brand{hiddenSections.size!==1?'s':''} hidden
              </span>
            )}
          </div>
        </div>

        {/* ── Honesty note ── */}
        {!noteDismissed && (
          <div style={{
            margin:'10px 20px 0', padding:'8px 12px',
            background:'#141414', border:'1px solid #2a3535', borderRadius:6,
            display:'flex', alignItems:'flex-start', gap:8, flexShrink:0,
          }}>
            <span style={{ fontSize:11, color:'#5a7070', lineHeight:1.5, flex:1 }}>
              Hex swatches approximate real paint — finish, opacity and pigment behaviour aren't captured. Matches are a starting point; swatch before committing.
            </span>
            <button onClick={()=>setNoteDismissed(true)} style={{
              background:'none', border:'none', color:'#4a6060',
              cursor:'pointer', fontSize:14, flexShrink:0, padding:'0 2px',
            }}>✕</button>
          </div>
        )}

        {/* ── Results ── */}
        <div style={{ flex:1, overflowY:'auto', padding:'8px 20px 20px' }}>
          {results.length === 0 ? (
            <div style={{ padding:'40px 0', textAlign:'center', color:'#4a6060', fontSize:13 }}>
              No matches in this scope — try "All" or expand finish.
            </div>
          ) : (
            results.slice(0, 10).map((r, i) => (
              <ResultRow
                key={`${r.paint.id}-${r.paint.section_key}`}
                target={paint}
                result={r}
                isOwned={!!checked[r.paint.id]}
                isInSet={!!mySet[r.paint.id]}
              />
            ))
          )}
        </div>

      </div>
    </div>
  )
}
