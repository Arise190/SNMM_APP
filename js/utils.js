// js/utils.js

(function preventPageZoom() {
    let lastTouchEnd = 0;

    document.addEventListener('gesturestart', function(e) {
        e.preventDefault();
    });

    document.addEventListener('gesturechange', function(e) {
        e.preventDefault();
    });

    document.addEventListener('gestureend', function(e) {
        e.preventDefault();
    });

    document.addEventListener('touchmove', function(e) {
        if (e.touches && e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });

    document.addEventListener('touchend', function(e) {
        const now = Date.now();
        if (now - lastTouchEnd <= 350) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, { passive: false });

    document.addEventListener('wheel', function(e) {
        if (e.ctrlKey) {
            e.preventDefault();
        }
    }, { passive: false });
})();

// Function to toggle fullscreen mode
function toggleFullScreen() {
    if (window.pywebview && window.pywebview.api) {
        window.pywebview.api.toggle_fullscreen();
        return;
    }

    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

// Global Keyboard Shortcuts
document.addEventListener('keydown', function(e) {
    // Press F11 for Fullscreen (already handled by browser, but we can catch it or use our own)
    
    // Press 'C' or 'c' while not in input to clear bill
    if (e.key.toLowerCase() === 'c' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        const btnClear = document.getElementById('btn-clear-bill');
        if (btnClear) btnClear.click();
    }
    
    // Handle Enter/Escape for Custom Alert Modal
    const alertModal = document.getElementById('custom-alert-modal');
    if (alertModal && alertModal.style.display === 'flex') {
        if (e.key === 'Enter' || e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            closeCustomAlert();
        }
        return; // Stop processing other shortcuts
    }
    
    // Press 'F' to focus on search box
    if (e.key.toLowerCase() === 'f' && e.target.tagName !== 'INPUT' && e.ctrlKey) {
        e.preventDefault();
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.focus();
    }
});

// Custom Alert Modal Functions
function showCustomAlert(title, message, type = 'error') {
    const modal = document.getElementById('custom-alert-modal');
    if (!modal) {
        alert(title + '\n' + message);
        return;
    }
    
    document.getElementById('custom-alert-title').innerText = title;
    document.getElementById('custom-alert-message').innerText = message;
    
    const iconEl = document.getElementById('custom-alert-icon');
    if (type === 'error' || type === 'warning') {
        iconEl.innerText = type === 'error' ? 'error_outline' : 'warning_amber';
        iconEl.style.color = 'var(--danger)';
    } else if (type === 'success') {
        iconEl.innerText = 'check_circle_outline';
        iconEl.style.color = 'var(--success)';
    } else {
        iconEl.innerText = 'info_outline';
        iconEl.style.color = 'var(--primary)';
    }
    
    modal.style.display = 'flex';
}

function closeCustomAlert() {
    const modal = document.getElementById('custom-alert-modal');
    if (modal) modal.style.display = 'none';
}

function showCustomConfirm(title, message, onConfirm, onCancel = null) {
    const modal = document.getElementById('custom-confirm-modal');
    if (!modal) {
        if (confirm(title + '\n\n' + message)) {
            if (onConfirm) onConfirm();
        } else {
            if (onCancel) onCancel();
        }
        return;
    }
    
    document.getElementById('custom-confirm-title').innerText = title;
    document.getElementById('custom-confirm-message').innerText = message;
    
    const btnOk = document.getElementById('custom-confirm-ok');
    const btnCancel = document.getElementById('custom-confirm-cancel');
    
    // Clear old event listeners by cloning
    const newBtnOk = btnOk.cloneNode(true);
    const newBtnCancel = btnCancel.cloneNode(true);
    btnOk.parentNode.replaceChild(newBtnOk, btnOk);
    btnCancel.parentNode.replaceChild(newBtnCancel, btnCancel);
    
    newBtnOk.addEventListener('click', () => {
        modal.style.display = 'none';
        if (onConfirm) onConfirm();
    });
    
    newBtnCancel.addEventListener('click', () => {
        modal.style.display = 'none';
        if (onCancel) onCancel();
    });
    
    modal.style.display = 'flex';
}
