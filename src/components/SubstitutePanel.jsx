import { useState, useMemo, useEffect } from 'react'
import { rankSubstitutes } from '../deltaE.js'
import { SECTION_LABELS }   from '../data/paints.js'

// ── Design tokens ─────────────────────────────────────────────────
const BRAND_CYAN  = '#36E2DD'
const IRIS_COLOR  = '#C084FC'
const MATCH_COLOR = '#7B5EA7'
const BG_PANEL    = '#171B1B'
const BG_CARD     = '#1E2428'
const BG_DEEP     = '#141414'
const BORDER      = '#2a3535'
const SHOP_COLOR  = '#FF6B00'

// ── Grade scale (hobby-calibrated thresholds) ──────────────────────
function grade(dE) {
  if (dE < 1.5) return { label:'Near Identical', color: BRAND_CYAN, bg:'#0e3535' }
  if (dE < 3)   return { label:'Excellent',       color:'#2BABA8',  bg:'#0d2e2e' }
  if (dE < 6)   return { label:'Close',           color:'#6B89A8',  bg:'#0e1e2e' }
  if (dE < 12)  return { label:'Usable',          color:'#6E7F8A',  bg:'#1a2028' }
  return              { label:'Distant',          color:'#4A5560',  bg:'#181c20' }
}

// ── Swatch (6-state) ───────────────────────────────────────────────
const SOLID_F  = new Set(['flat','gloss','satin','ink','one-coat','pigment'])
const DASHED_F = new Set(['metallic','wash','fx','clear'])

function Swatch({ paint, size }) {
  if (!paint) return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:'#1a1e20', border:'1px dashed #2a3535', flexShrink:0 }} />
  )
  const ff = paint.finish_family
  const isCS  = ff === 'colorshift'
  const isAux = ff === 'auxiliary'
  const bg    = isCS ? '#FFFFFF' : isAux ? 'transparent' : paint.hex || 'transparent'
  const bdr   = !ff && paint.hex ? 'none'
    : !ff      ? '1.5px dashed #333'
    : isAux    ? '2px solid #3a3a4a'
    : isCS || DASHED_F.has(ff) ? '2px dashed rgba(255,255,255,0.7)'
    : (SOLID_F.has(ff)||ff) && paint.hex ? '2px solid rgba(255,255,255,0.85)'
    : '2px solid #444'
  const ind = isCS ? '~' : isAux ? '—' : !paint.hex ? '?' : null
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%', flexShrink:0,
      background:bg, border:bdr,
      boxShadow:(!isCS&&!isAux&&paint.hex) ? `inset 0 0 0 ${Math.round(size*.07)}px rgba(0,0,0,.4),inset 0 0 0 ${Math.round(size*.12)}px ${paint.hex}` : 'none',
      display:'flex', alignItems:'center', justifyContent:'center',
    }}>
      {ind && <span style={{ fontSize:Math.round(size*.22), color:'#666' }}>{ind}</span>}
    </div>
  )
}

// ── Chip ───────────────────────────────────────────────────────────
function Chip({ label, color, bg }) {
  return (
    <span style={{
      fontSize:9, padding:'2px 6px', borderRadius:20,
      background:bg||'#1a1a1a', color,
      border:`1px solid ${color}44`, whiteSpace:'nowrap', flexShrink:0, lineHeight:1.4,
    }}>{label}</span>
  )
}

