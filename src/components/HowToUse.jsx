import { useState } from 'react'
import logoUrl from '../assets/logo.svg'

const BRAND_CYAN = '#36E2DD'
const PURPLE     = '#9060d0'
const AMBER      = '#E8A838'
const TEAL       = '#36E2DD'

export default function HowToUse({ onClose, onDismissForever }) {
  const [dontShow, setDontShow] = useState(false)

  const S  = { fontSize:12, color:'#bbb', lineHeight:1.7 }
  const H  = { fontSize:10, color:'#555', textTransform:'uppercase', letterSpacing:'0.1em', margin:'20px 0 8px', fontWeight:700 }
  const C  = { color:BRAND_CYAN, fontWeight:700 }
  const P  = { color:PURPLE,     fontWeight:700 }
  const Am = { color:AMBER,      fontWeight:700 }
  const Te = { color:TEAL,       fontWeight:700 }
  const Gr = { color:'#4caf50',  fontWeight:700 }

  const row = (left, right) => (
    <div style={{ display:'flex', gap:10, padding:'6px 0', borderBottom:'1px solid #1e2828', alignItems:'flex-start' }}>
      <div style={{ minWidth:90, flexShrink:0 }}>{left}</div>
      <div style={S}>{right}</div>
    </div>
  )

  const tip = (text) => (
    <div style={{ margin:'10px 0', padding:'8px 12px', background:'#141e1e', borderRadius:6, fontSize:11, color:'#556', lineHeight:1.6, borderLeft:`2px solid ${BRAND_CYAN}40` }}>
      {text}
    </div>
  )

  return (
    <div style={{ position:'fixed', inset:0, background:'#000b', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose() }}>
      <div style={{ background:'#171B1B', borderRadius:16, border:'1px solid #252E2E', width:'100%', maxWidth:540, maxHeight:'92vh', overflowY:'auto', display:'flex', flexDirection:'column' }}>

        {/* Header */}
        <div style={{ padding:'14px 18px', borderBottom:'1px solid #252E2E', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, background:'#171B1B', zIndex:1, flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <img src={logoUrl} alt="" style={{ width:26, height:26 }} />
            <div>
              <span style={{ fontSize:14, fontWeight:800, letterSpacing:'-0.02em' }}>
                <span style={{ color:BRAND_CYAN }}>Paint</span><span style={{ color:'#2E3A3A' }}>forge</span>
              </span>
              <span style={{ color:'#444', fontWeight:400, fontSize:12 }}> — How to Use</span>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <label style={{ display:'flex', alignItems:'center', gap:5, cursor:'pointer', userSelect:'none', background:'#1E2828', padding:'4px 8px', borderRadius:6, border:'1px solid #2A3A3A' }}>
              <input type="checkbox" checked={dontShow} onChange={e => {
                setDontShow(e.target.checked)
                if (e.target.checked && onDismissForever) onDismissForever()
              }} style={{ accentColor:PURPLE, cursor:'pointer', width:13, height:13 }} />
              <span style={{ fontSize:10, color:'#6B8080', whiteSpace:'nowrap' }}>Don't show on startup</span>
            </label>
            <button onClick={onClose} style={{ fontSize:16, background:'none', border:'none', color:'#444', cursor:'pointer' }}>✕</button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding:'14px 18px 28px', fontFamily:"'Montserrat',system-ui,sans-serif" }}>

          {/* Paint row */}
          <div style={H}>A paint row looks like this</div>
          <div style={{ background:'#1a2828', border:'1px solid #2a4a3a', borderRadius:6, padding:'6px 8px', display:'flex', alignItems:'center', gap:5, marginBottom:8, flexWrap:'nowrap', overflow:'hidden' }}>
            <div style={{ width:15,height:15,borderRadius:3,background:'#9060d0',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
              <span style={{ fontSize:8,color:'#fff' }}>♦</span>
            </div>
            <div style={{ width:15,height:15,borderRadius:3,background:'#4caf50',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
              <span style={{ color:'#fff',fontSize:9 }}>✓</span>
            </div>
            <div style={{ width:18,height:18,borderRadius:'50%',background:'#C43E33',border:'1.5px solid rgba(255,255,255,0.85)',boxShadow:'inset 0 0 0 2px rgba(0,0,0,0.4)',flexShrink:0 }} />
            <span style={{ fontSize:10,color:'#4a6060',fontFamily:'monospace',flexShrink:0 }}>72.009</span>
            <span style={{ fontSize:13,color:'#c8e8c8',fontFamily:"'Barlow Condensed',system-ui",flex:1,minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>Hot Orange</span>
            <div style={{ display:'flex',gap:2,border:'1px solid #333',borderRadius:4,padding:'2px 3px',flexShrink:0 }}>
              {[1,2,3,4,5].map(n=><div key={n} style={{ width:5,height:12,borderRadius:2,background:n<=2?'#f07030':'transparent',border:`1px solid ${n<=2?'#f07030':'#444'}` }}/>)}
            </div>
            <div style={{ display:'flex',gap:2,border:'1px solid #333',borderRadius:4,padding:'2px 3px',flexShrink:0 }}>
              {[1,2,3,4,5].map(n=><div key={n} style={{ width:5,height:12,borderRadius:2,background:n<=3?'#20a080':'transparent',border:`1px solid ${n<=3?'#20a080':'#444'}` }}/>)}
            </div>
          </div>

          {/* Legend */}
          {row(
            <span style={{ display:'flex',gap:4,alignItems:'center' }}>
              <span style={{ ...P, fontSize:14 }}>♦</span>
              <span style={{ ...Gr, fontSize:12 }}>✓</span>
            </span>,
            <><span style={P}>My Set ♦</span> — paints in your curated wishlist/workflow. <span style={Gr}>Owned ✓</span> — physically in your hands right now.</>
          )}
          {row(
            <div style={{ width:18,height:18,borderRadius:'50%',background:'#C43E33',border:'1.5px solid rgba(255,255,255,0.85)',boxShadow:'inset 0 0 0 2px rgba(0,0,0,0.4)' }} />,
            <>Hex color swatch. <strong>Solid white border</strong> = standard color. <strong>Dashed border</strong> = approximate — metallics, clears, and colorshift paints that shift with angle and lighting can't be captured in one flat color.</>
          )}
          {row(
            <span style={{ fontFamily:'monospace',fontSize:10,color:'#4a6060' }}>72.009</span>,
            <>Manufacturer code — the number on the physical bottle. Blank for brands without official codes.</>
          )}
          {row(
            <div style={{ display:'flex',gap:5 }}>
              <div style={{ display:'flex',gap:2,border:'1px solid #333',borderRadius:4,padding:'2px 3px' }}>
                {[1,2,3,4,5].map(n=><div key={n} style={{ width:5,height:12,borderRadius:2,background:n<=2?'#f07030':'transparent',border:`1px solid ${n<=2?'#f07030':'#444'}` }}/>)}
              </div>
              <div style={{ display:'flex',gap:2,border:'1px solid #333',borderRadius:4,padding:'2px 3px' }}>
                {[1,2,3,4,5].map(n=><div key={n} style={{ width:5,height:12,borderRadius:2,background:n<=3?'#20a080':'transparent',border:`1px solid ${n<=3?'#20a080':'#444'}` }}/>)}
              </div>
            </div>,
            <><span style={{ color:'#f07030',fontWeight:700 }}>Orange pills</span> = backup bottles currently owned beyond your working bottle. <span style={{ color:'#20a080',fontWeight:700 }}>Teal pills</span> = your backup target. Tap to set. When you own fewer backups than your target, an <span style={Am}>amber +N badge</span> appears.</>
          )}
          {tip('My Set is what you actually track against — the progress bar and counters all reflect My Set first, Collection second.')}

          {/* Navigating the list */}
          <div style={H}>Navigating the list</div>
          <div style={{ borderRadius:8, overflow:'hidden', border:'1px solid #252E2E', marginBottom:8 }}>
            <div style={{ background:'#1A2020', padding:'6px 10px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:13,fontWeight:800,color:BRAND_CYAN,textTransform:'uppercase',letterSpacing:'0.08em' }}>VALLEJO</span>
              <span style={{ fontSize:9,color:'#555' }}>190/1094 (904) ♦ 87/253 (166)</span>
            </div>
            <div style={{ background:'#141E1E', padding:'5px 10px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:12,fontWeight:600,color:'#E8A838' }}>Game Color</span>
              <span style={{ fontSize:9,color:'#555' }}>94/264 (170) ♦ 92/92 (0)</span>
            </div>
            <div style={{ background:'#111818', padding:'4px 10px', paddingLeft:22, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:11,fontWeight:700,color:'#9B8FD0',textTransform:'uppercase',letterSpacing:'0.07em' }}>BASE COLORS</span>
              <span style={{ fontSize:9,color:'#555' }}>51/81 (30) ♦ 51/51 (0)</span>
            </div>
          </div>
          <div style={S}>Three levels — tap any header to collapse. <span style={{ color:BRAND_CYAN,fontWeight:600 }}>Cyan = brand</span>. <span style={{ color:AMBER,fontWeight:600 }}>Amber = product line</span>. <span style={{ color:'#9B8FD0',fontWeight:600 }}>Violet = section</span>. Each shows <span style={P}>owned</span>/<span style={Te}>total</span> <span style={Am}>(missing)</span> for both your Collection and My Set.</div>

          {/* Content filters */}
          <div style={H}>Content filters</div>
          {row(<span style={{ fontSize:10,fontWeight:600,color:BRAND_CYAN }}>All</span>, 'Everything in currently visible sections.')}
          {row(<span style={{ fontSize:10,fontWeight:600,color:'#4caf50' }}>Owned ✓</span>, 'Paints you physically own right now.')}
          {row(<span style={{ fontSize:10,fontWeight:600,color:'#888' }}>Missing</span>, 'Not yet owned.')}
          {row(<span style={{ fontSize:10,fontWeight:600,color:PURPLE }}>My Set ♦</span>, 'Your curated collection — the paints you use or want in your workflow.')}
          {row(<span style={{ fontSize:10,fontWeight:600,color:'#888' }}>Need Restock</span>, 'In My Set but owned zero copies. Priority purchases.')}
          {row(<span style={{ fontSize:10,fontWeight:600,color:AMBER }}>Low Stock ⚠</span>, 'Owned, but backup count is below your target. Running low.')}

          {/* Brand Filter */}
          <div style={H}>Brands and Product Line Filters</div>
          <div style={S}>The <strong>Brand Filter</strong> button opens a panel to show or hide any brand, product line, or section. Hidden sections disappear from the list and drop out of both progress bars. The button shows a count of hidden sections when any are active. Use it to focus on just Vallejo when painting a Vallejo-heavy project, or to hide all the brands you don't own.</div>

          {/* Export / Shop */}
          <div style={H}>Export & Shop</div>
          {row(<span style={{ color:'#FF6B00',fontWeight:700 }}>Shop 🛒</span>, 'Generates a shopping list of everything in My Set that you don\'t own yet, plus any paints below their backup target — with quantities. Auto-copied to clipboard.')}
          {row(<span style={{ color:'#888',fontWeight:600 }}>Export</span>, 'Exports your full owned inventory as a text list. Useful for backup or sharing.')}

          {/* Preference persistence */}
          <div style={H}>Everything saves automatically</div>
          <div style={S}>Hidden sections, collapse states, all preferences — saved to your account with a short delay. Every device, every login, the app loads exactly as you left it. No save button.</div>

        </div>
      </div>
    </div>
  )
}
