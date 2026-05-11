// js/pos.js

let currentCart = [];
let dbData = window.DB.get();
let currentCategory = 'all';
let searchQuery = '';
let activeProductId = null;
let priceMode = localStorage.getItem('snack_pos_price_mode') || 'base';

// Pagination state
let currentPage = 1;
const itemsPerPage = 12;

// DOM Elements
const productGrid = document.getElementById('product-grid');
const categoryFilters = document.getElementById('category-filters');
const searchInput = document.getElementById('search-input');
const billItemsBody = document.getElementById('bill-items-body');
const totalAmountEl = document.getElementById('total-amount');
const customerNameInput = document.getElementById('customer-name');
const btnClearBill = document.getElementById('btn-clear-bill');
const btnCheckout = document.getElementById('btn-checkout');
const btnFinalizeCheckout = document.getElementById('btn-finalize-checkout');

function formatPrice(value) {
    const price = Number(value);
    if (!Number.isFinite(price)) return '0';
    return price.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function getProductPrice(product, mode = priceMode) {
    const basePrice = Number(product.price);
    const altPrice = Number(product.priceAlt);
    const fallback = Number.isFinite(basePrice) ? basePrice : 0;

    if (mode === 'alt') {
        return Number.isFinite(altPrice) ? altPrice : fallback;
    }

    return fallback;
}

function updatePriceModeUI() {
    const buttons = document.querySelectorAll('.price-mode-btn');
    buttons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.priceMode === priceMode);
    });

    const sampleProduct = dbData.products.find(product => Number.isFinite(Number(product.price)));
    const baseSample = document.getElementById('price-mode-base-sample');
    const altSample = document.getElementById('price-mode-alt-sample');

    if (sampleProduct && baseSample && altSample) {
        baseSample.innerText = formatPrice(getProductPrice(sampleProduct, 'base'));
        altSample.innerText = formatPrice(getProductPrice(sampleProduct, 'alt'));
    }
}

function refreshCartPricesForMode() {
    currentCart.forEach(item => {
        const product = dbData.products.find(p => p.id === item.productId);
        if (!product) return;

        item.price = getProductPrice(product);
        item.subtotal = item.qty * item.boxQty * item.price;
    });
}

function setPriceMode(mode) {
    priceMode = mode === 'alt' ? 'alt' : 'base';
    localStorage.setItem('snack_pos_price_mode', priceMode);
    refreshCartPricesForMode();
    updatePriceModeUI();
    renderProducts();
    renderCart();
}

function bindReliableTap(element, handler) {
    if (!element) return;

    let lastTouchRun = 0;

    const run = (event) => {
        const now = Date.now();

        if (event.type === 'click' && now - lastTouchRun < 700) {
            event.preventDefault();
            return;
        }

        if (event.type === 'pointerup' && event.pointerType === 'mouse') {
            return;
        }

        if (event.type === 'pointerup' && event.pointerType && event.pointerType !== 'mouse') {
            lastTouchRun = now;
            if (event.cancelable) event.preventDefault();
        }

        if (event.type === 'touchend') {
            lastTouchRun = now;
            if (event.cancelable) event.preventDefault();
        }

        if (document.activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
            document.activeElement.blur();
        }

        handler(event);
    };

    element.addEventListener('click', run);

    if (window.PointerEvent) {
        element.addEventListener('pointerup', run);
    } else {
        element.addEventListener('touchend', run, { passive: false });
    }
}

// Initialize
function initPOS() {
    renderCategories();
    updatePriceModeUI();
    renderProducts();
    setupEventListeners();
    
    // Check if we are editing an existing bill
    const editCartStr = localStorage.getItem('editCartItems');
    if (editCartStr) {
        try {
            currentCart = JSON.parse(editCartStr);
            renderCart();
            // We don't remove editCartItems here, we keep them until checkout or clear
        } catch (e) {
            console.error("Error loading edit cart", e);
        }
    }
}

