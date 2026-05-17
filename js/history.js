// js/history.js

let dbData = window.DB.get();
let salesHistory = [...dbData.sales].reverse(); // ใหม่สุดขึ้นก่อน
let searchQuery = '';

const tableBody = document.getElementById('history-table-body');
const searchInput = document.getElementById('search-history');
const totalSalesEl = document.getElementById('total-sales-amount');
const modal = document.getElementById('bill-modal');

/** แถวขั้นต่ำของกริด (เดิมออกแบบที่ 50 แถว / กระดาษ F14) */
const PRINT_ROWS_MIN = 50;
const PRINT_TRACK_ROWS = 5;

/**
 * หาคำย่อที่สั้นที่สุดโดยไม่ซ้ำกัน (first-come-first-served)
 * เช่น ["ผัก","ตับ","น้ำพริก","ตอก"] → ["ผ","ต","น","ตอ"]
 */
function makeMinimalAbbrs(varNames) {
    const used = {};
    return varNames.map(name => {
        for (let len = 1; len <= name.length; len++) {
            const prefix = name.substring(0, len);
            if (!used[prefix]) {
                used[prefix] = true;
                return prefix;
            }
        }
        return name;
    });
}

/**
 * ยุบสินค้าเดียวกันหลายไส้ให้เป็นบรรทัดเดียว
 * กลุ่มด้วย productId → ชื่อเป็น "ปังแผ่น (ผ/ต/น/ตอ)", qty/subtotal รวมกัน
 */
function consolidateItemsForPrint(items) {
    const orderKeys = [];
    const groups = new Map();

    items.forEach(item => {
        const key = item.productId != null ? String(item.productId) : item.name;
        const match = item.name.match(/^(.+?)\s*\((.+)\)$/);
        const baseName = match ? match[1].trim() : item.name;
        const variation = match ? match[2].trim() : null;

        if (!groups.has(key)) {
            orderKeys.push(key);
            groups.set(key, {
                baseName,
                variations: variation ? [variation] : [],
                qty: item.qty,
                subtotal: Number(item.subtotal) || 0,
                capacities: [item.capacity],
            });
        } else {
            const g = groups.get(key);
            if (variation && !g.variations.includes(variation)) {
                g.variations.push(variation);
            }
            g.qty += item.qty;
            g.subtotal += Number(item.subtotal) || 0;
            g.capacities.push(item.capacity);
        }
    });

    return orderKeys.map(key => {
        const g = groups.get(key);
        let name;
        if (g.variations.length === 0) {
            name = g.baseName;
        } else if (g.variations.length === 1) {
            name = `${g.baseName} (${g.variations[0]})`;
        } else {
            name = `${g.baseName} (${g.variations.join('/')})`;
        }
        const allSame = g.capacities.every(c => c === g.capacities[0]);
        return {
            name,
            qty: g.qty,
            subtotal: g.subtotal,
            capacity: allSame ? g.capacities[0] : '',
        };
    });
}

/**
 * คำนวณ layout โดยอิงจากขนาดกระดาษ F14 จริง
 * F14 = 14in × 96px = 1344px, margin 0.4cm×2 ≈ 30px, padding 10px, header+footer ≈ 100px
 * → tbody พร้อมใช้ ≈ 1204px → แบ่งให้ครบทุกแถว = text ใหญ่ขึ้น + ไม่มีที่ว่างด้านล่าง
 */
function computeReceiptLayout(itemCount) {
    const n = Math.max(0, itemCount);
    const rowsNeeded = Math.ceil((n + PRINT_TRACK_ROWS) / 3);
    const rowsCount = Math.max(PRINT_ROWS_MIN, rowsNeeded);

    // F14 = 356mm @ 96/25.4 px/mm = 1345px
    // margin 4mm×2 ≈ 30px  |  page padding 10px  |  header+thead+tfoot ≈ 115px
    const TBODY_AVAIL = Math.round(356 * 96 / 25.4)   // 1345px
                      - Math.round(8   * 96 / 25.4)   //   30px
                      - 10                             //   10px
                      - 115;                           //  115px  → ≈ 1190px
    const rowH = Math.floor(TBODY_AVAIL / rowsCount);

    // 1 บรรทัดต่อช่อง (เหมือน Excel reference): font ≈ rowH × 0.52
    const fontPx = Math.max(8, Math.min(13, Math.floor(rowH * 0.52)));
    const lineH  = 1.1;
    const padV   = Math.max(1, Math.floor((rowH - Math.ceil(fontPx * lineH)) / 2));
    const padH   = Math.max(3, padV + 1);

    const headerTitlePx = Math.max(13, Math.min(18, Math.round(fontPx * 1.6)));
    const headerInfoPx  = Math.max(10, Math.min(14, Math.round(fontPx * 1.2)));

    return { rowsCount, rowH, fontPx, lineH, padV, padH, headerTitlePx, headerInfoPx };
}

