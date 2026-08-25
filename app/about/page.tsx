"use client";

import heroImage from "../assests/about_me_profile.png";
import { useEffect, useState } from "react";

export default function AboutPage() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(true);
    }, []);

    return (

        
        <main className="min-h-screen bg-white text-gray-900 overflow-hidden">


            {/* HERO */}

            <section className="relative bg-[#f7f5f1] pt-8">
                <div className="max-w-7xl mx-auto px-6 md:px-8 py-20 md:py-28">


                    <div
                        className={`max-w-4xl transition-all duration-1000 ${visible
                                ? "opacity-100 translate-y-0"
                                : "opacity-0 translate-y-8"
                            }`}
                    >
                        <p className="text-xs md:text-sm tracking-[0.35em] uppercase text-gray-500 font-semibold">
                            The RT18 Story
                        </p>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] mt-5">
                            Built for
                            <br />
                            <span className="text-gray-400">
                                your style.
                            </span>
                        </h1>

                        <p className="text-gray-600 text-base md:text-lg max-w-2xl mt-8 leading-relaxed">
                            RT18 is a modern lifestyle brand focused on
                            jewellery, accessories and everyday fashion
                            essentials — created to make personal style
                            feel effortless, confident and timeless.
                        </p>
                    </div>

                </div>

                {/* Decorative circle */}

                <div className="absolute -right-32 -bottom-32 w-80 h-80 rounded-full border border-gray-300 opacity-40" />

            </section>

            {/* BRAND STORY */}

            <section className="py-20 md:py-28">

                <div className="max-w-7xl mx-auto px-6 md:px-8">

                    <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">

                        <div>
                            <p className="text-xs tracking-[0.3em] uppercase text-gray-400 font-semibold">
                                Our Philosophy
                            </p>

                            <h2 className="text-3xl md:text-5xl font-black mt-3 leading-tight">
                                Style should feel
                                <br />
                                personal.
                            </h2>
                        </div>

                        <div className="text-gray-600 leading-8 space-y-5">
                            <p>
                                We believe fashion is more than what you
                                wear. It is a reflection of personality,
                                confidence and individuality.
                            </p>

                            <p>
                                RT18 was created with a simple vision:
                                bring stylish, thoughtfully selected
                                products to customers without making
                                the experience complicated.
                            </p>

                            <p>
                                From discovering a product to receiving
                                it at your doorstep, we focus on keeping
                                every part of the experience simple,
                                reliable and premium.
                            </p>
                        </div>

                    </div>

                </div>

            </section>

            {/* OWNER */}

            <section className="bg-black text-white py-20 md:py-28">

                <div className="max-w-7xl mx-auto px-6 md:px-8">

                    <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">

                        {/* OWNER IMAGE */}

                        <div className="relative">

                            <div className="absolute inset-0 border border-gray-700 rounded-[32px] rotate-3" />

                            <div className="relative aspect-[4/5] bg-gray-900 rounded-[32px] overflow-hidden">

                                {/* REPLACE THIS URL */}

                                <img
                                    src={heroImage.src}
                                    alt="RT18 Founder"
                                    className="w-full h-full object-cover"
                                />

                                {/* Premium overlay */}

                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

                                <div className="absolute bottom-6 left-6">

                                    <p className="text-xs tracking-[0.3em] uppercase text-gray-400">
                                        Founder
                                    </p>

                                    <p className="text-2xl font-black mt-1">
                                        Ritesh Thakare                                    </p>

                                </div>

                            </div>

                        </div>

                        {/* OWNER CONTENT */}

                        <div>

                            <p className="text-xs tracking-[0.3em] uppercase text-gray-500 font-semibold">
                                The Person Behind RT18
                            </p>

                            <h2 className="text-4xl md:text-6xl font-black mt-4 leading-tight">
                                Built with
                                <br />
                                <span className="text-gray-500">
                                    ambition.
                                </span>
                            </h2>

                            <p className="text-gray-400 mt-7 leading-8">
                                RT18 is driven by a passion for modern
                                style, creativity and building something
                                meaningful from the ground up.
                            </p>

                            <p className="text-gray-400 mt-5 leading-8">
                                The goal is simple — create a brand that
                                people can connect with, trust and return
                                to whenever they want to express their
                                own style.
                            </p>

                            <div className="mt-8 flex items-center gap-4">

                                <div className="h-px w-12 bg-gray-600" />

                                <p className="text-sm font-semibold tracking-widest uppercase text-gray-400">
                                    Founder • Ritesh Thakare
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </section>

            {/* VALUES */}

            <section className="py-20 md:py-28">

                <div className="max-w-7xl mx-auto px-6 md:px-8">

                    <div className="text-center mb-12">

                        <p className="text-xs tracking-[0.3em] uppercase text-gray-400 font-semibold">
                            What We Stand For
                        </p>

                        <h2 className="text-3xl md:text-5xl font-black mt-3">
                            The RT18 Standard
                        </h2>

                    </div>

                    <div className="grid md:grid-cols-3 gap-5">

                        <div className="border border-gray-100 rounded-3xl p-8 hover:shadow-xl transition">
                            <div className="text-3xl mb-6">
                                ✦
                            </div>

                            <h3 className="text-xl font-bold">
                                Quality
                            </h3>

                            <p className="text-gray-500 mt-3 leading-7">
                                We focus on products that combine
                                style, usability and quality.
                            </p>
                        </div>

                        <div className="border border-gray-100 rounded-3xl p-8 hover:shadow-xl transition">
                            <div className="text-3xl mb-6">
                                ◇
                            </div>

                            <h3 className="text-xl font-bold">
                                Simplicity
                            </h3>

                            <p className="text-gray-500 mt-3 leading-7">
                                Shopping should be easy, clear and
                                enjoyable from start to finish.
                            </p>
                        </div>

                        <div className="border border-gray-100 rounded-3xl p-8 hover:shadow-xl transition">
                            <div className="text-3xl mb-6">
                                →
                            </div>

                            <h3 className="text-xl font-bold">
                                Customer First
                            </h3>

                            <p className="text-gray-500 mt-3 leading-7">
                                Every product and experience is built
                                with our customers in mind.
                            </p>
                        </div>

                    </div>

                </div>

            </section>

            {/* FINAL CTA */}

            <section className="pb-20 md:pb-28">

                <div className="max-w-7xl mx-auto px-6 md:px-8">

                    <div className="bg-[#f7f5f1] rounded-[32px] p-10 md:p-16 text-center">

                        <p className="text-xs tracking-[0.3em] uppercase text-gray-400 font-semibold">
                            Discover RT18
                        </p>

                        <h2 className="text-3xl md:text-5xl font-black mt-3">
                            Find something made
                            <br />
                            for you.
                        </h2>

                        <a
                            href="/shop"
                            className="inline-flex mt-8 bg-black text-white px-8 py-3.5 rounded-full font-semibold hover:bg-gray-800 transition"
                        >
                            Explore Collection →
                        </a>

                    </div>

                </div>

            </section>

        </main>
    );
}