function renderCategories() {
    let html = `<button class="btn btn-primary btn-large filter-btn active" data-id="all">ทั้งหมด</button>`;
    
    dbData.categories.forEach(cat => {
        html += `<button class="btn btn-outline btn-large filter-btn" data-id="${cat.id}">${cat.name}</button>`;
    });
    
    categoryFilters.innerHTML = html;
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active', 'btn-primary'));
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.add('btn-outline'));
            
            e.target.classList.remove('btn-outline');
            e.target.classList.add('btn-primary', 'active');
            
            currentCategory = e.target.getAttribute('data-id');
            currentPage = 1; // Reset to page 1 on category change
            renderProducts();
        });
    });
}

function renderProducts() {
    let filteredProducts = dbData.products;
    
    if (currentCategory !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.categoryId == currentCategory);
    }
    
    if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(query));
    }
    
    let html = '';
    
    // Pagination calculation
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);
    
    paginatedProducts.forEach(product => {
        const stockWarning = product.stock < 10 && product.stock > 0 ? `<span class="stock-badge">เหลือ ${product.stock}</span>` : '';
        const outOfStock = product.stock <= 0 ? 'opacity: 0.5;' : '';
        const activePrice = getProductPrice(product);
        const otherPrice = getProductPrice(product, priceMode === 'base' ? 'alt' : 'base');
        const otherPriceLabel = priceMode === 'base' ? 'ราคาใหม่' : 'ราคาเดิม';
        
        html += `
            <div class="product-card" style="position: relative; ${outOfStock}" onclick="addToCart(${product.id})">
                ${stockWarning}
                <div class="product-name">${product.name}</div>
                <div class="product-price">${formatPrice(activePrice)} ฿/ชิ้น</div>
                <div class="product-alt-price" style="margin-top: 5px;">ในคลัง: ${product.stock} ลัง</div>
            </div>
        `;
    });
    
    if (filteredProducts.length === 0) {
        html = `<div class="p-4 text-center text-muted" style="grid-column: 1 / -1;">ไม่พบสินค้า</div>`;
    }
    
    productGrid.innerHTML = html;
    
    // Render pagination controls
    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    const controls = document.getElementById('pagination-controls');
    if (!controls) return;
    
    if (totalPages <= 1) {
        controls.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Previous button
    html += `<button class="btn btn-outline" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>&laquo; ก่อนหน้า</button>`;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            html += `<button class="btn btn-primary active">${i}</button>`;
        } else {
            // Show only a few pages around current page to prevent too many buttons
            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                html += `<button class="btn btn-outline" onclick="changePage(${i})">${i}</button>`;
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                html += `<span class="px-2">...</span>`;
            }
        }
    }
    
    // Next button
    html += `<button class="btn btn-outline" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>ถัดไป &raquo;</button>`;
    
    controls.innerHTML = html;
}

function changePage(page) {
    currentPage = page;
    renderProducts();
}

// --- Box Capacity & Variation Logic ---
let activeVariationName = null;
let activeVariationCapacity = null;

function addToCart(productId) {
    const product = dbData.products.find(p => p.id === productId);
    if (!product) return;
    
    if (product.stock <= 0) {
        showCustomAlert('สินค้าหมดสต็อก', 'ไม่สามารถสั่งซื้อได้เนื่องจากสินค้าหมด', 'warning');
        return;
    }
    
    activeProductId = productId;
    
    if (product.variations && product.variations.length > 0) {
        // Show variation modal
        document.getElementById('variation-product-name').innerText = `ระบุจำนวน: ${product.name}`;
        const container = document.getElementById('variation-buttons-container');
        container.innerHTML = '';
        
        product.variations.forEach((v) => {
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.justifyContent = 'space-between';
            row.style.alignItems = 'center';
            row.style.padding = '0.5rem 0';
            row.style.borderBottom = '1px solid var(--border)';
            
            const nameDiv = document.createElement('div');
            nameDiv.style.flex = '1';
            nameDiv.style.fontWeight = 'bold';
            nameDiv.innerText = v.name;
            
            const controlsDiv = document.createElement('div');
            controlsDiv.style.display = 'flex';
            controlsDiv.style.alignItems = 'center';
            controlsDiv.style.gap = '10px';
            
            const minusBtn = document.createElement('button');
            minusBtn.className = 'btn btn-outline';
            minusBtn.style.padding = '0.5rem';
            minusBtn.innerHTML = '<i class="material-icons">remove</i>';
            
            const input = document.createElement('input');
            input.type = 'number';
            input.min = '0';
            input.value = '0';
            input.className = 'form-control text-center multi-var-input';
            input.style.width = '70px';
            input.style.margin = '0';
            input.dataset.varName = v.name;
            input.dataset.varCapacity = v.capacity;
            
            // Highlight text on focus
            input.onfocus = () => input.select();
            
            const plusBtn = document.createElement('button');
            plusBtn.className = 'btn btn-outline';
            plusBtn.style.padding = '0.5rem';
            plusBtn.innerHTML = '<i class="material-icons">add</i>';
            
            minusBtn.onclick = () => {
                let val = parseInt(input.value) || 0;
                if (val > 0) input.value = val - 1;
            };
            plusBtn.onclick = () => {
                let val = parseInt(input.value) || 0;
                input.value = val + 1;
            };
            
            controlsDiv.appendChild(minusBtn);
            controlsDiv.appendChild(input);
            controlsDiv.appendChild(plusBtn);
            
            row.appendChild(nameDiv);
            row.appendChild(controlsDiv);
            container.appendChild(row);
        });
        
        document.getElementById('variation-modal').style.display = 'flex';
    } else {
        // No variations, go straight to numpad
        openNumpadModal(product.name, null, product.capacity || 1);
    }
}

