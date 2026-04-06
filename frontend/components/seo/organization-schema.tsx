import Script from 'next/script'

export function OrganizationSchema() {
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': 'StreetBite',
      'url': 'https://streetbitego.vercel.app',
      'logo': 'https://streetbitego.vercel.app/brand-icon.png',
      'sameAs': [
        'https://twitter.com/streetbite',
        'https://instagram.com/streetbite.social'
      ],
      'description': 'The ultimate guide to authentic local street food near you. Discover, track, and share street food flavors.',
      'contactPoint': {
        '@type': 'ContactPoint',
        'telephone': '+91-XXX-XXXXXXX',
        'contactType': 'customer service',
        'areaServed': 'IN',
        'availableLanguage': 'en'
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'url': 'https://streetbitego.vercel.app',
      'potentialAction': {
        '@type': 'SearchAction',
        'target': 'https://streetbitego.vercel.app/explore?q={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    }
  ]

  return (
    <Script
      id="branded-authority-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
    />
  )
}
