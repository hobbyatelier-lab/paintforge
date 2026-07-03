import { TAXONOMY, SECTION_LABELS } from '../data/paints.js'

function getState(keys, hidden) {
  const n = keys.filter(k => hidden.has(k)).length
  if (n === 0) return 'on'
  if (n === keys.length) return 'off'
  return 'partial'
}

function Tick({ state }) {
  const bg = state === 'on' ? '#e94560' : state === 'partial' ? '#7a3040' : '#2a2a3a'
  return (
    <div style={{ width:12, height:12, borderRadius:3, background:bg, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', border: state==='off'?'1px solid #3a3a4a':'none' }}>
      {state === 'on'      && <span style={{ fontSize:7, color:'#fff', fontWeight:900 }}>✓</span>}
      {state === 'partial' && <span style={{ fontSize:7, color:'#e8e8e8', fontWeight:900 }}>—</span>}
    </div>
  )
}

export default function BrandFilter({ hiddenSections, setHiddenSections, onClose }) {
  function toggle(keys) {
    setHiddenSections(prev => {
      const next = new Set(prev)
      const allHidden = keys.every(k => next.has(k))
      if (allHidden) keys.forEach(k => next.delete(k))
      else keys.forEach(k => next.add(k))
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
      <div style={{ background:'#1a1a2e', width:280, height:'100vh', overflowY:'auto', borderLeft:'1px solid #2e2e4e', paddingBottom:40 }}>

        {/* Header */}
        <div style={{ padding:'14px 14px 10px', borderBottom:'1px solid #2e2e3e', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, background:'#1a1a2e', zIndex:1 }}>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:'#f0f0f0' }}>Brand Filters</div>
            {hiddenSections.size > 0 && <div style={{ fontSize:11, color:'#e94560', marginTop:1 }}>{hiddenSections.size} section{hiddenSections.size!==1?'s':''} hidden</div>}
          </div>
          <div style={{ display:'flex', gap:5 }}>
            <button onClick={showAll} style={{ fontSize:10, padding:'3px 7px', borderRadius:4, border:'1px solid #3a3a5a', background:'transparent', color:'#70c070', cursor:'pointer' }}>All on</button>
            <button onClick={hideAll} style={{ fontSize:10, padding:'3px 7px', borderRadius:4, border:'1px solid #3a3a5a', background:'transparent', color:'#c07070', cursor:'pointer' }}>All off</button>
            <button onClick={onClose} style={{ fontSize:14, padding:'1px 6px', borderRadius:4, border:'1px solid #3a3a5a', background:'transparent', color:'#888', cursor:'pointer' }}>✕</button>
          </div>
        </div>

        {/* Tree */}
        <div style={{ paddingTop:6 }}>
          {TAXONOMY.map(brand => {
            const brandKeys = brand.lines.flatMap(l => l.sections.map(s => s.key))
            const bState = getState(brandKeys, hiddenSections)
            return (
              <div key={brand.id} style={{ marginBottom:2 }}>
                {/* Brand */}
                <div onClick={() => toggle(brandKeys)} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 12px', cursor:'pointer', borderRadius:4 }}>
                  <Tick state={bState} />
                  <span style={{ fontSize:12, fontWeight:800, color: bState==='off'?'#444':brand.color, textTransform:'uppercase', letterSpacing:'0.06em' }}>{brand.label}</span>
                </div>

                {/* Lines */}
                {brand.lines.map(line => {
                  const lineKeys = line.sections.map(s => s.key)
                  const lState = getState(lineKeys, hiddenSections)
                  const showLine = brand.lines.length > 1
                  return (
                    <div key={line.id}>
                      {showLine && (
                        <div onClick={() => toggle(lineKeys)} style={{ display:'flex', alignItems:'center', gap:8, padding:'4px 12px 4px 28px', cursor:'pointer' }}>
                          <Tick state={lState} />
                          <span style={{ fontSize:11, fontWeight:600, color: lState==='off'?'#444':'#b0b0d0' }}>{line.label}</span>
                        </div>
                      )}

                      {/* Sections */}
                      {line.sections.map(({key: sKey}) => {
                        const sState = hiddenSections.has(sKey) ? 'off' : 'on'
                        return (
                          <div key={sKey} onClick={() => toggle([sKey])} style={{ display:'flex', alignItems:'center', gap:8, padding:`3px 12px 3px ${showLine ? 44 : 28}px`, cursor:'pointer' }}>
                            <Tick state={sState} />
                            <span style={{ fontSize:11, color: sState==='off'?'#444':'#888' }}>{SECTION_LABELS[sKey]}</span>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
                <div style={{ height:1, background:'#2e2e3e', margin:'4px 12px' }} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
