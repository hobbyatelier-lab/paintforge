export default function HowToUse({ onClose }) {
  const S = { fontSize:12, color:'#bbb', lineHeight:1.6 }
  const H = { fontSize:11, color:'#555', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8, marginTop:4 }

  const row = (left, right, shade=false) => (
    <div style={{ display:'flex', gap:12, padding:'7px 0', borderBottom:'1px solid #2a2a3a', alignItems:'flex-start' }}>
      <div style={{ minWidth:100, fontFamily:'monospace', fontSize:11, color:'#e94560', background:shade?'#1e1e2e':'transparent', padding:'2px 6px', borderRadius:4, flexShrink:0 }}>{left}</div>
      <div style={S}>{right}</div>
    </div>
  )

  const tip = (text) => (
    <div style={{ margin:'10px 0', padding:'10px 14px', background:'#14141e', borderRadius:8, fontSize:11, color:'#556', lineHeight:1.6, borderLeft:'2px solid #e9456040' }}>
      {text}
    </div>
  )

  return (
    <div style={{ position:'fixed', inset:0, background:'#000b', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose() }}>
      <div style={{ background:'#1a1a2e', borderRadius:16, border:'1px solid #2e2e4e', width:'100%', maxWidth:540, maxHeight:'90vh', overflowY:'auto' }}>

        {/* Header */}
        <div style={{ padding:'18px 24px 12px', borderBottom:'1px solid #2e2e3e', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, background:'#1a1a2e', zIndex:1 }}>
          <div>
            <div style={{ fontSize:15, fontWeight:800, color:'#f0f0f0' }}>⚒ How to Use PaintForge</div>
            <div style={{ fontSize:11, color:'#555', marginTop:2 }}>Early Access · v0.1</div>
          </div>
          <button onClick={onClose} style={{ fontSize:18, background:'none', border:'none', color:'#666', cursor:'pointer' }}>✕</button>
        </div>

        <div style={{ padding:'16px 24px 28px', fontFamily:"'Inter', system-ui, sans-serif" }}>

          {/* Paint row visual */}
          <div style={H}>A paint row looks like this</div>
          <div style={{ background:'#1e2a1e', border:'1px solid #2a4a2a', borderRadius:6, padding:'8px 10px', display:'flex', alignItems:'center', gap:6, marginBottom:16 }}>
            <div style={{ width:14, height:14, borderRadius:3, background:'#9060d0', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><span style={{ fontSize:7, color:'#fff' }}>♦</span></div>
            <div style={{ width:14, height:14, borderRadius:3, background:'#4caf50', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><span style={{ color:'#fff', fontSize:9 }}>✓</span></div>
            <span style={{ fontSize:9, fontWeight:800, padding:'1px 3px', borderRadius:2, background:'#1e2a38', color:'#90c0e8', flexShrink:0 }}>L</span>
            <span style={{ fontSize:10, color:'#6a8a6a', fontFamily:'monospace', minWidth:48, flexShrink:0 }}>77.101</span>
            <span style={{ fontSize:12, color:'#c8e8c8', flex:1 }}>Sterling Silver</span>
            <div style={{ display:'flex', gap:2 }}>{[1,2,3,4,5].map(n=><div key={n} style={{ width:8, height:8, borderRadius:'50%', background:n<=2?'#f07030':'#2a2a3a' }} />)}</div>
            <div style={{ display:'flex', gap:2, marginLeft:3, paddingLeft:3, borderLeft:'1px solid #2a2a3a' }}>{[1,2,3,4,5].map(n=><div key={n} style={{ width:8, height:8, borderRadius:'50%', background:n<=3?'#20a080':'transparent', border:`1px solid ${n<=3?'#20a080':'#3a3a4a'}` }} />)}</div>
          </div>

          {/* Row elements */}
          <div style={H}>What each element means</div>
          {row('♦  My Set', 'Mark paints you want in your curated collection. Drives My Set progress bar and shopping list.')}
          {row('✓  Owned', 'Mark paints you physically have. Drives Collection progress bar.')}
          {row('L / B / S', 'True Metal role badges — Light, Base, Shade. Only on TMM paints.')}
          {row('72.022  etc.', 'Product SKU. Useful for ordering.')}
          {row('● ● ○ ○ ○', 'Orange dots — backup bottles you own right now. Tap 1–5 to set, same number again to clear.')}
          {row('◉ ◉ ◉ ○ ○', 'Teal dots — target backup count. When owned backups fall below target, row turns amber.')}
          {row('+2  amber', 'Low stock warning — you need this many more bottles to hit your target.')}

          {/* Navigating */}
          <div style={{ ...H, marginTop:20 }}>Navigating the list</div>
          {tip('The list is organised in three levels: Brand → Line → Section. Every level is independently collapsible and your layout is saved automatically.')}
          {row('VALLEJO  ▼', 'Brand header — click to collapse or expand the entire brand. All lines and sections inside hide together.')}
          {row('Game Color  ▼', 'Line header — click to collapse or expand a product line within a brand (e.g. Game Color, Mecha Color, Xpress Color).')}
          {row('Base Colors  ▼', 'Section header — click to collapse or expand just that one section. Shows owned/total count on the right.')}
          {tip('Your collapse state is saved to your account. Next time you open PaintForge, everything is exactly where you left it.')}

          {/* Brand filters */}
          <div style={{ ...H, marginTop:20 }}>Brand filters</div>
          {row('Brands button', 'Opens the brand filter panel. Use this to hide entire brands, product lines, or individual sections you don\'t use.')}
          {row('All on / All off', 'Buttons inside the panel to quickly show or hide everything at once.')}
          {row('✓ / — / ☐', 'Green check = fully visible. Dash = partially visible (some sections hidden). Empty = fully hidden.')}
          {row('Red Brands (N)', 'When any sections are hidden, the Brands button turns red and shows a count of hidden sections.')}
          {tip('Brand filter preferences also save automatically. If you hide Mecha Color because you don\'t own any, it stays hidden the next time you log in — on any device.')}

          {/* Content filters */}
          <div style={{ ...H, marginTop:20 }}>Content filters</div>
          {row('All', 'Show every paint in visible sections.')}
          {row('Owned ✓', 'Only paints you\'ve marked as owned.')}
          {row('Missing', 'Everything not yet owned.')}
          {row('My Set ♦', 'Only paints in your curated set.')}
          {row('Need Restock', 'In your set but not yet purchased.')}
          {row('Low Stock ⚠', 'Owned but below your backup target.')}

          {/* Buttons */}
          <div style={{ ...H, marginTop:20 }}>Actions</div>
          {row('Export', 'Full inventory as plain text — owned, My Set, and backup counts. Copy and save as a .txt file.')}
          {row('Shop 🛒', 'Shopping list — everything in My Set you don\'t own, plus anything below backup target, with quantities.')}

          {/* Progress */}
          <div style={{ ...H, marginTop:20 }}>Progress bars</div>
          {row('Collection', 'Owned paints out of every paint in the visible database.')}
          {row('My Set ♦', 'Owned out of everything marked as My Set.')}

          <div style={{ marginTop:20, padding:'12px 14px', background:'#14141e', borderRadius:8, fontSize:11, color:'#556', lineHeight:1.6 }}>
            💡 All changes — paint toggles, collapse states, brand filters — save automatically. Your collection is the same on phone, tablet, and desktop.
          </div>
        </div>
      </div>
    </div>
  )
}