function closeVariationModal() {
    document.getElementById('variation-modal').style.display = 'none';
    activeProductId = null;
}

function confirmMultiVariations() {
    const product = dbData.products.find(p => p.id === activeProductId);
    if (!product) return;
    
    const inputs = document.querySelectorAll('.multi-var-input');
    let addedCount = 0;
    
    // Check total boxes across all inputs to ensure it doesn't exceed stock
    let totalQtyRequested = 0;
    inputs.forEach(input => {
        totalQtyRequested += parseInt(input.value) || 0;
    });
    
    if (totalQtyRequested === 0) {
        closeVariationModal();
        return;
    }
    
    const boxesInCart = currentCart
        .filter(item => item.productId === product.id)
        .reduce((sum, item) => sum + item.qty, 0);
        
    if ((boxesInCart + totalQtyRequested) > product.stock) {
        showCustomAlert('สินค้าในสต็อกไม่พอ!', `มีสต็อกเหลือเพียง ${product.stock} ลัง\n(อยู่ในตะกร้าแล้ว ${boxesInCart} ลัง\nคุณพยายามเพิ่มอีก ${totalQtyRequested} ลัง)`, 'error');
        return;
    }
    
    inputs.forEach(input => {
        const qty = parseInt(input.value) || 0;
        if (qty > 0) {
            const vName = input.dataset.varName;
            const vCap = parseInt(input.dataset.varCapacity) || 1;
            const cartItemName = `${product.name} (${vName})`;
            const activePrice = getProductPrice(product);
            
            const existingItem = currentCart.find(item => item.productId === product.id && item.name === cartItemName);
            
            if (existingItem) {
                existingItem.qty += qty;
                existingItem.price = activePrice;
                existingItem.subtotal = existingItem.qty * existingItem.boxQty * existingItem.price;
            } else {
                currentCart.push({
                    cartId: Date.now() + Math.random(),
                    productId: product.id,
                    name: cartItemName,
                    price: activePrice,
                    boxQty: vCap,
                    qty: qty,
                    subtotal: qty * vCap * activePrice
                });
            }
            addedCount++;
        }
    });
    
    if (addedCount > 0) {
        closeVariationModal();
        renderCart();
    }
}

function openNumpadModal(productName, variationName, capacity) {
    activeVariationName = variationName;
    activeVariationCapacity = capacity;
    
    const displayName = variationName ? `${productName} (${variationName})` : productName;
    document.getElementById('numpad-product-name').innerText = displayName;
    document.querySelector('#numpad-modal p.text-muted').innerText = 'ระบุจำนวนลังที่ต้องการขาย';
    
    const display = document.getElementById('numpad-display');
    display.value = '0';
    document.getElementById('numpad-modal').style.display = 'flex';
    
    setTimeout(() => {
        display.focus();
        display.select();
    }, 50);
}

function numpadPress(num) {
    const display = document.getElementById('numpad-display');
    if (display.value === '0') {
        display.value = num.toString();
    } else {
        display.value += num.toString();
    }
}

