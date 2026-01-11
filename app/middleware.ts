import createMiddleware from 'next-intl/middleware'
import { NextRequest } from 'next/server'
import type { Locale } from './i18n/request'

const locales: Locale[] = ['en', 'ta']
const defaultLocale: Locale = 'en'

// Detect locale from request
function detectLocale(request: NextRequest): Locale {
  // Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language') || ''
  const browserLocale = acceptLanguage.split(',')[0]?.trim() || ''

  // Tamil for India locale
  if (browserLocale.startsWith('ta') || browserLocale === 'en-IN') {
    return 'ta'
  }

  return defaultLocale
}

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Detect locale from request
  localeDetection: true,

  // Prefix strategy - don't prefix default locale
  localePrefix: 'as-needed',
})

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
}
