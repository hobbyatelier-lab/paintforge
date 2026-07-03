import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../supabase.js'
import { COLORS, SECTION_LABELS, SECTION_ACCENTS, TAXONOMY } from '../data/paints.js'
import BrandFilter from './BrandFilter.jsx'
import HowToUse from './HowToUse.jsx'

const FILTERS = [
  ['all','All'],['owned','Owned ✓'],['missing','Missing'],
  ['myset','My Set ♦'],['need-restock','Need Restock'],['low-stock','Low Stock ⚠'],
]

export default function Inventory({ user }) {
  const [checked,         setChecked]         = useState({})
  const [mySet,           setMySet]           = useState({})
  const [extras,          setExtras]          = useState({})
  const [targets,         setTargets]         = useState({})
  const [loaded,          setLoaded]          = useState(false)
  const [filter,          setFilter]          = useState('all')
  const [brandCollapsed,  setBrandCollapsed]  = useState(new Set())
  const [lineCollapsed,   setLineCollapsed]   = useState(new Set())
  const [collapsed,       setCollapsed]       = useState(new Set())
  const [saving,          setSaving]          = useState(false)
  const [search,          setSearch]          = useState('')
  const [hiddenSections,  setHiddenSections]  = useState(new Set())
  const [showBrandFilter, setShowBrandFilter] = useState(false)
  const [showHowToUse,    setShowHowToUse]    = useState(false)
  const [showExport,      setShowExport]      = useState(false)
  const [exportText,      setExportText]      = useState('')
  const [exportTitle,     setExportTitle]     = useState('')
  const prefSaveRef = useRef(null)

  // ── Load everything ───────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const [paintsRes, prefsRes] = await Promise.all([
        supabase.from('user_paints').select('*').eq('user_id', user.id),
        supabase.from('user_preferences').select('*').eq('user_id', user.id).single(),
      ])
      if (!paintsRes.error && paintsRes.data) {
        const c={},m={},e={},t={}
        for (const row of paintsRes.data) {
          if (row.owned)            c[row.paint_id]=true
          if (row.in_my_set)        m[row.paint_id]=true
          if (row.extras>0)         e[row.paint_id]=row.extras
          if (row.target_count>0)   t[row.paint_id]=row.target_count
        }
        setChecked(c); setMySet(m); setExtras(e); setTargets(t)
      }
      if (!prefsRes.error && prefsRes.data) {
        const p = prefsRes.data
        if (p.hidden_sections?.length)   setHiddenSections(new Set(p.hidden_sections))
        if (p.brand_collapsed?.length)   setBrandCollapsed(new Set(p.brand_collapsed))
        if (p.line_collapsed?.length)    setLineCollapsed(new Set(p.line_collapsed))
        if (p.section_collapsed?.length) setCollapsed(new Set(p.section_collapsed))
      }
      setLoaded(true)
    }
    load()
  }, [user.id])

  // ── Auto-save ALL preferences (debounced, single write) ───────────────────
  useEffect(() => {
    if (!loaded) return
    if (prefSaveRef.current) clearTimeout(prefSaveRef.current)
    prefSaveRef.current = setTimeout(async () => {
      await supabase.from('user_preferences').upsert({
        user_id: user.id,
        hidden_sections:   [...hiddenSections],
        brand_collapsed:   [...brandCollapsed],
        line_collapsed:    [...lineCollapsed],
        section_collapsed: [...collapsed],
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
    }, 600)
  }, [hiddenSections, brandCollapsed, lineCollapsed, collapsed, loaded, user.id])

  // ── Save a paint row ──────────────────────────────────────────────────────
  const savePaint = useCallback(async (id, patch) => {
    setSaving(true)
    const current = { owned:!!checked[id], in_my_set:!!mySet[id], extras:extras[id]||0, target_count:targets[id]||0, ...patch }
    const isEmpty = !current.owned&&!current.in_my_set&&current.extras===0&&current.target_count===0
    if (isEmpty) {
      await supabase.from('user_paints').delete().eq('user_id',user.id).eq('paint_id',id)
    } else {
      await supabase.from('user_paints').upsert(
        { user_id:user.id, paint_id:id, ...current, updated_at:new Date().toISOString() },
        { onConflict:'user_id,paint_id' }
      )
    }
    setSaving(false)
  }, [checked, mySet, extras, targets, user.id])

  // ── Toggles ───────────────────────────────────────────────────────────────
  const togSet = (setter, id) => setter(p => { const n=new Set(p); if(n.has(id)) n.delete(id); else n.add(id); return n })
  function toggleOwned(id)    { const v=!checked[id]; setChecked(p=>{const n={...p};if(v)n[id]=true;else delete n[id];return n}); savePaint(id,{owned:v}) }
  function toggleMySet(id)    { const v=!mySet[id];   setMySet(p=>{const n={...p};if(v)n[id]=true;else delete n[id];return n}); savePaint(id,{in_my_set:v}) }
  function setExtraCount(id,n){ const v=extras[id]===n?0:n; setExtras(p=>{const e={...p};if(v)e[id]=v;else delete e[id];return e}); savePaint(id,{extras:v}) }
  function setTargetCount(id,n){ const v=targets[id]===n?0:n; setTargets(p=>{const t={...p};if(v)t[id]=v;else delete t[id];return t}); savePaint(id,{target_count:v}) }
  async function handleSignOut() { await supabase.auth.signOut() }

  // ── Exports ───────────────────────────────────────────────────────────────
  function exportOwned() {
    const all=Object.values(COLORS).flat()
    const oc=all.filter(c=>checked[c.id]).length, st=all.filter(c=>mySet[c.id])
    const lines=['VALLEJO PAINT INVENTORY','=======================','']
    for (const [key,label] of Object.entries(SECTION_LABELS)) {
      if(!COLORS[key]||!COLORS[key].length) continue
      const rel=COLORS[key].filter(c=>checked[c.id]||mySet[c.id]||extras[c.id]).sort((a,b)=>parseFloat(a.id)-parseFloat(b.id))
      if(!rel.length) continue
      lines.push(label); lines.push('-'.repeat(label.length+4))
      rel.forEach(c=>lines.push(`  ${c.id}  ${c.name}${checked[c.id]?' ✓':''}${mySet[c.id]?' ♦':''}${extras[c.id]?` [+${extras[c.id]}]`:''}`))
      lines.push('')
    }
    lines.push(`Owned: ${oc} / ${all.length}  |  My Set: ${st.filter(c=>checked[c.id]).length}/${st.length}`)
    openExport('Inventory Export', lines.join('\n'))
  }

  function exportShoppingList() {
    const lines=['PAINTFORGE — SHOPPING LIST','==========================','','MISSING','-------']
    let total=0,missing=0
    for (const [key,label] of Object.entries(SECTION_LABELS)) {
      if(!COLORS[key]) continue
      const needed=COLORS[key].filter(c=>mySet[c.id]&&!checked[c.id]).sort((a,b)=>parseFloat(a.id)-parseFloat(b.id))
      if(!needed.length) continue
      lines.push(`  ${label}`)
      needed.forEach(c=>{ const t=targets[c.id]||0; lines.push(`    ${c.id}  ${c.name}  ×${t>0?t+1:1}${t>0?`  (1 use + ${t} backup${t>1?'s':''})`:''}`) })
      missing+=needed.length
    }
    if(!missing) lines.push('  (none)')
    lines.push('','RESTOCK','-------')
    let restock=0
    for (const [key,label] of Object.entries(SECTION_LABELS)) {
      if(!COLORS[key]) continue
      const needed=COLORS[key].filter(c=>checked[c.id]&&(targets[c.id]||0)>0&&(extras[c.id]||0)<(targets[c.id]||0)).sort((a,b)=>parseFloat(a.id)-parseFloat(b.id))
      if(!needed.length) continue
      lines.push(`  ${label}`)
      needed.forEach(c=>lines.push(`    ${c.id}  ${c.name}  ×${(targets[c.id]||0)-(extras[c.id]||0)}  (have ${extras[c.id]||0}, want ${targets[c.id]||0})`))
      restock+=needed.length
    }
    if(!restock) lines.push('  (none)')
    total=missing+restock
    lines.push('',`Total items to order: ${total}`)
    openExport('Shopping List', lines.join('\n'))
  }

  function openExport(title, text) {
    setExportTitle(title); setExportText(text); setShowExport(true)
    try { navigator.clipboard.writeText(text) } catch(_) {}
  }

  // ── Stats ─────────────────────────────────────────────────────────────────
  const allPaints=Object.values(COLORS).flat()
  const ownedCount=allPaints.filter(c=>checked[c.id]).length
  const total=allPaints.length, pct=Math.round(ownedCount/total*100)
  const setTracked=allPaints.filter(c=>mySet[c.id])
  const setOwned=setTracked.filter(c=>checked[c.id]).length
  const setPct=setTracked.length>0?Math.round(setOwned/setTracked.length*100):0

  // ── Filter colors ─────────────────────────────────────────────────────────
  function filterColors(list) {
    let r=[...list].sort((a,b)=>{ const na=parseFloat(a.id),nb=parseFloat(b.id); return(!isNaN(na)&&!isNaN(nb))?na-nb:a.id.localeCompare(b.id) })
    if(search){ const q=search.toLowerCase(); r=r.filter(c=>c.name.toLowerCase().includes(q)||c.id.toLowerCase().includes(q)) }
    if(filter==='owned')        return r.filter(c=> checked[c.id])
    if(filter==='missing')      return r.filter(c=>!checked[c.id])
    if(filter==='myset')        return r.filter(c=> mySet[c.id])
    if(filter==='need-restock') return r.filter(c=> mySet[c.id]&&!checked[c.id])
    if(filter==='low-stock')    return r.filter(c=>{ const t=targets[c.id]||0; return(checked[c.id]&&t>0&&(extras[c.id]||0)<t)||(!checked[c.id]&&mySet[c.id]&&t>0) })
    return r
  }

  if (!loaded) return (
    <div style={{ background:'#141414',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center' }}>
      <div style={{ textAlign:'center',color:'#555',fontFamily:'system-ui' }}>
        <div style={{ fontSize:32,marginBottom:12 }}>⚒</div>
        <p style={{ fontSize:14 }}>Loading your collection…</p>
      </div>
    </div>
  )

  return (
    <div style={{ background:'#141414',minHeight:'100vh',fontFamily:"'Inter',system-ui,sans-serif",color:'#e8e8e8' }}>

      {showBrandFilter && <BrandFilter hiddenSections={hiddenSections} setHiddenSections={setHiddenSections} onClose={()=>setShowBrandFilter(false)} />}
      {showHowToUse   && <HowToUse onClose={()=>setShowHowToUse(false)} />}

      {showExport && (
        <div style={{ position:'fixed',inset:0,background:'#000a',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:20 }}>
          <div style={{ background:'#1e1e2e',borderRadius:12,padding:24,width:'100%',maxWidth:480,border:'1px solid #3a3a4a' }}>
            <h3 style={{ margin:'0 0 8px',fontSize:16,color:'#f0f0f0' }}>{exportTitle}</h3>
            <p style={{ margin:'0 0 12px',fontSize:12,color:'#888' }}>Copied to clipboard. Save as .txt for backup.</p>
            <textarea readOnly value={exportText} onFocus={e=>e.target.select()} style={{ width:'100%',height:220,background:'#141414',border:'1px solid #3a3a4a',borderRadius:6,color:'#ccc',fontSize:11,fontFamily:'monospace',padding:10,resize:'none',boxSizing:'border-box' }} />
            <button onClick={()=>{setShowExport(false);setExportText('')}} style={{ marginTop:12,width:'100%',padding:'8px 0',borderRadius:8,border:'1px solid #3a3a4a',background:'transparent',color:'#888',fontSize:13,cursor:'pointer' }}>Close</button>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ background:'linear-gradient(135deg,#1e1e2e 0%,#2a1a2e 100%)',borderBottom:'1px solid #2e2e3e',padding:'14px 20px',position:'sticky',top:0,zIndex:10 }}>
        <div style={{ maxWidth:700,margin:'0 auto' }}>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10 }}>
            <div style={{ display:'flex',alignItems:'center',gap:8 }}>
              <span style={{ fontSize:20 }}>⚒</span>
              <span style={{ fontSize:17,fontWeight:800,color:'#f0f0f0' }}>Paint<span style={{ color:'#e94560' }}>Forge</span></span>
              {saving&&<span style={{ fontSize:10,color:'#555' }}>saving…</span>}
            </div>
            <div style={{ display:'flex',alignItems:'center',gap:6 }}>
              <button onClick={()=>setShowHowToUse(true)} title="How to Use" style={{ width:22,height:22,borderRadius:'50%',border:'1px solid #3a3a4a',background:'#2a2a3a',color:'#888',fontSize:11,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700 }}>?</button>
              <span style={{ fontSize:11,color:'#444' }}>{user.email.split('@')[0]}</span>
              <button onClick={handleSignOut} style={{ padding:'3px 8px',borderRadius:6,border:'1px solid #3a3a4a',background:'transparent',color:'#666',fontSize:11,cursor:'pointer' }}>out</button>
            </div>
          </div>

          <div style={{ marginBottom:7 }}>
            <div style={{ display:'flex',justifyContent:'space-between',marginBottom:3 }}>
              <span style={{ fontSize:10,color:'#555',textTransform:'uppercase',letterSpacing:'0.08em' }}>Collection</span>
              <span style={{ fontSize:12,color:'#aaa' }}><span style={{ color:'#f0f0f0',fontWeight:600 }}>{ownedCount}</span><span style={{ color:'#444' }}>/{total}</span><span style={{ color:'#554' }}> · {pct}%</span></span>
            </div>
            <div style={{ height:4,background:'#2e2e3e',borderRadius:3,overflow:'hidden' }}>
              <div style={{ width:`${pct}%`,height:'100%',background:'linear-gradient(90deg,#f07030,#e03060)',borderRadius:3,transition:'width 0.3s' }} />
            </div>
          </div>
          <div style={{ marginBottom:10 }}>
            <div style={{ display:'flex',justifyContent:'space-between',marginBottom:3 }}>
              <span style={{ fontSize:10,color:'#555',textTransform:'uppercase',letterSpacing:'0.08em' }}>My Set ♦</span>
              <span style={{ fontSize:12,color:'#aaa' }}><span style={{ color:'#c090f0',fontWeight:600 }}>{setOwned}</span><span style={{ color:'#444' }}>/{setTracked.length}</span><span style={{ color:'#554' }}> · {setPct}%</span></span>
            </div>
            <div style={{ height:4,background:'#2e2e3e',borderRadius:3,overflow:'hidden' }}>
              <div style={{ width:`${setPct}%`,height:'100%',background:'linear-gradient(90deg,#9040d0,#6020a0)',borderRadius:3,transition:'width 0.3s' }} />
            </div>
          </div>

          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search paints…"
            style={{ width:'100%',padding:'6px 12px',borderRadius:8,marginBottom:7,background:'#141414',border:'1px solid #2e2e3e',color:'#e8e8e8',fontSize:13,outline:'none',boxSizing:'border-box' }} />

          <div style={{ display:'flex',gap:5,flexWrap:'wrap',marginBottom:5 }}>
            {FILTERS.slice(0,3).map(([val,label])=>(
              <button key={val} onClick={()=>setFilter(val)} style={{ padding:'4px 10px',borderRadius:20,border:'none',cursor:'pointer',fontSize:11,fontWeight:600,background:filter===val?'#e94560':'#2a2a3a',color:filter===val?'#fff':'#888' }}>{label}</button>
            ))}
            <div style={{ marginLeft:'auto',display:'flex',gap:5 }}>
              <button onClick={()=>setShowBrandFilter(true)} style={{ padding:'4px 10px',borderRadius:20,cursor:'pointer',fontSize:11,fontWeight:600,border:hiddenSections.size>0?'1px solid #e94560':'1px solid #3a3a5a',background:hiddenSections.size>0?'#2a0a10':'transparent',color:hiddenSections.size>0?'#e94560':'#7070a0' }}>Brands{hiddenSections.size>0?` (${hiddenSections.size})`:''}</button>
              <button onClick={exportOwned} style={{ padding:'4px 10px',borderRadius:20,border:'1px solid #2a3a2a',background:'transparent',color:'#4a7a4a',fontSize:11,cursor:'pointer' }}>Export</button>
              <button onClick={exportShoppingList} style={{ padding:'4px 10px',borderRadius:20,border:'1px solid #3a2a10',background:'transparent',color:'#a06020',fontSize:11,cursor:'pointer' }}>Shop 🛒</button>
            </div>
          </div>
          <div style={{ display:'flex',gap:5 }}>
            {FILTERS.slice(3).map(([val,label])=>(
              <button key={val} onClick={()=>setFilter(val)} style={{ padding:'4px 10px',borderRadius:20,border:'none',cursor:'pointer',fontSize:11,fontWeight:600,background:filter===val?'#a060e0':'#2a2a3a',color:filter===val?'#fff':'#888' }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth:700,margin:'0 auto',padding:'12px 20px 60px' }}>
        {TAXONOMY.map(brand => {
          const brandKeys = brand.lines.flatMap(l => l.sections.map(s => s.key))
          if (!brandKeys.some(k => !hiddenSections.has(k))) return null
          const isBrandCollapsed = brandCollapsed.has(brand.id)

          return (
            <div key={brand.id} style={{ marginBottom:8 }}>
              <div onClick={()=>togSet(setBrandCollapsed, brand.id)} style={{ display:'flex',alignItems:'center',gap:8,padding:'8px 10px',background:'#1a1a2e',borderRadius:8,cursor:'pointer',userSelect:'none',border:`1px solid ${brand.color}33`,marginBottom:isBrandCollapsed?0:4 }}>
                <span style={{ fontSize:9,color:brand.color,transform:isBrandCollapsed?'rotate(-90deg)':'rotate(0deg)',display:'inline-block',transition:'transform 0.2s' }}>▼</span>
                <span style={{ fontSize:13,fontWeight:800,color:brand.color,textTransform:'uppercase',letterSpacing:'0.08em',flex:1 }}>{brand.label}</span>
                {isBrandCollapsed && <span style={{ fontSize:10,color:'#444' }}>{brandKeys.filter(k=>checked[k]||mySet[k]||extras[k]).length} active</span>}
              </div>

              {!isBrandCollapsed && brand.lines.map(line => {
                const lineKeys = line.sections.map(s => s.key)
                if (!lineKeys.some(k => !hiddenSections.has(k))) return null
                const isLineCollapsed = lineCollapsed.has(line.id)
                const showLine = brand.lines.length > 1

                return (
                  <div key={line.id} style={{ marginBottom:4 }}>
                    {showLine && (
                      <div onClick={()=>togSet(setLineCollapsed, line.id)} style={{ display:'flex',alignItems:'center',gap:7,padding:'5px 10px 5px 22px',cursor:'pointer',userSelect:'none',borderRadius:6,marginBottom:isLineCollapsed?0:2 }}>
                        <span style={{ fontSize:8,color:'#6070a0',transform:isLineCollapsed?'rotate(-90deg)':'rotate(0deg)',display:'inline-block',transition:'transform 0.2s' }}>▼</span>
                        <span style={{ fontSize:12,fontWeight:600,color:isLineCollapsed?'#555':'#a0a0c8',flex:1 }}>{line.label}</span>
                      </div>
                    )}

                    {!isLineCollapsed && line.sections.map(({key:sKey,display}) => {
                      if (hiddenSections.has(sKey)) return null
                      const colors = filterColors(COLORS[sKey]||[])
                      if (colors.length===0) return null
                      const accent = SECTION_ACCENTS[sKey]||'#f07030'
                      const isSecCollapsed = collapsed.has(sKey)
                      const ownedInSec = colors.filter(c=>checked[c.id]).length

                      return (
                        <div key={sKey} style={{ marginBottom:2, paddingLeft:showLine?36:16 }}>
                          <div onClick={()=>togSet(setCollapsed,sKey)} style={{ display:'flex',alignItems:'center',gap:7,padding:'4px 8px',cursor:'pointer',userSelect:'none',borderBottom:isSecCollapsed?'none':`1px solid ${accent}22`,marginBottom:isSecCollapsed?0:2 }}>
                            <span style={{ fontSize:8,color:accent,transform:isSecCollapsed?'rotate(-90deg)':'rotate(0deg)',display:'inline-block',transition:'transform 0.2s' }}>▼</span>
                            <span style={{ fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em',color:accent,flex:1 }}>{display}</span>
                            <span style={{ fontSize:10,color:'#444' }}>{ownedInSec}/{colors.length}</span>
                          </div>
                          {!isSecCollapsed && (
                            <div style={{ display:'flex',flexDirection:'column',gap:1 }}>
                              {colors.map(c=>(
                                <ColorRow key={c.id} color={c}
                                  isChecked={!!checked[c.id]} inMySet={!!mySet[c.id]}
                                  extraCount={extras[c.id]||0} targetCount={targets[c.id]||0}
                                  toggleOwned={toggleOwned} toggleMySet={toggleMySet}
                                  setExtraCount={setExtraCount} setTargetCount={setTargetCount}
                                />
                              ))}
                            </div>
                          )}
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
  )
}

const ROLE_COLORS = {
  L:{bg:'#1e2a38',color:'#90c0e8'},
  B:{bg:'#2a2010',color:'#c0a060'},
  S:{bg:'#101820',color:'#6090a8'},
}

function ColorRow({ color, isChecked, inMySet, extraCount, targetCount, toggleOwned, toggleMySet, setExtraCount, setTargetCount }) {
  const isLow=(isChecked&&targetCount>0&&extraCount<targetCount)||(!isChecked&&inMySet&&targetCount>0)
  const need=isChecked?Math.max(0,targetCount-extraCount):targetCount+1
  return (
    <div style={{ display:'flex',alignItems:'center',gap:6,padding:'5px 8px',borderRadius:5,background:isLow?'#2a1a00':isChecked?'#1a2a1a':inMySet?'#1e1a28':'transparent',border:isLow?'1px solid #805010':isChecked?'1px solid #2a4a2a':inMySet?'1px solid #3a2a4a':'1px solid transparent' }}>
      <button onClick={()=>toggleMySet(color.id)} style={{ width:14,height:14,borderRadius:3,border:'none',cursor:'pointer',flexShrink:0,background:inMySet?'#9060d0':'#2a2a3a',display:'flex',alignItems:'center',justifyContent:'center' }}>
        <span style={{ fontSize:7,color:inMySet?'#fff':'#444' }}>♦</span>
      </button>
      <button onClick={()=>toggleOwned(color.id)} style={{ width:14,height:14,borderRadius:3,border:'none',cursor:'pointer',flexShrink:0,background:isChecked?'#4caf50':'#2a2a3a',display:'flex',alignItems:'center',justifyContent:'center' }}>
        {isChecked&&<span style={{ color:'#fff',fontSize:9 }}>✓</span>}
      </button>
      {color.role&&(()=>{ const s=ROLE_COLORS[color.role]||{bg:'#2a2a2a',color:'#888'}; return <span style={{ fontSize:7,fontWeight:800,padding:'1px 3px',borderRadius:2,background:s.bg,color:s.color,flexShrink:0 }}>{color.role}</span> })()}
      <span style={{ fontSize:10,color:isChecked?'#6a8a6a':'#444',fontFamily:'monospace',minWidth:48,flexShrink:0 }}>{color.id}</span>
      <span style={{ fontSize:12,flex:1,minWidth:0,color:isLow?'#e0a040':isChecked?'#c8e8c8':inMySet?'#c0b0e0':'#bbb',fontWeight:isChecked?500:400,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{color.name}</span>
      {isLow&&<span style={{ fontSize:10,fontWeight:700,color:'#e0a040',flexShrink:0 }}>+{need}</span>}
      <div style={{ display:'flex',gap:2,flexShrink:0 }}>
        {[1,2,3,4,5].map(n=><button key={n} onClick={()=>setExtraCount(color.id,n)} style={{ width:8,height:8,borderRadius:'50%',border:'none',cursor:'pointer',padding:0,background:n<=extraCount?'#f07030':'#2a2a3a' }} />)}
      </div>
      <div style={{ display:'flex',gap:2,flexShrink:0,marginLeft:3,paddingLeft:3,borderLeft:'1px solid #2a2a3a' }}>
        {[1,2,3,4,5].map(n=><button key={n} onClick={()=>setTargetCount(color.id,n)} style={{ width:8,height:8,borderRadius:'50%',cursor:'pointer',padding:0,background:n<=targetCount?'#20a080':'transparent',border:`1px solid ${n<=targetCount?'#20a080':'#3a3a4a'}` }} />)}
      </div>
    </div>
  )
}
