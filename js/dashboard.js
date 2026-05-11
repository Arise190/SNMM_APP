// js/dashboard.js

let dbData = window.DB.get();
let salesHistory = dbData.sales;
let products = dbData.products;

// Charts instances
let salesChartInst = null;
let categoryChartInst = null;

function renderDashboard(period = 'all') {
    let filteredSales = salesHistory;
    const now = new Date();
    
    // Filter by time
    if (period === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredSales = salesHistory.filter(s => new Date(s.date) >= weekAgo);
    } else if (period === 'month') {
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        filteredSales = salesHistory.filter(s => new Date(s.date) >= firstDay);
    }

    // 1. Calculate Summary Stats
    let totalSales = 0;
    let totalProfit = 0;
    let totalItems = 0;
    
    // To track product sales
    const productSales = {}; 
    products.forEach(p => {
        productSales[p.id] = { id: p.id, name: p.name, qty: 0, revenue: 0, categoryId: p.categoryId };
    });

    // To track customer sales
    const customerSales = {};

    filteredSales.forEach(sale => {
        totalSales += sale.totalAmount;
        totalProfit += (sale.profit || 0);
        
        // Track customer
        const cName = sale.customerName || 'ลูกค้าทั่วไป';
        if (!customerSales[cName]) {
            customerSales[cName] = { sales: 0, bills: 0, qty: 0 };
        }
        customerSales[cName].sales += sale.totalAmount;
        customerSales[cName].bills += 1;
        
        sale.items.forEach(item => {
            totalItems += item.qty;
            customerSales[cName].qty += item.qty;
            
            // Find product by name (since items in sale don't have productId, we match by name)
            const p = products.find(prod => prod.name === item.name);
            if (p) {
                productSales[p.id].qty += item.qty;
                productSales[p.id].revenue += item.subtotal;
            }
        });
    });

    // Deduct Spoilage from total profit
    let spoilageList = dbData.spoilage || [];
    let filteredSpoilage = spoilageList;
    if (period === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredSpoilage = spoilageList.filter(s => new Date(s.date) >= weekAgo);
    } else if (period === 'month') {
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        filteredSpoilage = spoilageList.filter(s => new Date(s.date) >= firstDay);
    }
    
    let totalSpoilageDeduction = filteredSpoilage.reduce((sum, s) => sum + s.amount, 0);
    totalProfit -= totalSpoilageDeduction;

    // Update DOM
    document.getElementById('dash-total-sales').innerText = totalSales.toLocaleString('th-TH') + ' ฿';
    document.getElementById('dash-total-profit').innerText = totalProfit.toLocaleString('th-TH') + ' ฿';
    document.getElementById('dash-total-bills').innerText = filteredSales.length.toLocaleString('th-TH');
    document.getElementById('dash-total-items').innerText = totalItems.toLocaleString('th-TH');

    // 2. Rankings
    const rankedProducts = Object.values(productSales).sort((a, b) => b.qty - a.qty);
    
    // Top 5
    const top5 = rankedProducts.slice(0, 5);
    let topHtml = '';
    top5.forEach((p, idx) => {
        if (p.qty > 0) {
            topHtml += `
                <li>
                    <div>
                        <span class="rank-number">${idx + 1}</span>
                        <span class="item-name">${p.name}</span>
                    </div>
                    <span class="item-value">${p.qty} ลัง</span>
                </li>`;
        }
    });
    document.getElementById('dash-top-products').innerHTML = topHtml || '<li class="text-muted text-center">ไม่มีข้อมูล</li>';

    // Worst 5
    const worst5 = [...rankedProducts].reverse().slice(0, 5);
    let worstHtml = '';
    worst5.forEach((p, idx) => {
        if (p.qty < 5) { // Show if sold less than 5 boxes
            worstHtml += `
                <li>
                    <div>
                        <span class="rank-number text-danger" style="color:var(--danger);">${rankedProducts.length - idx}</span>
                        <span class="item-name">${p.name}</span>
                    </div>
                    <span class="item-value" style="color:var(--danger);">${p.qty} ลัง</span>
                </li>`;
        }
    });
    document.getElementById('dash-worst-products').innerHTML = worstHtml || '<li class="text-muted text-center">ไม่มีข้อมูล</li>';

    // Update Top / Worst Customer
    const rankedCustomers = Object.entries(customerSales).sort((a, b) => b[1].sales - a[1].sales);
    if (rankedCustomers.length > 0) {
        document.getElementById('dash-top-customer').innerText = rankedCustomers[0][0];
        document.getElementById('dash-top-customer-sales').innerText = rankedCustomers[0][1].sales.toLocaleString('th-TH') + ' ฿';
        
        const worst = rankedCustomers[rankedCustomers.length - 1];
        document.getElementById('dash-worst-customer').innerText = worst[0];
        document.getElementById('dash-worst-customer-sales').innerText = worst[1].sales.toLocaleString('th-TH') + ' ฿';
    } else {
        document.getElementById('dash-top-customer').innerText = '-';
        document.getElementById('dash-top-customer-sales').innerText = '0 ฿';
        document.getElementById('dash-worst-customer').innerText = '-';
        document.getElementById('dash-worst-customer-sales').innerText = '0 ฿';
    }

    // Populate Customer Trends Table
    const trendsBody = document.getElementById('customer-trends-body');
    if (trendsBody) {
        if (rankedCustomers.length > 0) {
            let trendsHtml = '';
            rankedCustomers.forEach((entry, idx) => {
                const name = entry[0];
                const data = entry[1];
                trendsHtml += `
                    <tr>
                        <td class="text-center">${idx + 1}</td>
                        <td class="font-bold">${name}</td>
                        <td class="text-center">${data.bills.toLocaleString('th-TH')}</td>
                        <td class="text-center">${data.qty.toLocaleString('th-TH')}</td>
                        <td class="text-right text-success font-bold" style="padding-right: 1rem;">${data.sales.toLocaleString('th-TH', {minimumFractionDigits: 0, maximumFractionDigits: 2})} ฿</td>
                    </tr>
                `;
            });
            trendsBody.innerHTML = trendsHtml;
        } else {
            trendsBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted" style="padding: 2rem;">ไม่มีข้อมูล</td></tr>';
        }
    }

    // 3. Category Pie Chart
    const catSales = {};
    dbData.categories.forEach(c => catSales[c.id] = { name: c.name, revenue: 0 });
    
    Object.values(productSales).forEach(ps => {
        if (catSales[ps.categoryId]) {
            catSales[ps.categoryId].revenue += ps.revenue;
        }
    });
    
    const catLabels = Object.values(catSales).filter(c => c.revenue > 0).map(c => c.name);
    const catData = Object.values(catSales).filter(c => c.revenue > 0).map(c => c.revenue);
    
    if (categoryChartInst) categoryChartInst.destroy();
    const ctxCat = document.getElementById('categoryChart').getContext('2d');
    categoryChartInst = new Chart(ctxCat, {
        type: 'doughnut',
        data: {
            labels: catLabels.length ? catLabels : ['ไม่มีข้อมูล'],
            datasets: [{
                data: catData.length ? catData : [1],
                backgroundColor: ['#3498db', '#2ecc71', '#9b59b6', '#f1c40f', '#e74c3c', '#34495e'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right' }
            }
        }
    });

    // 4. Bar Chart (Last 7 Days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        last7Days.push({
            dateStr: d.toISOString().split('T')[0],
            display: d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
            sales: 0,
            profit: 0
        });
    }

    filteredSales.forEach(sale => {
        const sDate = sale.date.split('T')[0];
        const dayMatch = last7Days.find(d => d.dateStr === sDate);
        if (dayMatch) {
            dayMatch.sales += sale.totalAmount;
            dayMatch.profit += (sale.profit || 0);
        }
    });

    if (salesChartInst) salesChartInst.destroy();
    const ctxSales = document.getElementById('salesChart').getContext('2d');
    salesChartInst = new Chart(ctxSales, {
        type: 'bar',
        data: {
            labels: last7Days.map(d => d.display),
            datasets: [
                {
                    label: 'ยอดขาย (บาท)',
                    data: last7Days.map(d => d.sales),
                    backgroundColor: '#3498db',
                    borderRadius: 4
                },
                {
                    label: 'กำไร (บาท)',
                    data: last7Days.map(d => d.profit),
                    backgroundColor: '#2ecc71',
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function filterData(period) {
    // Update button active states
    document.querySelectorAll('.time-filter button').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    
    renderDashboard(period);
}

// Spoilage System
function renderSpoilageHistory() {
    const spoilageList = dbData.spoilage || [];
    const tbody = document.getElementById('spoilage-history-body');
    let html = '';
    
    if (spoilageList.length === 0) {
        html = '<tr><td colspan="6" class="text-center text-muted">ไม่มีประวัติการหักของเสีย</td></tr>';
    } else {
        [...spoilageList].reverse().forEach((s, idx) => {
            const dateStr = new Date(s.date).toLocaleDateString('th-TH');
            html += `
                <tr>
                    <td>${dateStr}</td>
                    <td>${s.customerName}</td>
                    <td>${s.qty}</td>
                    <td>${s.price} ฿</td>
                    <td class="text-danger font-bold">-${s.amount} ฿</td>
                    <td>
                        <button class="btn btn-icon delete" onclick="deleteSpoilage(${s.id})" title="ลบ">
                            <i class="material-icons">delete</i>
                        </button>
                    </td>
                </tr>
            `;
        });
    }
    tbody.innerHTML = html;
}

function updateCustomerDropdown() {
    const uniqueCustomers = [...new Set(dbData.sales.map(s => s.customerName).filter(name => name))];
    const select = document.getElementById('spoilage-customer');
    let options = '<option value="">-- เลือกร้านค้า --</option>';
    uniqueCustomers.forEach(c => {
        options += `<option value="${c}">${c}</option>`;
    });
    select.innerHTML = options;
}

function calculateSpoilage() {
    const qty = parseFloat(document.getElementById('spoilage-qty').value) || 0;
    const price = parseFloat(document.getElementById('spoilage-price').value) || 0;
    
    // (ชิ้นที่เสีย / 2) * ราคา
    const amount = (qty / 2) * price;
    document.getElementById('spoilage-amount').value = amount;
}

function saveSpoilage() {
    const customer = document.getElementById('spoilage-customer').value;
    const qty = parseFloat(document.getElementById('spoilage-qty').value);
    const price = parseFloat(document.getElementById('spoilage-price').value);
    const amount = parseFloat(document.getElementById('spoilage-amount').value);
    
    if (!customer || isNaN(amount) || amount <= 0) {
        alert("กรุณาเลือกร้านค้าและระบุยอดหักชดเชยให้ถูกต้อง");
        return;
    }
    
    if (!dbData.spoilage) dbData.spoilage = [];
    
    dbData.spoilage.push({
        id: Date.now(),
        date: new Date().toISOString(),
        customerName: customer,
        qty: qty,
        price: price,
        amount: amount
    });
    
    window.DB.save(dbData);
    
    // Reset Form
    document.getElementById('spoilage-qty').value = '';
    document.getElementById('spoilage-price').value = '';
    document.getElementById('spoilage-amount').value = '';
    
    renderSpoilageHistory();
    renderDashboard('all'); // refresh stats
}

function deleteSpoilage(id) {
    window.showConfirmModal("ยืนยันการลบประวัติการหักของเสียนี้?", () => {
        dbData.spoilage = dbData.spoilage.filter(s => s.id !== id);
        window.DB.save(dbData);
        renderSpoilageHistory();
        renderDashboard('all');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderDashboard('all');
    updateCustomerDropdown();
    renderSpoilageHistory();
});