// ── Paint info block (comparison top panel) ────────────────────────
function PaintInfo({ paint, emptyLabel }) {
  if (!paint) return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10 }}>
      <Swatch paint={null} size={110} />
      <span style={{ fontSize:11, color:'#3a5050', textAlign:'center', lineHeight:1.6, whiteSpace:'pre-line' }}>
        {emptyLabel}
      </span>
    </div>
  )
  const parts = (SECTION_LABELS[paint.section_key]||paint.section_key).split(' — ')
  const brand = parts[0], line = parts[1]||''
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:8, minWidth:0 }}>
      <Swatch paint={paint} size={110} />
      <div style={{ textAlign:'center', width:'100%', padding:'0 4px' }}>
        <div style={{
          fontSize:15, fontWeight:700, color:'#e8e8e8',
          fontFamily:"'Barlow Condensed','Montserrat',system-ui",
          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:2,
        }}>{paint.name}</div>
        <div style={{ fontSize:11, color:'#8AABAB', marginBottom:1 }}>{brand}</div>
        {line && <div style={{ fontSize:10, color:'#6b8080' }}>{line}</div>}
        {paint.id && <div style={{ fontSize:9, color:'#3a5050', fontFamily:'monospace', marginTop:2 }}>{paint.id}</div>}
        {paint.finish_family && (
          <div style={{ fontSize:10, color:'#9B8FD0', marginTop:4 }}>
            {paint.finish_family}
            {paint.chemistry_family && <span style={{ color:'#6b8080' }}> · {paint.chemistry_family}</span>}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Attribute comparison ───────────────────────────────────────────
function AttrRow({ label, val1, val2 }) {
  const same = val1 && val2 && val1 === val2
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:10, padding:'3px 0' }}>
      <span style={{ color:'#4a6060', width:64, flexShrink:0 }}>{label}</span>
      <span style={{ flex:1, color:'#8AABAB', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', textAlign:'left' }}>{val1||'—'}</span>
      <span style={{ fontSize:13, flexShrink:0, color: same ? '#4caf50' : (val1&&val2) ? '#E8A838' : '#3a5050' }}>
        {same ? '✓' : val1&&val2 ? '⚠' : '—'}
      </span>
      <span style={{ flex:1, color:'#8AABAB', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', textAlign:'right' }}>{val2||'—'}</span>
    </div>
  )
}

// ── LAB directional hints ──────────────────────────────────────────
function LabHints({ target, candidate }) {
  if (!target || !candidate) return null
  if (target.lab_l == null || candidate.lab_l == null) return null

  const dL = candidate.lab_l - target.lab_l
  const da = candidate.lab_a - target.lab_a
  const db = candidate.lab_b - target.lab_b

  const axes = [
    {
      label:'Δ Lightness',
      delta:dL,
      direction: dL > 0 ? 'candidate is lighter' : 'candidate is darker',
      advice:    dL > 0 ? 'add black to equalize'   : 'add white to equalize',
    },
    {
      label:'Δ Red-Green',
      delta:da,
      direction: da > 0 ? 'candidate is more red'    : 'candidate is greener',
      advice:    da > 0 ? 'add green/teal to equalize'  : 'add red/magenta to equalize',
    },
    {
      label:'Δ Yellow-Blue',
      delta:db,
      direction: db > 0 ? 'candidate is more yellow'        : 'candidate is bluer',
      advice:    db > 0 ? 'add blue to equalize'               : 'add yellow/orange to equalize',
    },
  ]

  const significant = axes.filter(a => Math.abs(a.delta) >= 1)
  if (!significant.length) return null

  return (
    <div style={{ marginTop:8, padding:'8px 10px', background:'#0e1414', borderRadius:6, border:`1px solid #1a2828` }}>
      <div style={{ fontSize:9, color:'#3a5050', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>
        For a closer match:
      </div>
      {axes.map(ax => {
        const abs = Math.abs(ax.delta)
        if (abs < 1) return (
          <div key={ax.label} style={{ display:'flex', gap:6, alignItems:'center', padding:'2px 0' }}>
            <span style={{ fontSize:9, color:'#2a4040', width:80, flexShrink:0 }}>{ax.label}</span>
            <span style={{ fontSize:9, color:'#2a4040' }}>≈ same</span>
          </div>
        )
        const valColor = abs < 3 ? '#6b8080' : abs < 8 ? '#8AABAB' : IRIS_COLOR
        return (
          <div key={ax.label} style={{ display:'flex', gap:6, alignItems:'baseline', padding:'2px 0' }}>
            <span style={{ fontSize:9, color:'#4a6060', width:80, flexShrink:0 }}>{ax.label}</span>
            <span style={{ fontSize:11, fontWeight:700, color:valColor, width:36, flexShrink:0 }}>
              {ax.delta > 0 ? '+' : ''}{ax.delta.toFixed(1)}
            </span>
            <span style={{ fontSize:9, color:'#6b8080', lineHeight:1.4 }}>
              {ax.direction} · <span style={{ color:'#8AABAB' }}>{ax.advice}</span>
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ── ΔE tooltip ─────────────────────────────────────────────────────
function DeltaTooltip({ onClose }) {
  const rows = [
    { range:'< 1.5',   label:'Near Identical', color:BRAND_CYAN },
    { range:'1.5 – 3', label:'Excellent',       color:'#2BABA8' },
    { range:'3 – 6',   label:'Close',           color:'#6B89A8' },
    { range:'6 – 12',  label:'Usable',          color:'#6E7F8A' },
    { range:'≥ 12',    label:'Distant',         color:'#4A5560' },
  ]
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:1300, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.6)' }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:BG_CARD, border:`1px solid ${BORDER}`, borderRadius:10, padding:20, maxWidth:300, width:'90%' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
          <span style={{ fontSize:13, fontWeight:700, color:'#e8e8e8' }}>What is ΔE?</span>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'#4a6060', cursor:'pointer', fontSize:16 }}>✕</button>
        </div>
        <p style={{ fontSize:11, color:'#8AABAB', lineHeight:1.6, marginBottom:12 }}>
          ΔE (Delta E) measures the perceptual distance between two colours in LAB colour space — calibrated to match how human vision perceives colour differences.
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
          {rows.map(r=>(
            <div key={r.range} style={{ display:'flex', gap:8, alignItems:'center' }}>
              <span style={{ fontSize:9, color:'#3a5050', width:52, flexShrink:0 }}>{r.range}</span>
              <span style={{ fontSize:11, color:r.color, fontWeight:600 }}>{r.label}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize:10, color:'#3a5050', marginTop:10, lineHeight:1.5 }}>
          Scores are computed from sampled hex values — real paints may differ. Swatch before committing.
        </p>
      </div>
    </div>
  )
}

// ── Result row ──────────────────────────────────────────────────────
const ROW_H = 56
function ResultRow({ target, result, isInSet, onSelect, onToggleSet, isSelected }) {
  const { paint:p, deltaE:dE, chips } = result
  const g     = grade(dE)
  const parts = (SECTION_LABELS[p.section_key]||p.section_key).split(' — ')
  const brand = parts[0], line = parts[1]||''
  return (
    <div onClick={()=>onSelect(result)} style={{
      display:'flex', alignItems:'center', gap:6,
      padding:'0 12px', height:ROW_H,
      borderBottom:`1px solid #1a2428`,
      cursor:'pointer',
      background: isSelected ? '#1A2424' : 'transparent',
      borderLeft: isSelected ? `3px solid ${BRAND_CYAN}` : '3px solid transparent',
    }}>
      {/* Swatch pair touching (target + candidate) */}
      <div style={{ display:'flex', flexShrink:0 }}>
        <Swatch paint={target} size={ROW_H-14} />
        <Swatch paint={p}      size={ROW_H-14} />
      </div>

      {/* Name + brand */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{
          fontSize:14, fontWeight:600, color:'#d8d8d8',
          fontFamily:"'Barlow Condensed','Montserrat',system-ui",
          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
        }}>{p.name}</div>
        <div style={{ fontSize:9, color:'#6b8080', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {brand}{line && <span style={{ color:'#4a6060' }}> · {line}</span>}
        </div>
        {chips.length > 0 && (
          <div style={{ display:'flex', gap:3, marginTop:2 }}>
            {chips.map((chip,i) => {
              if (chip==='yellow') return <Chip key={i} label='⚠ section'   color='#E8C840' bg='#2a2200' />
              if (chip==='orange') return <Chip key={i} label='⚠ chemistry' color='#E8A838' bg='#2a1400' />
              if (chip.startsWith('sheen:')) return <Chip key={i} label={chip.slice(6)} color='#8AABAB' bg='#1a1e28' />
              return null
            })}
          </div>
        )}
      </div>

      {/* ΔE + grade */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:3, flexShrink:0 }}>
        <span style={{ fontSize:13, fontWeight:700, color:g.color }}>Δ{dE.toFixed(1)}</span>
        <Chip label={g.label} color={g.color} bg={g.bg} />
      </div>

      {/* ♦ My Set */}
      <button
        onClick={e=>{ e.stopPropagation(); onToggleSet(p.id) }}
        title={isInSet?'Remove from My Set':'Add to My Set'}
        style={{
          width:18, height:18, borderRadius:3, border:'none', cursor:'pointer', flexShrink:0,
          background:isInSet?'#9060d0':'#1e1e2e',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}
      >
        <span style={{ fontSize:9, color:isInSet?'#fff':'#333' }}>♦</span>
      </button>
    </div>
  )
}

// ── Main panel ──────────────────────────────────────────────────────
const TIERS = [
  { id:'owned',  label:'Owned'         },
  { id:'brands', label:'Custom Brands' },
  { id:'all',    label:'All'           },
]

export default function SubstitutePanel({
  paint, catalog, checked, mySet, hiddenSections,
  toggleMySet, onShop, onBrandFilter, onClose,
}) {
  const [tier,         setTier]         = useState('all')
  const [finishExpand, setFinishExpand] = useState(false)
  const [selected,     setSelected]     = useState(null)
  const [showTooltip,  setShowTooltip]  = useState(false)

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640

  useEffect(()=>{ setSelected(null) }, [paint?.id, paint?.section_key])

  useEffect(()=>{
    const h = e => { if(e.key==='Escape'){ if(showTooltip) setShowTooltip(false); else onClose() } }
    window.addEventListener('keydown', h)
    return ()=>window.removeEventListener('keydown', h)
  }, [onClose, showTooltip])

  const userPaints = useMemo(()=>{
    const m={}
    Object.keys(checked||{}).forEach(id=>{ if(checked[id]){ m[id]=m[id]||{}; m[id].owned=true }})
    Object.keys(mySet||{}).forEach(id=>{ if(mySet[id]){ m[id]=m[id]||{}; m[id].inSet=true }})
    return m
  }, [checked, mySet])

  const results = useMemo(()=>{
    if(!paint||paint.lab_l==null) return []
    return rankSubstitutes(paint,{tier,finishExpand,userPaints,catalog,brandFilter:hiddenSections})
  }, [paint,tier,finishExpand,userPaints,catalog,hiddenSections])

  useEffect(()=>{
    if(!paint) return
    window.posthog?.capture('match_run',{
      target_id:paint.id, tier, finish_expand:finishExpand,
      top_result_deltaE:results[0]?.deltaE??null,
    })
  }, [tier, finishExpand]) // eslint-disable-line

  if(!paint) return null

  const candidate = selected?.paint||null
  const selGrade  = selected ? grade(selected.deltaE) : null

  const panelStyle = isMobile ? {
    position:'fixed', bottom:0, left:0, right:0, height:'90vh',
    borderRadius:'14px 14px 0 0', borderTop:`1px solid ${BORDER}`,
  } : {
    position:'fixed', top:0, right:0, bottom:0, width:420,
    borderLeft:`1px solid ${BORDER}`,
  }

  const sec1 = SECTION_LABELS[paint.section_key]?.split(' — ')?.[1] || paint.section_key
  const sec2 = candidate ? (SECTION_LABELS[candidate.section_key]?.split(' — ')?.[1] || candidate.section_key) : null

  return (
    <>
      {showTooltip && <DeltaTooltip onClose={()=>setShowTooltip(false)} />}

      <div onClick={onClose} style={{
        position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', zIndex:1100,
        fontFamily:"'Montserrat',system-ui,sans-serif",
      }}>
        <div onClick={e=>e.stopPropagation()} style={{
          ...panelStyle, position:'fixed', zIndex:1101,
          background:BG_PANEL, color:'#e8e8e8',
          display:'flex', flexDirection:'column', overflow:'hidden',
        }}>

          {/* ── IrisMatch header ─────────────────────────────── */}
          <div style={{ padding:'12px 20px 10px', borderBottom:`1px solid ${BORDER}`, flexShrink:0 }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontSize:17, fontWeight:800, letterSpacing:'-0.02em', lineHeight:1 }}>
                  <span style={{ color:IRIS_COLOR }}>Iris</span><span style={{ color:MATCH_COLOR }}>Match</span>
                </div>
                <div style={{ fontSize:10, color:'#6b8080', marginTop:3 }}>Paint with what you own</div>
              </div>
              <button onClick={onClose} style={{ background:'none', border:'none', color:'#4a6060', fontSize:18, cursor:'pointer' }}>✕</button>
            </div>
          </div>

          {/* ── Two-column comparison ─────────────────────────── */}
          <div style={{ padding:'12px 14px', borderBottom:`1px solid ${BORDER}`, flexShrink:0 }}>
            <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
              <PaintInfo paint={paint} />

              {/* Centre: ΔE */}
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', paddingTop:40, gap:4, flexShrink:0, width:48 }}>
                {candidate ? (
                  <>
                    <span style={{ fontSize:15, fontWeight:800, color:selGrade.color }}>
                      Δ{selected.deltaE.toFixed(1)}
                    </span>
                    <span style={{ fontSize:9, color:selGrade.color, textAlign:'center', lineHeight:1.3 }}>
                      {selGrade.label}{'\n'}Match
                    </span>
                    <button onClick={()=>setShowTooltip(true)} style={{
                      background:'none', border:`1px solid #2a3535`, color:'#4a6060',
                      borderRadius:'50%', width:16, height:16, cursor:'pointer',
                      fontSize:9, display:'flex', alignItems:'center', justifyContent:'center', marginTop:2,
                    }}>?</button>
                  </>
                ) : (
                  <span style={{ color:'#2a3535', fontSize:20 }}>↔</span>
                )}
              </div>

              <PaintInfo paint={candidate} emptyLabel={'select an\nalternative\nto compare'} />
            </div>

            {/* Attribute comparison */}
            {candidate && (
              <div style={{ marginTop:10, padding:'8px 10px', background:BG_DEEP, borderRadius:6 }}>
                <AttrRow label='Finish'    val1={paint.finish_family}    val2={candidate.finish_family}    />
                <AttrRow label='Chemistry' val1={paint.chemistry_family} val2={candidate.chemistry_family} />
                <AttrRow label='Section'   val1={sec1} val2={sec2} />
              </div>
            )}

            {/* LAB direction hints */}
            <LabHints target={paint} candidate={candidate} />
          </div>

          {/* ── Controls ──────────────────────────────────────── */}
          <div style={{ padding:'8px 14px', borderBottom:`1px solid ${BORDER}`, flexShrink:0 }}>
            <div style={{ display:'flex', gap:5, marginBottom:7 }}>
              {TIERS.map(t=>(
                <button key={t.id} onClick={()=>setTier(t.id)} style={{
                  padding:'4px 10px', borderRadius:20, border:'none', cursor:'pointer',
                  fontSize:10, fontWeight:600,
                  background:tier===t.id?BRAND_CYAN:BG_CARD,
                  color:tier===t.id?'#0A1414':'#8AABAB',
                }}>{t.label}</button>
              ))}
            </div>
            <div style={{ display:'flex', gap:5, alignItems:'center', flexWrap:'wrap' }}>
              <button onClick={()=>setFinishExpand(v=>!v)} style={{
                padding:'3px 8px', borderRadius:20, cursor:'pointer', fontSize:9, fontWeight:600,
                border:finishExpand?`1px solid ${BRAND_CYAN}44`:'1px solid transparent',
                background:finishExpand?'#0e2a2a':BG_CARD,
                color:finishExpand?BRAND_CYAN:'#6b8080',
              }}>{finishExpand?'✓ ':''}allow flat↔satin↔gloss</button>
              <button onClick={onBrandFilter} style={{
                padding:'3px 8px', borderRadius:20, cursor:'pointer', fontSize:9, fontWeight:600,
                border:hiddenSections?.size>0?`1px solid ${BRAND_CYAN}`:`1px solid #2a3535`,
                background:hiddenSections?.size>0?'#0A1E1E':BG_CARD,
                color:hiddenSections?.size>0?BRAND_CYAN:'#6b8080',
              }}>Brand Filter{hiddenSections?.size>0?` (${hiddenSections.size})`:''}</button>
              <button onClick={onShop} style={{
                padding:'3px 8px', borderRadius:20, cursor:'pointer', fontSize:9, fontWeight:700,
                border:`2px solid ${SHOP_COLOR}`, background:'transparent', color:SHOP_COLOR,
              }}>Shop 🛒</button>
            </div>
          </div>

          {/* ── Results (scrollable, 20 items) ────────────────── */}
          <div style={{ flex:1, overflowY:'auto' }}>
            {results.length===0 ? (
              <div style={{ padding:40, textAlign:'center', color:'#3a5050', fontSize:12 }}>
                No matches in this scope —<br/>try All or allow finish expansion.
              </div>
            ) : results.slice(0,20).map(r=>(
              <ResultRow
                key={`${r.paint.id}-${r.paint.section_key}`}
                target={paint}
                result={r}
                isInSet={!!mySet[r.paint.id]}
                onSelect={setSelected}
                onToggleSet={toggleMySet}
                isSelected={selected?.paint.id===r.paint.id&&selected?.paint.section_key===r.paint.section_key}
              />
            ))}
          </div>

          {/* ── Honesty note ──────────────────────────────────── */}
          <div style={{ padding:'8px 14px', borderTop:`1px solid ${BORDER}`, flexShrink:0 }}>
            <p style={{ fontSize:10, color:'#3a5050', lineHeight:1.5, margin:0 }}>
              Hex swatches approximate real paint — finish, opacity and pigment behaviour aren't captured. Matches are a starting point; swatch before committing.
            </p>
          </div>

        </div>
      </div>
    </>
  )
}
