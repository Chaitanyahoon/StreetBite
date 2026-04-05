import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081/api'

  // Define static core routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/community`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/offers`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  let vendorRoutes: MetadataRoute.Sitemap = []

  try {
    // Fetch active vendors directly to prevent sitemap generation failures
    // Note: To prevent a build-time crash if the backend is down, we catch errors.
    const res = await fetch(`${backendUrl}/vendors?page=0&size=1000`, { 
      next: { revalidate: 3600 } // Revalidate every hour
    })
    
    if (res.ok) {
      const data = await res.json()
      const vendors = data.content || data || []
      
      vendorRoutes = vendors.map((vendor: any) => ({
        url: `${baseUrl}/vendors/${vendor.slug || vendor.id}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      }))
    }
  } catch (error) {
    console.error('Failed to generate vendor sitemap:', error)
  }

  return [...staticRoutes, ...vendorRoutes]
}
