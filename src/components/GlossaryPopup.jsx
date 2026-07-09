// GlossaryPopup — Paint Type Glossary
// Opened from the ? button next to "Type" in IrisMatch comparison panel.

const BRAND_CYAN = '#36E2DD'

const TYPES = [
  {
    heading: 'Standard paints',
    items: [
      { name:'Flat',    desc:'No shine when dry. Brands write "matt," "matte," or "flat" — all filed as flat.' },
      { name:'Satin',   desc:'Soft sheen between flat and gloss. "Semi-gloss" and "silk" are filed here.' },
      { name:'Gloss',   desc:'Fully shiny when dry.' },
    ],
    note: 'Flat, satin, and gloss aren\'t laboratory measurements — they\'re buckets along a continuous spectrum, and every manufacturer draws the lines differently. One brand\'s "matt" can dry shinier than another\'s "satin." Treat the type tag as a strong guide, not a promise. When sheen matters, a coat of varnish makes everything match anyway.',
  },
  {
    heading: 'Specialty paints',
    items: [
      { name:'Metallic',          desc:'Color comes from metal-flake or mica particles. The swatch shows the dominant tone, never the sparkle. Only another metallic is a fair comparison.' },
      { name:'Wash / Shade',      desc:'Very thin paint built to flow into recesses and shade, not cover. A wash that looks like your paint on screen gives a translucent puddle, not a coat. Washes only match other washes. "Shades" are filed here.' },
      { name:'One-coat',          desc:'Translucent by design — final color depends on the undercoat and pooling. Compared only with other one-coats. Examples: Contrast, Speedpaint, Xpress Color. Not the same as transparent color products, despite the nickname.' },
      { name:'Transparent color', desc:'Deliberately clear tinting paints and candy effects. Think Tamiya X-23 Clear Blue or Vallejo Transparent series.' },
      { name:'Ink',               desc:'Transparent, high-intensity pigment for glazing and tinting. Inks match inks.' },
      { name:'Glaze',             desc:'Diluted color applied over raised areas to gently shift hue. Thinner than ink, used for highlights rather than recesses. Glazes match glazes.' },
      { name:'Dry',               desc:'Heavily pigmented, fast-drying paint for drybrushing. Applied almost dry. Warhammer Colour (Citadel Colour) Dry range is the canonical example.' },
      { name:'Pigment',           desc:'Dry powder with no liquid vehicle. Mixed with medium or applied directly. Completely different application from liquid paints.' },
      { name:'FX',                desc:'Special effects — blood, rust, frost, corrosion. Texture and effect first, color second.' },
    ],
  },
  {
    heading: 'Non-color products',
    items: [
      { name:'Primer',    desc:'Surface preparation layer. Primers match only other primers, never standard colors. Also exists in metallic and contrast primer variants for specialized undercoating.' },
      { name:'Varnish',   desc:'Protective clear coat. Available in flat, satin, and gloss. Does not appear in color matching.' },
      { name:'Auxiliary', desc:'Thinners, flow improvers, mediums. No color. Does not appear in color matching.' },
    ],
  },
]

export default function GlossaryPopup({ onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position:'fixed', inset:0, zIndex:1300,
        background:'rgba(0,0,0,0.7)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontFamily:"'Montserrat',system-ui,sans-serif",
        padding:20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background:'#1E2428', border:'1px solid #2a3535', borderRadius:12,
          width:'100%', maxWidth:460, maxHeight:'85vh',
          overflowY:'auto', padding:'20px 20px 24px',
          color:'#e8e8e8',
        }}
      >
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:'#e8e8e8', marginBottom:3 }}>Paint Types</div>
            <div style={{ fontSize:11, color:'#4a6060', lineHeight:1.5 }}>
              How PaintForge classifies paint. One vocabulary across all brands.
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background:'none', border:'none', color:'#4a6060', fontSize:18, cursor:'pointer', flexShrink:0, padding:'0 4px' }}
          >✕</button>
        </div>

        {TYPES.map((section, si) => (
          <div key={si} style={{ marginBottom:20 }}>
            <div style={{
              fontSize:9, color:'#4a6060', textTransform:'uppercase',
              letterSpacing:'0.1em', fontWeight:700, marginBottom:8,
              paddingBottom:4, borderBottom:'1px solid #1a2428',
            }}>
              {section.heading}
            </div>

            {section.items.map((item, ii) => (
              <div key={ii} style={{ display:'flex', gap:10, padding:'5px 0', borderBottom:'1px solid #141a1a' }}>
                <div style={{
                  minWidth:110, flexShrink:0,
                  fontSize:11, fontWeight:600, color: BRAND_CYAN,
                  paddingTop:1,
                }}>
                  {item.name}
                </div>
                <div style={{ fontSize:11, color:'#8AABAB', lineHeight:1.6 }}>
                  {item.desc}
                </div>
              </div>
            ))}

            {section.note && (
              <div style={{
                marginTop:8, padding:'8px 10px',
                background:'#141414', borderRadius:6,
                fontSize:10, color:'#5a7070', lineHeight:1.6,
                borderLeft:`2px solid ${BRAND_CYAN}30`,
              }}>
                {section.note}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
