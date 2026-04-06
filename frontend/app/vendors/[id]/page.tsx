import { Metadata } from 'next'
import VendorDetailClient from './VendorDetailClient'
import { BreadcrumbListSchema } from '@/components/seo/breadcrumb-schema'

type Props = {
    params: Promise<{ id: string }>
}

type VendorSeoData = {
    id: string | number
    slug?: string
    name?: string
    description?: string
    cuisine?: string
    address?: string
    latitude?: number
    longitude?: number
    city?: string
    state?: string
    imageUrl?: string
    bannerImageUrl?: string
}

async function fetchVendorSeoData(idOrSlug: string): Promise<VendorSeoData | null> {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081/api'

    try {
        const response = await fetch(`${backendUrl}/vendors/${idOrSlug}`, {
            next: { revalidate: 60 } // revalidate every minute
        })

        if (!response.ok) {
            return null
        }

        const vendor = await response.json()
        return vendor && vendor.name ? vendor : null
    } catch {
        return null
    }
}

// Ensure the page acts dynamically but leverages server-side fetching for metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params
    const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://streetbitego.vercel.app'
    const vendor = await fetchVendorSeoData(id)

    if (!vendor) {
        return {
            title: 'Street Food Vendor | StreetBite',
            description: 'Discover this amazing street food vendor on StreetBite.',
        }
    }

    try {
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
    } catch {
        return {
            title: 'Street Food Vendor | StreetBite',
            description: 'Discover this amazing street food vendor on StreetBite.',
        }
    }
}

// -------------------------------------------------------------------------------- //
// Server Component Layout 
// Renders the Client Component transparently 
// -------------------------------------------------------------------------------- //
export default async function VendorDetailServerPage({ params }: Props) {
    const { id } = await params
    const baseUrl = 'https://streetbitego.vercel.app'
    const vendor = await fetchVendorSeoData(id)

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
            <VendorDetailClient vendorIdParams={id} />
        </>
    )
}
