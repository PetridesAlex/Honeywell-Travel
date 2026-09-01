const hasGreekCharacters = (value) => /[\u0370-\u03FF\u1F00-\u1FFF]/.test(value || '')

export const normalizeLang = (lang) => {
  if (!lang) return 'en'
  if (lang.startsWith('el')) return 'el'
  return 'en'
}

const pickField = (source, field) => {
  if (!source) return undefined
  const value = source[field]
  return value != null && String(value).trim() !== '' ? value : undefined
}

const mergeDetails = (base = {}, overlay = {}) => ({
  ...base,
  ...overlay,
  ...(overlay.program ? { program: overlay.program } : {}),
  ...(overlay.hotels ? { hotels: overlay.hotels } : {}),
  ...(overlay.included ? { included: overlay.included } : {}),
  ...(overlay.notIncluded ? { notIncluded: overlay.notIncluded } : {}),
  ...(overlay.importantNotes ? { importantNotes: overlay.importantNotes } : {}),
  ...(overlay.gallery ? { gallery: overlay.gallery } : {}),
})

/** Resolve localized package fields with fallback chain. */
export function getLocalizedPackage(pkg, langInput) {
  if (!pkg) return null
  const lang = normalizeLang(langInput)
  const i18nBlock = pkg.i18n || {}
  const localized = i18nBlock[lang] || {}
  const fallbackLang = lang === 'en' ? 'el' : 'en'
  const fallback = i18nBlock[fallbackLang] || {}

  const title =
    pickField(localized, 'title') ||
    pickField(fallback, 'title') ||
    pkg.title ||
    ''

  const description =
    pickField(localized, 'description') ||
    pickField(fallback, 'description') ||
    pkg.description ||
    ''

  const longDescription =
    pickField(localized, 'longDescription') ||
    pickField(localized, 'long_description') ||
    pickField(fallback, 'longDescription') ||
    pickField(fallback, 'long_description') ||
    pkg.longDescription ||
    ''

  const details = mergeDetails(
    mergeDetails(pkg.details || {}, fallback.details || {}),
    localized.details || {},
  )

  const missingRequestedLang =
    lang === 'en' &&
    !pickField(localized, 'title') &&
    !pickField(localized, 'description') &&
    !pickField(localized, 'longDescription') &&
    !pickField(localized, 'long_description') &&
    !localized.details &&
    hasGreekCharacters(title || description || longDescription)

  return {
    ...pkg,
    title,
    description,
    longDescription,
    details,
    _i18nLang: lang,
    _i18nMissing: missingRequestedLang,
  }
}

export function getLocalizedBlogPost(post, langInput) {
  if (!post) return null
  const lang = normalizeLang(langInput)
  const block = post.i18n?.[lang] || post.i18n?.[lang === 'en' ? 'el' : 'en'] || {}
  return {
    ...post,
    title: block.title || post.title || '',
    excerpt: block.excerpt || post.excerpt || '',
    content: block.content || post.content || '',
    category: block.category || post.category || '',
  }
}

export function getLocalizedTerms(termsData, langInput) {
  const lang = normalizeLang(langInput)
  if (!termsData) return null
  const block = termsData[lang] || termsData.en || termsData
  return block
}
