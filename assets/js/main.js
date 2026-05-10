(function() {
    var user = JSON.parse(localStorage.getItem('clothink_user') || 'null');
    var nav = document.querySelector('.nav-links');

    // HAMBURGER MENU
    var navbar = document.querySelector('.navbar');
    if (navbar) {
        var burger = document.createElement('button');
        burger.id = 'burgerMenu';
        burger.innerHTML = '<span></span><span></span><span></span>';
        burger.style.cssText = 'display:none;background:none;border:none;cursor:pointer;padding:8px;position:relative;z-index:200;';
        burger.onclick = function() {
            nav.classList.toggle('open');
            burger.classList.toggle('open');
        };
        var navContainer = navbar.querySelector('.container');
        if (navContainer && navContainer.firstChild) {
            navContainer.insertBefore(burger, navContainer.firstChild.nextSibling);
        }
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.nav-links') && !e.target.closest('#burgerMenu')) {
                nav.classList.remove('open');
                burger.classList.remove('open');
            }
        });
    }

    if (nav && user) {
        var loginBtn = nav.querySelector('.btn-primary');
        var signupBtn = nav.querySelector('.btn-secondary');
        var inPages = window.location.pathname.includes('/pages/');
        var profileLink = inPages ? 'profil.html' : 'pages/profil.html';
        if (loginBtn) loginBtn.outerHTML = '<a href="' + profileLink + '" style="font-size:13px;font-weight:600;color:#555;text-decoration:none;">' + user.name + '</a>';
        if (signupBtn) signupBtn.outerHTML = '<a href="#" id="logoutBtn" style="font-size:13px;color:#999;text-decoration:none;">Çıkış</a>';
        setTimeout(function() {
            var logout = document.getElementById('logoutBtn');
            if (logout) {
                logout.addEventListener('click', function(e) {
                    e.preventDefault();
                    localStorage.removeItem('clothink_user');
                    window.location.reload();
                });
            }
        }, 0);
    }

    // ensure Clothink brand user exists for profile page
    var BRAND_EMAIL = 'clothink@brand.clothink';
    var users = JSON.parse(localStorage.getItem('clothink_users') || '[]');
    var profiles = JSON.parse(localStorage.getItem('clothink_profiles') || '{}');
    var brandExists = false;
    for (var i = 0; i < users.length; i++) {
        if (users[i].email === BRAND_EMAIL) { brandExists = true; break; }
    }
    if (!brandExists) {
        users.push({ name:'Clothink', email:BRAND_EMAIL, password:'clothink123' });
        profiles[BRAND_EMAIL] = { username:'clothink', bio:'Kombinini oluştur, tarzını keşfet.', gender:'kadin' };
        localStorage.setItem('clothink_users', JSON.stringify(users));
        localStorage.setItem('clothink_profiles', JSON.stringify(profiles));
    }

    // DARK MODE
    var dm = localStorage.getItem('clothink_darkmode');
    if (dm === '1') document.body.classList.add('dark');

    // SCROLL TO TOP BUTTON
    (function addScrollTop() {
        var btn = document.createElement('div');
        btn.id = 'scrollTopBtn';
        btn.innerHTML = '↑';
        btn.style.cssText = 'position:fixed;bottom:24px;right:24px;width:44px;height:44px;background:#0a0a0a;color:#c9a84c;border-radius:50%;display:none;align-items:center;justify-content:center;cursor:pointer;font-size:20px;font-weight:700;z-index:999;box-shadow:0 4px 16px rgba(0,0,0,0.2);transition:all 0.3s;';
        btn.onclick = function() { window.scrollTo({top:0,behavior:'smooth'}); };
        document.body.appendChild(btn);
        window.addEventListener('scroll', function() {
            btn.style.display = window.scrollY > 300 ? 'flex' : 'none';
        });
    })();

    // TOAST NOTIFICATIONS
    window.showToast = function(msg) {
        var toast = document.createElement('div');
        toast.textContent = msg;
        toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#0a0a0a;color:#c9a84c;padding:12px 24px;border-radius:0;font-size:13px;font-weight:500;letter-spacing:1px;z-index:9999;text-align:center;text-transform:uppercase;animation:toastIn 0.3s ease;box-shadow:0 8px 32px rgba(0,0,0,0.3);';
        document.body.appendChild(toast);
        setTimeout(function() { toast.remove(); }, 2000);
    };

    // RECENTLY VIEWED
    window.addRecentView = function(imgUrl, title) {
        var rv = JSON.parse(localStorage.getItem('clothink_recent_views') || '[]');
        rv = rv.filter(function(v) { return v.img !== imgUrl; });
        rv.unshift({ img: imgUrl, title: title || '', date: Date.now() });
        if (rv.length > 8) rv = rv.slice(0, 8);
        localStorage.setItem('clothink_recent_views', JSON.stringify(rv));
    };

    // NAVBAR INJECTIONS (search + cart icons)
    var navLinks = document.querySelector('.nav-links');
    if (navLinks && !document.getElementById('searchLink')) {
        var inPages = window.location.pathname.includes('/pages/');
        var searchLi = document.createElement('li');
        searchLi.innerHTML = '<a href="' + (inPages ? '' : 'pages/') + 'ara.html" id="searchLink" style="font-size:12px;text-decoration:none;letter-spacing:1px;text-transform:uppercase;color:#666;">Ara</a>';
        var cartLi = document.createElement('li');
        var cartCount = user ? JSON.parse(localStorage.getItem('clothink_cart_' + user.email) || '[]').length : 0;
        cartLi.innerHTML = '<a href="' + (inPages ? '' : 'pages/') + 'sepet.html" id="cartLink" style="font-size:12px;text-decoration:none;letter-spacing:1px;text-transform:uppercase;color:#666;position:relative;">Sepet' + (cartCount > 0 ? '<span style="position:absolute;top:-6px;right:-12px;background:#0a0a0a;color:#fff;font-size:10px;font-weight:700;padding:2px 5px;border-radius:0;line-height:1;min-width:16px;text-align:center;">' + cartCount + '</span>' : '') + '</a>';
        // insert before notification bell
        var notifBell = document.getElementById('notifBell');
        if (notifBell && notifBell.parentNode) {
            notifBell.parentNode.parentNode.insertBefore(searchLi, notifBell.parentNode);
            notifBell.parentNode.parentNode.insertBefore(cartLi, notifBell.parentNode);
        }
    }

    // NOTIFICATION BELL
    var notifBtn = document.getElementById('notifBell');
    if (notifBtn && user) {
        var unread = countUnread(user.email);
        notifBtn.innerHTML = '<span style="position:relative;font-size:18px;">🔔' + (unread > 0 ? '<span style="position:absolute;top:-6px;right:-8px;background:#e74c3c;color:#fff;font-size:10px;font-weight:700;padding:2px 5px;border-radius:100px;line-height:1;min-width:16px;text-align:center;">' + unread + '</span>' : '') + '</span>';
        notifBtn.onclick = function() { window.location.href = (window.location.pathname.includes('/pages/') ? '' : 'pages/') + 'bildirimler.html'; };
    }

    window.addEventListener('load', function() {
        var btn = document.getElementById('darkToggle');
        if (btn) {
            btn.textContent = dm === '1' ? 'Açık' : 'Koyu';
            btn.style.cssText = 'background:none;border:1px solid #ddd;font-size:11px;cursor:pointer;padding:4px 10px;letter-spacing:1px;text-transform:uppercase;color:#666;transition:all 0.3s;';
            btn.onclick = function() {
                document.body.classList.toggle('dark');
                var isDark = document.body.classList.contains('dark');
                btn.textContent = isDark ? 'Açık' : 'Koyu';
                localStorage.setItem('clothink_darkmode', isDark ? '1' : '0');
            };
        }
    });
})();

