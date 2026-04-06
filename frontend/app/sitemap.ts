import { MetadataRoute } from 'next'

/**
 * Dynamic Sitemap Generator for StreetBite.
 * Automatically discovers all vendors and social pages for SEO indexing.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://streetbite.app'
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081/api'

  // Static routes
  const staticRoutes = [
    '',
    '/explore',
    '/community',
    '/about',
    '/offers',
    '/signin',
    '/signup',
    '/privacy',
    '/terms',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  try {
    // Dynamic Vendor routes
    const response = await fetch(`${backendUrl}/vendors`)
    const vendors = await response.json()
    
    if (Array.isArray(vendors)) {
      const vendorRoutes = vendors.map((vendor: any) => ({
        url: `${baseUrl}/vendors/${vendor.slug || vendor.id}`,
        lastModified: new Date(vendor.updatedAt || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
      
      return [...staticRoutes, ...vendorRoutes]
    }
  } catch (error) {
    console.error('Sitemap generation error:', error)
  }

  return staticRoutes
}
