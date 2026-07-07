import { useState, useEffect, useCallback, useRef, memo } from 'react'
import logoUrl from '../assets/logo.svg'
import { supabase } from '../supabase.js'
import { COLORS, SECTION_LABELS, SECTION_ACCENTS, TAXONOMY } from '../data/paints.js'
import BrandFilter from './BrandFilter.jsx'
import HowToUse from './HowToUse.jsx'



// ── Responsive window width ───────────────────────────────────────────────────
function useWindowWidth() {
  const [w, setW] = useState(window.innerWidth)
  useEffect(() => {
    const h = () => setW(window.innerWidth)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return w
}

// ── Display code + name extraction ───────────────────────────────────────────
function getDisplayCode(id, name) {
  const tam = (name||'').match(/^(XF?-\d+)\s/)
  if (tam) return tam[1]
  if (/^\d{2,3}\.\d{3}$/.test(id)) return id                     // Vallejo: 72.034
  if (/^AK\d{4,}$/.test(id)) return id                           // AK: AK11001
  const indNum = id.match(/^(?:IND_|IP)(\d+)$/)
  if (indNum) return indNum[1]                                     // Indart: IND_01→01, IP00→00
  if (/^IA\d+$/.test(id)) return null                             // Indart aux: IA01 → blank
  if (/^[A-Z]{1,3}\d{1,4}$/.test(id) && id.length<=6) return id  // Mr Hobby: C1, GX8
  return null
}
function getDisplayName(id, name) {
  return (name||'').replace(/^XF?-\d+\s+/, '')
}
// ── Brand & UI hierarchy tokens ───────────────────────────────────────────────
const BRAND_CYAN   = '#36E2DD'   // Primary brand color
const BG_APP       = '#141414'   // App background
const BG_HEADER    = '#171B1B'   // Sticky header background
const HIER_BRAND   = '#36E2DD'   // Brand headers — brightest, identity level
const HIER_LINE    = '#E8A838'   // Line headers — amber/gold, warm forge energy
const HIER_SECTION = '#9B8FD0'   // Section headers — soft violet, clearly tertiary



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
  const [searchRaw,       setSearchRaw]       = useState('')
  const [search,          setSearch]          = useState('')
  const [hiddenSections,  setHiddenSections]  = useState(new Set())
  const [showBrandFilter, setShowBrandFilter] = useState(false)
  const [showHowToUse,    setShowHowToUse]    = useState(false)
  const winW      = useWindowWidth()
  const isDesktop = winW > 900
  const [seenHowToUse,    setSeenHowToUse]    = useState(true)  // true = don't auto-show
  const [showExport,      setShowExport]      = useState(false)
  const [exportText,      setExportText]      = useState('')
  const [exportTitle,     setExportTitle]     = useState('')
  const prefSaveRef = useRef(null)

  // ── Load everything ───────────────────────────────────────────────────────
  useEffect(() => {
    // Paginate through user_paints — Supabase caps at 1000 rows per trip
    async function fetchAllUserPaints(userId) {
      const PAGE = 1000
      let rows = [], from = 0, keepGoing = true
      while (keepGoing) {
        const { data, error } = await supabase
          .from('user_paints').select('*')
          .eq('user_id', userId)
          .range(from, from + PAGE - 1)
        if (error || !data) break
        rows = [...rows, ...data]
        keepGoing = data.length === PAGE
        from += PAGE
      }
      return { data: rows }
    }

    async function load() {
      const [paintsRes, prefsRes] = await Promise.all([
        fetchAllUserPaints(user.id),
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
        const hasSeen = p.seen_how_to_use === true
        setSeenHowToUse(hasSeen)
        if (p.active_filter) setFilter(p.active_filter)
      } else {
        setSeenHowToUse(false) // first time user — auto-show fires via useEffect
      }
      setLoaded(true)
    }
    load()
  }, [user.id])

  // ── Toggle How To Use startup preference — same pattern as hiddenSections
  // ── Debounce search input 300ms ──────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchRaw), 300)
    return () => clearTimeout(t)
  }, [searchRaw])

  // Auto-show on startup — fires ONCE when load completes, never again
  useEffect(() => {
    if (loaded && !seenHowToUse) setShowHowToUse(true)
  }, [loaded])  // only [loaded] — seenHowToUse NOT in deps, so checkbox never re-triggers this

  // seenHowToUse changes → debounced save picks it up, exactly like hiddenSections
  const saveHowToUsePreference = (value) => setSeenHowToUse(value)

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
        seen_how_to_use:   seenHowToUse,
        active_filter:     filter,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
    }, 600)
  }, [hiddenSections, brandCollapsed, lineCollapsed, collapsed, seenHowToUse, filter, loaded, user.id])

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

  const handleExport    = () => exportOwned()
  const handleShopList  = () => exportShoppingList()

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

  // ── Stats — only count sections currently visible (not hidden by brand filter) ──
  const visibleKeys   = Object.keys(COLORS).filter(k => !hiddenSections.has(k))
  const visiblePaints = visibleKeys.flatMap(k => COLORS[k] || [])
  const ownedCount = visiblePaints.filter(c=>checked[c.id]).length
  const total      = visiblePaints.length
  const pct        = total>0 ? Math.round(ownedCount/total*100) : 0
  const setTracked = visiblePaints.filter(c=>mySet[c.id])
  const setOwned   = setTracked.filter(c=>checked[c.id]).length
  const setPct     = setTracked.length>0 ? Math.round(setOwned/setTracked.length*100) : 0

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
    <div style={{ background:BG_APP,minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center' }}>
      <div style={{ textAlign:'center',color:'#555',fontFamily:'system-ui' }}>
        <img src={logoUrl} alt="PaintForge" style={{ width:72,height:72,marginBottom:12,opacity:0.7 }} />
        <p style={{ fontSize:14 }}>Loading your collection…</p>
      </div>
    </div>
  )

  return (
    <div style={{ background:BG_APP,minHeight:'100vh',fontFamily:"'Montserrat',system-ui,sans-serif",color:'#e8e8e8' }}>

      {showBrandFilter && <BrandFilter hiddenSections={hiddenSections} setHiddenSections={setHiddenSections} onClose={()=>setShowBrandFilter(false)} />}
      {showHowToUse   && <HowToUse onClose={()=>setShowHowToUse(false)} dontShow={seenHowToUse} onDontShowChange={saveHowToUsePreference} />}

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
      <div style={{ background:BG_HEADER,borderBottom:'1px solid #222C2C',padding:isDesktop?'12px 32px':'12px 16px',position:'sticky',top:0,zIndex:10 }}>
        <div style={{ maxWidth:isDesktop?980:700,margin:'0 auto' }}>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10 }}>
            <div style={{ display:'flex',alignItems:'center',gap:8 }}>
              <img src={logoUrl} alt="" style={{ width:28,height:28,flexShrink:0 }} />
              <span style={{ fontSize:17,fontWeight:800,letterSpacing:'-0.02em' }}>
                <span style={{ color:BRAND_CYAN }}>Paint</span>
                <span style={{ color:'#8AABAB' }}>forge</span>
              </span>
              {saving&&<span style={{ fontSize:10,color:'#555' }}>saving…</span>}
            </div>
            <div style={{ display:'flex',alignItems:'center',gap:6 }}>
              <button onClick={()=>setShowHowToUse(true)} style={{ background:'none',border:'none',cursor:'pointer',fontSize:9,color:HIER_SECTION,fontFamily:'inherit',letterSpacing:'0.08em',textTransform:'uppercase',opacity:0.7,padding:'2px 4px' }}>How to use</button>
              <span style={{ fontSize:11,color:'#444' }}>{user.email.split('@')[0]}</span>
              <button onClick={handleSignOut} style={{ padding:'3px 8px',borderRadius:6,border:'1px solid #3a3a4a',background:'transparent',color:'#666',fontSize:11,cursor:'pointer' }}>out</button>
            </div>
          </div>

          <div style={{ display:'flex',gap:10,marginBottom:8,alignItems:'center' }}>
            {/* My Set bar — LEFT, purple (most important) */}
            <div style={{ flex:1 }}>
              <div style={{ display:'flex',justifyContent:'space-between',marginBottom:2 }}>
                <span style={{ fontSize:9,color:'#7A9898',textTransform:'uppercase',letterSpacing:'0.07em' }}>My Set ♦</span>
                <span style={{ fontSize:10,color:'#aaa' }}><span style={{ color:'#9060d0',fontWeight:600 }}>{setOwned}</span><span style={{ color:'#444' }}>/{setTracked.length}</span><span style={{ color:'#8AABAB' }}> {setPct}%</span></span>
              </div>
              <div style={{ height:3,background:'#2A1E38',borderRadius:2,overflow:'hidden' }}>
                <div style={{ width:`${setPct}%`,height:'100%',background:'linear-gradient(90deg,#9060d0,#6840b0)',borderRadius:2,transition:'width 0.3s' }} />
              </div>
            </div>
            {/* Divider */}
            <div style={{ width:1,height:28,background:'#222' }} />
            {/* Collection bar — RIGHT, teal */}
            <div style={{ flex:1 }}>
              <div style={{ display:'flex',justifyContent:'space-between',marginBottom:2 }}>
                <span style={{ fontSize:9,color:'#7A9898',textTransform:'uppercase',letterSpacing:'0.07em' }}>Collection</span>
                <span style={{ fontSize:10,color:'#aaa' }}><span style={{ color:'#36E2DD',fontWeight:600 }}>{ownedCount}</span><span style={{ color:'#444' }}>/{total}</span><span style={{ color:'#8AABAB' }}> {pct}%</span></span>
              </div>
              <div style={{ height:3,background:'#162828',borderRadius:2,overflow:'hidden' }}>
                <div style={{ width:`${pct}%`,height:'100%',background:`linear-gradient(90deg,${BRAND_CYAN},#2BABA8)`,borderRadius:2,transition:'width 0.3s' }} />
              </div>
            </div>
          </div>

          <input value={searchRaw} onChange={e=>setSearchRaw(e.target.value)} placeholder="Search… (names or codes)"
            style={{ width:'100%',padding:'6px 12px',borderRadius:8,marginBottom:7,background:'#0F1818',border:'1px solid #2A3A3A',color:'#e8e8e8',fontSize:13,outline:'none',boxSizing:'border-box' }} />

          {/* Row 1: tools — Shop (orange!), Export, Brand Filter */}
          <div style={{ display:'flex',gap:5,marginBottom:4 }}>
            <button onClick={handleShopList} style={{ padding:'3px 10px',borderRadius:20,border:'2px solid #FF6B00',cursor:'pointer',fontSize:11,fontWeight:700,background:'transparent',color:'#FF6B00' }}>Shop 🛒</button>
            <button onClick={handleExport} style={{ padding:'3px 10px',borderRadius:20,border:'none',cursor:'pointer',fontSize:11,fontWeight:600,background:'#1E2828',color:'#888' }}>Export</button>
            <button onClick={()=>setShowBrandFilter(true)} style={{ padding:'3px 10px',borderRadius:20,cursor:'pointer',fontSize:11,fontWeight:600,border:hiddenSections.size>0?`1px solid ${BRAND_CYAN}`:'1px solid #2A3A3A',background:hiddenSections.size>0?'#0A1E1E':'transparent',color:hiddenSections.size>0?BRAND_CYAN:'#6B8080' }}>Brand Filter{hiddenSections.size>0?` (${hiddenSections.size})`:''}</button>
          </div>
          {/* Row 2: primary content filters */}
          <div style={{ display:'flex',gap:4,marginBottom:4 }}>
            {FILTERS.slice(0,3).map(([val,label])=>(
              <button key={val} onClick={()=>setFilter(val)} style={{ padding:'3px 8px',borderRadius:20,border:'none',cursor:'pointer',fontSize:10,fontWeight:600,background:filter===val?BRAND_CYAN:'#1E2828',color:filter===val?'#0A1414':'#888' }}>{label}</button>
            ))}
          </div>
          {/* Row 3: secondary filters */}
          <div style={{ display:'flex',gap:4,marginBottom:4 }}>
            {FILTERS.slice(3).map(([val,label])=>(
              <button key={val} onClick={()=>setFilter(val)} style={{ padding:'3px 8px',borderRadius:20,border:'none',cursor:'pointer',fontSize:10,fontWeight:600,background:filter===val?BRAND_CYAN:'#1E2828',color:filter===val?'#0A1414':'#888' }}>{label}</button>
            ))}
          </div>

        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth:isDesktop?980:700,margin:'0 auto',padding:isDesktop?'16px 32px 80px':'12px 16px 60px' }}>
        {TAXONOMY.map(brand => {
          const brandKeys = brand.lines.flatMap(l => l.sections.map(s => s.key))
          if (!brandKeys.some(k => !hiddenSections.has(k))) return null
          const isBrandCollapsed = brandCollapsed.has(brand.id)
          const bPaints    = brandKeys.filter(k=>!hiddenSections.has(k)).flatMap(k=>COLORS[k]||[])
          const bOwned     = bPaints.filter(c=>checked[c.id]).length
          const bMissing   = bPaints.length - bOwned
          const bInSet     = bPaints.filter(c=>mySet[c.id])
          const bSetOwned  = bInSet.filter(c=>checked[c.id]).length
          const bSetMissing= bInSet.length - bSetOwned

          return (
            <div key={brand.id} style={{ marginBottom:8 }}>
              <div onClick={()=>togSet(setBrandCollapsed, brand.id)} style={{ display:'flex',alignItems:'center',gap:8,padding:'8px 10px',background:BG_HEADER,borderRadius:8,cursor:'pointer',userSelect:'none',border:`1px solid ${HIER_BRAND}22`,marginBottom:isBrandCollapsed?0:4 }}>
                <span style={{ fontSize:9,color:HIER_BRAND,transform:isBrandCollapsed?'rotate(-90deg)':'rotate(0deg)',display:'inline-block',transition:'transform 0.2s' }}>▼</span>
                <span style={{ fontSize:isDesktop?15:13,fontWeight:800,color:HIER_BRAND,textTransform:'uppercase',letterSpacing:'0.08em',flex:1 }}>{brand.label}</span>
                <span style={{ fontSize:9,whiteSpace:'nowrap',display:'flex',gap:5,alignItems:'center' }}>
                  <span style={{color:'#9060d0',fontWeight:700,fontSize:10}}>♦</span>
                  <span><span style={{color:'#9060d0',fontWeight:600}}>{bSetOwned}</span><span style={{color:'#9060d0',opacity:0.7}}>/{bInSet.length}</span>{bSetMissing>0&&<span style={{color:'#E8A838'}}> ({bSetMissing})</span>}</span>
                  <span style={{color:'#2A3535'}}>·</span>
                  <span><span style={{color:'#36E2DD',fontWeight:600}}>{bOwned}</span><span style={{color:'#36E2DD',opacity:0.7}}>/{bPaints.length}</span>{bMissing>0&&<span style={{color:'#E8A838'}}> ({bMissing})</span>}</span>
                </span>
              </div>

              {!isBrandCollapsed && brand.lines.map(line => {
                const lineKeys = line.sections.map(s => s.key)
                if (!lineKeys.some(k => !hiddenSections.has(k))) return null
                const isLineCollapsed = lineCollapsed.has(line.id)
                const showLine = brand.lines.length > 1
                const lPaints    = lineKeys.filter(k=>!hiddenSections.has(k)).flatMap(k=>COLORS[k]||[])
                const lOwned     = lPaints.filter(c=>checked[c.id]).length
                const lMissing   = lPaints.length - lOwned
                const lInSet     = lPaints.filter(c=>mySet[c.id])
                const lSetOwned  = lInSet.filter(c=>checked[c.id]).length
                const lSetMissing= lInSet.length - lSetOwned

                return (
                  <div key={line.id} style={{ marginBottom:4 }}>
                    {showLine && (
                      <div onClick={()=>togSet(setLineCollapsed, line.id)} style={{ display:'flex',alignItems:'center',gap:7,padding:'4px 6px',cursor:'pointer',userSelect:'none',borderRadius:6,marginBottom:isLineCollapsed?0:2 }}>
                        <span style={{ fontSize:8,color:HIER_LINE,transform:isLineCollapsed?'rotate(-90deg)':'rotate(0deg)',display:'inline-block',transition:'transform 0.2s' }}>▼</span>
                        <span style={{ fontSize:isDesktop?14:12,fontWeight:600,color:isLineCollapsed?'#6B5A1A':HIER_LINE,flex:1 }}>{line.label}</span>
                        <span style={{ fontSize:9,whiteSpace:'nowrap',display:'flex',gap:4,alignItems:'center' }}>
                          <span style={{color:'#9060d0',fontWeight:700,fontSize:10}}>♦</span>
                          <span><span style={{color:'#9060d0',fontWeight:600}}>{lSetOwned}</span><span style={{color:'#9060d0',opacity:0.7}}>/{lInSet.length}</span>{lSetMissing>0&&<span style={{color:'#E8A838'}}> ({lSetMissing})</span>}</span>
                          <span style={{color:'#2A3535'}}>·</span>
                          <span><span style={{color:'#36E2DD',fontWeight:600}}>{lOwned}</span><span style={{color:'#36E2DD',opacity:0.7}}>/{lPaints.length}</span>{lMissing>0&&<span style={{color:'#E8A838'}}> ({lMissing})</span>}</span>
                        </span>
                      </div>
                    )}

                    {!isLineCollapsed && line.sections.map(({key:sKey,display}) => {
                      if (hiddenSections.has(sKey)) return null
                      const colors = filterColors(COLORS[sKey]||[])
                      if (colors.length===0) return null
                      const accent = SECTION_ACCENTS[sKey]||'#f07030'
                      const isSecCollapsed = collapsed.has(sKey)
                      const rawPaints   = COLORS[sKey]||[]
                      const sOwned      = rawPaints.filter(c=>checked[c.id]).length
                      const sMissing    = rawPaints.length - sOwned
                      const sInSet      = rawPaints.filter(c=>mySet[c.id])
                      const sSetOwned   = sInSet.filter(c=>checked[c.id]).length
                      const sSetMissing = sInSet.length - sSetOwned

                      return (
                        <div key={sKey} style={{ marginBottom:2, paddingLeft:showLine?12:4 }}>
                          <div onClick={()=>togSet(setCollapsed,sKey)} style={{ display:'flex',alignItems:'center',gap:7,padding:'4px 8px',cursor:'pointer',userSelect:'none',borderBottom:isSecCollapsed?'none':`1px solid ${HIER_SECTION}25`,marginBottom:isSecCollapsed?0:2 }}>
                            <span style={{ fontSize:8,color:HIER_SECTION,transform:isSecCollapsed?'rotate(-90deg)':'rotate(0deg)',display:'inline-block',transition:'transform 0.2s' }}>▼</span>
                            <span style={{ fontSize:isDesktop?13:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em',color:HIER_SECTION,flex:1 }}>{display}</span>
                            <span style={{ fontSize:9,whiteSpace:'nowrap',display:'flex',gap:4,alignItems:'center' }}>
                              <span style={{color:'#9060d0',fontWeight:700,fontSize:10}}>♦</span>
                              <span><span style={{color:'#9060d0',fontWeight:600}}>{sSetOwned}</span><span style={{color:'#9060d0',opacity:0.7}}>/{sInSet.length}</span>{sSetMissing>0&&<span style={{color:'#E8A838'}}> ({sSetMissing})</span>}</span>
                              <span style={{color:'#2A3535'}}>·</span>
                              <span><span style={{color:'#36E2DD',fontWeight:600}}>{sOwned}</span><span style={{color:'#36E2DD',opacity:0.7}}>/{rawPaints.length}</span>{sMissing>0&&<span style={{color:'#E8A838'}}> ({sMissing})</span>}</span>
                            </span>
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

      {/* Footer */}
      <div style={{ textAlign:'center', padding:'12px 20px 20px', color:'#444', fontSize:11, fontFamily:"'Montserrat',system-ui,sans-serif" }}>
        © {new Date().getFullYear()} Hobby Atelier · PaintForge
      </div>
    </div>
  )
}

const ROLE_COLORS = {
  L:{bg:'#1e2a38',color:'#90c0e8'},
  B:{bg:'#2a2010',color:'#c0a060'},
  S:{bg:'#101820',color:'#6090a8'},
}

const ColorRow = memo(function ColorRow({ color, isChecked, inMySet, extraCount, targetCount, toggleOwned, toggleMySet, setExtraCount, setTargetCount }) {
  const isLow=(isChecked&&targetCount>0&&extraCount<targetCount)||(!isChecked&&inMySet&&targetCount>0)
  const need=isChecked?Math.max(0,targetCount-extraCount):targetCount+1
  const dispCode = getDisplayCode(color.id, color.name)
  const dispName = getDisplayName(color.id, color.name)

  // Swatch style — refined double ring, white outer, solid or dashed for approx
  const swatchSize = 18
  const outerBorder = color.approx
    ? '1.5px dashed rgba(255,255,255,0.7)'
    : color.hex
      ? '1.5px solid rgba(255,255,255,0.85)'
      : '1.5px solid #3a3a4a'

  // Battery pill builder — bordered with group outline
  const Pips = ({count, activeColor, isExtras}) => (
    <div style={{ display:'flex',gap:2,flexShrink:0,alignItems:'center',border:'1px solid #2A3535',borderRadius:4,padding:'2px 3px' }}>
      {[1,2,3,4,5].map(n=>(
        <button key={n}
          onClick={()=>{ isExtras ? setExtraCount(color.id,n) : setTargetCount(color.id,n) }}
          style={{ width:5,height:12,borderRadius:2,border:`1px solid ${n<=count?activeColor:'#333'}`,cursor:'pointer',padding:0,flexShrink:0,background:n<=count?activeColor:'transparent' }}
        />
      ))}
    </div>
  )

  return (
    <div style={{
      display:'flex', alignItems:'center', gap:4, padding:'4px 6px', borderRadius:5,
      background:isLow?'#2a1a00':isChecked?'#1a2a1a':inMySet?'#1e1a28':'transparent',
      border:isLow?'1px solid #805010':isChecked?'1px solid #2a4a2a':inMySet?'1px solid #3a2a4a':'1px solid transparent',
    }}>

      {/* ♦ My Set button */}
      <button onClick={()=>toggleMySet(color.id)} style={{ width:15,height:15,borderRadius:3,border:'none',cursor:'pointer',flexShrink:0,background:inMySet?'#9060d0':'#1e1e2e',display:'flex',alignItems:'center',justifyContent:'center' }}>
        <span style={{ fontSize:8,color:inMySet?'#fff':'#333' }}>♦</span>
      </button>

      {/* ✓ Owned button */}
      <button onClick={()=>toggleOwned(color.id)} style={{ width:15,height:15,borderRadius:3,border:'none',cursor:'pointer',flexShrink:0,background:isChecked?'#4caf50':'#1e1e2e',display:'flex',alignItems:'center',justifyContent:'center' }}>
        {isChecked&&<span style={{ color:'#fff',fontSize:9 }}>✓</span>}
      </button>

      {/* Hex swatch — refined double-ring, bigger, white border */}
      <div style={{
        width:swatchSize, height:swatchSize, borderRadius:'50%', flexShrink:0,
        background: color.hex || '#1a1a1a',
        border: outerBorder,
        boxShadow: color.hex
          ? `inset 0 0 0 2px rgba(0,0,0,0.45), inset 0 0 0 3.5px ${color.hex}`
          : 'none',
        display:'flex', alignItems:'center', justifyContent:'center',
        cursor:'default',
      }} title={color.approx ? `~${color.hex} (approx)` : color.hex || 'No color data'}>
        {!color.hex && <span style={{ fontSize:7,color:color.approx?'#8AABAB':'#555',lineHeight:1 }}>{color.approx?'~':'?'}</span>}
      </div>

      {/* Display code — manufacturer code only, fixed width */}
      <span style={{
        fontSize:10, color:'#4a6060', fontFamily:'monospace',
        width:44, flexShrink:0, overflow:'hidden',
        display: dispCode ? 'block' : 'none',
      }}>{dispCode||''}</span>

      {/* Name — condensed font, gets all remaining space */}
      <span style={{
        fontFamily:"'Barlow Condensed','Montserrat',system-ui",
        fontSize:15, fontWeight: isChecked?500:400,
        flex:1, minWidth:0,
        color:isLow?'#e0a040':isChecked?'#c8e8c8':inMySet?'#c0b0e0':'#bbb',
        overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
      }}>{dispName}</span>

      {/* Low stock badge */}
      {isLow&&<span style={{ fontSize:9,fontWeight:700,color:'#e0a040',flexShrink:0 }}>+{need}</span>}

      {/* Battery pips — owned extras (orange) */}
      <Pips count={extraCount} activeColor='#f07030' isExtras={true} />

      {/* Gap between groups */}
      <div style={{ width:5, flexShrink:0 }} />

      {/* Battery pips — target (teal) */}
      <Pips count={targetCount} activeColor='#20a080' isExtras={false} />
    </div>
  )
}, (prev, next) =>
  prev.color.id    === next.color.id    &&
  prev.isChecked   === next.isChecked   &&
  prev.inMySet     === next.inMySet     &&
  prev.extraCount  === next.extraCount  &&
  prev.targetCount === next.targetCount
)
