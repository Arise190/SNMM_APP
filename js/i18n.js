const translations = {
    th: {
        menu_dashboard: "แดชบอร์ดสถิติ",
        menu_pos: "หน้าขาย",
        menu_products: "จัดการสินค้า",
        menu_categories: "หมวดหมู่",
        menu_stock: "สต็อกสินค้า",
        menu_history: "ประวัติการขาย",
        menu_settings: "ตั้งค่า",
        settings_title: "ตั้งค่า (Settings)",
        settings_language: "เปลี่ยนภาษา (Language)",
        settings_data: "การจัดการข้อมูล (Backup & Restore)",
        settings_data_desc: "บันทึกข้อมูลเพื่อนำไปใช้คอมพิวเตอร์เครื่องอื่น",
        btn_export: "ส่งออก (Export)",
        btn_import: "นำเข้า (Import)"
    },
    en: {
        menu_dashboard: "Dashboard",
        menu_pos: "POS",
        menu_products: "Products",
        menu_categories: "Categories",
        menu_stock: "Stock",
        menu_history: "Sales History",
        menu_settings: "Settings",
        settings_title: "Settings",
        settings_language: "Language",
        settings_data: "Data Management (Backup & Restore)",
        settings_data_desc: "Save your data to use on another computer",
        btn_export: "Export Data",
        btn_import: "Import Data"
    }
};

function changeLanguage(lang) {
    localStorage.setItem('snack_pos_lang', lang);
    applyTranslations(lang);
    
    // If settings modal is open, update its buttons
    const thBtn = document.getElementById('lang-th-btn');
    const enBtn = document.getElementById('lang-en-btn');
    if (thBtn && enBtn) {
        thBtn.style.background = lang === 'th' ? 'var(--primary)' : 'white';
        thBtn.style.color = lang === 'th' ? 'white' : 'var(--text-main)';
        enBtn.style.background = lang === 'en' ? 'var(--primary)' : 'white';
        enBtn.style.color = lang === 'en' ? 'white' : 'var(--text-main)';
    }
}

function applyTranslations(lang) {
    const dict = translations[lang] || translations['th'];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
            el.innerText = dict[key];
        }
    });
}

// Apply saved language and maximize window on load
document.addEventListener('DOMContentLoaded', () => {
    // Attempt to maximize the window
    try {
        window.moveTo(0, 0);
        window.resizeTo(screen.availWidth, screen.availHeight);
    } catch (e) {
        console.log("Browser prevented auto-maximize");
    }

    const savedLang = localStorage.getItem('snack_pos_lang') || 'th';
    applyTranslations(savedLang);
});
