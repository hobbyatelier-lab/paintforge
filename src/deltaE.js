// ============================================================
//  PaintForge — Color Engine
//  deltaE.js — hexToLab + ΔE2000 (Sharma 2005 port) + rankSubstitutes
//
//  Do NOT replace this with an npm package.
//  Implementation validated against Sharma 34-pair test set.
// ============================================================

// ── Hex → CIE LAB (D65 illuminant) ──────────────────────────────
export function hexToLab(hex) {
  const n = parseInt(hex.slice(1), 16)
  let [r, g, b] = [(n>>16)&255, (n>>8)&255, n&255].map(v => v/255)
  const lin = c => c <= 0.04045 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4)
  ;[r, g, b] = [lin(r), lin(g), lin(b)]
  const X = r*0.4124564 + g*0.3575761 + b*0.1804375
  const Y = r*0.2126729 + g*0.7151522 + b*0.0721750
  const Z = r*0.0193339 + g*0.1191920 + b*0.9503041
  const f = t => t > 0.008856 ? Math.cbrt(t) : 7.787*t + 16/116
  const [fx, fy, fz] = [f(X/0.95047), f(Y), f(Z/1.08883)]
  return { L: 116*fy-16, a: 500*(fx-fy), b: 200*(fy-fz) }
}

// ── CIEDE2000 (Sharma et al. 2005) ──────────────────────────────
// Validated against the 34-pair test dataset to 4 decimal places.
export function deltaE2000(lab1, lab2) {
  const { L: L1, a: a1, b: b1 } = lab1
  const { L: L2, a: a2, b: b2 } = lab2
  const rad = d => d * Math.PI / 180

  // Step 1 — a' adjustment
  const C1ab = Math.sqrt(a1*a1 + b1*b1)
  const C2ab = Math.sqrt(a2*a2 + b2*b2)
  const Cabbar = (C1ab + C2ab) / 2
  const Cab7  = Math.pow(Cabbar, 7)
  const g = 0.5 * (1 - Math.sqrt(Cab7 / (Cab7 + 6103515625))) // 25^7 = 6103515625
  const a1p = a1 * (1 + g)
  const a2p = a2 * (1 + g)

  // Step 2 — C' and h'
  const C1p = Math.sqrt(a1p*a1p + b1*b1)
  const C2p = Math.sqrt(a2p*a2p + b2*b2)

  const hp = (a, b) => {
    if (a === 0 && b === 0) return 0
    const h = Math.atan2(b, a) * 180 / Math.PI
    return h < 0 ? h + 360 : h
  }
  const h1p = hp(a1p, b1)
  const h2p = hp(a2p, b2)

  // Step 3 — delta L', delta C', delta h', delta H'
  const dLp = L2 - L1
  const dCp = C2p - C1p

  let dhp = 0
  if (C1p * C2p !== 0) {
    const diff = h2p - h1p
    if      (Math.abs(diff) <= 180) dhp = diff
    else if (diff > 180)            dhp = diff - 360
    else                            dhp = diff + 360
  }
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(rad(dhp / 2))

  // Step 4 — CIEDE2000
  const Lbarp = (L1 + L2) / 2
  const Cbarp = (C1p + C2p) / 2

  let Hbarp
  if (C1p * C2p === 0) {
    Hbarp = h1p + h2p
  } else if (Math.abs(h1p - h2p) <= 180) {
    Hbarp = (h1p + h2p) / 2
  } else if (h1p + h2p < 360) {
    Hbarp = (h1p + h2p + 360) / 2
  } else {
    Hbarp = (h1p + h2p - 360) / 2
  }

  const T = 1
    - 0.17 * Math.cos(rad(Hbarp - 30))
    + 0.24 * Math.cos(rad(2 * Hbarp))
    + 0.32 * Math.cos(rad(3 * Hbarp + 6))
    - 0.20 * Math.cos(rad(4 * Hbarp - 63))

  const SL = 1 + 0.015 * Math.pow(Lbarp - 50, 2) / Math.sqrt(20 + Math.pow(Lbarp - 50, 2))
  const SC = 1 + 0.045 * Cbarp
  const SH = 1 + 0.015 * Cbarp * T

  const dTheta  = 30 * Math.exp(-Math.pow((Hbarp - 275) / 25, 2))
  const Cbar7p  = Math.pow(Cbarp, 7)
  const RC      = 2 * Math.sqrt(Cbar7p / (Cbar7p + 6103515625))
  const RT      = -Math.sin(rad(2 * dTheta)) * RC

  return Math.sqrt(
    Math.pow(dLp / SL, 2) +
    Math.pow(dCp / SC, 2) +
    Math.pow(dHp / SH, 2) +
    RT * (dCp / SC) * (dHp / SH)
  )
}

