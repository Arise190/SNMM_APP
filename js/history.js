// js/history.js

let dbData = window.DB.get();
let salesHistory = [...dbData.sales].reverse(); // ใหม่สุดขึ้นก่อน
let searchQuery = '';

const tableBody = document.getElementById('history-table-body');
const searchInput = document.getElementById('search-history');
const totalSalesEl = document.getElementById('total-sales-amount');
const modal = document.getElementById('bill-modal');

function renderHistory() {
    let filteredSales = salesHistory;
    
    if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        filteredSales = filteredSales.filter(s => s.customerName.toLowerCase().includes(query));
    }
    
    let html = '';
    let totalSales = 0;
    
    if (filteredSales.length === 0) {
        html = `<tr><td colspan="6" class="text-center text-muted py-4">ไม่พบประวัติการขาย</td></tr>`;
    } else {
        filteredSales.forEach(sale => {
            totalSales += sale.totalAmount;
            const dateStr = new Date(sale.date).toLocaleString('th-TH');
            html += `
                <tr>
                    <td class="checkbox-col" style="text-align: center;">
                        <input type="checkbox" class="history-checkbox" value="${sale.id}" onchange="updatePrintButton()" style="width: 20px; height: 20px;">
                    </td>
                    <td>${String(sale.id).startsWith('INV') ? sale.id : '#' + sale.id}</td>
                    <td>${dateStr}</td>
                    <td>${sale.customerName}</td>
                    <td class="font-bold text-success">${sale.totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ฿</td>
                    <td>
                        <div class="action-cell">
                            <button class="btn btn-outline btn-icon" onclick="viewBill('${sale.id}')" title="ดูรายละเอียด">
                                <i class="material-icons">visibility</i>
                            </button>
                            <button class="btn btn-icon" onclick="editBill('${sale.id}')" title="แก้ไขบิล" style="color: var(--primary);">
                                <i class="material-icons">edit</i>
                            </button>
                            <button class="btn btn-icon delete" onclick="deleteBill('${sale.id}')" title="ลบ" style="margin-left: 5px;">
                                <i class="material-icons">delete</i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }
    
    tableBody.innerHTML = html;
    totalSalesEl.innerText = `${totalSales.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} บาท`;
    updatePrintButton();
    
    const selectAllCb = document.getElementById('selectAllHistory');
    if (selectAllCb) selectAllCb.checked = false;
}

function toggleSelectAllHistory() {
    const selectAllCb = document.getElementById('selectAllHistory');
    const checkboxes = document.querySelectorAll('.history-checkbox');
    checkboxes.forEach(cb => cb.checked = selectAllCb.checked);
    updatePrintButton();
}

let isSelectMode = false;

function toggleSelectMode() {
    isSelectMode = !isSelectMode;
    const btnToggle = document.getElementById('btn-toggle-select');
    const btnPrint = document.getElementById('btn-print-selected');
    
    if (isSelectMode) {
        // Enter Select Mode
        btnToggle.className = 'btn btn-danger btn-large';
        btnToggle.innerHTML = '<i class="material-icons mr-2">cancel</i> ยกเลิกการเลือก';
        if (btnPrint) btnPrint.style.display = 'inline-flex';
        
        // Show checkboxes
        document.body.classList.add('select-mode-active');
    } else {
        // Exit Select Mode
        btnToggle.className = 'btn btn-primary btn-large';
        btnToggle.innerHTML = '<i class="material-icons mr-2">check_box</i> เลือก';
        if (btnPrint) btnPrint.style.display = 'none';
        
        // Uncheck everything
        const selectAllCb = document.getElementById('selectAllHistory');
        if (selectAllCb) selectAllCb.checked = false;
        
        const checkboxes = document.querySelectorAll('.history-checkbox');
        checkboxes.forEach(cb => cb.checked = false);
        updatePrintButton();
        
        // Hide checkboxes
        document.body.classList.remove('select-mode-active');
    }
}

function updatePrintButton() {
    const checkboxes = document.querySelectorAll('.history-checkbox:checked');
    const printBtn = document.getElementById('btn-print-selected');
    
    if (!printBtn) return;
    
    if (checkboxes.length > 0) {
        printBtn.disabled = false;
        printBtn.innerHTML = `<i class="material-icons mr-2">print</i> พิมพ์บิลที่เลือก (${checkboxes.length})`;
    } else {
        printBtn.disabled = true;
        printBtn.innerHTML = `<i class="material-icons mr-2">print</i> พิมพ์บิลที่เลือก (0)`;
    }
}

function printSelectedBills() {
    const checkboxes = document.querySelectorAll('.history-checkbox:checked');
    if (checkboxes.length === 0) return;
    
    const selectedIds = Array.from(checkboxes).map(cb => cb.value);
    const selectedSales = salesHistory.filter(s => selectedIds.includes(String(s.id)));
    
    const printArea = document.getElementById('batch-print-area');
    printArea.innerHTML = '';
    
    selectedSales.forEach(sale => {
        const dateStr = new Date(sale.date).toLocaleDateString('th-TH');
        const districtStr = sale.district ? sale.district : '';
        
        // 9-Column Grid Logic
        const items = sale.items;
        const totalItems = items.length;
        
        // Calculate rows: hardcode to 50 rows (for 145 items + 5 tracking rows) to always fill Legal paper
        const rowsCount = 50; 
        
        const grid = Array.from({ length: rowsCount }, () => [null, null, null]);
        
        let itemIdx = 0;
        for (let c = 0; c < 3; c++) {
            const maxRowForCol = (c === 2) ? rowsCount - 5 : rowsCount;
            for (let r = 0; r < maxRowForCol; r++) {
                if (itemIdx < totalItems) {
                    grid[r][c] = items[itemIdx];
                    itemIdx++;
                }
            }
        }
        
        let tbodyHtml = '';
        for (let r = 0; r < rowsCount; r++) {
            let rowHtml = '<tr>';
            for (let c = 0; c < 3; c++) {
                if (c === 2 && r >= rowsCount - 5) {
                    // Tracking Table in the last 5 rows of column 3
                    const trackIdx = r - (rowsCount - 5);
                    if (trackIdx === 0) {
                        rowHtml += `<td colspan="3" class="text-center font-bold" style="padding: 4px; background-color: transparent;">จำนวนลูกค้าค้างลัง</td><td style="padding: 4px;"></td>`;
                    } else if (trackIdx === 1) {
                        rowHtml += `<td colspan="2" style="padding: 4px;">ขาว / ปุ้ม</td><td style="padding: 4px;"></td><td style="padding: 4px;"></td>`;
                    } else if (trackIdx === 2) {
                        rowHtml += `<td colspan="2" style="padding: 4px;">SD / สยาม</td><td style="padding: 4px;"></td><td style="padding: 4px;"></td>`;
                    } else if (trackIdx === 3) {
                        rowHtml += `<td colspan="2" style="padding: 4px;">MN / มก</td><td style="padding: 4px;"></td><td style="padding: 4px;"></td>`;
                    } else if (trackIdx === 4) {
                        rowHtml += `<td colspan="2" style="padding: 4px;">ส.บ</td><td style="padding: 4px;"></td><td style="padding: 4px;"></td>`;
                    }
                } else {
                    const item = grid[r][c];
                    if (item) {
                        const pricePerPiece = item.pricePerPiece || item.price;
                        const capacity = item.capacity || '';
                        
                        rowHtml += `
                            <td class="text-left" style="padding: 1px 2px; vertical-align: middle;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100px; display: inline-block;">${item.name}</span>
                                    <span style="font-size: 0.8em; color: #333; margin-left: 2px;">@${pricePerPiece}</span>
                                </div>
                            </td>
                            <td class="text-center" style="padding: 1px 2px; font-weight: bold;">${item.qty}</td>
                            <td class="text-center" style="padding: 1px 2px;">${capacity}</td>
                            <td class="text-right" style="padding: 1px 2px;">${item.subtotal.toLocaleString('th-TH')}</td>
                        `;
                    } else {
                        // Empty slot
                        rowHtml += `<td style="padding: 1px 2px;">&nbsp;</td><td style="padding: 1px 2px;"></td><td style="padding: 1px 2px;"></td><td style="padding: 1px 2px;"></td>`;
                    }
                }
            }
            rowHtml += '</tr>';
            tbodyHtml += rowHtml;
        }
        
        const tableHtml = `
            <table class="receipt-table w-100 mb-0" style="font-size: 10px; line-height: 1.1; table-layout: fixed; width: 100%; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="width: 16%; padding: 2px;">รายการ</th>
                        <th style="width: 4%; padding: 2px;">ลัง</th>
                        <th style="width: 4%; padding: 2px;">จุ</th>
                        <th style="width: 9.33%; padding: 2px;">จำนวนเงิน</th>
                        
                        <th style="width: 16%; padding: 2px;">รายการ</th>
                        <th style="width: 4%; padding: 2px;">ลัง</th>
                        <th style="width: 4%; padding: 2px;">จุ</th>
                        <th style="width: 9.33%; padding: 2px;">จำนวนเงิน</th>
                        
                        <th style="width: 16%; padding: 2px;">รายการ</th>
                        <th style="width: 4%; padding: 2px;">ลัง</th>
                        <th style="width: 4%; padding: 2px;">จุ</th>
                        <th style="width: 9.33%; padding: 2px;">จำนวนเงิน</th>
                    </tr>
                </thead>
                <tbody>
                    ${tbodyHtml}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="12" style="text-align: left; padding: 4px 10px; font-weight: bold; font-size: 14px; border-top: 2px solid #000;">
                            <div style="display: flex; justify-content: space-between;">
                                <span>รวมเงินทั้งสิ้น</span>
                                <span style="margin-right: 20px;">${sale.totalAmount.toLocaleString('th-TH')} บาท</span>
                            </div>
                        </td>
                    </tr>
                </tfoot>
            </table>
        `;
        
        const billHtml = `
            <div class="print-page custom-receipt" style="padding: 5px;">
                <div class="receipt-header text-center mb-1">
                    <h2 class="font-bold" style="font-size: 16px; margin-bottom: 2px;">บ.บูรณ์เจริญ มือถือเจ๊น้อง 064-4454983 เบอร์ 065-0720261</h2>
                </div>
                
                <div class="receipt-customer-info mb-1" style="font-size: 12px;">
                    <div class="dotted-line-container">
                        <span>เลขที่บิล</span>
                        <span class="dotted-fill font-bold" style="width: 120px;">${String(sale.id).startsWith('INV') ? sale.id : '#' + sale.id}</span>
                        <span>ชื่อร้าน</span>
                        <span class="dotted-fill flex-1 font-bold">${sale.customerName}</span>
                        <span>อำเภอ</span>
                        <span class="dotted-fill font-bold" style="width: 150px;">${districtStr}</span>
                        <span>วันที่</span>
                        <span class="dotted-fill" style="width: 150px;">${dateStr}</span>
                    </div>
                </div>
                
                ${tableHtml}
            </div>
        `;
        printArea.innerHTML += billHtml;
    });
    
    // Call print
    window.print();
}

function viewBill(id) {
    const sale = salesHistory.find(s => String(s.id) === String(id));
    if (!sale) return;
    
    document.getElementById('modal-bill-title').innerText = `รายละเอียดบิล ${String(sale.id).startsWith('INV') ? sale.id : '#' + sale.id}`;
    document.getElementById('modal-customer-name').innerText = sale.customerName;
    document.getElementById('modal-date').innerText = new Date(sale.date).toLocaleString('th-TH');
    
    let itemsHtml = '';
    sale.items.forEach(item => {
        itemsHtml += `
            <tr>
                <td>${item.name}</td>
                <td>${item.qty}</td>
                <td>${item.price} ฿</td>
                <td>${item.subtotal} ฿</td>
            </tr>
        `;
    });
    
    document.getElementById('modal-items-body').innerHTML = itemsHtml;
    document.getElementById('modal-total').innerText = `ยอดรวมทั้งหมด: ${sale.totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} บาท`;
    
    modal.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
}

// Event Listeners
searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderHistory();
});

// Init
document.addEventListener('DOMContentLoaded', () => {
    renderHistory();
});

function deleteBill(id) {
    window.showConfirmModal(`คุณต้องการลบบิล ${String(id).startsWith('INV') ? id : '#' + id} ใช่หรือไม่?\nข้อมูลนี้ไม่สามารถกู้คืนได้`, () => {
        const index = salesHistory.findIndex(s => String(s.id) === String(id));
        if (index !== -1) {
            salesHistory.splice(index, 1);
            dbData.sales = [...salesHistory].reverse(); // reverse back to chronological order for DB
            window.DB.save(dbData);
            renderHistory();
        }
    });
}

function deleteAllBills() {
    window.showConfirmModal(`คุณแน่ใจหรือไม่ว่าต้องการ "ลบบิลทั้งหมด"?\nคำเตือน: ข้อมูลประวัติการขายทั้งหมดจะหายไปและไม่สามารถกู้คืนได้!`, () => {
        dbData.sales = [];
        window.DB.save(dbData);
        salesHistory = [];
        renderHistory();
    });
}

function editBill(id) {
    const sale = salesHistory.find(s => String(s.id) === String(id));
    if (!sale) return;
    
    window.showConfirmModal(`คุณต้องการแก้ไขบิล ${String(id).startsWith('INV') ? id : '#' + id} ใช่หรือไม่?\n\n- สินค้าในบิลนี้จะถูกดึงกลับไปที่หน้าขาย\n- สต็อกจะถูกคืนกลับเข้าระบบชั่วคราว\n- กรุณากดยืนยันการชำระเงินอีกครั้งเพื่อบันทึกบิลแก้ไข`, () => {
        
        // 1. คืนสต็อก (Restore Stock)
        sale.items.forEach(item => {
            const product = dbData.products.find(p => p.id === item.productId);
            if (product) {
                // คืนสต็อกตามจำนวนลัง
                product.stock += item.qty;
            }
        });
        
        // 2. เอายอดบิลเก่าออกชั่วคราว
        const index = salesHistory.findIndex(s => String(s.id) === String(id));
        if (index !== -1) {
            salesHistory.splice(index, 1);
            dbData.sales = [...salesHistory].reverse();
        }
        
        window.DB.save(dbData);
        
        // 3. นำสินค้าเข้าตะกร้า (Cart) ของ POS
        // แปลง item ในบิลกลับไปเป็นโครงสร้างตะกร้า
        const cartItems = sale.items.map(item => ({
            cartId: Date.now() + Math.random(),
            productId: item.productId,
            name: item.name,
            price: item.price,
            boxQty: item.boxQty || (item.subtotal / item.price / item.qty) || 1,
            qty: item.qty,
            subtotal: item.subtotal
        }));
        
        localStorage.setItem('editCartItems', JSON.stringify(cartItems));
        localStorage.setItem('editBillId', sale.id);
        localStorage.setItem('editBillCustomer', sale.customerName);
        localStorage.setItem('editBillAmphoe', sale.district || '');
        localStorage.setItem('editBillDate', sale.date);
        
        // 4. ไปที่หน้า POS
        window.location.href = 'index.html';
    });
}
