// ── provenance.jsx — PaintForge hex-sampling provenance ────────────
// Place next to the other components (adjust import paths if your
// data modules live in src/data — this one is component+data hybrid).
//
// Cyan anvil = hex sampled by PaintForge from the manufacturer's
// digital chips. Unmarked = open-source dataset (Miniature Painter
// Pro — credited in About). Launch implementation: section-level set
// (sampling is section-complete per the July 10 sampling record).
// Durable post-launch path: hex_source column in Supabase.

export const SAMPLED_SECTIONS = new Set([
  // Tamiya Color Spray (July 10)
  'tamiyaSpray',
  // Tamiya Color Enamel Paint — all sub-sections
  'tamiyaEnamelFlat', 'tamiyaEnamelGloss', 'tamiyaEnamelMetallic',
  'tamiyaEnamelSatin', 'tamiyaEnamelAux',
  // Tamiya Color Acrylic Paint Mini — all sub-sections
  'tamiyaAcrylicFlat', 'tamiyaAcrylicGloss', 'tamiyaAcrylicMetallic',
  'tamiyaAcrylicSatin', 'tamiyaAcrylicClear', 'tamiyaAcrylicAux',
  // Tamiya other lines
  'tamiyaPolycarbSpray',   // was 'tamiyaPolycarbonate' — corrected
  'tamiyaPaintMarkers',    // was 'tamiyaMarkers' — corrected
  'tamiyaWeatheringStick',
  // Vallejo TMM (all three tiers) + Mecha Color full range
  'tmmLight', 'tmmBase', 'tmmShade',
  'mechaColor', 'mechaFluo', 'mechaPrimer',
  'mechaMetallic', 'mechaWeathering',
  // Warhammer Colour (Citadel Colour)
  'citadelContrast', 'citadelShade',
])

// Partial-section stragglers, id-level:
export const SAMPLED_IDS = new Set([
  // 2 discontinued Shades sampled July 8 — ids confirmed correct
  'CIT_SH_Coelia_Greenshade', 'CIT_SH_Seraphim_Sepia',
])

export const isPaintForgeSampled = (p) =>
  !!p && !!p.hex && (SAMPLED_SECTIONS.has(p.section_key) || SAMPLED_IDS.has(p.id))

export const SAMPLED_TOOLTIP =
  "Sampled by PaintForge from the manufacturer's digital chips."

// ── AnvilBadge — 12px cyan anvil on a dark disc ───────────────────
// Generic anvil silhouette; swap the path for the logo.svg anvil if
// you want pixel-identical branding.
export function AnvilBadge({ size = 16, inline = false }) {
  return (
    <span
      title={SAMPLED_TOOLTIP}
      style={{
        ...(inline
          ? { display:'inline-flex', verticalAlign:'-2px', marginRight:5 }
          : { display:'flex', position:'absolute', right:-2, bottom:-2 }),
        width: size, height: size, borderRadius: '50%',
        background: '#0A1414', border: '1px solid #36E2DD55',
        alignItems: 'center', justifyContent: 'center',
        lineHeight: 0, zIndex: 1,
      }}
    >
      <svg viewBox="0 0 24 24" width={size - 5} height={size - 5} fill="#36E2DD" aria-hidden="true">
        <path d="M22 4v5h-7l1.5 4.5h-9L9 9H5.5C3.5 9 2 7.5 2 5.5V4h20zM8.5 15.5h7l2.5 4h-12l2.5-4z" />
      </svg>
    </span>
  )
}