// ── rankSubstitutes ──────────────────────────────────────────────
// Pure client-side. Runs over in-memory catalog, < 10ms @ 6-7k rows.
//
// targetPaint  — full paint object from catalog (must have lab_l/a/b)
// tier         — 'owned' | 'myset' | 'brands' | 'all'
// finishExpand — bool: expand to flat↔satin↔gloss sheen trio
// userPaints   — map of paint_id → { owned, in_my_set }
// catalog      — full paintsBySection flattened to array
// brandFilter  — Set of section_keys currently hidden (brand filter state)
//
// Returns array of { paint, deltaE, grade, chips } sorted by deltaE asc.

const SHEEN_TRIO      = new Set(['flat', 'satin', 'gloss'])
const EXCLUDED_TYPES  = new Set([
  'auxiliary','colorshift','pigment',  // never color-matchable
  'varnish','satin_varnish',           // protective coats
  // primers are NOT excluded — a primer matches other primers via the finish rule
])

export function rankSubstitutes(targetPaint, { tier, finishExpand, userPaints, catalog, brandFilter = new Set() }) {
  const tLab = { L: targetPaint.lab_l, a: targetPaint.lab_a, b: targetPaint.lab_b }

  // ── Pre-filter ────────────────────────────────────────────────
  const candidates = catalog.filter(p => {
    if (p.id === targetPaint.id) return false   // exclude all sections of same paint code
    if (!p.lab_l && p.lab_l !== 0) return false   // no LAB
    if (!p.hex)                    return false   // no hex
    if (!p.finish_family)          return false   // pending — exclude
    if (EXCLUDED_TYPES.has(p.finish_family)) return false
    if (p.category === 'auxiliary')         return false

    // Finish rule: same family only, unless finishExpand + sheen trio
    const tFinish = targetPaint.finish_family
    const cFinish = p.finish_family
    if (tFinish !== cFinish) {
      if (!finishExpand) return false
      if (!SHEEN_TRIO.has(tFinish) || !SHEEN_TRIO.has(cFinish)) return false
    }

    // Tier filter
    if (tier === 'owned') {
      const up = userPaints[p.id]
      if (!up || !up.owned) return false
    }
    if (tier === 'myset') {
      // myset tier: filter to paints the user is tracking in My Set.
      // userPaints[id].inSet is set from the mySet state in SubstitutePanel.
      const up = userPaints[p.id]
      if (!up || !up.inSet) return false
    }
    if (tier === 'brands') {
      if (brandFilter.has(p.section_key)) return false
    }

    return true
  })

  // ── Score + chip assignment ───────────────────────────────────
  const results = candidates.map(p => {
    const cLab = { L: p.lab_l, a: p.lab_a, b: p.lab_b }
    const dE   = deltaE2000(tLab, cLab)
    const chips = []

    // Yellow: cross-section
    if (p.section_key !== targetPaint.section_key) chips.push('yellow')

    // Orange: cross-chemistry or hybrid
    const tChem = targetPaint.chemistry_family
    const cChem = p.chemistry_family
    if (tChem && cChem && tChem !== cChem) chips.push('orange')

    // Sheen chip: cross-finish within trio
    if (p.finish_family !== targetPaint.finish_family) chips.push('sheen:' + p.finish_family)

    return { paint: p, deltaE: dE, grade: grade(dE), chips }
  })

  results.sort((a, b) => a.deltaE - b.deltaE)
  return results
}

// ── Grade scale — CANONICAL SINGLE SOURCE ───────────────────────
// Hobby-calibrated thresholds (business doc law):
// Near Identical <1.5 · Excellent <3 · Close <6 · Usable <12 · Distant ≥12
// Cool/neutral ramp only — warm hues are warnings, never grades.
// UI components must import this — do not create local copies.
export function grade(dE) {
  if (dE < 1.5) return { label:'Near Identical', color:'#36E2DD', bg:'#0e3535' }
  if (dE < 3)   return { label:'Excellent',      color:'#2BABA8', bg:'#0d2e2e' }
  if (dE < 6)   return { label:'Close',          color:'#6B89A8', bg:'#0e1e2e' }
  if (dE < 12)  return { label:'Usable',         color:'#6E7F8A', bg:'#1a2028' }
  return              { label:'Distant',         color:'#4A5560', bg:'#181c20' }
}
