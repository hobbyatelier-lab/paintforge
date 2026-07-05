import { TAXONOMY, SECTION_LABELS } from '../data/paints.js'

const BRAND_CYAN = '#36E2DD'
const HIER_LINE  = '#E8A838'
const HIER_SEC   = '#9B8FD0'

function getState(keys, hidden) {
  const n = keys.filter(k => hidden.has(k)).length
  if (n === 0)          return 'on'
  if (n === keys.length) return 'off'
  return 'partial'
}

function Tick({ state, color }) {
  const bg = state === 'on' ? color : state === 'partial' ? color + '55' : '#1e2828'
  return (
    <div style={{ width:12, height:12, borderRadius:3, background:bg, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', border:`1px solid ${state==='off'?'#333':color}` }}>
      {state === 'on'      && <span style={{ fontSize:7, color:'#fff', fontWeight:900 }}>✓</span>}
      {state === 'partial' && <span style={{ fontSize:7, color:'#fff', fontWeight:900 }}>—</span>}
    </div>
  )
}

export default function BrandFilter({ hiddenSections, setHiddenSections, onClose }) {
  function toggle(keys) {
    setHiddenSections(prev => {
      const next = new Set(prev)
      const allHidden = keys.every(k => next.has(k))
      if (allHidden) keys.forEach(k => next.delete(k))
      else           keys.forEach(k => next.add(k))
      return next
    })
  }

  function showAll() { setHiddenSections(new Set()) }
  function hideAll() {
    const all = TAXONOMY.flatMap(b => b.lines.flatMap(l => l.sections.map(s => s.key)))
    setHiddenSections(new Set(all))
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'#000b', zIndex:200, display:'flex', alignItems:'flex-start', justifyContent:'flex-end' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background:'#171B1B', width:290, height:'100vh', overflowY:'auto', borderLeft:'1px solid #252E2E', paddingBottom:40 }}>

        {/* Header */}
        <div style={{ padding:'14px 14px 10px', borderBottom:'1px solid #252E2E', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, background:'#171B1B', zIndex:1 }}>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:'#f0f0f0' }}>Brands and Product Line Filters</div>
            {hiddenSections.size > 0 && <div style={{ fontSize:11, color:BRAND_CYAN, marginTop:1 }}>{hiddenSections.size} section{hiddenSections.size!==1?'s':''} hidden</div>}
          </div>
          <div style={{ display:'flex', gap:5 }}>
            <button onClick={showAll} style={{ fontSize:10, padding:'3px 7px', borderRadius:4, border:'1px solid #2A3A3A', background:'transparent', color:'#4caf50', cursor:'pointer' }}>All on</button>
            <button onClick={hideAll} style={{ fontSize:10, padding:'3px 7px', borderRadius:4, border:'1px solid #2A3A3A', background:'transparent', color:'#c07070', cursor:'pointer' }}>All off</button>
            <button onClick={onClose} style={{ fontSize:14, padding:'1px 6px', borderRadius:4, border:'1px solid #2A3A3A', background:'transparent', color:'#666', cursor:'pointer' }}>✕</button>
          </div>
        </div>

        {/* Tree */}
        <div style={{ paddingTop:6 }}>
          {TAXONOMY.map(brand => {
            const brandKeys = brand.lines.flatMap(l => l.sections.map(s => s.key))
            const brandState = getState(brandKeys, hiddenSections)
            return (
              <div key={brand.id} style={{ marginBottom:2 }}>
                {/* Brand row */}
                <div onClick={() => toggle(brandKeys)}
                  style={{ display:'flex', alignItems:'center', gap:7, padding:'6px 12px', cursor:'pointer', background:'#1A2020', borderBottom:'1px solid #1E2828' }}>
                  <Tick state={brandState} color={BRAND_CYAN} />
                  <span style={{ fontSize:12, fontWeight:800, color:BRAND_CYAN, textTransform:'uppercase', letterSpacing:'0.07em', flex:1 }}>{brand.label}</span>
                </div>

                {brand.lines.map(line => {
                  const lineKeys = line.sections.map(s => s.key)
                  const lineState = getState(lineKeys, hiddenSections)
                  return (
                    <div key={line.id}>
                      {/* Line row — only show if brand has multiple lines */}
                      {brand.lines.length > 1 && (
                        <div onClick={() => toggle(lineKeys)}
                          style={{ display:'flex', alignItems:'center', gap:7, padding:'4px 12px 4px 20px', cursor:'pointer', background:'#141C1C', borderBottom:'1px solid #1A2424' }}>
                          <Tick state={lineState} color={HIER_LINE} />
                          <span style={{ fontSize:11, fontWeight:600, color:HIER_LINE, flex:1 }}>{line.label}</span>
                        </div>
                      )}

                      {line.sections.map(({ key, display }) => {
                        const secState = hiddenSections.has(key) ? 'off' : 'on'
                        return (
                          <div key={key} onClick={() => toggle([key])}
                            style={{ display:'flex', alignItems:'center', gap:7, padding:'3px 12px 3px', paddingLeft: brand.lines.length > 1 ? 32 : 20, cursor:'pointer', background:'#111818', borderBottom:'1px solid #171F1F' }}>
                            <Tick state={secState} color={HIER_SEC} />
                            <span style={{ fontSize:10, fontWeight:600, color:secState==='off'?'#3a4848':HIER_SEC, textTransform:'uppercase', letterSpacing:'0.06em', flex:1 }}>{display}</span>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
