import { useState } from 'react'
import logoUrl from '../assets/logo.svg'

const BRAND_CYAN = '#36E2DD'
const PURPLE     = '#9060d0'
const AMBER      = '#E8A838'
const GREEN      = '#4caf50'

export default function HowToUse({ onClose, onDismissForever, initialDontShow }) {
  const [dontShow, setDontShow] = useState(!!initialDontShow)

  const S  = { fontSize:12, color:'#bbb', lineHeight:1.7 }
  const H  = { fontSize:10, color:'#555', textTransform:'uppercase', letterSpacing:'0.1em', margin:'20px 0 8px', fontWeight:700 }

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

  // Mini pill display for how-to examples
  const MiniPips = ({count, total=5, color}) => (
    <div style={{ display:'flex',gap:2,border:'1px solid #2A3535',borderRadius:4,padding:'2px 3px' }}>
      {[...Array(total)].map((_,i)=>(
        <div key={i} style={{ width:5,height:12,borderRadius:2,border:`1px solid ${i<count?color:'#333'}`,background:i<count?color:'transparent' }} />
      ))}
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
                <span style={{ color:BRAND_CYAN }}>Paint</span><span style={{ color:'#8AABAB' }}>forge</span>
              </span>
              <span style={{ color:'#444', fontWeight:400, fontSize:12 }}> — How to Use</span>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <label style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer', userSelect:'none', background:'#1E2828', padding:'5px 10px', borderRadius:6, border:`1px solid ${dontShow?PURPLE:'#2A3A3A'}` }}>
              <input type="checkbox" checked={dontShow} onChange={e => {
                setDontShow(e.target.checked)
                if (e.target.checked && onDismissForever) onDismissForever()
              }} style={{ accentColor:PURPLE, cursor:'pointer', width:14, height:14 }} />
              <span style={{ fontSize:11, color:dontShow?PURPLE:'#6B8080', fontWeight:dontShow?600:400 }}>Don't show on startup</span>
            </label>
            <button onClick={onClose} style={{ fontSize:16, background:'none', border:'none', color:'#555', cursor:'pointer', padding:'2px 4px' }}>✕</button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding:'14px 18px 28px', fontFamily:"'Montserrat',system-ui,sans-serif" }}>

          {/* Paint row example */}
          <div style={H}>A paint row looks like this</div>
          <div style={{ background:'#1a2828', border:'1px solid #2a4a3a', borderRadius:6, padding:'6px 8px', display:'flex', alignItems:'center', gap:5, marginBottom:8 }}>
            {/* My Set */}
            <div style={{ width:15,height:15,borderRadius:3,background:PURPLE,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
              <span style={{ fontSize:8,color:'#fff' }}>♦</span>
            </div>
            {/* Owned */}
            <div style={{ width:15,height:15,borderRadius:3,background:GREEN,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
              <span style={{ color:'#fff',fontSize:9 }}>✓</span>
            </div>
            {/* Swatch */}
            <div style={{ width:18,height:18,borderRadius:'50%',background:'#C43E33',border:'1.5px solid rgba(255,255,255,0.85)',boxShadow:'inset 0 0 0 2px rgba(0,0,0,0.4)',flexShrink:0 }} />
            {/* Code */}
            <span style={{ fontSize:10,color:'#4a6060',fontFamily:'monospace',flexShrink:0 }}>72.009</span>
            {/* Name */}
            <span style={{ fontSize:13,color:'#c8e8c8',fontFamily:"'Barlow Condensed',system-ui",flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>Hot Orange</span>
            {/* Low stock badge */}
            <span style={{ fontSize:10,fontWeight:700,color:AMBER,flexShrink:0 }}>+1</span>
            {/* Backup pills: 2 lit / 5, target 3 → low! */}
            <MiniPips count={2} color='#f07030' />
            <div style={{ width:4,flexShrink:0 }} />
            <MiniPips count={3} color='#20a080' />
          </div>

          {/* Legend */}
          <div style={H}>What each element means</div>
          {row(
            <div style={{ width:15,height:15,borderRadius:3,background:PURPLE,display:'flex',alignItems:'center',justifyContent:'center' }}>
              <span style={{ fontSize:8,color:'#fff' }}>♦</span>
            </div>,
            <><span style={{ color:PURPLE,fontWeight:700 }}>My Set ♦</span> — this paint is in your curated workflow or wishlist. Tap to toggle.</>
          )}
          {row(
            <div style={{ width:15,height:15,borderRadius:3,background:GREEN,display:'flex',alignItems:'center',justifyContent:'center' }}>
              <span style={{ color:'#fff',fontSize:9 }}>✓</span>
            </div>,
            <><span style={{ color:GREEN,fontWeight:700 }}>Owned ✓</span> — you physically have this paint right now. Tap to toggle.</>
          )}
          {row(
            <div style={{ display:'flex',flexDirection:'column',gap:5 }}>
              {/* Solid = true color */}
              <div style={{ display:'flex',alignItems:'center',gap:5 }}>
                <div style={{ width:18,height:18,borderRadius:'50%',background:'#C43E33',border:'1.5px solid rgba(255,255,255,0.85)',boxShadow:'inset 0 0 0 2px rgba(0,0,0,0.4)',flexShrink:0 }} />
                <span style={{ fontSize:10,color:'#bbb' }}>True color</span>
              </div>
              {/* Dashed = approximate */}
              <div style={{ display:'flex',alignItems:'center',gap:5 }}>
                <div style={{ width:18,height:18,borderRadius:'50%',background:'#C43E3355',border:'1.5px dashed rgba(255,255,255,0.7)',flexShrink:0 }} />
                <span style={{ fontSize:10,color:'#888' }}>Approximate color</span>
              </div>
              {/* Empty = no data */}
              <div style={{ display:'flex',alignItems:'center',gap:5 }}>
                <div style={{ width:18,height:18,borderRadius:'50%',background:'transparent',border:'1.5px solid #3a3a4a',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                  <span style={{ fontSize:7,color:'#555' }}>?</span>
                </div>
                <span style={{ fontSize:10,color:'#555' }}>No data yet</span>
              </div>
            </div>,
            <div style={S}>
              <div><strong>Solid white border</strong> — true swatch of solid colors based on manufacturer digital chips.</div>
              <div style={{ marginTop:5 }}><strong>Dashed border</strong> — approximate swatch. Metallics, one coat paints (Contrast, Xpress, Speedpaint, and similar), clears, and colorshift paints shift with angle, lighting, and texture and can't be fully captured in a flat swatch.</div>
              <div style={{ marginTop:5 }}><strong>Empty ring with ?</strong> — either no color data available or not applicable for this product.</div>
            </div>
          )}
          {row(
            <span style={{ fontFamily:'monospace',fontSize:10,color:'#4a6060' }}>72.009</span>,
            <>Manufacturer code — the number printed on the bottle. Blank for products without official codes.</>
          )}
          {row(
            <div style={{ display:'flex',flexDirection:'column',gap:5,alignItems:'flex-start' }}>
              <MiniPips count={2} color='#f07030' />
              <MiniPips count={3} color='#20a080' />
              <span style={{ fontSize:10,color:AMBER,fontWeight:700 }}>+1</span>
            </div>,
            <div style={S}>
              <div><span style={{ color:'#f07030',fontWeight:700 }}>Orange pills</span> — backup bottles you currently own beyond your working bottle. Tap to set.</div>
              <div style={{ marginTop:4 }}><span style={{ color:'#20a080',fontWeight:700 }}>Teal pills</span> — your backup target. How many spares you want on hand. Tap to set.</div>
              <div style={{ marginTop:4 }}><span style={{ color:AMBER,fontWeight:700 }}>Amber +N badge</span> — appears when you own fewer backups than your target. N = how many bottles to buy.</div>
            </div>
          )}
          {tip('My Set is what you track against — the progress bars and section counters show My Set first, Collection second.')}

          {/* Navigating the list */}
          <div style={H}>Navigating the list</div>
          <div style={{ borderRadius:8, overflow:'hidden', border:'1px solid #252E2E', marginBottom:8 }}>
            <div style={{ background:'#1A2020', padding:'6px 10px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:13,fontWeight:800,color:BRAND_CYAN,textTransform:'uppercase',letterSpacing:'0.08em' }}>VALLEJO</span>
              <span style={{ fontSize:9,display:'flex',gap:4,alignItems:'center' }}>
                <span style={{ color:PURPLE,fontWeight:700 }}>♦</span>
                <span style={{ color:PURPLE,fontWeight:600 }}>87</span><span style={{ color:PURPLE,opacity:0.7 }}>/253</span>
                <span style={{ color:AMBER }}>(166)</span>
                <span style={{ color:'#2A3535' }}>·</span>
                <span style={{ color:BRAND_CYAN,fontWeight:600 }}>190</span><span style={{ color:BRAND_CYAN,opacity:0.7 }}>/1094</span>
                <span style={{ color:AMBER }}>(904)</span>
              </span>
            </div>
            <div style={{ background:'#141E1E', padding:'5px 10px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:12,fontWeight:600,color:AMBER }}>Game Color</span>
              <span style={{ fontSize:9,display:'flex',gap:4,alignItems:'center' }}>
                <span style={{ color:PURPLE,fontWeight:700 }}>♦</span>
                <span style={{ color:PURPLE,fontWeight:600 }}>92</span><span style={{ color:PURPLE,opacity:0.7 }}>/92</span>
                <span style={{ color:'#2A3535' }}>·</span>
                <span style={{ color:BRAND_CYAN,fontWeight:600 }}>94</span><span style={{ color:BRAND_CYAN,opacity:0.7 }}>/264</span>
                <span style={{ color:AMBER }}>(170)</span>
              </span>
            </div>
            <div style={{ background:'#111818', padding:'4px 10px 4px 22px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:11,fontWeight:700,color:'#9B8FD0',textTransform:'uppercase',letterSpacing:'0.07em' }}>BASE COLORS</span>
              <span style={{ fontSize:9,display:'flex',gap:4,alignItems:'center' }}>
                <span style={{ color:PURPLE,fontWeight:700 }}>♦</span>
                <span style={{ color:PURPLE,fontWeight:600 }}>51</span><span style={{ color:PURPLE,opacity:0.7 }}>/51</span>
                <span style={{ color:'#2A3535' }}>·</span>
                <span style={{ color:BRAND_CYAN,fontWeight:600 }}>51</span><span style={{ color:BRAND_CYAN,opacity:0.7 }}>/81</span>
                <span style={{ color:AMBER }}>(30)</span>
              </span>
            </div>
          </div>
          <div style={S}>Three collapsible levels — tap any header to expand or collapse. <span style={{ color:BRAND_CYAN,fontWeight:600 }}>Cyan = brand</span>. <span style={{ color:AMBER,fontWeight:600 }}>Amber = product line</span>. <span style={{ color:'#9B8FD0',fontWeight:600 }}>Violet = section</span>.</div>
          <div style={{ ...S, marginTop:6 }}>Each header shows <span style={{ color:PURPLE,fontWeight:600 }}>♦ owned/total</span> <span style={{ color:AMBER,fontWeight:600 }}>(missing)</span> for your <span style={{ color:PURPLE,fontWeight:600 }}>My Set</span>, then <span style={{ color:BRAND_CYAN,fontWeight:600 }}>owned/total</span> <span style={{ color:AMBER,fontWeight:600 }}>(missing)</span> for your <span style={{ color:BRAND_CYAN,fontWeight:600 }}>Collection</span>. Missing only shows when non-zero.</div>

          {/* Content filters */}
          <div style={H}>Content filters</div>
          {row(<span style={{ fontSize:10,fontWeight:600,color:BRAND_CYAN }}>All</span>, 'Every paint in currently visible sections.')}
          {row(<span style={{ fontSize:10,fontWeight:600,color:GREEN }}>Owned ✓</span>, 'Paints you physically own right now.')}
          {row(<span style={{ fontSize:10,fontWeight:600,color:'#888' }}>Missing</span>, 'Not yet owned — from the visible collection.')}
          {row(<span style={{ fontSize:10,fontWeight:600,color:PURPLE }}>My Set ♦</span>, 'Your curated workflow — the paints you use or want.')}
          {row(<span style={{ fontSize:10,fontWeight:600,color:'#888' }}>Need Restock</span>, 'In My Set but owned zero copies. Priority purchases.')}
          {row(<span style={{ fontSize:10,fontWeight:600,color:AMBER }}>Low Stock ⚠</span>, 'Owned, but backup count is below your target. Running low.')}

          {/* Brand Filter */}
          <div style={H}>Brands and Product Line Filters</div>
          <div style={S}>The <strong>Brand Filter</strong> button opens a panel to show or hide any brand, product line, or section. Hidden sections disappear from the list and drop out of both progress bars. The button shows a count of hidden sections when active.</div>

          {/* Export / Shop */}
          <div style={H}>Export & Shop</div>
          {row(<span style={{ color:'#FF6B00',fontWeight:700 }}>Shop 🛒</span>, "Shopping list: everything in My Set you don't own yet, plus paints below their backup target, with quantities. Auto-copied to clipboard.")}
          {row(<span style={{ color:'#888',fontWeight:600 }}>Export</span>, <><div>Full inventory as a text list for backup or sharing. Auto-copied to clipboard.</div><div style={{ marginTop:4, color:'#888' }}>Includes owned inventory, curated inventory (My Set), current backup reserves, and backup targets.</div></>)}

          {/* Preferences */}
          <div style={H}>Everything saves automatically</div>
          <div style={S}>Hidden sections, collapse states, all preferences — saved to your account automatically. Same state across every device, every login. No save button.</div>
        </div>
      </div>
    </div>
  )
}