function numpadClear() {
    document.getElementById('numpad-display').value = '0';
}

function closeNumpad() {
    document.getElementById('numpad-modal').style.display = 'none';
    activeProductId = null;
    activeVariationName = null;
    activeVariationCapacity = null;
}

function numpadConfirm() {
    const qtyInput = parseInt(document.getElementById('numpad-display').value);
    
    if (isNaN(qtyInput) || qtyInput <= 0) {
        showCustomAlert('ข้อมูลไม่ถูกต้อง', 'กรุณาระบุจำนวนลังให้ถูกต้อง', 'warning');
        return;
    }
    
    const product = dbData.products.find(p => p.id === activeProductId);
    const cartItemName = activeVariationName ? `${product.name} (${activeVariationName})` : product.name;
    const capacity = activeVariationCapacity || product.capacity || 1;
    const activePrice = getProductPrice(product);
    
    // Check total boxes currently in cart for this product
    const boxesInCart = currentCart
        .filter(item => item.productId === product.id)
        .reduce((sum, item) => sum + item.qty, 0); // Sum up qty of boxes
        
    if ((boxesInCart + qtyInput) > product.stock) {
        showCustomAlert('สินค้าในสต็อกไม่พอ!', `มีสต็อกเหลือเพียง ${product.stock} ลัง\n(อยู่ในตะกร้าแล้ว ${boxesInCart} ลัง)`, 'error');
        return;
    }
    
    // Check if identical item (same product AND same variation) already exists in cart
    const existingItem = currentCart.find(item => item.productId === product.id && item.name === cartItemName);
    
    if (existingItem) {
        existingItem.qty += qtyInput;
        existingItem.price = activePrice;
        existingItem.subtotal = existingItem.qty * existingItem.boxQty * existingItem.price;
    } else {
        // Add to cart
        currentCart.push({
            cartId: Date.now() + Math.random(),
            productId: product.id,
            name: cartItemName,
            price: activePrice,         // unit price
            boxQty: capacity,           // capacity per box
            qty: qtyInput,              // Number of boxes
            subtotal: qtyInput * capacity * activePrice
        });
    }
    
    closeNumpad();
    renderCart();
}


function updateQty(cartId, newQty) {
    const itemIndex = currentCart.findIndex(item => item.cartId === cartId);
    if (itemIndex > -1) {
        const item = currentCart[itemIndex];
        const product = dbData.products.find(p => p.id === item.productId);
        let qty = parseInt(newQty);
        
        if (isNaN(qty) || qty <= 0) {
            qty = 1;
        }
        
        // Calculate total boxes of this product in cart EXCEPT this item
        const otherBoxesInCart = currentCart
            .filter(c => c.productId === product.id && c.cartId !== cartId)
            .reduce((sum, c) => sum + c.qty, 0);
            
        if (otherBoxesInCart + qty > product.stock) {
            showCustomAlert('สต็อกไม่พอ!', `มีสต็อกเหลือเพียง ${product.stock} ลัง`, 'error');
            qty = product.stock - otherBoxesInCart;
            if (qty <= 0) qty = 1;
        }
        
        currentCart[itemIndex].qty = qty;
        currentCart[itemIndex].subtotal = qty * item.boxQty * item.price;
        renderCart();
    }
}

function removeFromCart(cartId) {
    currentCart = currentCart.filter(item => item.cartId !== cartId);
    renderCart();
}

function renderCart() {
    let html = '';
    let total = 0;
    
    if (currentCart.length === 0) {
        html = `<tr class="empty-bill"><td colspan="4" class="text-center p-4 text-muted">ยังไม่มีรายการสินค้า</td></tr>`;
    } else {
        currentCart.forEach(item => {
            total += item.subtotal;
            html += `
                <tr>
                    <td>
                        <div class="font-bold">${item.name}</div>
                        <div class="text-muted text-sm">@${item.price} ฿/ชิ้น</div>
                    </td>
                    <td>
                        <div class="qty-control">
                            <button class="qty-btn" onclick="updateQty(${item.cartId}, ${item.qty - 1})">-</button>
                            <input type="number" class="qty-input" value="${item.qty}" 
                                   onchange="updateQty(${item.cartId}, this.value)"
                                   onfocus="this.select()">
                            <button class="qty-btn" onclick="updateQty(${item.cartId}, ${item.qty + 1})">+</button>
                        </div>
                    </td>
                    <td class="text-right font-bold">${item.subtotal.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ฿</td>
                    <td class="text-center">
                        <button class="btn-remove" onclick="removeFromCart(${item.cartId})">
                            <i class="material-icons">delete</i>
                        </button>
                    </td>
                </tr>
            `;
        });
    }
    
    billItemsBody.innerHTML = html;
    totalAmountEl.innerText = `${total.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} บาท`;
}

