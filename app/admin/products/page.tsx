"use client";

import { useEffect, useState } from "react";

type Category = {
    id: number;
    name: string;
};

type Product = {
    id: number;
    name: string;
    price: number;
    discount_price: number | null;
    stock: number;
    image_url: string | null;
    category_id: number | null;
    category_name: string | null;
};

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [discountPrice, setDiscountPrice] = useState("");
    const [categoryId, setCategoryId] = useState("");

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>(
        []
    );

    const [search, setSearch] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [uploading, setUploading] = useState(false);

    async function loadProducts() {
        const response = await fetch("/api/products");
        const data = await response.json();
        setProducts(data);
    }

    async function loadCategories() {
        const response = await fetch("/api/categories");
        const data = await response.json();
        setCategories(data);
    }

    useEffect(() => {
        loadProducts();
        loadCategories();
    }, []);

    function resetForm() {
        setName("");
        setPrice("");
        setStock("");
        setCategoryId("");
        setDiscountPrice("");
        setImageFile(null);
        setAdditionalImageFiles([]);
        setEditingId(null);
    }

    // =========================
    // UPLOAD ONE IMAGE
    // =========================

    async function uploadSingleImage(file: File) {
        const formData = new FormData();

        formData.append("file", file);

        const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error("Image upload failed");
        }

        return data.url;
    }

    // =========================
    // SAVE PRODUCT
    // =========================

    async function saveProduct() {
        if (!name || !price || !stock || !categoryId) {
            alert("Please fill all product details");
            return;
        }

        if (!editingId && !imageFile) {
            alert("Please select a main product image");
            return;
        }

        if (additionalImageFiles.length > 3) {
            alert("Maximum 3 additional images allowed");
            return;
        }

        setUploading(true);

        try {
            // =========================
            // MAIN IMAGE
            // =========================

            let imageUrl: string | null = null;

            if (imageFile) {
                imageUrl = await uploadSingleImage(imageFile);
            }

            // =========================
            // EDIT PRODUCT
            // =========================

            if (editingId) {
                const response = await fetch("/api/products", {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        id: editingId,
                        name,
                        price,
                        stock,
                        categoryId,
                        imageUrl,
                        discountPrice,
                    }),
                });

                const data = await response.json();

                if (!data.success) {
                    alert(data.message || "Product update failed");
                    return;
                }

                // Add newly selected additional images
                for (const file of additionalImageFiles) {
                    const url = await uploadSingleImage(file);

                    await fetch("/api/product-images", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            productId: editingId,
                            imageUrl: url,
                        }),
                    });
                }

                alert("Product updated successfully!");

                resetForm();
                loadProducts();

                return;
            }

            // =========================
            // CREATE PRODUCT
            // =========================

            const response = await fetch("/api/products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    price,
                    stock,
                    categoryId,
                    imageUrl,
                    discountPrice,
                }),
            });

            const data = await response.json();

            if (!data.success) {
                alert(data.message || "Product creation failed");
                return;
            }

            const productId = data.product.id;

            // =========================
            // ADDITIONAL IMAGES
            // =========================

            for (const file of additionalImageFiles) {
                const url = await uploadSingleImage(file);

                const imageResponse = await fetch(
                    "/api/product-images",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            productId,
                            imageUrl: url,
                        }),
                    }
                );

                const imageData = await imageResponse.json();

                if (!imageData.success) {
                    throw new Error(
                        "Additional image save failed"
                    );
                }
            }

            alert("Product added successfully!");

            resetForm();
            loadProducts();
        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        } finally {
            setUploading(false);
        }
    }

    // =========================
    // EDIT PRODUCT
    // =========================

    function editProduct(product: Product) {
        setEditingId(product.id);
        setName(product.name);
        setPrice(String(product.price));

        setDiscountPrice(
            product.discount_price
                ? String(product.discount_price)
                : ""
        );

        setStock(String(product.stock));
        setCategoryId(
            String(product.category_id || "")
        );

        setImageFile(null);
        setAdditionalImageFiles([]);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    // =========================
    // DELETE PRODUCT
    // =========================

    async function deleteProduct(id: number) {
        const confirmed = confirm(
            "Are you sure you want to delete this product?"
        );

        if (!confirmed) return;

        try {
            const response = await fetch("/api/products", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(
                    data.message ||
                    "Unable to delete product"
                );
                return;
            }

            if (data.success) {
                alert("Product deleted successfully!");
                loadProducts();
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong while deleting product");
        }
    }

    const filteredProducts = products.filter(
        (product) =>
            product.name
                .toLowerCase()
                .includes(search.toLowerCase())
    );

    return (
        <main className="min-h-screen bg-gray-100 p-8">

            <div className="max-w-7xl mx-auto">

                {/* HEADER */}

                <div className="flex justify-between items-center mb-8">

                    <h1 className="text-3xl font-bold text-gray-900">
                        Product Management
                    </h1>

                    <span className="text-gray-600">
                        {products.length} Products
                    </span>

                </div>

                {/* ADD / EDIT PRODUCT */}

                <div className="bg-white p-6 rounded-2xl shadow mb-8">

                    <h2 className="text-xl font-bold text-gray-900 mb-5">
                        {editingId
                            ? "Edit Product"
                            : "Add Product"}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* NAME */}

                        <input
                            className="border p-3 rounded-lg text-gray-900"
                            placeholder="Product Name"
                            value={name}
                            onChange={(e) =>
                                setName(e.target.value)
                            }
                        />

                        {/* PRICE */}

                        <input
                            className="border p-3 rounded-lg text-gray-900"
                            placeholder="Price"
                            type="number"
                            value={price}
                            onChange={(e) =>
                                setPrice(e.target.value)
                            }
                        />

                        {/* DISCOUNT */}

                        <input
                            className="border p-3 rounded-lg text-gray-900"
                            placeholder="Discount Price (Optional)"
                            type="number"
                            value={discountPrice}
                            onChange={(e) =>
                                setDiscountPrice(e.target.value)
                            }
                        />

                        {/* STOCK */}

                        <input
                            className="border p-3 rounded-lg text-gray-900"
                            placeholder="Stock"
                            type="number"
                            value={stock}
                            onChange={(e) =>
                                setStock(e.target.value)
                            }
                        />

                        {/* CATEGORY */}
                        <select
                            className="w-full h-12 border p-3 rounded-lg text-gray-900"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                        >
                            <option value="">
                                Select Category
                            </option>

                            {categories.map((category) => (
                                <option
                                    key={category.id}
                                    value={category.id}
                                >
                                    {category.name}
                                </option>
                            ))}
                        </select>

                        {/* MAIN IMAGE */}

                        <div>

                            {/* <label className="block font-semibold mb-2 text-gray-900">
                                Main Product Image
                            </label> */}

                            <input
                                type="file"
                                accept="image/*"
                                className="border p-3 rounded-lg text-gray-900 w-full"
                                onChange={(e) =>
                                    setImageFile(
                                        e.target.files?.[0] || null
                                    )
                                }
                            />

                            <p className="text-xs text-gray-500 mt-2">
                                This image will be the main product image.
                            </p>

                        </div>

                        {/* ADDITIONAL IMAGES */}

                        <div className="md:col-span-2">

                            <label className="block font-semibold mb-2 text-gray-900">
                                Additional Product Images
                            </label>

                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="w-full border p-3 rounded-lg text-gray-900"
                                onChange={(e) => {
                                    const newFiles = Array.from(e.target.files || []);

                                    const combinedFiles = [
                                        ...additionalImageFiles,
                                        ...newFiles,
                                    ];

                                    if (combinedFiles.length > 3) {
                                        alert("You can upload maximum 3 additional images");
                                        e.target.value = "";
                                        return;
                                    }

                                    setAdditionalImageFiles(combinedFiles);

                                    e.target.value = "";
                                }}
                            />

                            <p className="text-sm text-gray-500 mt-2">
                                Upload up to 3 additional images.
                                Total product images: 4.
                            </p>

                            {/* PREVIEW */}

                            {additionalImageFiles.length > 0 && (

                                <div className="flex gap-3 mt-4 flex-wrap">

                                    {additionalImageFiles.map((file, index) => (
                                        <div
                                            key={`${file.name}-${index}`}
                                            className="relative w-24 h-24 border rounded-xl overflow-hidden"
                                        >
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`Additional ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setAdditionalImageFiles(
                                                        additionalImageFiles.filter(
                                                            (_, fileIndex) => fileIndex !== index
                                                        )
                                                    );
                                                }}
                                                className="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-full text-xs font-bold flex items-center justify-center hover:bg-red-700"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}

                                </div>

                            )}

                        </div>

                    </div>

                    {/* BUTTONS */}

                    <div className="flex gap-3 mt-5">

                        <button
                            onClick={saveProduct}
                            disabled={uploading}
                            className="bg-black text-white px-6 py-3 rounded-lg disabled:opacity-50"
                        >
                            {uploading
                                ? "Saving..."
                                : editingId
                                    ? "Update Product"
                                    : "Add Product"}
                        </button>

                        {editingId && (

                            <button
                                onClick={resetForm}
                                className="border border-gray-400 text-gray-900 px-6 py-3 rounded-lg"
                            >
                                Cancel
                            </button>

                        )}

                    </div>

                </div>

                {/* SEARCH */}

                <div className="mb-6">

                    <input
                        className="w-full md:w-96 border p-3 rounded-lg text-gray-900"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />

                </div>

                {/* PRODUCT LIST */}

                <div className="bg-white rounded-2xl shadow overflow-hidden">

                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead className="bg-gray-100">

                                <tr>

                                    <th className="text-left p-4 text-gray-900">
                                        Product
                                    </th>

                                    <th className="text-left p-4 text-gray-900">
                                        Category
                                    </th>

                                    <th className="text-left p-4 text-gray-900">
                                        Price
                                    </th>

                                    <th className="text-left p-4 text-gray-900">
                                        Stock
                                    </th>

                                    <th className="text-left p-4 text-gray-900">
                                        Actions
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {filteredProducts.map(
                                    (product) => (

                                        <tr
                                            key={product.id}
                                            className="border-t"
                                        >

                                            <td className="p-4">

                                                <div className="flex items-center gap-3">

                                                    {product.image_url && (
                                                        <img
                                                            src={product.image_url}
                                                            alt={product.name}
                                                            className="w-14 h-14 object-cover rounded-lg"
                                                        />
                                                    )}

                                                    <span className="font-semibold text-gray-900">
                                                        {product.name}
                                                    </span>

                                                </div>

                                            </td>

                                            <td className="p-4 text-gray-700">
                                                {product.category_name ||
                                                    "-"}
                                            </td>

                                            <td className="p-4 font-semibold text-gray-900">
                                                ₹{product.price}
                                            </td>

                                            <td className="p-4">

                                                {product.stock === 0 ? (

                                                    <span className="text-red-600 font-semibold">
                                                        Out of Stock
                                                    </span>

                                                ) : product.stock <= 5 ? (

                                                    <span className="text-orange-600 font-semibold">
                                                        Low Stock (
                                                        {product.stock})
                                                    </span>

                                                ) : (

                                                    <span className="text-green-600 font-semibold">
                                                        In Stock (
                                                        {product.stock})
                                                    </span>

                                                )}

                                            </td>

                                            <td className="p-4">

                                                <div className="flex gap-2">

                                                    <button
                                                        onClick={() =>
                                                            editProduct(product)
                                                        }
                                                        className="border border-gray-400 px-3 py-2 rounded-lg text-gray-900"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            deleteProduct(
                                                                product.id
                                                            )
                                                        }
                                                        className="bg-red-600 text-white px-3 py-2 rounded-lg"
                                                    >
                                                        Delete
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    )
                                )}

                                {filteredProducts.length ===
                                    0 && (

                                        <tr>

                                            <td
                                                colSpan={5}
                                                className="p-8 text-center text-gray-600"
                                            >
                                                No products found.
                                            </td>

                                        </tr>

                                    )}

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </main>
    );
}