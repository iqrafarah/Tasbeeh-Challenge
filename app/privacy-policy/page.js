import Link from 'next/link';

export default function PrivacyPolicyPage() {
    return (
        <div className="overflow-y-auto pb-[130px]">
            <div className="flex gap-3 items-center mb-5">
                {/* Close Button */}
                <div>
                    <Link href="/settings">
                        <i className="fa-solid fa-chevron-left text-lg cursor-pointer text-gray-600 hover:text-black transition-all"></i>
                    </Link>
                </div>

                <h1 className="title w-[80%] text-center">
                    Privacy Policy
                </h1>
            </div>

            <p className="text-sm text-gray-600 mb-4">
                We take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal data when you use the Tasbeeh Challenge Progressive Web App (PWA).
            </p>

            <div className="space-y-6">
                <section>
                    <h2 className="text-sm font-semibold text-gray-700">1. Information We Collect</h2>
                    <p className="text-sm text-gray-600">
                        When you use the Tasbeeh Challenge PWA, we may collect the following types of information:
                    </p>
                    <ul className="list-disc ml-6 text-sm text-gray-600">
                        <li>Personal information you provide (e.g., name, email, and profile details)</li>
                        <li>Activity data (e.g., your dhikr counts, streaks, and leaderboard position)</li>
                        <li>Usage data such as device information and browser type (for improving the app's functionality)</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-sm font-semibold text-gray-700">2. How We Use Your Data</h2>
                    <p className="text-sm text-gray-600">
                        The data we collect is used to enhance your experience on the PWA, including but not limited to:
                    </p>
                    <ul className="list-disc ml-6 text-sm text-gray-600">
                        <li>Tracking your progress, streaks, and leaderboard rankings</li>
                        <li>Improving the functionality and performance of the PWA</li>
                        <li>Providing customer support if you have any issues or requests</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-sm font-semibold text-gray-700">3. Data Retention</h2>
                    <p className="text-sm text-gray-600">
                        We retain your data for as long as necessary to provide the services you have requested. You can delete your account and personal data by contacting us at any time, and we will remove it from our systems.
                    </p>
                </section>

                <section>
                    <h2 className="text-sm font-semibold text-gray-700">4. Data Security</h2>
                    <p className="text-sm text-gray-600">
                        We use industry-standard security measures to protect your personal data. However, please be aware that no method of data transmission over the internet is 100% secure. While we strive to protect your data, we cannot guarantee its absolute security.
                    </p>
                </section>

                <section>
                    <h2 className="text-sm font-semibold text-gray-700">5. Cookies</h2>
                    <p className="text-sm text-gray-600">
                        The PWA may use cookies to enhance user experience. Cookies are small text files stored on your device that help us remember your preferences and improve app functionality. You can control cookie settings through your browser, but disabling cookies may affect the app's performance.
                    </p>
                </section>

                <section>
                    <h2 className="text-sm font-semibold text-gray-700">6. Sharing Your Data</h2>
                    <p className="text-sm text-gray-600">
                        We do not sell or share your personal data with third parties for marketing purposes. We may share your data with trusted third-party services to help us operate the PWA, but only to the extent necessary to perform their services (e.g., cloud hosting providers, analytics services).
                    </p>
                </section>

                <section>
                    <h2 className="text-sm font-semibold text-gray-700">7. Your Rights</h2>
                    <p className="text-sm text-gray-600">
                        You have the right to access, correct, and delete your personal data at any time. To exercise these rights, please contact us at the details provided below. You can also request that we stop processing your data or withdraw consent, where applicable.
                    </p>
                </section>

                <section>
                    <h2 className="text-sm font-semibold text-gray-700">8. Changes to This Privacy Policy</h2>
                    <p className="text-sm text-gray-600">
                        We may update this Privacy Policy from time to time. When we make changes, we will update the "Last Updated" date at the top of this page. If the changes are significant, we will notify you within the PWA or by other appropriate means.
                    </p>
                </section>
            </div>

            <p className="text-sm text-gray-600 mt-8">
                If you have any questions about these terms, please contact us at 
                <Link href="https://www.instagram.com/tasbeehChallenge" target="_blank" className="text-blue-600 hover:underline"> @tasbeehChallenge</Link> on Instagram.
            </p>
        </div>
    );
}
