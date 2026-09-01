import { getLocalizedPackage, normalizeLang } from './localizedContent'
import { greekPackageTitleToEnglish, hasGreekCharacters } from './packageTitleI18n'

const jsonTitleForLang = (packageId, lang, i18n) => {
  const translationKey = `packages.${packageId}.title`
  const tFn = lang === 'en' ? i18n?.getFixedT?.('en') : i18n?.getFixedT?.('el')
  const fromJson = tFn ? tFn(translationKey, { defaultValue: null }) : null
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

  const missingRequestedLang =
    lang === 'en' &&
    !pkg.i18n?.en?.title &&
    !jsonTitleForLang(pkg.id, 'en', i18n) &&
    hasGreekCharacters(localized.title || localized.description)

  return {
    ...localized,
    title,
    description,
    _i18nMissing: missingRequestedLang,
  }
}
