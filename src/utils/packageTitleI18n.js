import { normalizeLang } from './localizedContent'

const hasGreekCharacters = (value) => /[\u0370-\u03FF\u1F00-\u1FFF]/.test(value || '')
const GREEK_TITLE_WORDS = [
  ['ΚΩΝΣΤΑΝΤΙΝΟΥΠΟΛΗ', 'CONSTANTINOPLE'],
  ['ΘΕΣΣΑΛΟΝΙΚΗ', 'THESSALONIKI'],
  ['ΚΑΣΤΟΡΙΑ', 'KASTORIA'],
  ['ΙΩΑΝΝΙΝΑ', 'IOANNINA'],
  ['ΗΡΑΚΛΕΙΟ', 'HERAKLION'],
  ['ΠΡΕΒΕΖΑ', 'PREVEZA'],
  ['ΣΚΙΑΘΟΣ', 'SKIATHOS'],
  ['ΣΑΝΤΟΡΙΝΗ', 'SANTORINI'],
  ['ΡΟΔΟΣ', 'RHODES'],
  ['ΠΑΡΙΣΙ', 'PARIS'],
  ['ΝΑΠΟΛΗ', 'NAPLES'],
  ['ΑΘΗΝΑ', 'ATHENS'],
  ['ΚΡΗΤΗ', 'CRETE'],
  ['ΒΟΛΟΣ', 'VOLOS'],
  ['ΠΗΛΙΟ', 'PELION'],
  ['ΜΕΤΕΩΡΑ', 'METEORA'],
  ['ΒΑΡΣΟΒΙΑ', 'WARSAW'],
  ['ΡΟΥΜΑΝΙΑ', 'ROMANIA'],
  ['Μάγικη', 'Magical'],
  ['Μαγική', 'Magical'],
  ['Πελοπόννησος', 'Peloponnese'],
  ['Πανόραμα', 'Panorama'],
  ['Ημέρες', 'Days'],
  ['Ημέρα', 'Day'],
  ['Μέρες', 'Days'],
  ['Μέρα', 'Day'],
  ['ημέρες', 'days'],
  ['ημέρα', 'day'],
  ['ΚΑΘΑΡΑ ΔΕΥΤΕΡΑ', 'CLEAN MONDAY'],
  ['Καθαρά Δευτέρα', 'Clean Monday'],
]

export const greekPackageTitleToEnglish = (title, destination) => {
  if (!title || !hasGreekCharacters(title)) return title || ''

  let out = String(title)
  for (const [gr, en] of GREEK_TITLE_WORDS) {
    out = out.split(gr).join(en)
  }

  out = out
    .replace(/\s+/g, ' ')
    .replace(/\s*–\s*/g, ' – ')
    .trim()

  if (!hasGreekCharacters(out)) return out

  if (destination && hasGreekCharacters(out)) {
    const dest = String(destination).trim()
    if (dest && !hasGreekCharacters(dest)) {
      const daysMatch = out.match(/(\d+)\s*(days|Days|ημέρες|Μέρες|Ημέρες)/i)
      if (daysMatch) return `${dest.toUpperCase()} – ${daysMatch[1]} Days`
      return `${dest} Package`
    }
  }

  return out
}

export { hasGreekCharacters }

/** Localize duration strings like "4 Μέρες" → "4 Days" in English mode. */
export const translatePackageDuration = (duration, lang) => {
  if (!duration) return duration
  const normalized = normalizeLang(lang)
  if (normalized === 'el') return duration
  let out = String(duration)
  for (const [gr, en] of GREEK_TITLE_WORDS) {
    if (gr.includes('ημέρ') || gr.includes('Μέρ') || gr.includes('Ημέρ')) {
      out = out.split(gr).join(en)
    }
  }
  return out.replace(/\s+/g, ' ').trim()
}
