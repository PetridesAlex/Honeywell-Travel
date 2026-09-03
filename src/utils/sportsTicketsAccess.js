/**
 * Sports & Events public gate.
 * Enabled locally (Vite DEV) so you can keep building.
 * Disabled on deployed/public builds until explicitly turned on.
 *
 * Go live: set VITE_SPORTS_TICKETS_PUBLIC=true in the production env.
 */
export function isSportsTicketsPublicEnabled() {
  const flag = String(import.meta.env.VITE_SPORTS_TICKETS_PUBLIC || '')
    .trim()
    .toLowerCase()
  if (flag === 'true' || flag === '1' || flag === 'yes') return true
  if (flag === 'false' || flag === '0' || flag === 'no') return false
  return Boolean(import.meta.env.DEV)
}
