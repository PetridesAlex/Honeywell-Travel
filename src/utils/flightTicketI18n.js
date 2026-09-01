import { normalizeLang } from './localizedContent'

export function getLocalizedFlightOffer(offer, langInput) {
  if (!offer) return null
  const lang = normalizeLang(langInput)
  const fallbackLang = lang === 'en' ? 'el' : 'en'
  const block = offer.i18n?.[lang] || offer.i18n?.[fallbackLang] || {}

  return {
    ...offer,
    title: block.title || offer.title,
    duration: block.duration || offer.duration,
    luggage: block.luggage || offer.luggage,
    departureFlight: block.departureFlight || offer.departureFlight,
    returnFlight: block.returnFlight || offer.returnFlight,
  }
}

export function localizeFlightOffers(offers, langInput) {
  return (offers || []).map((offer) => getLocalizedFlightOffer(offer, langInput))
}
