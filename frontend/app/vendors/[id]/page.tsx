import { Metadata } from 'next'
import VendorDetailClient from './VendorDetailClient'

// Define the shape of our Route params
type Props = {
    params: { id: string }
}

// Ensure the page acts dynamically but leverages server-side fetching for metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081/api'
    const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://streetbite.app'

    try {
        // We fetch minimal data purely for SEO purposes
        const response = await fetch(`${backendUrl}/vendors/${params.id}`, {
            next: { revalidate: 60 } // revalidate every minute
        })
        const vendor = await response.json()

        if (!vendor || !vendor.name) {
            return { title: 'Vendor Not Found | StreetBite' }
        }

        const vendorImage = vendor.bannerImageUrl || vendor.imageUrl || `${baseUrl}/og-image.jpg`
        const description = vendor.description 
                            ? vendor.description.substring(0, 155) + '...'
                            : `Discover the best of ${vendor.name} on StreetBite.`

        return {
            title: `${vendor.name} | StreetBite`,
            description: description,
            alternates: {
                canonical: `${baseUrl}/vendors/${vendor.slug || vendor.id}`,
            },
            openGraph: {
                title: `${vendor.name} on StreetBite`,
                description: description,
                images: [
                    {
                        url: vendorImage,
                        width: 1200,
                        height: 630,
                        alt: `${vendor.name} stall photo`,
                    },
                ],
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title: `${vendor.name} on StreetBite`,
                description: description,
                images: [vendorImage],
            },
            other: {
                'google-site-verification': 'googlee1e3021816c42e23.html',
            }
        }
    } catch (error) {
        // Fallback if the backend request fails during ISR
        return {
            title: 'Street Food Vendor | StreetBite',
            description: 'Discover this amazing street food vendor on StreetBite.',
        }
    }
}

import { BreadcrumbListSchema } from '@/components/seo/breadcrumb-schema'

// -------------------------------------------------------------------------------- //
// Server Component Layout 
// Renders the Client Component transparently 
// -------------------------------------------------------------------------------- //
export default async function VendorDetailServerPage({ params }: Props) {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://streetbite.onrender.com/api'
    const baseUrl = 'https://streetbitego.vercel.app'
    
    // Fetch data for JSON-LD (Next.js deduplicates this fetch)
    const response = await fetch(`${backendUrl}/vendors/${params.id}`)
    const vendor = await response.json()

    const jsonLd = vendor && vendor.name ? {
        '@context': 'https://schema.org',
        '@type': 'Restaurant',
        'name': vendor.name,
        'image': vendor.imageUrl || vendor.bannerImageUrl,
        'description': vendor.description || `Authentic ${vendor.cuisine} street food by ${vendor.name}.`,
        'servesCuisine': vendor.cuisine,
        'priceRange': '₹',
        'geo': vendor.latitude && vendor.longitude ? {
            '@type': 'GeoCoordinates',
            'latitude': vendor.latitude,
            'longitude': vendor.longitude
        } : null,
        'address': {
            '@type': 'PostalAddress',
            'streetAddress': vendor.address,
            'addressLocality': vendor.city || 'Mumbai',
            'addressRegion': vendor.state || 'Maharashtra',
            'addressCountry': 'IN'
        },
        'url': `${baseUrl}/vendors/${vendor.slug || vendor.id}`
    } : null;

    const breadcrumbs = vendor && vendor.name ? [
        { name: 'Home', item: baseUrl },
        { name: 'Explore', item: `${baseUrl}/explore` },
        { name: vendor.name, item: `${baseUrl}/vendors/${vendor.slug || vendor.id}` }
    ] : [];

    return (
        <>
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
            {breadcrumbs.length > 0 && <BreadcrumbListSchema items={breadcrumbs} />}
            <VendorDetailClient vendorIdParams={params.id} />
        </>
    )
}