function clearBill() {
    if (currentCart.length === 0) return;
    window.showConfirmModal('คุณต้องการยกเลิกบิลปัจจุบันทั้งหมดใช่หรือไม่?', () => {
        currentCart = [];
        customerNameInput.value = '';
        
        // Clear edit flags if editing
        localStorage.removeItem('editCartItems');
        localStorage.removeItem('editBillId');
        localStorage.removeItem('editBillCustomer');
        localStorage.removeItem('editBillAmphoe');
        localStorage.removeItem('editBillDate');
        
        renderCart();
    });
}

function checkout() {
    if (currentCart.length === 0) {
        showCustomAlert('ตะกร้าว่างเปล่า', 'กรุณาเลือกสินค้าอย่างน้อย 1 รายการ', 'warning');
        return;
    }
    
    // Open Checkout Summary Modal
    const totalAmount = currentCart.reduce((sum, item) => sum + item.subtotal, 0);
    const itemsCount = currentCart.reduce((sum, item) => sum + item.qty, 0);
    
    document.getElementById('summary-total').innerText = `${totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ฿`;
    document.getElementById('summary-items-count').innerText = `${itemsCount} ลัง (${currentCart.length} รายการ)`;
    
    const modal = document.getElementById('checkout-summary-modal');
    modal.style.display = 'flex';
    
    // Pre-fill customer name and district if editing
    const editBillCustomer = localStorage.getItem('editBillCustomer');
    const editBillAmphoe = localStorage.getItem('editBillAmphoe');
    
    if (editBillCustomer) {
        const nameInput = document.getElementById('customer-name');
        if (nameInput && !nameInput.value) {
            nameInput.value = editBillCustomer;
        }
    }
    
    if (editBillAmphoe) {
        const districtInput = document.getElementById('customer-district');
        if (districtInput && !districtInput.value) {
            districtInput.value = editBillAmphoe;
        }
    }
    
    // Avoid auto-opening the mobile keyboard, which can cover the payment button on iPad/iPhone.
    if (!window.matchMedia('(pointer: coarse)').matches) {
        setTimeout(() => {
            const nameInput = document.getElementById('customer-name');
            if (nameInput) nameInput.focus();
        }, 50);
    }
}

function closeCheckoutSummary() {
    const modal = document.getElementById('checkout-summary-modal');
    if (modal) modal.style.display = 'none';
}

function generateInvoiceId(dateObj, salesArray) {
    const year = (dateObj.getFullYear() + 543).toString().slice(-2);
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const prefix = `INV-${year}${month}`;
    const sales = Array.isArray(salesArray) ? salesArray : [];
    
    const currentMonthSales = sales.filter(s => String(s.id).startsWith(prefix));
    let maxNum = 0;
    currentMonthSales.forEach(s => {
       const numStr = String(s.id).slice(-4);
       const num = parseInt(numStr, 10);
       if (!isNaN(num) && num > maxNum) maxNum = num;
    });
    const nextNum = String(maxNum + 1).padStart(4, '0');
    return `${prefix}${nextNum}`;
}

