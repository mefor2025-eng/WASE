/**
 * WASE - Main JavaScript
 * 
 * Includes:
 * 1. Config & State
 * 2. Mock Data
 * 3. API Service
 * 4. UI Rendering Helpers
 * 5. Page Initialization Logic
 */

// --- 1. CONFIG & STATE ---

const CONFIG = {
    // Paste your deployed Google Web App URL here
    API_URL: "https://script.google.com/macros/s/AKfycbz5ffYU8gqZJ3N8-Xcnc2yw-HoeE8_uwuK6JJaf6kZp2Fqm-xNCVqms9qDPTue4gP-Y/exec",
    USE_MOCK: false // Set to false when backend is ready and URL is set
};

const state = {
    products: [],
    cart: JSON.parse(localStorage.getItem('wase_cart')) || [],
    user: JSON.parse(localStorage.getItem('wase_user')) || null,
    orders: []
};

// --- 2. MOCK DATA (Fallback) ---

const MOCK_DATA = {
    products: [
        {
            id: "p1",
            name: "Minimalist Black Watch",
            price: 2499,
            description: "Elegant matte black analog watch with premium leather strap.",
            category: "Accessories",
            images: ["https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=500"],
            stock: 10
        },
        {
            id: "p2",
            name: "Noise Cancelling Headphones",
            price: 5999,
            description: "High fidelity audio with active noise cancellation. 30h battery.",
            category: "Electronics",
            images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=500"],
            stock: 5
        },
        {
            id: "p3",
            name: "White Sneakers",
            price: 1999,
            description: "Classic white sneakers for everyday urban wear. Comfortable sole.",
            category: "Footwear",
            images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=500"],
            stock: 20
        },
        {
            id: "p4",
            name: "Graphite Desk Lamp",
            price: 1299,
            description: "Adjustable LED desk lamp with touch control and dimming.",
            category: "Home",
            images: ["https://images.unsplash.com/photo-1534073828943-f801091a7d58?auto=format&fit=crop&q=80&w=500"],
            stock: 8
        },
        {
            id: "p5",
            name: "Leather Backpack",
            price: 3499,
            description: "Premium leather backpack with laptop compartment.",
            category: "Accessories",
            images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=500"],
            stock: 12
        }
    ]
};

// --- 3. API SERVICE ---

const API = {
    async getProducts() {
        if (CONFIG.USE_MOCK || !CONFIG.API_URL) {
            console.log("Fetching Mock Products...");
            return new Promise(resolve => setTimeout(() => resolve(MOCK_DATA.products), 500));
        }
        try {
            const res = await fetch(`${CONFIG.API_URL}?action=getProducts`);
            const data = await res.json();
            return data.status === "success" ? data.products : [];
        } catch (e) {
            console.error("API Error:", e);
            return [];
        }
    },

    async login(phone, password) {
        if (CONFIG.USE_MOCK) {
            // Mock Login
            if (phone === "9999999999" && password === "1234") {
                return { status: "success", user: { name: "Demo User", phone, address: "123 Street", city: "kerala", pincode: "673502" } };
            }
            return { status: "error", message: "Invalid credentials (Mock: 9999999999/1234)" };
        }
        // Real implementation
        const res = await fetch(CONFIG.API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'login', phone, password })
        });
        return await res.json();
    },

    async signup(userData) {
        if (CONFIG.USE_MOCK) {
            return { status: "success", user: userData };
        }
        const res = await fetch(CONFIG.API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'signup', ...userData })
        });
        return await res.json();
    },

    async placeOrder(orderData) {
        if (CONFIG.USE_MOCK) {
            return { status: "success", orderId: "MOCK-ORD-" + Date.now() };
        }
        try {
            const res = await fetch(CONFIG.API_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'placeOrder', ...orderData })
            });
            return await res.json();
        } catch (e) {
            console.error("Order Save Error", e);
            return { status: "error" }; // Don't block WhatsApp workflow on error
        }
    }
};

function logout() {
    localStorage.removeItem('wase_user');
    window.location.href = 'index.html';
}

// --- 4. CORE HELPERS ---

function formatPrice(amount) {
    return "₹" + amount.toLocaleString('en-IN');
}

function showToast(msg) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function addToCart(product) {
    const existing = state.cart.find(item => item.id === product.id);
    if (existing) {
        existing.qty++;
    } else {
        state.cart.push({ ...product, qty: 1 });
    }
    saveCart();
    showToast("Added to Cart");
    updateCartCount();
}

function saveCart() {
    localStorage.setItem('wase_cart', JSON.stringify(state.cart));
}

function updateCartCount() {
    const count = state.cart.reduce((sum, item) => sum + item.qty, 0);
    const badge = document.getElementById('cart-count');
    if (badge) badge.textContent = count > 0 ? count : '';
}

function renderHeader() {
    return `
    <div class="container flex justify-between items-center" style="height: 100%;">
        <a href="index.html" class="logo">WASEM&emsp;</a> 
        <div class="flex items-center gap-md">
            <a href="products.html" class="hidden-mobile"><i class="ph ph-magnifying-glass" style="font-size:1.5rem"></i></a>
            <a href="cart.html" style="position:relative">
                <i class="ph ph-shopping-cart" style="font-size:1.5rem"></i>
                <span id="cart-count" style="position:absolute; top:-5px; right:-5px; background:black; color:white; font-size:0.7rem; padding:2px 5px; border-radius:10px;">${state.cart.length || ''}</span>
            </a>
            ${state.user
            ? `<a href="orders.html"><i class="ph ph-user" style="font-size:1.5rem"></i></a>`
            : `<a href="login.html" class="btn btn-primary" style="padding: 6px 12px; font-size: 0.9rem;">Login</a>`
        }
        </div>
    </div>
    `;
}

function renderMobileNav() {
    const page = window.location.pathname;
    const isActive = (p) => page.includes(p) ? 'active' : '';

    return `
    <div class="nav-item ${isActive('index.html') || (!page.includes('.html') && 'active')}" onclick="window.location.href='index.html'">
        <i class="ph ph-house nav-icon"></i>
        <span>Home</span>
    </div>
    <div class="nav-item ${isActive('products.html')}" onclick="window.location.href='products.html'">
        <i class="ph ph-grid-four nav-icon"></i>
        <span>Shop</span>
    </div>
    <div class="nav-item ${isActive('cart.html')}" onclick="window.location.href='cart.html'">
        <i class="ph ph-shopping-cart nav-icon"></i>
        <span>Cart</span>
    </div>
    <div class="nav-item ${isActive('orders.html') || isActive('login.html')}" onclick="window.location.href='${state.user ? 'orders.html' : 'login.html'}'">
        <i class="ph ph-user nav-icon"></i>
        <span>Account</span>
    </div>
    `;
}

// --- 5. INITIALIZATION ---

async function init() {
    // Inject Header & Nav
    const headerEl = document.querySelector('header');
    if (headerEl) headerEl.innerHTML = renderHeader();

    const navEl = document.querySelector('.mobile-nav');
    if (navEl) navEl.innerHTML = renderMobileNav();

    updateCartCount();

    // Check Icons
    if (!document.getElementById('phosphor-icons')) {
        const script = document.createElement('script');
        script.id = 'phosphor-icons';
        script.src = "https://unpkg.com/@phosphor-icons/web";
        document.head.appendChild(script);
    }
}

// Auto-run init
document.addEventListener('DOMContentLoaded', init);