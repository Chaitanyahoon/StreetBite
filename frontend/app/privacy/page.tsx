'use client'

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-4xl mx-auto px-6 py-24">
                <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100">
                    <h1 className="text-4xl font-black text-gray-900 mb-2">Privacy Policy</h1>
                    <p className="text-gray-500 mb-8">Last Updated: December 3, 2025</p>

                    <div className="prose prose-lg text-gray-700 max-w-none space-y-6">
                        <p>
                            At StreetBite, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
                        <p>
                            We collect information that you provide directly to us when you register, search for vendors, or communicate with us. This may include:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Personal identification information (Name, email address, phone number)</li>
                            <li>Location data (to help you find nearby vendors)</li>
                            <li>Preferences and interests</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
                        <p>
                            We use the information we collect to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Provide, operate, and maintain our website</li>
                            <li>Improve, personalize, and expand our website</li>
                            <li>Understand and analyze how you use our website</li>
                            <li>Develop new products, services, features, and functionality</li>
                            <li>Communicate with you, either directly or through one of our partners</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Sharing Your Information</h2>
                        <p>
                            We do not sell, trade, or otherwise transfer to outside parties your Personally Identifiable Information unless we provide users with advance notice. This does not include website hosting partners and other parties who assist us in operating our website, conducting our business, or serving our users.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Security</h2>
                        <p>
                            We value your trust in providing us your Personal Information, thus we are striving to use commercially acceptable means of protecting it. But remember that no method of transmission over the internet, or method of electronic storage is 100% secure and reliable, and we cannot guarantee its absolute security.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Contact Us</h2>
                        <p>
                            If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us at <a href="mailto:privacy@streetbite.com" className="text-primary hover:underline">privacy@streetbite.com</a>.
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}
