import Script from 'next/script'

interface CollectionPageSchemaProps {
  name: string
  description: string
  url: string
}

export function CollectionPageSchema({
  name,
  description,
  url,
}: CollectionPageSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url,
    isPartOf: {
      '@type': 'WebSite',
      name: 'StreetBite',
      url: 'https://streetbitego.vercel.app',
    },
  }

  const schemaJson = JSON.stringify(schema)
    .replace(/<\/script>/gi, '<\\/script>')
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')

  return (
    <Script
      id={`collection-page-schema-${name.toLowerCase().replace(/\s+/g, '-')}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: schemaJson }}
    />
  )
}
