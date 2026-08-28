"use client";


import { useEffect, useState } from "react";
import heroImage from "./assests/hero.png";
import logo from "./assests/brand_new.png";


type User = {
  id: number;
  name: string;
  email: string;
};

type Product = {
  id: number;
  name: string;
  price: number;
  discount_price: number | null;
  stock: number;
  image_url: string | null;
  category_name: string | null;
};

type Category = {
  id: number;
  name: string;
};

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [cartCount, setCartCount] = useState(0);
  const [search, setSearch] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const searchResults = search.trim()
    ? products
      .filter((product) =>
        `${product.name} ${product.category_name || ""}`
          .toLowerCase()
          .includes(search.trim().toLowerCase())
      )
      .slice(0, 6)
    : [];

  useEffect(() => {
    async function checkUser() {
      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();

        if (data.success) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setCheckingAuth(false);
      }
    }

    checkUser();
  }, []);

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch("/api/products");
        const data = await response.json();

        setProducts(data);
      } catch (error) {
        console.error("Products loading error:", error);
      } finally {
        setLoadingProducts(false);
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch("/api/categories");
        const data = await response.json();

        if (Array.isArray(data)) {
          setCategories(data);
        }
      } catch (error) {
        console.error("Categories loading error:", error);
      } finally {
        setLoadingCategories(false);
      }
    }

    loadCategories();
  }, []);

  useEffect(() => {
    function updateCartCount() {
      const cart = JSON.parse(
        localStorage.getItem("cart") || "[]"
      );

      const count = cart.reduce(
        (
          total: number,
          item: { quantity?: number }
        ) => total + (item.quantity || 0),
        0
      );

      setCartCount(count);
    }

    updateCartCount();

    window.addEventListener("cartUpdated", updateCartCount);

    return () => {
      window.removeEventListener(
        "cartUpdated",
        updateCartCount
      );
    };
  }, []);

  async function logout() {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        setUser(null);
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  function addToCart(product: Product) {
    if (product.stock <= 0) {
      alert("This product is out of stock");
      return;
    }

    const cart = JSON.parse(
      localStorage.getItem("cart") || "[]"
    );

    const existingProduct = cart.find(
      (item: Product & { quantity: number }) =>
        item.id === product.id
    );

    let updatedCart;

    if (existingProduct) {
      updatedCart = cart.map(
        (item: Product & { quantity: number }) =>
          item.id === product.id
            ? {
              ...item,
              quantity: item.quantity + 1,
            }
            : item
      );
    } else {
      updatedCart = [
        ...cart,
        {
          id: product.id,
          name: product.name,
          price:
            Number(product.price) -
            Number(product.discount_price || 0),
          original_price: product.price,
          discount_price: product.discount_price,
          image_url: product.image_url,
          quantity: 1,
        },
      ];
    }

    localStorage.setItem(
      "cart",
      JSON.stringify(updatedCart)
    );

    window.dispatchEvent(new Event("cartUpdated"));

    alert("Product added to cart");
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">

      {/* ================= NAVBAR ================= */}

      <nav className="sticky top-0 z-[9999] bg-white/95 border-b border-gray-100">

        {/* ================= MAIN NAVBAR ================= */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-5 md:px-8">

          <div className="h-20 flex items-center gap-3 md:gap-5">

            {/* ================= MOBILE MENU BUTTON ================= */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition shrink-0"
              aria-label="Open menu"
            >
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 6h16" />
                <path d="M4 12h16" />
                <path d="M4 18h16" />
              </svg>
            </button>

            {/* ================= LOGO ================= */}
            <a
              href="/"
              className="shrink-0 flex items-center"
            >
              <img
                src={logo.src}
                alt="RT18"
                className="h-30 sm:h-30 md:h-30 w-auto object-contain"
              />
            </a>

            {/* ================= DESKTOP NAV LINKS ================= */}
            <div className="hidden lg:flex items-center gap-6 text-sm font-medium shrink-0">

              <a
                href="/"
                className="text-black hover:text-gray-500 transition"
              >
                Home
              </a>

              <a
                href="/shop"
                className="text-gray-500 hover:text-black transition"
              >
                Shop
              </a>

              <a
                href="#categories"
                className="text-gray-500 hover:text-black transition"
              >
                Categories
              </a>

              <a
                href="/about"
                className="text-gray-500 hover:text-black transition"
              >
                About Us
              </a>

            </div>

            {/* ================= SPACER ================= */}
            <div className="flex-1" />

            {/* ================= ACTIONS ================= */}
            <div className="flex items-center gap-2 shrink-0">

              {/* SEARCH BUTTON */}
              <button
                onClick={() => setSearchOpen((value) => !value)}
                aria-label="Search products"
                className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-gray-100 transition"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-4-4" />
                </svg>
              </button>

              {/* ================= PROFILE ================= */}
              {!checkingAuth && (
                user ? (
                  <div className="relative">

                    <button
                      onClick={() =>
                        setProfileOpen((value) => !value)
                      }
                      aria-label="Open profile menu"
                      className="w-11 h-11 rounded-full bg-black text-white flex items-center justify-center font-bold hover:bg-gray-800 transition"
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </button>

                    {profileOpen && (
                      <div className="absolute right-0 top-14 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl p-2 z-[120]">

                        <div className="px-3 py-3 border-b border-gray-100">
                          <p className="font-semibold text-gray-900 truncate">
                            {user.name}
                          </p>

                          <p className="text-xs text-gray-500 truncate mt-1">
                            {user.email}
                          </p>
                        </div>

                        <a
                          href="/account"
                          className="block px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50"
                        >
                          My Account
                        </a>

                        <a
                          href="/account/orders"
                          className="block px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50"
                        >
                          My Orders
                        </a>

                        <button
                          onClick={logout}
                          className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50"
                        >
                          Logout
                        </button>

                      </div>
                    )}

                  </div>
                ) : (

                  <div className="hidden sm:flex items-center gap-2">

                    <a
                      href="/login"
                      className="px-3 py-2.5 text-sm font-semibold hover:text-gray-500"
                    >
                      Login
                    </a>

                    <a
                      href="/register"
                      className="bg-black text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition"
                    >
                      Register
                    </a>

                  </div>

                )
              )}

              {/* ================= CART ================= */}
              <a
                href="/cart"
                className="relative w-11 h-11 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition"
                aria-label="Cart"
              >

                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 8h12l1 12H5L6 8Z" />
                  <path d="M9 8a3 3 0 0 1 6 0" />
                </svg>

                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}

              </a>

            </div>

          </div>

          {/* ================= SEARCH BAR ================= */}
          {searchOpen && (
            <div className="pb-4">

              <div className="relative">

                {/* SEARCH ICON */}
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-4-4" />
                </svg>

                {/* INPUT */}
                <input
                  autoFocus
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full bg-gray-50 border border-gray-300 rounded-full pl-12 pr-14 py-3 text-sm outline-none focus:border-gray-500 focus:bg-white transition"
                />

                {/* CLOSE SEARCH */}
                <button
                  onClick={() => {
                    setSearch("");
                    setSearchOpen(false);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition"
                  aria-label="Close search"
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 6l12 12" />
                    <path d="M18 6L6 18" />
                  </svg>
                </button>

                {/* SEARCH RESULTS */}
                {search.trim() && (
                  <div className="absolute left-0 right-0 top-[calc(100%+8px)] bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-[120]">

                    {searchResults.length > 0 ? (

                      searchResults.map((product) => (

                        <a
                          key={product.id}
                          href={`/product/${product.id}`}
                          onClick={() => {
                            setSearch("");
                            setSearchOpen(false);
                          }}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 transition"
                        >

                          <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">

                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">
                                RT18
                              </div>
                            )}

                          </div>

                          <div className="min-w-0">

                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {product.name}
                            </p>

                            <p className="text-xs text-gray-500 mt-0.5">
                              ₹
                              {Number(
                                product.discount_price ??
                                product.price
                              ).toFixed(0)}
                            </p>

                          </div>

                        </a>

                      ))

                    ) : (

                      <div className="p-5 text-sm text-gray-500 text-center">
                        No products found.
                      </div>

                    )}

                  </div>
                )}

              </div>

            </div>
          )}

        </div>


        {/* ===================================================== */}
        {/* ================= MOBILE SIDE MENU ================== */}
        {/* ===================================================== */}

        {mobileMenuOpen && (
          <>

            {/* OVERLAY */}
            <div
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 z-[99998] lg:hidden"
            />

            {/* SIDE DRAWER */}
            <aside
              className="fixed left-0 top-0 bottom-0 w-[82%] max-w-sm bg-white z-[99999] shadow-2xl lg:hidden overflow-y-auto"
            >

              {/* DRAWER HEADER */}
              <div className="h-20 px-5 border-b border-gray-100 flex items-center justify-between">

                <a
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center"
                >
                  <img
                    src={logo.src}
                    alt="RT18"
                    className="h-14 w-auto object-contain"
                  />
                </a>

                {/* CLOSE MENU */}
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition"
                  aria-label="Close menu"
                >
                  <svg
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 6l12 12" />
                    <path d="M18 6L6 18" />
                  </svg>
                </button>

              </div>


              {/* MENU LINKS */}
              <div className="p-4 space-y-2">

                <a
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-4 py-4 rounded-xl text-base font-semibold hover:bg-gray-100 transition"
                >
                  Home
                </a>

                <a
                  href="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-4 py-4 rounded-xl text-base font-semibold hover:bg-gray-100 transition"
                >
                  Shop
                </a>

                <a
                  href="#categories"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-4 py-4 rounded-xl text-base font-semibold hover:bg-gray-100 transition"
                >
                  Categories
                </a>

                <a
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-4 py-4 rounded-xl text-base font-semibold hover:bg-gray-100 transition"
                >
                  About Us
                </a>

                <a
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-4 py-4 rounded-xl text-base font-semibold hover:bg-gray-100 transition"
                >
                  Contact Us
                </a>

                <a
                  href="/account/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-4 py-4 rounded-xl text-base font-semibold hover:bg-gray-100 transition"
                >
                  Track Order
                </a>

              </div>


              {/* MOBILE ACCOUNT SECTION */}
              <div className="border-t border-gray-100 p-5">

                {!checkingAuth && (
                  user ? (

                    <>

                      <div className="mb-4">
                        <p className="font-semibold text-gray-900">
                          {user.name}
                        </p>

                        <p className="text-xs text-gray-500 mt-1 break-all">
                          {user.email}
                        </p>
                      </div>

                      <a
                        href="/account"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-3 rounded-xl bg-gray-50 text-sm font-semibold mb-2"
                      >
                        My Account
                      </a>

                      <a
                        href="/account/orders"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-3 rounded-xl bg-gray-50 text-sm font-semibold mb-2"
                      >
                        My Orders
                      </a>

                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm font-semibold"
                      >
                        Logout
                      </button>

                    </>

                  ) : (

                    <div className="flex gap-2">

                      <a
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex-1 text-center border border-gray-200 py-3 rounded-xl text-sm font-semibold"
                      >
                        Login
                      </a>

                      <a
                        href="/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex-1 text-center bg-black text-white py-3 rounded-xl text-sm font-semibold"
                      >
                        Register
                      </a>

                    </div>

                  )
                )}

              </div>

            </aside>

          </>
        )}

      </nav>
      {/* HERO SECTION */}

      <section className="bg-[#f7f5f1] overflow-hidden">

        <div className="max-w-7xl mx-auto px-5 md:px-8">

          <div className="min-h-155 grid md:grid-cols-2 items-center gap-10 lg:gap-16">

            {/* LEFT CONTENT */}

            <div className="order-2 md:order-1 py-10 md:py-20">

              <p className="text-sm md:text-base font-semibold tracking-[0.25em] uppercase text-gray-500 mb-5">
                RT18 • New Collection
              </p>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] text-gray-950">
                Discover
                <br />
                Your Style.
              </h1>

              <p className="text-gray-600 text-base md:text-lg max-w-md mt-7 leading-relaxed">
                Discover stylish jewellery, accessories and
                everyday essentials made to elevate your look.
              </p>

              <div className="flex flex-wrap items-center gap-4 mt-9">

                <a
                  href="/shop"
                  className="inline-flex items-center gap-3 bg-black text-white px-7 py-3.5 rounded-full font-semibold hover:bg-gray-800 transition"
                >
                  Shop Now
                  <span className="text-lg">→</span>
                </a>

                <a
                  href="/shop"
                  className="text-sm font-semibold text-gray-700 hover:text-black transition"
                >
                  Explore Collection
                </a>

              </div>

              {/* SMALL TRUST INFO */}

              <div className="flex flex-wrap gap-6 mt-12 text-sm text-gray-500">

                <div>
                  <p className="font-bold text-gray-900">
                    Premium
                  </p>
                  <p>Quality Products</p>
                </div>

                <div className="w-px bg-gray-300" />

                <div>
                  <p className="font-bold text-gray-900">
                    Secure
                  </p>
                  <p>Easy Checkout</p>
                </div>

                <div className="w-px bg-gray-300" />

                <div>
                  <p className="font-bold text-gray-900">
                    Fast
                  </p>
                  <p>Reliable Delivery</p>
                </div>

              </div>

            </div>


            {/* RIGHT PRODUCT IMAGE */}

            <div className="order-1 md:order-2 relative flex items-center justify-center py-10 md:py-16">

              {/* Soft background shape */}

              <div className="absolute w-[80%] aspect-square bg-white rounded-[40px] rotate-3 shadow-sm" />

              <div className="relative w-full max-w-135">

                <div className="bg-white rounded-4xl overflow-hidden shadow-2xl">

                  <img
                    src={heroImage.src}
                    alt="RT18 Featured Product"
                    className="w-full aspect-square object-cover"
                  />

                </div>

                {/* FLOATING BADGE */}

                <div className="absolute -bottom-5 -left-3 md:-left-7 bg-black text-white rounded-2xl px-5 py-4 shadow-xl">

                  <p className="text-xs text-gray-400 uppercase tracking-wider">
                    Featured
                  </p>

                  <p className="font-bold mt-1">
                    New Arrival ✦
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ================= REAL PRODUCTS ================= */}

      <section className="bg-gray-50 py-20 md:py-24">

        <div className="max-w-7xl mx-auto px-5 md:px-8">

          <div className="flex items-end justify-between mb-10">

            <div>

              <p className="text-xs tracking-[0.3em] uppercase text-gray-400 font-semibold">
                Curated For You
              </p>

              <h2 className="text-3xl md:text-4xl font-black mt-2">
                Featured Products
              </h2>

            </div>

            <a
              href="/shop"
              className="hidden sm:block text-sm font-semibold hover:underline"
            >
              View All →
            </a>

          </div>

          {loadingProducts ? (

            <div className="py-20 text-center text-gray-500">
              Loading products...
            </div>

          ) : products.length === 0 ? (

            <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">

              <p className="text-gray-500">
                No products available right now.
              </p>

            </div>

          ) : (

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">

              {products.slice(0, 8).map((product) => {

                const hasDiscount =
                  product.discount_price !== null &&
                  Number(product.discount_price) > 0 &&
                  Number(product.discount_price) < Number(product.price);

                const discountAmount = hasDiscount
                  ? Number(product.discount_price)
                  : 0;

                const displayPrice =
                  Number(product.price) - discountAmount;
                return (

                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden group"
                  >

                    {/* IMAGE */}

                    <a
                      href={`/shop`}
                      className="relative block h-56 md:h-72 bg-gray-100"
                    >

                      {product.image_url ? (

                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />

                      ) : (

                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl font-black">
                          RT18
                        </div>

                      )}

                      {/* CATEGORY */}

                      {product.category_name && (
                        <span className="absolute top-3 left-3 bg-white/95 backdrop-blur text-gray-900 text-[10px] font-bold px-2.5 py-1.5 rounded-md">
                          {product.category_name}
                        </span>
                      )}

                    </a>

                    {/* DETAILS */}

                    <div className="p-4 md:p-5">

                      <h3 className="font-bold text-gray-900 line-clamp-1">
                        {product.name}
                      </h3>

                      <div className="flex items-center gap-2 mt-2">

                        <span className="font-bold">
                          ₹{displayPrice.toFixed(2)}
                        </span>

                        {hasDiscount && (
                          <span className="text-sm text-gray-400 line-through">
                            ₹{Number(product.price).toFixed(2)}
                          </span>
                        )}

                      </div>

                      {hasDiscount && (
                        <p className="text-xs text-green-600 font-semibold mt-1">
                          Special Price
                        </p>
                      )}

                      {product.stock <= 0 ? (

                        <button
                          disabled
                          className="w-full mt-4 bg-gray-200 text-gray-500 py-2.5 rounded-xl text-sm font-semibold cursor-not-allowed"
                        >
                          Out of Stock
                        </button>

                      ) : (

                        <button
                          onClick={() => addToCart(product)}
                          className="w-full mt-4 bg-black text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition"
                        >
                          Add to Cart
                        </button>

                      )}

                    </div>

                  </div>

                );
              })}

            </div>

          )}

        </div>

      </section>

      {/* ================= CATEGORIES ================= */}

      <section
        id="categories"
        className="py-20 md:py-24"
      >

        <div className="max-w-7xl mx-auto px-5 md:px-8">

          <div className="flex items-end justify-between mb-10">

            <div>

              <p className="text-xs tracking-[0.3em] uppercase text-gray-400 font-semibold">
                Explore
              </p>

              <h2 className="text-3xl md:text-4xl font-black mt-2">
                Shop by Category
              </h2>

            </div>

            <a
              href="/shop"
              className="hidden sm:block text-sm font-semibold hover:underline"
            >
              View All →
            </a>

          </div>

          {loadingCategories ? (

            <div className="py-12 text-center text-gray-500">
              Loading categories...
            </div>

          ) : categories.length === 0 ? (

            <div className="bg-gray-50 border border-gray-100 rounded-2xl py-12 text-center text-gray-500">
              No categories available right now.
            </div>

          ) : (

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

              {categories.map((category, index) => {
                const icons = ["✦", "◇", "◈", "✧"];

                return (
                  <a
                    key={category.id}
                    href="/shop"
                    className="group min-h-47.5 bg-gray-50 border border-gray-100 rounded-2xl p-6 flex flex-col justify-between hover:bg-black hover:text-white transition-all duration-300"
                  >

                    <span className="text-3xl text-gray-400 group-hover:text-white transition">
                      {icons[index % icons.length]}
                    </span>

                    <div>

                      <h3 className="text-lg font-bold">
                        {category.name}
                      </h3>

                      <p className="text-sm text-gray-500 group-hover:text-gray-400 mt-1">
                        Explore {category.name}
                      </p>

                    </div>

                  </a>
                );
              })}

            </div>

          )}

        </div>

      </section>

      {/* ================= PROMO ================= */}

      <section className="py-20 md:py-24">

        <div className="max-w-7xl mx-auto px-5 md:px-8">

          <div className="bg-black text-white rounded-3xl p-8 md:p-14 flex flex-col md:flex-row md:items-center justify-between gap-8">

            <div>

              <p className="text-gray-400 text-xs tracking-[0.3em] uppercase font-semibold">
                RT18 Collection
              </p>

              <h2 className="text-3xl md:text-5xl font-black mt-3">
                Find something
                <br />
                made for you.
              </h2>

              <p className="text-gray-400 mt-4 max-w-lg">
                Explore our latest collection and discover
                pieces that match your personal style.
              </p>

            </div>

            <a
              href="/shop"
              className="shrink-0 bg-white text-black px-7 py-3.5 rounded-xl font-semibold hover:bg-gray-200 transition text-center"
            >
              Explore Shop →
            </a>

          </div>

        </div>

      </section>

      {/* ================= WHY RT18 ================= */}

      <section className="border-t border-gray-100 py-20">

        <div className="max-w-7xl mx-auto px-5 md:px-8">

          <div className="text-center mb-12">

            <p className="text-xs tracking-[0.3em] uppercase text-gray-400 font-semibold">
              Why RT18
            </p>

            <h2 className="text-3xl md:text-4xl font-black mt-2">
              Simple. Stylish. Reliable.
            </h2>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            <div className="border border-gray-100 rounded-2xl p-7">

              <div className="text-3xl mb-5">
                ✓
              </div>

              <h3 className="font-bold text-lg">
                Quality First
              </h3>

              <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                Products selected with attention to quality,
                style and everyday usability.
              </p>

            </div>

            <div className="border border-gray-100 rounded-2xl p-7">

              <div className="text-3xl mb-5">
                ◇
              </div>

              <h3 className="font-bold text-lg">
                Secure Shopping
              </h3>

              <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                Shop confidently with secure checkout and
                multiple payment options.
              </p>

            </div>

            <div className="border border-gray-100 rounded-2xl p-7">

              <div className="text-3xl mb-5">
                →
              </div>

              <h3 className="font-bold text-lg">
                Easy Experience
              </h3>

              <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                From discovering products to tracking orders,
                everything stays simple.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* ================= FOOTER ================= */}

      <footer className="bg-black text-white">

        <div className="max-w-7xl mx-auto px-5 md:px-8 py-14">

          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

            <div className="md:col-span-2">

              <h2 className="text-3xl font-black">
                RT18
              </h2>

              <p className="text-gray-400 mt-4 max-w-md leading-relaxed">
                Discover your style with RT18.
                Fashion, jewellery and accessories
                curated for everyday confidence.
              </p>

            </div>

            <div>

              <h3 className="font-bold mb-4">
                Shop
              </h3>

              <div className="space-y-3 text-sm text-gray-400">

                <a
                  href="/shop"
                  className="block hover:text-white"
                >
                  All Products
                </a>

                <a
                  href="/shop"
                  className="block hover:text-white"
                >
                  Jewellery
                </a>

                <a
                  href="/shop"
                  className="block hover:text-white"
                >
                  Accessories
                </a>

              </div>

            </div>

            <div>

              <h3 className="font-bold mb-4">
                Account
              </h3>

              <div className="space-y-3 text-sm text-gray-400">

                <a
                  href="/account"
                  className="block hover:text-white"
                >
                  My Account
                </a>

                <a
                  href="/account/orders"
                  className="block hover:text-white"
                >
                  My Orders
                </a>

                <a
                  href="/cart"
                  className="block hover:text-white"
                >
                  Cart
                </a>

                <a
                  href="/contact"
                  className="block hover:text-white"
                >
                  Contact US
                </a>

                <a
                  href="/shipping-return-policy"
                  className="block hover:text-white"
                >
                  Shipping & Return Policy
                </a>

              </div>


            </div>


          </div>

          <div className="border-t border-gray-800 mt-12 pt-6 flex flex-col md:flex-row justify-between gap-3 text-sm text-gray-500">

            <p>
              © {new Date().getFullYear()} RT18. All rights reserved.
            </p>

            <p>
              Built with style.
            </p>

          </div>

        </div>

      </footer>

    </main>
  );
}