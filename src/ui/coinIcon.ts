// Placeholder coin icon: no Figma access was available in this session to
// pull the real asset, so this simple inline SVG stands in for it. Swap it
// for a Figma export by replacing this markup — everything that uses it
// (HUD, flying coins) works unchanged either way.
export const COIN_ICON_SVG = `
<svg viewBox="0 0 32 32" width="26" height="26" xmlns="http://www.w3.org/2000/svg">
  <circle cx="16" cy="16" r="14" fill="#ffd54a" stroke="#b8860b" stroke-width="2"/>
  <circle cx="16" cy="16" r="10" fill="none" stroke="#b8860b" stroke-width="1.5"/>
  <text x="16" y="21" text-anchor="middle" font-size="14" font-weight="700" fill="#b8860b" font-family="system-ui, sans-serif">$</text>
</svg>
`
