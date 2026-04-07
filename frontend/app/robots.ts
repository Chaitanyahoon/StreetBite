import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://streetbitego.vercel.app'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/profile/',
          '/reset-password/'
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