function finalizeCheckoutProcess() {
    if (!Array.isArray(dbData.sales)) dbData.sales = [];

    const customerName = document.getElementById('customer-name').value.trim() || 'ลูกค้าทั่วไป';
    const customerDistrict = document.getElementById('customer-district').value.trim() || '';
    const totalAmount = currentCart.reduce((sum, item) => sum + item.subtotal, 0);
    
    let totalCost = 0;
    
    // 1. ลดสต็อก และ คำนวณต้นทุน
    currentCart.forEach(cartItem => {
        const product = dbData.products.find(p => p.id === cartItem.productId);
        if (product) {
            product.stock -= cartItem.qty; // Reduce by number of boxes
            // Calculate cost: (cost per piece) * (pieces per box) * (number of boxes)
            const itemCost = (product.costPrice || product.cost || 0) * (cartItem.boxQty || product.capacity || 1) * cartItem.qty;
            totalCost += itemCost;
        }
    });
    
    const profit = totalAmount - totalCost;
    
    // Check if we are editing a bill
    const editBillId = localStorage.getItem('editBillId');
    const editBillDate = localStorage.getItem('editBillDate');
    const editBillCustomer = localStorage.getItem('editBillCustomer'); // Original customer, but we use the new input
    
    const dateObj = editBillDate ? new Date(editBillDate) : new Date();
    
    // 2. บันทึกประวัติ
    const newSale = {
        id: editBillId ? editBillId : generateInvoiceId(dateObj, dbData.sales),
        customerName: customerName,
        district: customerDistrict,
        items: currentCart.map(item => ({
            name: item.name,
            qty: item.qty, // Number of boxes
            productId: item.productId,
            price: item.boxQty * item.price, // Price per 1 box
            subtotal: item.subtotal,
            capacity: item.boxQty,       // ความจุต่อลัง (ชิ้น)
            pricePerPiece: item.price    // ราคาต่อชิ้น
        })),
        totalAmount: totalAmount,
        totalCost: totalCost,
        profit: profit,
        date: dateObj.toISOString()
    };
    
    dbData.sales.push(newSale);
    
    // 3. Save to DB
    window.DB.save(dbData);
    
    // Clear edit flags
    localStorage.removeItem('editCartItems');
    localStorage.removeItem('editBillId');
    localStorage.removeItem('editBillCustomer');
    localStorage.removeItem('editBillAmphoe');
    localStorage.removeItem('editBillDate');
    
    // 4. เคลียร์ตะกร้าและปิดหน้าต่าง
    currentCart = [];
    document.getElementById('customer-name').value = '';
    document.getElementById('customer-district').value = '';
    closeCheckoutSummary();
    renderCart();
    renderProducts();
    
    // แจ้งเตือนสำเร็จ
    showCustomAlert('บันทึกบิลสำเร็จ', 'ตัดสต็อกแล้ว สามารถไปสั่งพิมพ์ได้ที่แท็บ "ประวัติการขาย"', 'success');
}

// Event Listeners
function setupEventListeners() {
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        currentPage = 1; // Reset to page 1 on search
        renderProducts();
    });
    
    btnClearBill.addEventListener('click', clearBill);
    bindReliableTap(btnCheckout, checkout);
    bindReliableTap(btnFinalizeCheckout, finalizeCheckoutProcess);
    document.querySelectorAll('.price-mode-btn').forEach(button => {
        bindReliableTap(button, () => setPriceMode(button.dataset.priceMode));
    });
    
    // Global Key Handlers (Numpad & Checkout Modal)
    document.addEventListener('keydown', (e) => {
        // 1. Numpad Modal Logic
        const numpadModal = document.getElementById('numpad-modal');
        if (numpadModal && numpadModal.style.display === 'flex') {
            if (e.key === 'Enter') {
                e.preventDefault(); // Prevent triggering focused buttons
                numpadConfirm();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                closeNumpad();
            }
            return; // Stop processing if numpad is open
        }
        
        // 2. Checkout Summary Modal Logic
        const summaryModal = document.getElementById('checkout-summary-modal');
        if (summaryModal && summaryModal.style.display === 'flex') {
            if (e.key === 'Enter') {
                e.preventDefault();
                // If focus is on customer-name, jump to district
                if (document.activeElement && document.activeElement.id === 'customer-name') {
                    const districtInput = document.getElementById('customer-district');
                    if (districtInput) districtInput.focus();
                } else if (document.activeElement && document.activeElement.id === 'customer-district') {
                    // If focus is on district, confirm and save bill
                    finalizeCheckoutProcess();
                } else {
                    // If focus is lost or modal just opened, focus the name input first to prevent accidental instant save
                    const nameInput = document.getElementById('customer-name');
                    if (nameInput) nameInput.focus();
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                closeCheckoutSummary();
            }
            return; // Stop processing
        }
    });
}

// Start
document.addEventListener('DOMContentLoaded', initPOS);
