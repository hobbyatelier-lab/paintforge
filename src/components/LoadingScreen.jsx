// ── LoadingScreen — branded splash for both load moments ──────────
// Use for (1) the pre-auth blink and (2) the post-auth → Anvil load.
// Drop-in: render <LoadingScreen/> wherever the spinner/hammers were.
// Assumes the canonical logo.svg is served at /logo.svg.

export default function LoadingScreen({ label = '' }) {
  return (
    <div style={{
      position:'fixed', inset:0, background:'#141414',
      display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', gap:18, zIndex:9999,
    }}>
      <img src="/logo.svg" alt="PaintForge" style={{
        width:96, height:'auto',
        animation:'pf-breathe 1.6s ease-in-out infinite',
      }}/>
      <div style={{ fontSize:13, letterSpacing:'0.18em', fontWeight:700, color:'#2a4545' }}>
        <span style={{ color:'#8AABAB' }}>PAINT</span>FORGE
      </div>
      {label && <div style={{ fontSize:10, color:'#3a5050' }}>{label}</div>}
      <style>{`@keyframes pf-breathe {
        0%,100% { opacity:.55; transform:scale(.97); }
        50%     { opacity:1;   transform:scale(1); }
      }`}</style>
    </div>
  )
}
// Pre-auth:  <LoadingScreen/>
// Post-auth: <LoadingScreen label="heating the forge…"/>
