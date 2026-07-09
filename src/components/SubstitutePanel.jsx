import { useState, useMemo, useEffect } from 'react'
import { rankSubstitutes } from '../deltaE.js'
import { SECTION_LABELS }   from '../data/paints.js'

// ── Design tokens ────────────────────────────────────────────────
const BRAND_CYAN   = '#36E2DD'
const IRIS_COLOR   = '#C084FC'
const MATCH_COLOR  = '#7B5EA7'
const BG_PANEL     = '#171B1B'
const BG_CARD      = '#1E2428'
const BG_DEEP      = '#141414'
const BORDER       = '#2a3535'

// ── Grade scale (revised — human-hobby thresholds) ───────────────
function grade(dE) {
  if (dE < 1.5) return { label:'Near Identical', color: BRAND_CYAN,   bg:'#0e3535' }
  if (dE < 3)   return { label:'Excellent',       color:'#2BABA8',     bg:'#0d2e2e' }
  if (dE < 6)   return { label:'Close',           color:'#6B89A8',     bg:'#0e1e2e' }
  if (dE < 12)  return { label:'Usable',          color:'#6E7F8A',     bg:'#1a2028' }
  return              { label:'Distant',          color:'#4A5560',     bg:'#181c20' }
}

// ── Swatch (6-state, finish_family driven) ───────────────────────
const SOLID_FINISH  = new Set(['flat','gloss','satin','ink','one-coat','pigment'])
const DASHED_FINISH = new Set(['metallic','wash','fx','clear'])

function Swatch({ paint, size }) {
  if (!paint) return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:'#1E2428', border:'1px dashed #2a3535', flexShrink:0 }} />
  )
  const ff = paint.finish_family
  const isColorshift = ff === 'colorshift'
  const isAuxiliary  = ff === 'auxiliary'
  const isPending    = !ff
  const bg = isColorshift ? '#FFFFFF' : isAuxiliary ? 'transparent' : paint.hex ? paint.hex : 'transparent'
  const border = isPending && paint.hex ? 'none'
    : isPending    ? '1.5px dashed #333'
    : isAuxiliary  ? `2px solid #3a3a4a`
    : isColorshift || DASHED_FINISH.has(ff) ? '2px dashed rgba(255,255,255,0.7)'
    : (SOLID_FINISH.has(ff) || ff) && paint.hex ? '2px solid rgba(255,255,255,0.85)'
    : '2px solid #444'
  const indicator = isColorshift ? '~' : isAuxiliary ? '—' : !paint.hex ? '?' : null
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%', flexShrink:0,
      background:bg, border,
      boxShadow: (!isColorshift && !isAuxiliary && paint.hex)
        ? `inset 0 0 0 ${Math.round(size*0.07)}px rgba(0,0,0,0.4), inset 0 0 0 ${Math.round(size*0.12)}px ${paint.hex}`
        : 'none',
      display:'flex', alignItems:'center', justifyContent:'center',
    }}>
      {indicator && <span style={{ fontSize: Math.round(size*0.22), color:'#666' }}>{indicator}</span>}
    </div>
  )
}

// ── Chip ─────────────────────────────────────────────────────────
function Chip({ label, color, bg }) {
  return (
    <span style={{
      fontSize:9, padding:'2px 6px', borderRadius:20,
      background:bg||'#1a1a1a', color, border:`1px solid ${color}44`,
      whiteSpace:'nowrap', flexShrink:0, lineHeight:1.4,
    }}>{label}</span>
  )
}

