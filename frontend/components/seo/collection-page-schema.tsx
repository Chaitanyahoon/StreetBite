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

  return (
    <Script
      id={`collection-page-schema-${name.toLowerCase().replace(/\s+/g, '-')}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
