"use client";

import { useEffect, useState } from "react";

type Category = {
    id: number;
    name: string;
};

export default function CategoriesPage() {
    const [name, setName] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    async function loadCategories() {
        try {
            const response = await fetch("/api/categories");
            const data = await response.json();

            setCategories(data);
        } catch (error) {
            console.error("Load categories error:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadCategories();
    }, []);

    async function addCategory() {
        const categoryName = name.trim();

        if (!categoryName) {
            alert("Please enter category name");
            return;
        }

        setAdding(true);

        try {
            const response = await fetch("/api/categories", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: categoryName,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setName("");
                await loadCategories();
                alert("Category added successfully!");
            } else {
                alert(data.message || "Failed to add category");
            }
        } catch (error) {
            console.error("Add category error:", error);
            alert("Something went wrong");
        } finally {
            setAdding(false);
        }
    }

    async function deleteCategory(id: number) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this category?"
        );

        if (!confirmed) {
            return;
        }

        setDeletingId(id);

        try {
            const response = await fetch("/api/categories", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id,
                }),
            });

            const data = await response.json();

            if (data.success) {
                await loadCategories();
                alert("Category deleted successfully!");
            } else {
                alert(data.message || "Unable to delete category");
            }
        } catch (error) {
            console.error("Delete category error:", error);
            alert("Something went wrong");
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <main className="min-h-screen bg-gray-100 p-6 md:p-8">

            <div className="max-w-5xl mx-auto">

                {/* HEADER */}

                <div className="mb-8">

                    <p className="text-sm text-gray-500">
                        Admin Panel
                    </p>

                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-1">
                        Categories
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Add and manage your product categories.
                    </p>

                </div>

                {/* ADD CATEGORY */}

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">

                    <h2 className="text-xl font-bold text-gray-900">
                        Add New Category
                    </h2>

                    <p className="text-sm text-gray-500 mt-1 mb-5">
                        Create a category for your products.
                    </p>

                    <div className="flex flex-col md:flex-row gap-3">

                        <input
                            className="flex-1 border border-gray-300 p-3 rounded-xl text-gray-900 outline-none focus:border-black"
                            placeholder="e.g. Jewellery"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    addCategory();
                                }
                            }}
                        />

                        <button
                            onClick={addCategory}
                            disabled={adding}
                            className="bg-black text-white px-7 py-3 rounded-xl font-semibold hover:bg-gray-800 transition disabled:opacity-50"
                        >
                            {adding ? "Adding..." : "+ Add Category"}
                        </button>

                    </div>

                </div>

                {/* CATEGORY LIST */}

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

                    <div className="p-6 border-b border-gray-200 flex items-center justify-between">

                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                All Categories
                            </h2>

                            <p className="text-sm text-gray-500 mt-1">
                                {categories.length}{" "}
                                {categories.length === 1
                                    ? "category"
                                    : "categories"}
                            </p>
                        </div>

                    </div>

                    {/* LOADING */}

                    {loading && (
                        <div className="p-8 text-center text-gray-500">
                            Loading categories...
                        </div>
                    )}

                    {/* EMPTY */}

                    {!loading && categories.length === 0 && (
                        <div className="p-12 text-center">

                            <div className="text-4xl">
                                📂
                            </div>

                            <h3 className="font-bold text-gray-900 mt-4">
                                No categories yet
                            </h3>

                            <p className="text-sm text-gray-500 mt-1">
                                Add your first category above.
                            </p>

                        </div>
                    )}

                    {/* LIST */}

                    {!loading && categories.length > 0 && (
                        <div className="divide-y divide-gray-100">

                            {categories.map((category, index) => (

                                <div
                                    key={category.id}
                                    className="p-5 flex items-center justify-between gap-4 hover:bg-gray-50 transition"
                                >

                                    <div className="flex items-center gap-4">

                                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-700">
                                            {index + 1}
                                        </div>

                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {category.name}
                                            </p>

                                            <p className="text-xs text-gray-400 mt-1">
                                                Category ID: #{category.id}
                                            </p>
                                        </div>

                                    </div>

                                    <button
                                        onClick={() =>
                                            deleteCategory(category.id)
                                        }
                                        disabled={
                                            deletingId === category.id
                                        }
                                        className="border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-50 transition disabled:opacity-50"
                                    >
                                        {deletingId === category.id
                                            ? "Deleting..."
                                            : "Delete"}
                                    </button>

                                </div>

                            ))}

                        </div>
                    )}

                </div>

            </div>

        </main>
    );
}