// ── Paint info block ─────────────────────────────────────────────
function PaintInfo({ paint, label }) {
  if (!paint) return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8 }}>
      <Swatch paint={null} size={110} />
      <span style={{ fontSize:11, color:'#3a5050', textAlign:'center', lineHeight:1.5 }}>
        {label}
      </span>
    </div>
  )
  const parts  = (SECTION_LABELS[paint.section_key]||paint.section_key).split(' — ')
  const brand  = parts[0]
  const line   = parts[1] || ''
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:8, minWidth:0 }}>
      <Swatch paint={paint} size={110} />
      <div style={{ textAlign:'center', width:'100%' }}>
        <div style={{
          fontSize:13, fontWeight:700, color:'#e8e8e8',
          fontFamily:"'Barlow Condensed','Montserrat',system-ui",
          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
          marginBottom:2,
        }}>{paint.name}</div>
        <div style={{ fontSize:10, color:'#4a6060', marginBottom:1 }}>{brand}</div>
        {line && <div style={{ fontSize:10, color:'#3a5050' }}>{line}</div>}
        {paint.id && <div style={{ fontSize:9, color:'#2a4040', fontFamily:'monospace', marginTop:1 }}>{paint.id}</div>}
        {paint.finish_family && (
          <div style={{ fontSize:9, color:'#6b8080', marginTop:3 }}>{paint.finish_family}
            {paint.chemistry_family && <span style={{ color:'#3a5050' }}> · {paint.chemistry_family}</span>}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Attribute comparison row ─────────────────────────────────────
function AttrRow({ label, val1, val2 }) {
  const same = val1 && val2 && val1 === val2
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:10, padding:'3px 0' }}>
      <span style={{ color:'#3a5050', width:60, flexShrink:0 }}>{label}</span>
      <span style={{ flex:1, color:'#6b8080', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{val1||'—'}</span>
      <span style={{ fontSize:12, flexShrink:0 }}>{same ? '✓' : val1 && val2 ? '⚠' : '—'}</span>
      <span style={{ flex:1, color:'#6b8080', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', textAlign:'right' }}>{val2||'—'}</span>
    </div>
  )
}

// ── ΔE tooltip ───────────────────────────────────────────────────
function DeltaTooltip({ onClose }) {
  const rows = [
    { range:'< 1.5',   label:'Near Identical', color: BRAND_CYAN  },
    { range:'1.5 – 3', label:'Excellent',       color:'#2BABA8'   },
    { range:'3 – 6',   label:'Close',           color:'#6B89A8'   },
    { range:'6 – 12',  label:'Usable',          color:'#6E7F8A'   },
    { range:'≥ 12',    label:'Distant',         color:'#4A5560'   },
  ]
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:1300, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.5)' }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:BG_CARD, border:`1px solid ${BORDER}`, borderRadius:10, padding:20, maxWidth:300, width:'90%' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
          <span style={{ fontSize:13, fontWeight:700, color:'#e8e8e8' }}>What is ΔE?</span>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'#4a6060', cursor:'pointer', fontSize:16 }}>✕</button>
        </div>
        <p style={{ fontSize:11, color:'#6b8080', lineHeight:1.6, marginBottom:12 }}>
          ΔE (Delta E) measures the perceptual distance between two colours in LAB colour space — designed to match how human vision actually perceives colour differences.
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
          {rows.map(r => (
            <div key={r.range} style={{ display:'flex', gap:8, alignItems:'center' }}>
              <span style={{ fontSize:9, color:'#3a5050', width:50, flexShrink:0 }}>{r.range}</span>
              <span style={{ fontSize:10, color:r.color }}>{r.label}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize:10, color:'#3a5050', marginTop:10, lineHeight:1.5 }}>
          Scores are calculated from sampled hex values — real paints may match better or worse than numbers suggest. Swatch before committing.
        </p>
      </div>
    </div>
  )
}

