// js/categories.js

let dbData = window.DB.get();
let searchQuery = '';

const tableBody = document.getElementById('category-table-body');
const searchInput = document.getElementById('search-category');
const modal = document.getElementById('category-modal');

function getProductCount(categoryId) {
    return dbData.products.filter(p => p.categoryId == categoryId).length;
}

function renderCategories() {
    let filteredCategories = dbData.categories;
    
    if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        filteredCategories = filteredCategories.filter(c => c.name.toLowerCase().includes(query));
    }
    
    let html = '';
    
    if (filteredCategories.length === 0) {
        html = `<tr><td colspan="3" class="text-center text-muted py-4">ไม่พบหมวดหมู่</td></tr>`;
    } else {
        filteredCategories.forEach(cat => {
            const count = getProductCount(cat.id);
            html += `
                <tr>
                    <td>C${cat.id}</td>
                    <td class="font-bold">${cat.name}</td>
                    <td>
                        <div class="action-cell">
                            <button class="btn-icon edit" onclick="editCategory(${cat.id})" title="แก้ไข">
                                <i class="material-icons">edit</i>
                            </button>
                            <button class="btn-icon delete" onclick="deleteCategory(${cat.id})" title="ลบ" ${count > 0 ? 'disabled style="opacity:0.3; cursor:not-allowed;"' : ''}>
                                <i class="material-icons">delete</i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }
    
    tableBody.innerHTML = html;
}

function openModal(id = null) {
    document.getElementById('category-form').reset();
    
    if (id) {
        const cat = dbData.categories.find(c => c.id === id);
        if (cat) {
            document.getElementById('modal-title').innerText = 'แก้ไขหมวดหมู่';
            document.getElementById('cat-id').value = cat.id;
            document.getElementById('cat-name').value = cat.name;
        }
    } else {
        document.getElementById('modal-title').innerText = 'เพิ่มหมวดหมู่ใหม่';
        document.getElementById('cat-id').value = '';
    }
    
    modal.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
}

function saveCategory() {
    const id = document.getElementById('cat-id').value;
    const name = document.getElementById('cat-name').value.trim();
    
    if (!name) {
        alert('กรุณากรอกชื่อหมวดหมู่');
        return;
    }
    
    if (id) {
        // Update
        const index = dbData.categories.findIndex(c => c.id == id);
        if (index > -1) {
            dbData.categories[index].name = name;
        }
    } else {
        // Add
        const newId = dbData.categories.length > 0 ? Math.max(...dbData.categories.map(c => c.id)) + 1 : 1;
        dbData.categories.push({ id: newId, name });
    }
    
    window.DB.save(dbData);
    closeModal();
    renderCategories();
}

function editCategory(id) {
    openModal(id);
}

function deleteCategory(id) {
    const count = getProductCount(id);
    if (count > 0) {
        alert('ไม่สามารถลบหมวดหมู่ที่มีสินค้าอยู่ได้ กรุณาลบหรือย้ายสินค้าก่อน');
        return;
    }
    
    window.showConfirmModal('คุณต้องการลบหมวดหมู่นี้ใช่หรือไม่?', () => {
        dbData.categories = dbData.categories.filter(c => c.id !== id);
        window.DB.save(dbData);
        renderCategories();
    });
}

// Event Listeners
searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderCategories();
});

// Init
document.addEventListener('DOMContentLoaded', () => {
    renderCategories();
});
