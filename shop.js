let allProducts = [];
let cart = [];

const productContainer = document.getElementById('product-container');
const cartContainer = document.getElementById('cart-container');
const cartTotalDisplay = document.getElementById('cart-total');
const checkoutMsg = document.getElementById('checkout-message');

async function fetchProducts() {
    try {
        const response = await fetch('https://api.escuelajs.co/api/v1/products?limit=25&offset=0');
        allProducts = await response.json();
        renderProducts();
    } catch (error) {
        productContainer.innerHTML = "<p class='text-red-500'>Error loading products.</p>";
    }
}

function renderProducts() {
    let filtered = [...allProducts];    
    
    const minPrice = document.getElementById('minPriceInput').value;
    const maxPrice = document.getElementById('maxPriceInput').value;
    const sortVal = document.getElementById('sortSelect').value;

    if (minPrice) filtered = filtered.filter(p => p.price >= Number(minPrice));
    if (maxPrice) filtered = filtered.filter(p => p.price <= Number(maxPrice));

    if (sortVal === 'low-high') filtered.sort((a, b) => a.price - b.price);
    else if (sortVal === 'high-low') filtered.sort((a, b) => b.price - a.price);

    productContainer.innerHTML = '';
    
    filtered.forEach(product => {
        const card = document.createElement('div');
        card.className = "bg-[#1a1a1e] rounded-md overflow-hidden shadow-lg border border-zinc-800 flex flex-col";
        const cleanImageUrl = product.images[0].replace(/[\[\]"]/g, '');

        card.innerHTML = `
            <img 
                src="${cleanImageUrl}" 
                alt="${product.title}" 
                class="w-full h-48 object-cover"
                referrerpolicy="no-referrer" 
                crossorigin="anonymous"
                onerror="this.src='https://placehold.co/600x400/1a1a1e/5865f2?text=Image+Unavailable'"
            >
            <div class="p-4 flex flex-col flex-grow gap-2">
                <h3 class="font-bold text-white text-lg line-clamp-1">${product.title}</h3>
                
                <div class="mb-1">
                    <span class="bg-zinc-800 text-zinc-300 text-[10px] px-2 py-1 rounded-full font-bold uppercase border border-zinc-600 tracking-wider">
                        ${product.category.name}
                    </span>
                </div>

                <p class="text-[#5865f2] font-black text-xl">$${product.price}</p>
                <button class="add-to-cart mt-auto bg-[#5865f2] hover:bg-[#4752c4] text-white font-bold py-2 rounded transition-colors">
                    Add to Cart
                </button>
            </div>
        `;
        productContainer.appendChild(card);

        const addBtn = card.querySelector('.add-to-cart');
        if (addBtn) {
            addBtn.addEventListener('click', () => addToCart(product));
        }
    });
}

document.getElementById('minPriceInput').addEventListener('input', renderProducts);
document.getElementById('maxPriceInput').addEventListener('input', renderProducts);
document.getElementById('sortSelect').addEventListener('change', renderProducts);

function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) existingItem.quantity += 1;
    else cart.push({ id: product.id, name: product.title, price: product.price, quantity: 1 });
    renderCart();
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    renderCart();
}

function renderCart() {
    cartContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p class="text-zinc-500 text-sm italic text-center mt-10">Cart is empty</p>';
    } else {
        cart.forEach(item => {
            total += item.price * item.quantity;
            const cartItem = document.createElement('div');
            cartItem.className = "flex justify-between items-center bg-[#121214] p-2 rounded border border-zinc-800";
            cartItem.innerHTML = `
                <div class="flex-grow">
                    <p class="text-sm font-bold text-white">${item.name}</p>
                    <p class="text-xs text-zinc-400">$${item.price} x ${item.quantity}</p>
                </div>
                <button class="remove-from-cart text-red-500 hover:text-red-700 text-sm font-bold px-2">X</button>
            `;
            cartContainer.appendChild(cartItem);

            const removeBtn = cartItem.querySelector('.remove-from-cart');
            if (removeBtn) {
                removeBtn.addEventListener('click', () => removeFromCart(item.id));
            }
        });
    }
    cartTotalDisplay.innerText = total;
}

document.getElementById('checkoutBtn').addEventListener('click', () => {
    if (cart.length === 0) {
        openAlertModal("Your cart is empty!");
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const checkoutPayload = {
        user: currentUser,
        cart: cart,
        total: Number(cartTotalDisplay.innerText),
        date: new Date().toISOString() // ISO format for serializable payload
    };

    checkoutMsg.innerText = "Processing order...";
    checkoutMsg.className = "mt-3 text-center text-sm font-bold text-yellow-400 block";

    setTimeout(() => {
        try {
            localStorage.setItem('lastOrder', JSON.stringify(checkoutPayload));
            checkoutMsg.innerText = "Order Successful!";
            checkoutMsg.className = "mt-3 text-center text-sm font-bold text-green-500 block";
            cart = [];
            renderCart();
        } catch (error) {
            checkoutMsg.innerText = "Something went wrong!";
            checkoutMsg.className = "mt-3 text-center text-sm font-bold text-red-500 block";
        }
    }, 2000);
});

function openAlertModal(message) {
    const modal = document.getElementById('globalModal');
    const msgEl = document.getElementById('globalModalMessage');
    if (!modal || !msgEl) {
        alert(message);
        return;
    }
    msgEl.textContent = message;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeAlertModal() {
    const modal = document.getElementById('globalModal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

fetchProducts();