// ── Result row ───────────────────────────────────────────────────
const ROW_H = 56
function ResultRow({ target, result, isInSet, onSelect, onToggleSet, isSelected }) {
  const { paint: p, deltaE: dE, chips } = result
  const g      = grade(dE)
  const parts  = (SECTION_LABELS[p.section_key]||p.section_key).split(' — ')
  const brand  = parts[0], line = parts[1]||''
  return (
    <div
      onClick={() => onSelect(result)}
      style={{
        display:'flex', alignItems:'center', gap:8,
        padding:'0 4px',
        height:ROW_H,
        borderBottom:`1px solid #1a2428`,
        cursor:'pointer',
        background: isSelected ? '#1E2A2A' : 'transparent',
        borderLeft: isSelected ? `2px solid ${BRAND_CYAN}` : '2px solid transparent',
      }}
    >
      {/* Candidate swatch — fills row height */}
      <Swatch paint={p} size={ROW_H - 10} />

      {/* Name + brand */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{
          fontSize:13, fontWeight:600, color:'#d0d0d0',
          fontFamily:"'Barlow Condensed','Montserrat',system-ui",
          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
        }}>{p.name}</div>
        <div style={{ fontSize:9, color:'#4a6060', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {brand}{line && <span style={{ color:'#2a4040' }}> · {line}</span>}
        </div>
        <div style={{ display:'flex', gap:3, marginTop:2, flexWrap:'wrap' }}>
          {chips.map((chip,i) => {
            if (chip==='yellow')   return <Chip key={i} label='⚠ section' color='#E8C840' bg='#2a2200' />
            if (chip==='orange')   return <Chip key={i} label='⚠ chemistry' color='#E8A838' bg='#2a1400' />
            if (chip.startsWith('sheen:')) return <Chip key={i} label={chip.slice(6)} color='#8AABAB' bg='#1a1e28' />
            return null
          })}
        </div>
      </div>

      {/* ΔE + grade */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:3, flexShrink:0 }}>
        <span style={{ fontSize:13, fontWeight:700, color:g.color }}>Δ{dE.toFixed(1)}</span>
        <Chip label={g.label} color={g.color} bg={g.bg} />
      </div>

      {/* ♦ My Set toggle */}
      <button
        onClick={e=>{ e.stopPropagation(); onToggleSet(p.id) }}
        title={isInSet ? 'Remove from My Set' : 'Add to My Set'}
        style={{
          width:20, height:20, borderRadius:4, border:'none', cursor:'pointer', flexShrink:0,
          background: isInSet ? '#9060d0' : '#1e1e2e',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}
      >
        <span style={{ fontSize:9, color: isInSet ? '#fff' : '#333' }}>♦</span>
      </button>
    </div>
  )
}

// ── Main panel ───────────────────────────────────────────────────
const TIERS = [
  { id:'owned',  label:'Owned'         },
  { id:'brands', label:'Custom Brands' },
  { id:'all',    label:'All'           },
]

export default function SubstitutePanel({
  paint, catalog, checked, mySet,
  hiddenSections, toggleMySet,
  onShop, onBrandFilter, onClose,
}) {
  const [tier,          setTier]          = useState('all')
  const [finishExpand,  setFinishExpand]  = useState(false)
  const [selected,      setSelected]      = useState(null)
  const [showTooltip,   setShowTooltip]   = useState(false)

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640

  // Reset selected when target changes
  useEffect(() => { setSelected(null) }, [paint?.id, paint?.section_key])

  // Close on Escape
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') { if (showTooltip) setShowTooltip(false); else onClose() } }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose, showTooltip])

  // Build userPaints map
  const userPaints = useMemo(() => {
    const m = {}
    Object.keys(checked||{}).forEach(id => { if (checked[id]) { m[id]=m[id]||{}; m[id].owned=true } })
    Object.keys(mySet||{}).forEach(id =>   { if (mySet[id])   { m[id]=m[id]||{}; m[id].inSet=true  } })
    return m
  }, [checked, mySet])

  // Run engine
  const results = useMemo(() => {
    if (!paint || paint.lab_l == null) return []
    return rankSubstitutes(paint, { tier, finishExpand, userPaints, catalog, brandFilter: hiddenSections })
  }, [paint, tier, finishExpand, userPaints, catalog, hiddenSections])

  // PostHog
  useEffect(() => {
    if (!paint) return
    window.posthog?.capture('match_run', {
      target_id: paint.id, tier,
      finish_expand: finishExpand,
      top_result_deltaE: results[0]?.deltaE ?? null,
    })
  }, [tier, finishExpand]) // eslint-disable-line

  if (!paint) return null

  const selectedResult = selected
  const candidate      = selectedResult?.paint || null
  const selGrade       = selectedResult ? grade(selectedResult.deltaE) : null

  const panelStyle = isMobile ? {
    position:'fixed', bottom:0, left:0, right:0,
    height:'88vh', borderRadius:'14px 14px 0 0',
  } : {
    position:'fixed', top:0, right:0, bottom:0, width:420,
  }

  return (
    <>
      {showTooltip && <DeltaTooltip onClose={()=>setShowTooltip(false)} />}

      <div onClick={onClose} style={{
        position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', zIndex:1100,
        fontFamily:"'Montserrat',system-ui,sans-serif",
      }}>
        <div onClick={e=>e.stopPropagation()} style={{
          ...panelStyle, position:'fixed',
          background:BG_PANEL, color:'#e8e8e8',
          borderLeft: isMobile ? 'none' : `1px solid ${BORDER}`,
          borderTop:  isMobile ? `1px solid ${BORDER}` : 'none',
          display:'flex', flexDirection:'column', overflow:'hidden', zIndex:1101,
        }}>

          {/* ── IrisMatch header ── */}
          <div style={{ padding:'14px 20px 10px', borderBottom:`1px solid ${BORDER}`, flexShrink:0 }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontSize:20, fontWeight:800, letterSpacing:'-0.02em', lineHeight:1 }}>
                  <span style={{ color:IRIS_COLOR }}>Iris</span><span style={{ color:MATCH_COLOR }}>Match</span>
                </div>
                <div style={{ fontSize:10, color:'#4a6060', marginTop:2 }}>Paint with what you own</div>
              </div>
              <button onClick={onClose} style={{ background:'none', border:'none', color:'#4a6060', fontSize:18, cursor:'pointer', padding:'2px 4px' }}>✕</button>
            </div>
          </div>

          {/* ── Two-column comparison area ── */}
          <div style={{ padding:'14px 16px', borderBottom:`1px solid ${BORDER}`, flexShrink:0 }}>
            <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
              <PaintInfo paint={paint} />

              {/* Centre: ΔE or separator */}
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', paddingTop:35, gap:4, flexShrink:0 }}>
                {candidate ? (
                  <>
                    <span style={{ fontSize:16, fontWeight:800, color:selGrade.color }}>
                      Δ{selectedResult.deltaE.toFixed(1)}
                    </span>
                    <Chip label={selGrade.label} color={selGrade.color} bg={selGrade.bg} />
                    <button
                      onClick={()=>setShowTooltip(true)}
                      style={{ background:'none', border:`1px solid #2a3535`, color:'#4a6060', borderRadius:'50%', width:16, height:16, cursor:'pointer', fontSize:9, display:'flex', alignItems:'center', justifyContent:'center', marginTop:2 }}
                    >?</button>
                  </>
                ) : (
                  <span style={{ color:'#2a3535', fontSize:18 }}>↔</span>
                )}
              </div>

              <PaintInfo paint={candidate} label={'select an alternative\nto compare'} />
            </div>

            {/* Attribute comparison */}
            {candidate && (
              <div style={{ marginTop:10, padding:'8px 10px', background:BG_DEEP, borderRadius:6 }}>
                <AttrRow label='Finish'    val1={paint.finish_family}    val2={candidate.finish_family}    />
                <AttrRow label='Chemistry' val1={paint.chemistry_family} val2={candidate.chemistry_family} />
                <AttrRow label='Section'   val1={SECTION_LABELS[paint.section_key]?.split(' — ')[1]||paint.section_key} val2={SECTION_LABELS[candidate.section_key]?.split(' — ')[1]||candidate.section_key} />
              </div>
            )}
          </div>

          {/* ── Controls ── */}
          <div style={{ padding:'8px 16px', borderBottom:`1px solid ${BORDER}`, flexShrink:0 }}>
            {/* Tier pills */}
            <div style={{ display:'flex', gap:5, marginBottom:7 }}>
              {TIERS.map(t=>(
                <button key={t.id} onClick={()=>setTier(t.id)} style={{
                  padding:'4px 10px', borderRadius:20, border:'none', cursor:'pointer',
                  fontSize:10, fontWeight:600,
                  background: tier===t.id ? BRAND_CYAN : BG_CARD,
                  color:       tier===t.id ? '#0A1414'  : '#6b8080',
                }}>{t.label}</button>
              ))}
            </div>
            {/* Second row: finishExpand + brand filter + shop */}
            <div style={{ display:'flex', gap:5, alignItems:'center', flexWrap:'wrap' }}>
              <button onClick={()=>setFinishExpand(v=>!v)} style={{
                padding:'3px 8px', borderRadius:20, border: finishExpand ? `1px solid ${BRAND_CYAN}44` : '1px solid transparent',
                cursor:'pointer', fontSize:9, fontWeight:600,
                background: finishExpand ? '#0e2a2a' : BG_CARD,
                color:       finishExpand ? BRAND_CYAN : '#6b8080',
              }}>{finishExpand?'✓ ':''} flat↔satin↔gloss</button>
              <button onClick={onBrandFilter} style={{
                padding:'3px 8px', borderRadius:20, cursor:'pointer', fontSize:9, fontWeight:600,
                border: hiddenSections?.size>0 ? `1px solid ${BRAND_CYAN}` : `1px solid #2a3535`,
                background: hiddenSections?.size>0 ? '#0A1E1E' : BG_CARD,
                color:       hiddenSections?.size>0 ? BRAND_CYAN : '#6b8080',
              }}>Brand Filter{hiddenSections?.size>0?` (${hiddenSections.size})`:''}</button>
              <button onClick={onShop} style={{
                padding:'3px 8px', borderRadius:20, border:`1px solid #2a3535`, cursor:'pointer',
                fontSize:9, fontWeight:600, background:BG_CARD, color:'#6b8080',
              }}>Shop 🛒</button>
            </div>
          </div>

          {/* ── Results ── */}
          <div style={{ flex:1, overflowY:'auto' }}>
            {results.length === 0 ? (
              <div style={{ padding:40, textAlign:'center', color:'#3a5050', fontSize:12 }}>
                No matches in this scope —<br/>try All or expand finish.
              </div>
            ) : (
              results.slice(0,10).map(r => (
                <ResultRow
                  key={`${r.paint.id}-${r.paint.section_key}`}
                  target={paint}
                  result={r}
                  isInSet={!!mySet[r.paint.id]}
                  onSelect={setSelected}
                  onToggleSet={toggleMySet}
                  isSelected={selected?.paint.id===r.paint.id && selected?.paint.section_key===r.paint.section_key}
                />
              ))
            )}
          </div>

          {/* ── Honesty note ── */}
          <div style={{ padding:'8px 16px', borderTop:`1px solid ${BORDER}`, flexShrink:0 }}>
            <p style={{ fontSize:10, color:'#3a5050', lineHeight:1.5, margin:0 }}>
              Hex swatches approximate real paint — finish, opacity and pigment behaviour aren't captured. Matches are a starting point; swatch before committing.
            </p>
          </div>

        </div>
      </div>
    </>
  )
}
