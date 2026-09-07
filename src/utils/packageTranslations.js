import { getLocalizedPackage, normalizeLang } from './localizedContent'
import { greekPackageTitleToEnglish, hasGreekCharacters } from './packageTitleI18n'

const jsonTitleForLang = (packageId, lang, i18n) => {
  const translationKey = `packages.${packageId}.title`
  if (!i18n?.t) return null
  const fromJson = i18n.t(translationKey, { lng: lang, defaultValue: null })
  if (fromJson && fromJson !== translationKey) return fromJson
  return null
}

export const getTranslatedPackageTitle = (packageId, originalTitle, i18n, destination) => {
  const lang = normalizeLang(i18n?.language)
  const fromJson = jsonTitleForLang(packageId, lang, i18n)
  if (fromJson) return fromJson

  if (lang === 'el') {
    return originalTitle || ''
  }

  const englishFromJson = jsonTitleForLang(packageId, 'en', i18n)
  if (englishFromJson) return englishFromJson

  if (!hasGreekCharacters(originalTitle)) {
    return originalTitle || ''
  }

  return greekPackageTitleToEnglish(originalTitle, destination)
}

export const getEnglishPackageTitle = (packageId, originalTitle, destination, i18n) => {
  return getTranslatedPackageTitle(packageId, originalTitle, { ...i18n, language: 'en' }, destination)
}

export const getTranslatedPackageDescription = (packageId, originalDescription, i18n) => {
  const translationKey = `packages.${packageId}.description`
  const translated = i18n.t(translationKey, { defaultValue: null })

  if (translated && translated !== translationKey) {
    return translated
  }

  return originalDescription
}

/** Localize full package object for current language. */
export const localizePackage = (pkg, i18n) => {
  if (!pkg) return null
  const lang = normalizeLang(i18n?.language)
  const localized = getLocalizedPackage(pkg, lang)

  const title = getTranslatedPackageTitle(
    pkg.id,
    localized.title,
    i18n,
    pkg.destination || localized.destination,
  )

  const description = getTranslatedPackageDescription(pkg.id, localized.description, i18n)

  // Only flag missing English when the displayed title is still Greek-only.
  // Program/details may remain in Greek as fallback — no user-facing warning needed.
  const missingRequestedLang =
    lang === 'en' &&
    !pkg.i18n?.en?.title &&
    !jsonTitleForLang(pkg.id, 'en', i18n) &&
    hasGreekCharacters(title)

  return {
    ...localized,
    title,
    description,
    _i18nMissing: missingRequestedLang,
  }
}
