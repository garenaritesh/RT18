export default function ShippingReturnPolicyPage() {
    return (
        <main className="min-h-screen bg-white text-gray-900">

            <div className="max-w-4xl mx-auto px-6 py-14">

                {/* HEADER */}

                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black">
                        Shipping & Return Policy
                    </h1>

                    <p className="text-gray-500 mt-3">
                        Please read our shipping, return and refund
                        policy carefully before placing your order.
                    </p>
                </div>

                {/* SHIPPING */}

                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">
                        Shipping Policy
                    </h2>

                    <ul className="space-y-3 text-gray-600">
                        <li>
                            • Orders are usually processed within
                            <strong> 1–2 business days.</strong>
                        </li>

                        <li>
                            • Delivery usually takes
                            <strong> 3–7 business days</strong>,
                            depending on your location.
                        </li>

                        <li>
                            • Once your order is shipped, available
                            tracking details will be provided.
                        </li>

                        <li>
                            • Delivery delays caused by courier
                            partners, weather, holidays, or other
                            circumstances beyond our control may occur.
                        </li>

                        <li>
                            • Please make sure your shipping address
                            and contact details are correct before
                            placing your order.
                        </li>
                    </ul>
                </section>

                {/* RETURN */}

                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">
                        Return & Refund Policy
                    </h2>

                    <p className="text-gray-600 mb-5">
                        We offer a <strong>7-day return window</strong>
                        from the date of delivery.
                    </p>

                    <ul className="space-y-3 text-gray-600">
                        <li>
                            • The product must be unused and in its
                            original condition.
                        </li>

                        <li>
                            • Original packaging, tags, and accessories
                            should be retained.
                        </li>

                        <li>
                            • The product should not be damaged, altered,
                            washed, or used.
                        </li>

                        <li>
                            • A clear 360° product-view video is required
                            for return/refund verification.
                        </li>
                    </ul>
                </section>

                {/* IMPORTANT */}

                <section className="mb-10">
                    <div className="border-2 border-red-300 bg-red-50 rounded-2xl p-6">

                        <h2 className="text-xl font-black text-red-700">
                            🚨 IMPORTANT — PLEASE READ
                        </h2>

                        <p className="text-lg font-black text-red-700 mt-4">
                            NO RETURN • NO REFUND WITHOUT A 360°
                            PRODUCT-VIEW VIDEO.
                        </p>

                        <p className="text-gray-700 mt-3 leading-7">
                            A complete 360° video of the product showing
                            the product from all sides is mandatory to
                            verify its condition and any damage or issue.
                        </p>

                        <p className="font-bold text-gray-900 mt-3">
                            Without the required 360° product-view video,
                            return or refund requests will not be accepted.
                        </p>

                    </div>
                </section>

                {/* DAMAGED / WRONG */}

                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">
                        Damaged / Wrong Product
                    </h2>

                    <ul className="space-y-3 text-gray-600">
                        <li>
                            • Contact us within <strong>7 days</strong>
                            of delivery.
                        </li>

                        <li>
                            • Keep the product, packaging, tags and
                            accessories safely.
                        </li>

                        <li>
                            • Provide the required 360° product-view
                            video along with details of the issue.
                        </li>

                        <li>
                            • Our team will review the request and,
                            if approved, provide the applicable resolution.
                        </li>
                    </ul>
                </section>

                {/* REFUND */}

                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">
                        Refund
                    </h2>

                    <ul className="space-y-3 text-gray-600">
                        <li>
                            • Once the returned product is received and
                            inspected, the refund will be processed if
                            the request is approved.
                        </li>

                        <li>
                            • Refund processing time may depend on the
                            payment method and bank/payment provider.
                        </li>

                        <li>
                            • Shipping charges, if applicable, may not
                            be refundable.
                        </li>
                    </ul>
                </section>

                {/* NON RETURNABLE */}

                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">
                        Non-Returnable Conditions
                    </h2>

                    <ul className="space-y-3 text-gray-600">
                        <li>
                            • Used or damaged products caused by the
                            customer.
                        </li>

                        <li>
                            • Products without original packaging or tags,
                            where applicable.
                        </li>

                        <li>
                            • Requests made after the
                            <strong> 7-day return period.</strong>
                        </li>

                        <li>
                            • Requests without the required
                            <strong> 360° product-view video.</strong>
                        </li>
                    </ul>
                </section>

                {/* AGREEMENT */}

                <div className="border-t pt-8 text-center text-gray-500">
                    By placing an order, you acknowledge and agree
                    to this Shipping & Return Policy.
                </div>

            </div>

        </main>
    );
}