// GLOBAL HELPERS
function addNotification(email, type, from, msg) {
    if (!email) return;
    var notifs = JSON.parse(localStorage.getItem('clothink_notifs_' + email) || '[]');
    notifs.unshift({ type: type, from: from, message: msg, date: new Date().toISOString(), read: false });
    if (notifs.length > 50) notifs = notifs.slice(0, 50);
    localStorage.setItem('clothink_notifs_' + email, JSON.stringify(notifs));
}
function countUnread(email) {
    if (!email) return 0;
    var notifs = JSON.parse(localStorage.getItem('clothink_notifs_' + email) || '[]');
    return notifs.filter(function(n) { return !n.read; }).length;
}
function addToCart(name, brand, price, img) {
    var user = JSON.parse(localStorage.getItem('clothink_user') || 'null');
    if (!user) { window.location.href = (window.location.pathname.includes('/pages/') ? '' : 'pages/') + 'giris.html'; return; }
    var cart = JSON.parse(localStorage.getItem('clothink_cart_' + user.email) || '[]');
    cart.push({ name: name, brand: brand, price: price, img: img });
    localStorage.setItem('clothink_cart_' + user.email, JSON.stringify(cart));
    alert('🛒 "' + name + '" sepete eklendi!');
    // reload to update cart badge
    window.location.reload();
}

// PWA service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('../sw.js').catch(function() {});
}
