// js/stock.js

let dbData = window.DB.get();
let searchQuery = '';
let filterStatus = 'all';

const tableBody = document.getElementById('stock-table-body');
const searchInput = document.getElementById('search-stock');
const filterSelect = document.getElementById('filter-status');

function renderStock() {
    let filteredProducts = dbData.products;
    
    // Search
    if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(query));
    }
    
    // Filter by Status
    if (filterStatus === 'low') {
        filteredProducts = filteredProducts.filter(p => p.stock > 0 && p.stock < 10);
    } else if (filterStatus === 'out') {
        filteredProducts = filteredProducts.filter(p => p.stock <= 0);
    }
    
    let html = '';
    
    if (filteredProducts.length === 0) {
        html = `<tr><td colspan="5" class="text-center text-muted py-4">ไม่พบสินค้า</td></tr>`;
    } else {
        filteredProducts.forEach(product => {
            let statusHtml = '';
            if (product.stock <= 0) {
                statusHtml = '<span class="status-low">สินค้าหมด</span>';
            } else if (product.stock < 10) {
                statusHtml = '<span class="status-low">ใกล้หมด</span>';
            } else {
                statusHtml = '<span class="status-ok">ปกติ</span>';
            }
            
            html += `
                <tr>
                    <td>${product.id}</td>
                    <td class="font-bold">${product.name}</td>
                    <td>${statusHtml}</td>
                    <td class="font-bold text-lg" id="stock-val-${product.id}">${product.stock}</td>
                    <td>
                        <div class="flex items-center gap-2">
                            <input type="number" id="input-stock-${product.id}" class="stock-input" value="${product.stock}" min="0">
                            <button class="btn btn-primary" style="padding: 0.5rem 1rem;" onclick="updateStock(${product.id})">
                                บันทึก
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }
    
    tableBody.innerHTML = html;
}

function updateStock(id) {
    const newVal = parseInt(document.getElementById(`input-stock-${id}`).value);
    
    if (isNaN(newVal) || newVal < 0) {
        alert('กรุณากรอกตัวเลขจำนวนเต็มที่มากกว่าหรือเท่ากับ 0');
        return;
    }
    
    const index = dbData.products.findIndex(p => p.id === id);
    if (index > -1) {
        dbData.products[index].stock = newVal;
        window.DB.save(dbData);
        
        // Show success briefly
        const btn = event.target;
        const originalText = btn.innerText;
        btn.innerText = 'สำเร็จ!';
        btn.classList.replace('btn-primary', 'btn-success');
        
        setTimeout(() => {
            btn.innerText = originalText;
            btn.classList.replace('btn-success', 'btn-primary');
            renderStock();
        }, 1000);
    }
}

function resetAllStock() {
    window.showConfirmModal("⚠️ คำเตือน: คุณแน่ใจหรือไม่ว่าต้องการรีเซ็ตสต็อกสินค้าทั้งหมดให้กลายเป็น 0 ? การกระทำนี้ไม่สามารถย้อนกลับได้", () => {
        dbData.products.forEach(p => {
            p.stock = 0;
        });
        window.DB.save(dbData);
        renderStock();
        
        // Show success alert
        setTimeout(() => {
            alert('ล้างสต็อกสินค้าทั้งหมดเรียบร้อยแล้ว');
        }, 100);
    });
}

// Event Listeners
searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderStock();
});

filterSelect.addEventListener('change', (e) => {
    filterStatus = e.target.value;
    renderStock();
});

// Init
document.addEventListener('DOMContentLoaded', () => {
    renderStock();
});
