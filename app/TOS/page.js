import Link from 'next/link';

export default function TOSPage() {
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
                    Terms of Service
                </h1>
            </div>

            <p className="text-sm text-gray-600 mb-4">
                Welcome to the Tasbeeh Challenge! By using this web-based Progressive Web App (PWA), you agree to the following terms:
            </p>

            <div className="space-y-6">
                <section>
                    <h2 className="text-sm font-semibold text-gray-700">1. Acceptance of Terms</h2>
                    <p className="text-sm text-gray-600">
                        By using the Tasbeeh Challenge PWA, you agree to comply with these Terms of Service and any additional guidelines or rules that may be posted on the app.
                    </p>
                </section>

                <section>
                    <h2 className="text-sm font-semibold text-gray-700">2. Privacy</h2>
                    <p className="text-sm text-gray-600">
                        We respect your privacy. We do not sell, share, or misuse your data. Any data collected (e.g., progress, streaks, or account details) is solely used to improve your experience on the PWA. See our 
                        <Link href="/privacy-policy" className="text-blue-600 hover:underline"> Privacy Policy {" "}
                        </Link> 
                         for more information.
                    </p>
                </section>

                <section>
                    <h2 className="text-sm font-semibold text-gray-700">3. Account Responsibility</h2>
                    <p className="text-sm text-gray-600">
                        Users are responsible for maintaining the confidentiality of their account information and for all activities that occur under their account.
                    </p>
                </section>

                <section>
                    <h2 className="text-sm font-semibold text-gray-700">4. Streaks and Leaderboards</h2>
                    <p className="text-sm text-gray-600">
                        Streaks and leaderboard rankings are based on user activity. We reserve the right to remove or reset streaks or rankings in case of any misuse of the system or violations of our terms.
                    </p>
                </section>

                <section>
                    <h2 className="text-sm font-semibold text-gray-700">5. Prohibited Activities</h2>
                    <p className="text-sm text-gray-600">
                        You agree not to engage in any unlawful or inappropriate activities while using the PWA, including but not limited to spamming, cheating, or violating any applicable laws.
                    </p>
                </section>

                <section>
                    <h2 className="text-sm font-semibold text-gray-700">6. Termination</h2>
                    <p className="text-sm text-gray-600">
                        We reserve the right to suspend or terminate your account if you violate these Terms of Service or engage in misconduct.
                    </p>
                </section>

                <section>
                    <h2 className="text-sm font-semibold text-gray-700">7. Disclaimers</h2>
                    <p className="text-sm text-gray-600">
                        The PWA is provided “as is,” and we make no guarantees about its availability or functionality. We are not liable for any damages or loss of data that may result from using the PWA.
                    </p>
                </section>

                <section>
                    <h2 className="text-sm font-semibold text-gray-700">8. Changes to the Terms</h2>
                    <p className="text-sm text-gray-600">
                        We may update these Terms of Service from time to time. Any changes will be posted on this page, and you will be notified if necessary.
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
