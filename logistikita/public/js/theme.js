// ============================================================
// THEME TOGGLE LOGIC
// ============================================================

function initTheme() {
    const savedTheme = localStorage.getItem('logistikita-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

// Call initTheme immediately to prevent FOUC (Flash of Unstyled Content)
initTheme();

document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('theme-toggle');
    if (!themeBtn) return;

    // Set initial icon
    const currentTheme = document.documentElement.getAttribute('data-theme');
    updateThemeIcon(themeBtn, currentTheme);

    // Toggle event
    themeBtn.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme');
        let newTheme = theme === 'dark' ? 'light' : 'dark';
        
        // Add a small transition effect to body
        document.body.style.transition = 'background-color 0.4s ease, color 0.4s ease';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('logistikita-theme', newTheme);
        
        updateThemeIcon(themeBtn, newTheme);
        
        // Remove transition after it's done to prevent lagging on resize
        setTimeout(() => {
            document.body.style.transition = '';
        }, 400);
    });
});

function updateThemeIcon(btn, theme) {
    if (theme === 'light') {
        btn.innerHTML = '<i class="fas fa-moon"></i>';
        btn.setAttribute('title', 'Switch to Dark Mode');
    } else {
        btn.innerHTML = '<i class="fas fa-sun"></i>';
        btn.setAttribute('title', 'Switch to Light Mode');
    }
}
