// js/products.js

let dbData = window.DB.get();
let searchQuery = '';
let isSelectMode = false;

const tableBody = document.getElementById('product-table-body');
const searchInput = document.getElementById('search-product');
const modal = document.getElementById('product-modal');
const categorySelect = document.getElementById('prod-category');

function normalizeProductPrices(product) {
    const price = Number(product.price);
    if (typeof product.priceAlt === 'undefined') {
        const savedAlt = Number(product.salePriceAlt ?? product.price2 ?? product.altPrice);
        const fallbackPrice = Number.isFinite(price) ? price : 0;
        product.priceAlt = Number.isFinite(savedAlt) ? savedAlt : (Math.abs(fallbackPrice - 3.85) < 0.001 ? 3.75 : fallbackPrice);
        return true;
    }
    return false;
}

function formatPrice(value) {
    const price = Number(value);
    if (!Number.isFinite(price)) return '0';
    return price.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function renderCategories() {
    let html = '<option value="">-- เลือกหมวดหมู่ --</option>';
    dbData.categories.forEach(cat => {
        html += `<option value="${cat.id}">${cat.name}</option>`;
    });
    categorySelect.innerHTML = html;
}

function getCategoryName(id) {
    const cat = dbData.categories.find(c => c.id == id);
    return cat ? cat.name : '-';
}

function renderProducts() {
    let filteredProducts = dbData.products;
    
    if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(query));
    }
    
    let html = '';
    
    if (filteredProducts.length === 0) {
        html = `<tr><td colspan="8" class="text-center text-muted py-4">ไม่พบสินค้า</td></tr>`;
    } else {
        filteredProducts.forEach(product => {
            normalizeProductPrices(product);
            html += `
                <tr>
                    <td class="select-column" style="text-align: center; display: ${isSelectMode ? 'table-cell' : 'none'};">
                        <input type="checkbox" class="product-checkbox" value="${product.id}" style="transform: scale(1.5); cursor: pointer;" onclick="checkSelectAllStatus()">
                    </td>
                    <td>P${product.id}</td>
                    <td class="font-bold">${product.name}</td>
                    <td>${getCategoryName(product.categoryId)}</td>
                    <td class="text-success font-bold price-cell">${formatPrice(product.price)} ฿/ชิ้น <br><small class="text-muted">(ลังละ ${product.capacity || 1} ชิ้น)</small></td>
                    <td class="text-primary font-bold price-cell">${formatPrice(product.priceAlt)} ฿/ชิ้น <br><small class="text-muted">ใช้กับอำเภอราคาใหม่</small></td>
                    <td>${product.stock}</td>
                    <td>
                        <div class="action-cell">
                            <button class="btn-icon edit" onclick="editProduct(${product.id})" title="แก้ไข">
                                <i class="material-icons">edit</i>
                            </button>
                            <button class="btn-icon delete" onclick="deleteProduct(${product.id})" title="ลบ">
                                <i class="material-icons">delete</i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }
    
    tableBody.innerHTML = html;
    checkSelectAllStatus(); // Update select all checkbox state
}

function toggleSelectMode(mode) {
    isSelectMode = mode;
    
    // Toggle buttons
    document.getElementById('btn-enter-select-mode').style.display = mode ? 'none' : 'inline-flex';
    document.getElementById('btn-delete-all').style.display = mode ? 'none' : 'inline-flex';
    
    document.getElementById('btn-cancel-select').style.display = mode ? 'inline-flex' : 'none';
    document.getElementById('btn-confirm-delete-selected').style.display = mode ? 'inline-flex' : 'none';
    
    // Toggle header column
    const headerCol = document.querySelector('th.select-column');
    if (headerCol) headerCol.style.display = mode ? 'table-cell' : 'none';
    
    // If turning off mode, uncheck select all
    if (!mode) {
        const selectAllCb = document.getElementById('selectAllCheckbox');
        if (selectAllCb) selectAllCb.checked = false;
    }
    
    // Re-render table to show/hide checkboxes and clear selections if mode is off
    renderProducts();
}

function toggleSelectAll() {
    const selectAllCb = document.getElementById('selectAllCheckbox');
    const checkboxes = document.querySelectorAll('.product-checkbox');
    checkboxes.forEach(cb => cb.checked = selectAllCb.checked);
}

function checkSelectAllStatus() {
    const selectAllCb = document.getElementById('selectAllCheckbox');
    const checkboxes = document.querySelectorAll('.product-checkbox');
    if (checkboxes.length === 0) {
        selectAllCb.checked = false;
        return;
    }
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    selectAllCb.checked = allChecked;
}

function deleteSelectedProducts() {
    const checkboxes = document.querySelectorAll('.product-checkbox:checked');
    if (checkboxes.length === 0) {
        alert('กรุณาเลือกสินค้าที่ต้องการลบอย่างน้อย 1 รายการ');
        return;
    }
    
    if (confirm(`คุณต้องการลบสินค้าที่เลือกจำนวน ${checkboxes.length} รายการ ใช่หรือไม่?`)) {
        const idsToDelete = Array.from(checkboxes).map(cb => parseInt(cb.value));
        dbData.products = dbData.products.filter(p => !idsToDelete.includes(p.id));
        window.DB.save(dbData);
        toggleSelectMode(false); // Exit select mode on successful delete
        renderProducts();
    }
}

function deleteAllProducts() {
    if (dbData.products.length === 0) {
        alert('ไม่มีสินค้าในระบบให้ลบ');
        return;
    }
    
    if (confirm('⚠️ คำเตือน: คุณต้องการลบ "สินค้าทั้งหมด" ในระบบใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้!')) {
        // Double confirmation for safety
        if (confirm('ยืนยันการลบสินค้าทั้งหมดจริงๆ ใช่ไหม?')) {
            dbData.products = [];
            window.DB.save(dbData);
            renderProducts();
        }
    }
}

function openModal(id = null) {
    document.getElementById('product-form').reset();
    document.getElementById('variations-container').innerHTML = ''; // Clear variations
    
    if (id) {
        const product = dbData.products.find(p => p.id === id);
        if (product) {
            document.getElementById('modal-title').innerText = 'แก้ไขสินค้า';
            document.getElementById('prod-id').value = product.id;
            document.getElementById('prod-name').value = product.name;
            document.getElementById('prod-category').value = product.categoryId;
            document.getElementById('prod-cost').value = product.costPrice || product.cost || 0;
            document.getElementById('prod-price').value = product.price;
            document.getElementById('prod-price-alt').value = product.priceAlt;
            document.getElementById('prod-capacity').value = product.capacity || 1;
            document.getElementById('prod-stock').value = product.stock;
            
            // Load variations if exist
            if (product.variations && product.variations.length > 0) {
                product.variations.forEach(v => {
                    addVariationRow(v.name, v.capacity);
                });
            }
        }
    } else {
        document.getElementById('modal-title').innerText = 'เพิ่มสินค้าใหม่';
        document.getElementById('prod-id').value = '';
    }
    
    modal.classList.add('active');
}

function addVariationRow(name = '', capacity = '') {
    const container = document.getElementById('variations-container');
    const id = Date.now() + Math.random();
    const html = `
        <div class="flex gap-2 mb-2 variation-row" id="var-row-${id}">
            <input type="text" class="form-control flex-1 var-name" placeholder="ชื่อไส้ (เช่น กลมคู่)" value="${name}" required>
            <input type="number" class="form-control var-capacity" placeholder="จุ" value="${capacity}" style="width: 80px;" required min="1">
            <button type="button" class="btn btn-icon delete" onclick="removeVariationRow('${id}')" title="ลบไส้">
                <i class="material-icons">close</i>
            </button>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
}

function removeVariationRow(id) {
    const row = document.getElementById(`var-row-${id}`);
    if (row) row.remove();
}

function getVariationsFromForm() {
    const rows = document.querySelectorAll('.variation-row');
    const variations = [];
    rows.forEach(row => {
        const name = row.querySelector('.var-name').value.trim();
        const capacity = parseInt(row.querySelector('.var-capacity').value);
        if (name && !isNaN(capacity) && capacity > 0) {
            variations.push({ name, capacity });
        }
    });
    return variations;
}

function closeModal() {
    modal.classList.remove('active');
}

function saveProduct() {
    const id = document.getElementById('prod-id').value;
    const name = document.getElementById('prod-name').value.trim();
    const categoryId = document.getElementById('prod-category').value;
    const cost = parseFloat(document.getElementById('prod-cost').value) || 0;
    const price = parseFloat(document.getElementById('prod-price').value);
    const priceAlt = parseFloat(document.getElementById('prod-price-alt').value);
    const capacity = parseInt(document.getElementById('prod-capacity').value);
    const stock = parseInt(document.getElementById('prod-stock').value);
    const variations = getVariationsFromForm();
    
    if (!name || !categoryId || isNaN(price) || isNaN(priceAlt) || isNaN(capacity) || isNaN(stock) || capacity <= 0) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง (ราคาและความจุต้องมากกว่า 0)');
        return;
    }
    
    if (id) {
        // อัปเดต
        const index = dbData.products.findIndex(p => p.id == id);
        if (index !== -1) {
            dbData.products[index] = { ...dbData.products[index], name, categoryId: parseInt(categoryId), costPrice: cost, price, priceAlt, capacity, stock, variations };
        }
    } else {
        // เพิ่มใหม่
        const newId = dbData.products.length > 0 ? Math.max(...dbData.products.map(p => p.id)) + 1 : 1;
        dbData.products.push({ id: newId, categoryId: parseInt(categoryId), name, costPrice: cost, price, priceAlt, capacity, stock, variations });
    }
    
    window.DB.save(dbData);
    renderProducts();
    closeModal();
}

function editProduct(id) {
    openModal(id);
}

function deleteProduct(id) {
    window.showConfirmModal('คุณต้องการลบสินค้านี้ใช่หรือไม่?', () => {
        dbData.products = dbData.products.filter(p => p.id !== id);
        window.DB.save(dbData);
        renderProducts();
    });
}

// Event Listeners
searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderProducts();
});

// Init
document.addEventListener('DOMContentLoaded', () => {
    // Migrate data if capacity is missing
    let migrated = false;
    dbData.products.forEach(p => {
        if (typeof p.capacity === 'undefined') {
            p.capacity = 1;
            migrated = true;
        }
        if (normalizeProductPrices(p)) {
            migrated = true;
        }
    });
    if (migrated) window.DB.save(dbData);
    
    renderCategories();
    renderProducts();
});
