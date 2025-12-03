'use client'

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export default function CookiesPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-4xl mx-auto px-6 py-24">
                <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100">
                    <h1 className="text-4xl font-black text-gray-900 mb-2">Cookie Policy</h1>
                    <p className="text-gray-500 mb-8">Last Updated: December 3, 2025</p>

                    <div className="prose prose-lg text-gray-700 max-w-none space-y-6">
                        <p>
                            This Cookie Policy explains what cookies are, how we use cookies, how third-parties we may partner with may use cookies on the Service, your choices regarding cookies, and further information about cookies.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. What are cookies?</h2>
                        <p>
                            Cookies are small pieces of text sent by your web browser by a website you visit. A cookie file is stored in your web browser and allows the Service or a third-party to recognize you and make your next visit easier and the Service more useful to you.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. How StreetBite uses cookies</h2>
                        <p>
                            When you use and access the Service, we may place a number of cookies files in your web browser. We use cookies for the following purposes:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>To enable certain functions of the Service</li>
                            <li>To provide analytics</li>
                            <li>To store your preferences</li>
                            <li>To enable advertisements delivery, including behavioral advertising</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Third-party cookies</h2>
                        <p>
                            In addition to our own cookies, we may also use various third-parties cookies to report usage statistics of the Service, deliver advertisements on and through the Service, and so on.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. What are your choices regarding cookies</h2>
                        <p>
                            If you'd like to delete cookies or instruct your web browser to delete or refuse cookies, please visit the help pages of your web browser. Please note, however, that if you delete cookies or refuse to accept them, you might not be able to use all of the features we offer, you may not be able to store your preferences, and some of our pages might not display properly.
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}
