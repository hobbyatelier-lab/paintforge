export default function HowToUse({ onClose }) {
  const row = (left, right, bg = 'transparent') => (
    <div style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid #2a2a3a', alignItems: 'flex-start' }}>
      <div style={{ minWidth: 90, fontFamily: 'monospace', fontSize: 12, color: '#e94560', background: bg, padding: '2px 6px', borderRadius: 4, flexShrink: 0 }}>{left}</div>
      <div style={{ fontSize: 12, color: '#bbb', lineHeight: 1.5 }}>{right}</div>
    </div>
  )

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000b', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: '#1a1a2e', borderRadius: 16, border: '1px solid #2e2e4e', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px 12px', borderBottom: '1px solid #2e2e3e', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#1a1a2e' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#f0f0f0' }}>⚒ How to Use PaintForge</div>
            <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>Early Access · v0.1</div>
          </div>
          <button onClick={onClose} style={{ fontSize: 18, background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ padding: '16px 24px 24px', fontFamily: "'Inter', system-ui, sans-serif" }}>

          {/* Paint Row visual */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>A paint row looks like this</div>
            <div style={{ background: '#1e2a1e', border: '1px solid #2a4a2a', borderRadius: 6, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <div style={{ width: 15, height: 15, borderRadius: 3, background: '#9060d0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 8, color: '#fff' }}>♦</span>
              </div>
              <div style={{ width: 15, height: 15, borderRadius: 3, background: '#4caf50', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: '#fff', fontSize: 9 }}>✓</span>
              </div>
              <span style={{ fontSize: 10, color: '#6a8a6a', fontFamily: 'monospace', minWidth: 50, flexShrink: 0 }}>72.022</span>
              <span style={{ fontSize: 13, color: '#c8e8c8', flex: 1 }}>Ultramarine Blue</span>
              <div style={{ display: 'flex', gap: 2 }}>
                {[1,2,3,4,5].map(n => <div key={n} style={{ width: 9, height: 9, borderRadius: '50%', background: n <= 2 ? '#f07030' : '#2a2a3a' }} />)}
              </div>
              <div style={{ display: 'flex', gap: 2, marginLeft: 3, paddingLeft: 3, borderLeft: '1px solid #2a2a3a' }}>
                {[1,2,3,4,5].map(n => <div key={n} style={{ width: 9, height: 9, borderRadius: '50%', background: n <= 3 ? '#20a080' : 'transparent', border: `1px solid ${n <= 3 ? '#20a080' : '#3a3a4a'}` }} />)}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>What each element means</div>
            {row('♦  My Set', 'Mark paints you want in your curated collection. Drives the My Set progress bar and shopping list.')}
            {row('✓  Owned', 'Mark paints you physically have. Drives the Collection progress bar.')}
            {row('72.022', 'The paint\'s SKU / product code. Useful for ordering.')}
            {row('● ● ○ ○ ○', 'Orange dots — backup bottles you currently own. Tap 1–5 to set. Tap same number to clear.')}
            {row('◉ ◉ ◉ ○ ○', 'Teal dots — target backup count. When owned backups fall below target, the row turns amber and shows how many you need.')}
            {row('L / B / S', 'True Metal role badges — Light, Base, Shade. Only on TMM paints.')}
            {row('+2  warning', 'Amber indicator — you\'re below your backup target by this many bottles.')}
          </div>

          {/* Filters */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Filters</div>
            {row('All', 'Show every paint in the database.')}
            {row('Owned ✓', 'Only paints you\'ve marked as owned.')}
            {row('Missing', 'Everything you don\'t own yet.')}
            {row('My Set ♦', 'Only paints in your curated set.')}
            {row('Need Restock', 'In your set but not yet purchased.')}
            {row('Low Stock ⚠', 'Owned but below your backup target.')}
          </div>

          {/* Actions */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Buttons</div>
            {row('Brands', 'Open the brand/line filter panel. Hide entire brands or specific product lines you don\'t use.')}
            {row('Export', 'Generate a text list of your full inventory. Useful as a backup or to share.')}
            {row('Shop 🛒', 'Generate a shopping list — everything in your set you don\'t own, plus anything below backup target.')}
          </div>

          {/* Progress bars */}
          <div>
            <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Progress bars</div>
            {row('Collection', 'Owned paints out of every paint in the database (or visible after brand filtering).')}
            {row('My Set ♦', 'Owned paints out of everything you\'ve marked as My Set.')}
          </div>

          <div style={{ marginTop: 24, padding: '12px 16px', background: '#14141e', borderRadius: 8, fontSize: 11, color: '#555', lineHeight: 1.6 }}>
            💡 All changes save automatically to your account. Your collection is accessible from any device.
          </div>
        </div>
      </div>
    </div>
  )
}
