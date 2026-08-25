"use client";

import { useEffect, useState } from "react";

type User = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
    city: string | null;
    pincode: string | null;
};

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [pincode, setPincode] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function loadProfile() {
            try {
                const response = await fetch("/api/auth/me");
                const data = await response.json();

                if (!data.success) {
                    window.location.href = "/login";
                    return;
                }

                const currentUser = data.user;

                setUser(currentUser);

                setName(currentUser.name || "");
                setPhone(currentUser.phone || "");
                setAddress(currentUser.address || "");
                setCity(currentUser.city || "");
                setPincode(currentUser.pincode || "");
            } catch (error) {
                console.error("Profile error:", error);
                window.location.href = "/login";
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, []);

    async function updateProfile() {
        if (!name.trim()) {
            alert("Name is required");
            return;
        }

        setSaving(true);

        try {
            const response = await fetch("/api/auth/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    phone,
                    address,
                    city,
                    pincode,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setUser(data.user);
                alert("Profile updated successfully!");
            } else {
                alert(data.message || "Failed to update profile");
            }
        } catch (error) {
            console.error("Update profile error:", error);
            alert("Something went wrong");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-100 flex items-center justify-center">
                <p className="text-gray-500">
                    Loading profile...
                </p>
            </main>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <main className="min-h-screen bg-gray-100 p-6 md:p-10">

            <div className="max-w-3xl mx-auto">

                {/* HEADER */}

                <div className="mb-8">

                    <a
                        href="/account"
                        className="text-sm text-gray-500 hover:text-black"
                    >
                        ← Back to Account
                    </a>

                    <h1 className="text-3xl font-bold text-gray-900 mt-4">
                        My Profile
                    </h1>

                    <p className="text-gray-500 mt-1">
                        Manage your personal and delivery information.
                    </p>

                </div>

                {/* PROFILE */}

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

                    {/* AVATAR */}

                    <div className="flex items-center gap-5 pb-6 border-b border-gray-200">

                        <div className="w-20 h-20 rounded-full bg-black text-white flex items-center justify-center text-3xl font-bold">
                            {name.charAt(0).toUpperCase()}
                        </div>

                        <div>

                            <h2 className="text-2xl font-bold text-gray-900">
                                {name}
                            </h2>

                            <p className="text-gray-500 mt-1">
                                {user.email}
                            </p>

                        </div>

                    </div>

                    {/* FORM */}

                    <div className="mt-6 space-y-5">

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Full Name
                            </label>

                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full border border-gray-300 p-3 rounded-xl text-gray-900 outline-none focus:border-black"
                                placeholder="Full Name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Email Address
                            </label>

                            <input
                                type="email"
                                value={user.email}
                                disabled
                                className="w-full border border-gray-200 bg-gray-100 p-3 rounded-xl text-gray-500"
                            />

                            <p className="text-xs text-gray-400 mt-1">
                                Email address cannot be changed here.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Mobile Number
                            </label>

                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full border border-gray-300 p-3 rounded-xl text-gray-900 outline-none focus:border-black"
                                placeholder="Mobile Number"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Address
                            </label>

                            <textarea
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                rows={4}
                                className="w-full border border-gray-300 p-3 rounded-xl text-gray-900 outline-none focus:border-black"
                                placeholder="Full Address"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    City
                                </label>

                                <input
                                    type="text"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="w-full border border-gray-300 p-3 rounded-xl text-gray-900 outline-none focus:border-black"
                                    placeholder="City"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Pincode
                                </label>

                                <input
                                    type="text"
                                    value={pincode}
                                    onChange={(e) => setPincode(e.target.value)}
                                    className="w-full border border-gray-300 p-3 rounded-xl text-gray-900 outline-none focus:border-black"
                                    placeholder="Pincode"
                                />
                            </div>

                        </div>

                        {/* SAVE */}

                        <button
                            onClick={updateProfile}
                            disabled={saving}
                            className="w-full bg-black text-white py-3 rounded-xl font-semibold disabled:opacity-50"
                        >
                            {saving
                                ? "Saving..."
                                : "Save Changes"}
                        </button>

                    </div>

                </div>

            </div>

        </main>
    );
}