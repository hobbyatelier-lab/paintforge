import { TAXONOMY, SECTION_LABELS } from '../data/paints.js'

function getState(keys, hidden) {
  const n = keys.filter(k => hidden.has(k)).length
  if (n === 0) return 'on'
  if (n === keys.length) return 'off'
  return 'partial'
}

function Toggle({ state, onToggle, label, indent = 0, small = false }) {
  const bg = state === 'on' ? '#e94560' : state === 'partial' ? '#7a3040' : '#2a2a3a'
  const textColor = state === 'off' ? '#555' : '#e8e8e8'
  return (
    <div onClick={onToggle} style={{
      display: 'flex', alignItems: 'center', gap: 8,
      paddingLeft: 12 + indent * 16, paddingTop: 5, paddingBottom: 5,
      cursor: 'pointer', borderRadius: 4,
    }}>
      <div style={{
        width: small ? 10 : 12, height: small ? 10 : 12,
        borderRadius: 3, background: bg, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {state === 'partial' && <span style={{ fontSize: 7, color: '#e8e8e8', fontWeight: 900 }}>—</span>}
        {state === 'on' && <span style={{ fontSize: 7, color: '#fff', fontWeight: 900 }}>✓</span>}
      </div>
      <span style={{ fontSize: small ? 11 : 12, color: textColor, fontWeight: indent === 0 ? 700 : indent === 1 ? 600 : 400 }}>
        {label}
      </span>
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
    const all = TAXONOMY.flatMap(b => b.lines.flatMap(l => l.sections))
    setHiddenSections(new Set(all))
  }

  const hiddenCount = hiddenSections.size

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000b', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{
        background: '#1a1a2e', width: 280, height: '100vh', overflowY: 'auto',
        borderLeft: '1px solid #2e2e4e', paddingBottom: 40,
      }}>
        {/* Header */}
        <div style={{ padding: '16px 16px 10px', borderBottom: '1px solid #2e2e3e', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#1a1a2e', zIndex: 1 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f0f0f0' }}>Brand Filters</div>
            {hiddenCount > 0 && <div style={{ fontSize: 11, color: '#e94560', marginTop: 2 }}>{hiddenCount} section{hiddenCount !== 1 ? 's' : ''} hidden</div>}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={showAll} style={{ fontSize: 10, padding: '3px 7px', borderRadius: 4, border: '1px solid #3a3a5a', background: 'transparent', color: '#70c070', cursor: 'pointer' }}>All on</button>
            <button onClick={hideAll} style={{ fontSize: 10, padding: '3px 7px', borderRadius: 4, border: '1px solid #3a3a5a', background: 'transparent', color: '#c07070', cursor: 'pointer' }}>All off</button>
            <button onClick={onClose} style={{ fontSize: 14, padding: '1px 6px', borderRadius: 4, border: '1px solid #3a3a5a', background: 'transparent', color: '#888', cursor: 'pointer' }}>✕</button>
          </div>
        </div>

        {/* Tree */}
        <div style={{ paddingTop: 8 }}>
          {TAXONOMY.map(brand => {
            const brandKeys = brand.lines.flatMap(l => l.sections)
            const brandState = getState(brandKeys, hiddenSections)
            return (
              <div key={brand.id} style={{ marginBottom: 4 }}>
                <Toggle state={brandState} label={brand.label} indent={0}
                  onToggle={() => toggle(brandKeys)} />

                {brand.lines.map(line => {
                  const lineState = getState(line.sections, hiddenSections)
                  return (
                    <div key={line.id}>
                      {brand.lines.length > 1 && (
                        <Toggle state={lineState} label={line.label} indent={1}
                          onToggle={() => toggle(line.sections)} />
                      )}
                      {line.sections.map(sKey => {
                        const secState = hiddenSections.has(sKey) ? 'off' : 'on'
                        return (
                          <Toggle key={sKey} small state={secState}
                            label={SECTION_LABELS[sKey] || sKey}
                            indent={brand.lines.length > 1 ? 2 : 1}
                            onToggle={() => toggle([sKey])} />
                        )
                      })}
                    </div>
                  )
                })}

                <div style={{ height: 1, background: '#2e2e3e', margin: '6px 12px' }} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
