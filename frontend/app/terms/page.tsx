'use client'

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-4xl mx-auto px-6 py-24">
                <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100">
                    <h1 className="text-4xl font-black text-gray-900 mb-2">Terms of Service</h1>
                    <p className="text-gray-500 mb-8">Last Updated: December 3, 2025</p>

                    <div className="prose prose-lg text-gray-700 max-w-none space-y-6">
                        <p>
                            Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the StreetBite website operated by StreetBite ("us", "we", or "our").
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
                        <p>
                            Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service. By accessing or using the Service you agree to be bound by these Terms.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Use of Service</h2>
                        <p>
                            StreetBite is a platform that connects users with street food vendors. We are not responsible for the quality, safety, or legality of the food provided by vendors. Users interact with vendors at their own risk.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. User Accounts</h2>
                        <p>
                            When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Intellectual Property</h2>
                        <p>
                            The Service and its original content, features, and functionality are and will remain the exclusive property of StreetBite and its licensors.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Termination</h2>
                        <p>
                            We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Changes</h2>
                        <p>
                            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Contact Us</h2>
                        <p>
                            If you have any questions about these Terms, please contact us at <a href="mailto:legal@streetbite.com" className="text-primary hover:underline">legal@streetbite.com</a>.
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}
