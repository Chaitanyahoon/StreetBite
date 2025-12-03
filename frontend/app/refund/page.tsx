'use client'

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export default function RefundPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-4xl mx-auto px-6 py-24">
                <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100">
                    <h1 className="text-4xl font-black text-gray-900 mb-2">Refund Policy</h1>
                    <p className="text-gray-500 mb-8">Last Updated: December 3, 2025</p>

                    <div className="prose prose-lg text-gray-700 max-w-none space-y-6">
                        <p>
                            Thank you for using StreetBite. We want you to be happy with your street food experience.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. General Policy</h2>
                        <p>
                            Since StreetBite is a platform connecting users with independent street food vendors, all transactions are typically handled directly between the user and the vendor. StreetBite does not process payments directly for food orders in most cases.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Issues with Orders</h2>
                        <p>
                            If you have an issue with an order (e.g., food quality, missing items), please address it directly with the vendor at the time of purchase. Most vendors are happy to resolve issues immediately.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Platform Fees</h2>
                        <p>
                            If you have been charged a fee directly by the StreetBite platform (e.g., for a premium subscription or specific service) and believe it was in error, please contact our support team within 14 days of the charge.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Contact Us</h2>
                        <p>
                            If you have any questions about our Refund Policy, please contact us at <a href="mailto:support@streetbite.com" className="text-primary hover:underline">support@streetbite.com</a>.
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}