function buildReceiptTableHtml(sale, items) {
    const totalItems = items.length;
    const { rowsCount, rowH, fontPx, lineH, padV, padH, headerTitlePx, headerInfoPx } =
        computeReceiptLayout(totalItems);

    const grid = Array.from({ length: rowsCount }, () => [null, null, null]);
    let itemIdx = 0;
    const col2ItemRows = rowsCount - PRINT_TRACK_ROWS;

    for (let c = 0; c < 3; c++) {
        const maxRowForCol = c === 2 ? col2ItemRows : rowsCount;
        for (let r = 0; r < maxRowForCol; r++) {
            if (itemIdx < totalItems) {
                grid[r][c] = items[itemIdx];
                itemIdx++;
            }
        }
    }

    const cs = `padding: ${padV}px ${padH}px;`;

    let tbodyHtml = '';
    for (let r = 0; r < rowsCount; r++) {
        let rowHtml = `<tr style="height: ${rowH}px;">`;
        for (let c = 0; c < 3; c++) {
            if (c === 2 && r >= rowsCount - PRINT_TRACK_ROWS) {
                const trackIdx = r - (rowsCount - PRINT_TRACK_ROWS);
                if (trackIdx === 0) {
                    rowHtml += `<td colspan="3" class="text-center font-bold" style="${cs} background-color: transparent;">จำนวนลูกค้าค้างลัง</td><td style="${cs}"></td>`;
                } else if (trackIdx === 1) {
                    rowHtml += `<td colspan="2" style="${cs}">ขาว / ปุ้ม</td><td style="${cs}"></td><td style="${cs}"></td>`;
                } else if (trackIdx === 2) {
                    rowHtml += `<td colspan="2" style="${cs}">SD / สยาม</td><td style="${cs}"></td><td style="${cs}"></td>`;
                } else if (trackIdx === 3) {
                    rowHtml += `<td colspan="2" style="${cs}">MN / มก</td><td style="${cs}"></td><td style="${cs}"></td>`;
                } else if (trackIdx === 4) {
                    rowHtml += `<td colspan="2" style="${cs}">ส.บ</td><td style="${cs}"></td><td style="${cs}"></td>`;
                }
            } else {
                const item = grid[r][c];
                if (item) {
                    const capacity = item.capacity || '';
                    rowHtml += `
                            <td class="text-center" style="${cs} font-weight: bold; vertical-align: middle;">${item.qty}</td>
                            <td class="text-left" style="${cs} vertical-align: middle; overflow: hidden;">
                                <span style="display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: ${lineH};">${item.name}</span>
                            </td>
                            <td class="text-center" style="${cs} vertical-align: middle;">${capacity}</td>
                            <td class="text-right" style="${cs} vertical-align: middle;">${item.subtotal.toLocaleString('th-TH')}</td>
                        `;
                } else {
                    rowHtml += `<td style="${cs}">&nbsp;</td><td style="${cs}"></td><td style="${cs}"></td><td style="${cs}"></td>`;
                }
            }
        }
        rowHtml += '</tr>';
        tbodyHtml += rowHtml;
    }

    const thStyle = `${cs} font-size: ${fontPx}px;`;
    const footMain = Math.min(14, Math.round(fontPx * 1.35));

    return {
        tableHtml: `
            <table class="receipt-table w-100 mb-0 receipt-table--dynamic" style="font-size: ${fontPx}px; line-height: ${lineH}; font-weight: bold; table-layout: fixed; width: 100%; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="width: 4%; ${thStyle}">ลัง</th>
                        <th style="width: 18%; ${thStyle}">รายการ</th>
                        <th style="width: 4%; ${thStyle}">จุ</th>
                        <th style="width: 7.33%; ${thStyle}">จำนวนเงิน</th>

                        <th style="width: 4%; ${thStyle}">ลัง</th>
                        <th style="width: 18%; ${thStyle}">รายการ</th>
                        <th style="width: 4%; ${thStyle}">จุ</th>
                        <th style="width: 7.33%; ${thStyle}">จำนวนเงิน</th>

                        <th style="width: 4%; ${thStyle}">ลัง</th>
                        <th style="width: 18%; ${thStyle}">รายการ</th>
                        <th style="width: 4%; ${thStyle}">จุ</th>
                        <th style="width: 7.33%; ${thStyle}">จำนวนเงิน</th>
                    </tr>
                </thead>
                <tbody>
                    ${tbodyHtml}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="12" style="text-align: left; padding: ${Math.max(padV, 3)}px 8px; font-weight: bold; font-size: ${footMain}px; border-top: 2px solid #000;">
                            <div style="display: flex; justify-content: space-between;">
                                <span>รวมเงินทั้งสิ้น</span>
                                <span style="margin-right: 12px;">${sale.totalAmount.toLocaleString('th-TH')} บาท</span>
                            </div>
                        </td>
                    </tr>
                </tfoot>
            </table>
        `,
        headerTitlePx,
        headerInfoPx,
    };
}

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
    
    selectedSales.forEach((sale) => {
        const dateStr = new Date(sale.date).toLocaleDateString('th-TH');
        const districtStr = sale.district ? sale.district : '';
        const items = consolidateItemsForPrint(sale.items || []);
        const { tableHtml, headerTitlePx, headerInfoPx } = buildReceiptTableHtml(sale, items);

        const billHtml = `
            <div class="print-page custom-receipt" style="padding: 5px;">
                <div class="receipt-header text-center mb-1">
                    <h2 class="font-bold" style="font-size: ${headerTitlePx}px; margin-bottom: 2px; line-height: 1.15;">บ.บูรณ์เจริญ มือถือเจ๊น้อง 064-4454983 เบอร์ 065-0720261</h2>
                </div>
                
                <div class="receipt-customer-info mb-1" style="font-size: ${headerInfoPx}px; line-height: 1.2;">
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
            </div>`;

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
