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
        }
    } catch (error) {
        // Fallback if the backend request fails during ISR
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
export default function VendorDetailServerPage({ params }: Props) {
    // Next.js handles the `params.id` extraction. 
    // Data fetching & client-side interaction is fully delegated.
    return <VendorDetailClient vendorIdParams={params.id} />
}
