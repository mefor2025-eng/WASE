# WASE - Minimal E-commerce Website

A premium, black-and-white, mobile-first e-commerce website with Google Sheets backend and WhatsApp checkout.

## 🚀 Features

- **Mobile First Design**: Optimized for touch interaction and small screens.
- **Backend-less**: Uses Google Sheets as the database via Google Apps Script.
- **WhatsApp Checkout**: Orders are saved to the Sheet and then users are redirected to WhatsApp to complete purchase.
- **Live Search**: Instant product filtering.
- **User Accounts**: Signup/Login functionality.

## 🛠 Setup Instructions

### 1. Frontend
The frontend is pure HTML/CSS/JS. You can host it on GitHub Pages, Vercel, or Netlify.
- **Main Entry**: `index.html`

### 2. Backend (Google Sheets)
The site uses Google Apps Script to fetch products and save orders.

1.  Open [Google Apps Script](https://script.google.com/).
2.  Create a **New Project**.
3.  Copy the content of `backend.gs` from this repo into the script editor.
4.  **Important**: Save the project.
5.  Click **Deploy** > **New Deployment**.
    - **Type**: Web App.
    - **Execute as**: Me (your email).
    - **Who has access**: **Anyone** (Critical for the site to work).
6.  Copy the **Web App URL**.
7.  Open `script.js` in this repo.
8.  Update the `API_URL` variable:
    ```javascript
    const CONFIG = {
        API_URL: "https://script.google.com/macros/s/YOUR_URL_HERE/exec",
        USE_MOCK: false
    };
    ```

### ⚠️ Common Errors & Fixes

**"Loading..." forever or "Product not found"**
- This usually means the API URL is wrong or the deployment is outdated.
- **Fix**: Whenever you change `backend.gs` code (e.g., adding the `placeOrder` function), you must Deploy a **New Version**.
- Go to Deploy > Manage Deployments > Edit > Version: **New version** > Deploy.

**CORS Error**
- Ensure "Who has access" is set to "Anyone" in the deployment settings.

**Images Broken**
- The mock data uses Unsplash URLs. If they expire, update the URLs in your **Products** sheet.

## 📂 File Structure

- `index.html` - Landing page.
- `products.html` - Shop page.
- `product.html` - Product details.
- `cart.html` - Cart & Checkout.
- `script.js` - Main logic (API, Cart, State).
- `style.css` - Global styles.
- `backend.gs` - Google Apps Script code.
