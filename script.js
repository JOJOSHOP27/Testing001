// ============================================================
// JOELL SHOP - MAIN SCRIPT (FULL WORKING + FIREBASE AUTH)
// VERSION 2.4.1 - FIXED AUTH
// ============================================================

// ============================================================
// NOTIFICATION SYSTEM
// ============================================================
function requestNotificationPermission() {
    if ("Notification" in window) {
        Notification.requestPermission();
    }
}

function sendBrowserNotification(title, message, orderId = null) {
    if ("Notification" in window && Notification.permission === "granted") {
        const notification = new Notification(title, {
            body: message,
            icon: 'https://files.catbox.moe/o3t86k.jpg'
        });
        notification.onclick = function() {
            window.focus();
            if (orderId) {
                if (typeof isAdminLoggedIn !== 'undefined' && isAdminLoggedIn) {
                    openAdminChat(orderId);
                } else {
                    navigateTo('orders');
                    setTimeout(() => openOrderChat(orderId), 500);
                }
            }
        };
    }
}
requestNotificationPermission();

// ============================================================
// CONFIG & DATA
// ============================================================
const CONFIG = {
    flashSaleEnd: new Date(Date.now() + 4 * 3600 * 1000 + 32 * 60000 + 15 * 1000),
    promoCodes: {
        'JOELL50': { discount: 0.5, type: 'percent', max: 50000, desc: 'Diskon 50%' },
        'WELCOME': { discount: 10000, type: 'fixed', desc: 'Potongan Rp 10.000' },
        'FLASH25': { discount: 0.25, type: 'percent', max: 25000, desc: 'Diskon 25%' }
    },
    imgurClientId: '546c25a59c58ad7',
    adminPassword: 'joelladmin2026'
};

// PRODUCTS DATA - LENGKAP 13 PRODUK
const products = [
    { id: 1, name: 'Panel Pterodactyl', price: 2000, desc: 'Panel hosting premium dengan performa stabil.', icon: 'fa-server', category: 'hosting', badge: 'hot', variants: [
        { name: '1GB RAM', price: 2000, stock: 'Tersedia' }, { name: '2GB RAM', price: 3000, stock: 'Tersedia' },
        { name: '3GB RAM', price: 4000, stock: 'Tersedia' }, { name: '4GB RAM', price: 5000, stock: 'Tersedia' },
        { name: '5GB RAM', price: 6000, stock: 'Tersedia' }, { name: '6GB RAM', price: 7000, stock: 'Tersedia' },
        { name: '7GB RAM', price: 8000, stock: 'Tersedia' }, { name: '8GB RAM', price: 9000, stock: 'Tersedia' },
        { name: '9GB RAM', price: 10000, stock: 'Tersedia' }, { name: '11GB RAM', price: 11000, stock: 'Tersedia' },
        { name: 'Unlimited RAM', price: 13000, stock: 'Limited' }, { name: 'Reseller Panel', price: 16000, stock: 'Tersedia' },
        { name: 'Admin Panel', price: 18000, stock: 'Tersedia' }
    ]},
    { id: 2, name: 'Jasa Pembuatan Fitur', price: 5000, desc: 'Custom fitur untuk bot WhatsApp.', icon: 'fa-microchip', category: 'hosting', badge: 'new', variants: [
        { name: 'Add & Fix Fitur', price: 5000, stock: 'Tersedia' }, { name: 'Auto React Status', price: 15000, stock: 'Tersedia' },
        { name: 'Security IP', price: 25000, stock: 'Tersedia' }, { name: 'Security User+Pass', price: 15000, stock: 'Tersedia' },
        { name: 'Autojoin Saluran', price: 10000, stock: 'Tersedia' }, { name: 'Auto Show JKT48', price: 55000, stock: 'Limited' }
    ]},
    { id: 3, name: 'Sewa Bot & Jadibot', price: 10000, desc: 'Bot WhatsApp siap pakai 24/7.', icon: 'fa-robot', category: 'hosting', variants: [
        { name: '2 Minggu', price: 10000, stock: 'Tersedia' }, { name: '1 Bulan', price: 20000, stock: 'Tersedia' }, { name: 'Lifetime', price: 30000, stock: 'Limited' }
    ]},
    { id: 4, name: 'Script Lily Gen 2', price: 30000, desc: 'Script bot WhatsApp 600+ fitur.', icon: 'fa-database', category: 'hosting', badge: 'pro', variants: [
        { name: 'No Update', price: 30000, stock: 'Tersedia' }, { name: 'Free 1x Update', price: 35000, stock: 'Tersedia' }, { name: 'Free 2x Update', price: 45000, stock: 'Tersedia' }
    ]},
    { id: 5, name: 'Jasa Rename Script', price: 7000, desc: 'Ubah identitas script bot WA.', icon: 'fa-pen-fancy', category: 'hosting', variants: [
        { name: 'Rename 30%', price: 7000, stock: 'Tersedia' }, { name: 'Rename 60%', price: 12000, stock: 'Tersedia' },
        { name: 'Rename 80%', price: 15000, stock: 'Tersedia' }, { name: 'Rename 100%', price: 20000, stock: 'Tersedia' }
    ]},
    { id: 6, name: 'Domain & Hosting', price: 8000, desc: 'Domain dan hosting website berkualitas.', icon: 'fa-globe', category: 'hosting', variants: [
        { name: 'Domain .my.id 1th', price: 8000, stock: 'Tersedia' }, { name: 'Domain .biz.id 1th', price: 8000, stock: 'Tersedia' },
        { name: 'Domain .xyz 1th', price: 75000, stock: 'Tersedia' }, { name: '.xyz + Hosting', price: 550000, stock: 'Tersedia' }
    ]},
    { id: 7, name: 'Bot Multi Device', price: 35000, desc: 'Script bot WhatsApp MD dengan fitur modern.', icon: 'fa-code-branch', category: 'script', badge: 'hot', variants: [
        { name: 'Bot MD Basic', price: 35000, stock: 'Tersedia' }, { name: 'Bot MD Premium', price: 75000, stock: 'Tersedia' }, { name: 'Custom Request', price: 0, stock: 'Hubungi' }
    ]},
    { id: 8, name: 'Bot RPG', price: 45000, desc: 'Script bot RPG dengan sistem game.', icon: 'fa-gamepad', category: 'script', variants: [
        { name: 'Bot RPG Basic', price: 45000, stock: 'Tersedia' }, { name: 'Bot RPG Full', price: 85000, stock: 'Tersedia' }, { name: 'Custom Request', price: 0, stock: 'Hubungi' }
    ]},
    { id: 9, name: 'Bot Jaga Group', price: 30000, desc: 'Bot keamanan grup dengan welcome & anti-link.', icon: 'fa-users-cog', category: 'script', variants: [
        { name: 'Jaga Group Basic', price: 30000, stock: 'Tersedia' }, { name: 'Jaga Group + Pushkontak', price: 70000, stock: 'Tersedia' }, { name: 'Custom Request', price: 0, stock: 'Hubungi' }
    ]},
    { id: 10, name: 'Bot Downloader', price: 40000, desc: 'Bot convert media & downloader sosmed.', icon: 'fa-download', category: 'script', badge: 'new', variants: [
        { name: 'Downloader Basic', price: 40000, stock: 'Tersedia' }, { name: 'Convert + Sticker Full', price: 80000, stock: 'Tersedia' }, { name: 'Custom Request', price: 0, stock: 'Hubungi' }
    ]},
    { id: 11, name: 'Bot Auto AI', price: 50000, desc: 'Bot AI pintar untuk chat otomatis.', icon: 'fa-brain', category: 'script', badge: 'pro', variants: [
        { name: 'AI Basic', price: 50000, stock: 'Tersedia' }, { name: 'AI Premium', price: 95000, stock: 'Tersedia' }, { name: 'Custom Request', price: 0, stock: 'Hubungi' }
    ]},
    { id: 12, name: 'Bot Auto Order', price: 55000, desc: 'Bot WhatsApp dengan sistem pembayaran otomatis.', icon: 'fa-credit-card', category: 'script', variants: [
        { name: 'Auto Order Basic', price: 55000, stock: 'Tersedia' }, { name: 'Auto Order Premium', price: 99000, stock: 'Tersedia' }, { name: 'Custom Request', price: 0, stock: 'Hubungi' }
    ]},
    { id: 13, name: 'Topup All Game', price: 0, desc: 'Topup diamond, UC, dan voucher game favoritmu.', icon: 'fa-gamepad', category: 'topup', isTopup: true, variants: [{ name: 'Pilih Game', price: 0, stock: 'Tersedia' }] }
];

// TOPUP GAMES
const topupGames = [
    { name: 'FREE FIRE', logo: 'https://files.catbox.moe/5mzzve.webp', url: 'https://bananagamestore.com/free-fire-b' },
    { name: 'MOBILE LEGENDS', logo: 'https://files.catbox.moe/6l0i99.webp', url: 'https://bananagamestore.com/mobile-legends-b' },
    { name: 'HONOR OF KINGS', logo: 'https://files.catbox.moe/jr45bw.png', url: 'https://bananagamestore.com/honor-of-kings' },
    { name: 'PUBG MOBILE', logo: 'https://files.catbox.moe/ja3cb4.webp', url: 'https://bananagamestore.com/pubg-mobile' },
    { name: 'MAGIC CHESS', logo: 'https://files.catbox.moe/20pncb.webp', url: 'https://bananagamestore.com/magic-chess-go-go' },
    { name: 'VALORANT', logo: 'https://files.catbox.moe/o7ggke.webp', url: 'https://bananagamestore.com/valorant' },
    { name: 'BLOOD STRIKE', logo: 'https://files.catbox.moe/rzmi2o.webp', url: 'https://bananagamestore.com/blood-strike' },
    { name: 'CALL OF DUTY', logo: 'https://files.catbox.moe/xjzqxc.webp', url: 'https://bananagamestore.com/call-of-duty-mobile-id' },
    { name: 'ROBLOX', logo: 'https://files.catbox.moe/t347k0.webp', url: 'https://bananagamestore.com/roblox' },
    { name: 'DELTA FORCE', logo: 'https://files.catbox.moe/kkcx3r.webp', url: 'https://bananagamestore.com/delta-force-garena' },
    { name: 'POINT BLANK', logo: 'https://files.catbox.moe/y9zkye.webp', url: 'https://bananagamestore.com/ppoint-blank-voucher-cash' },
    { name: 'STEAM', logo: 'https://files.catbox.moe/s7r8fi.webp', url: 'https://bananagamestore.com/steam-voucher-indonesia-rupiah' }
];

// ============================================================
// STATE
// ============================================================
let cart = JSON.parse(localStorage.getItem('joellCart')) || [];
let orders = JSON.parse(localStorage.getItem('joellOrders')) || [];
let currentUser = JSON.parse(localStorage.getItem('joellUser')) || null;
let currentProductId = null;
let selectedVariant = null;
let activePromo = null;
let currentOrderChatId = null;
let isAdminLoggedIn = false;
let currentAdminChatId = null;
let logoClickCount = 0;
let firebaseInitialized = false;
let firebaseAuth = null;
let db = null;
let firestore = null;

// ============================================================
// FIREBASE REALTIME DATABASE CONFIG
// ============================================================
const _0x4f2a = ["QUl6YVN5RG9HNkdQQkRVUnZCQ3piT09TQ1FMSmtucnVGeXM0WEV3", "am9lbGwtc2hvcC1kYjNhNi5maXJlYmFzZWFwcC5jb20=", "am9lbGwtc2hvcC1kYjNhNg==", "am9lbGwtc2hvcC1kYjNhNi5maXJlYmFzZXN0b3JhZ2UuYXBw", "MTAxNjIzOTA2NjI0MA==", "MToxMDE2MjM5MDY2MjQwOndlYjoxODk4ZWM4MGU4OWU0NTg3MjRhYTY1", "aHR0cHM6Ly9qb2VsbC1zaG9wLWRiM2E2LWRlZmF1bHQtcnRkYi5hc2lhLXNvdXRoZWFzdDEuZmlyZWJhc2VkYXRhYmFzZS5hcHAv"];
const firebaseConfig = {
    apiKey: atob(_0x4f2a[0]),
    authDomain: atob(_0x4f2a[1]),
    projectId: atob(_0x4f2a[2]),
    storageBucket: atob(_0x4f2a[3]),
    messagingSenderId: atob(_0x4f2a[4]),
    appId: atob(_0x4f2a[5]),
    databaseURL: atob(_0x4f2a[6])
};

// ============================================================
// INIT CLOUD SYNC - FIXED: CEK SDK TERSEDIA
// ============================================================
function initCloudSync() {
    if (firebaseInitialized) return;
    
    if (typeof firebase === 'undefined') {
        console.warn("Firebase SDK belum dimuat");
        return;
    }
    
    if (!firebase.auth) {
        console.warn("Firebase Auth SDK tidak tersedia");
        return;
    }
    
    try {
        firebase.initializeApp(firebaseConfig);
        db = firebase.database();
        firebaseAuth = firebase.auth();
        firebaseInitialized = true;
        
        if (firebase.firestore) {
            firestore = firebase.firestore();
        }
        
        // Setup auth state listener
        firebaseAuth.onAuthStateChanged(async (user) => {
            if (user) {
                const userData = await getCurrentUserData();
                if (userData) {
                    currentUser = userData;
                    localStorage.setItem('joellUser', JSON.stringify(currentUser));
                    updateUserUI();
                    renderProfilePage();
                    if (typeof renderOrdersList === 'function') renderOrdersList();
                }
            } else {
                currentUser = null;
                localStorage.removeItem('joellUser');
                updateUserUI();
                renderProfilePage();
            }
        });
        
        // Cloud connection status
        const connectedRef = db.ref(".info/connected");
        connectedRef.on("value", (snap) => {
            const statusDot = document.getElementById('cloudStatusDot');
            const statusText = document.getElementById('cloudStatusText');
            if (snap.val() === true) {
                if (statusDot) statusDot.style.background = 'var(--green)';
                if (statusText) statusText.textContent = 'Terhubung ke Cloud Database';
                console.log("Cloud Connected");
            } else {
                if (statusDot) statusDot.style.background = 'var(--red)';
                if (statusText) statusText.textContent = 'Terputus dari Cloud Database';
                console.log("Cloud Disconnected");
            }
        });

        // Sync orders from cloud
        db.ref('orders').on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                orders = data;
                localStorage.setItem('joellOrders', JSON.stringify(orders));
                renderOrdersList();
                if (isAdminLoggedIn) {
                    renderAdminOrders();
                    updateAdminStats();
                }
                if (currentOrderChatId) renderOrderChatMessages();
                if (currentAdminChatId) renderAdminChatMessages();
                updateUnreadBadges();
            }
        });
        
        console.log("✅ Firebase initialized successfully");
    } catch (e) {
        console.error("Firebase Init Error:", e);
        const statusDot = document.getElementById('cloudStatusDot');
        const statusText = document.getElementById('cloudStatusText');
        if (statusDot) statusDot.style.background = 'var(--red)';
        if (statusText) statusText.textContent = 'Error: Konfigurasi Cloud Salah';
    }
}

function syncOrdersToCloud() {
    if (db) {
        db.ref('orders').set(orders).then(() => {
            console.log("Cloud Sync Success");
        }).catch(e => {
            console.error("Sync Error:", e);
        });
    }
}

// ============================================================
// FIREBASE AUTHENTICATION FUNCTIONS
// ============================================================

// GET CURRENT USER DATA FROM FIRESTORE
async function getCurrentUserData() {
    const user = firebaseAuth ? firebaseAuth.currentUser : null;
    if (!user) return null;

    try {
        if (firestore) {
            const doc = await firestore.collection('users').doc(user.uid).get();
            if (doc.exists) {
                const data = doc.data();
                return {
                    id: user.uid,
                    name: user.displayName || data.nama || 'User',
                    email: user.email,
                    picture: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || data.nama || 'User')}&background=random`,
                    ...data
                };
            }
        }
        return {
            id: user.uid,
            name: user.displayName || 'User',
            email: user.email,
            picture: user.photoURL || `https://ui-avatars.com/api/?name=User&background=random`
        };
    } catch (e) {
        console.error("Error getting user data:", e);
        return {
            id: user.uid,
            name: user.displayName || 'User',
            email: user.email,
            picture: user.photoURL || `https://ui-avatars.com/api/?name=User&background=random`
        };
    }
}

// ============================================================
// REGISTER - FIXED: VALIDASI & ERROR HANDLING
// ============================================================
async function registerUserCloud(nama, email, password) {
    try {
        if (!firebaseAuth) {
            throw new Error('Firebase Auth belum siap. Refresh halaman.');
        }
        
        const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        await user.updateProfile({ displayName: nama });
        
        if (firestore) {
            await firestore.collection('users').doc(user.uid).set({
                nama: nama,
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        const userData = {
            id: user.uid,
            name: nama,
            email: email,
            picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(nama)}&background=random`
        };
        
        currentUser = userData;
        localStorage.setItem('joellUser', JSON.stringify(currentUser));
        updateUserUI();
        renderProfilePage();
        
        return { success: true, user: userData };
        
    } catch (error) {
        let message = 'Terjadi kesalahan saat mendaftar';
        if (error.code === 'auth/email-already-in-use') message = 'Email sudah terdaftar. Silakan login.';
        else if (error.code === 'auth/weak-password') message = 'Password minimal 6 karakter.';
        else if (error.code === 'auth/invalid-email') message = 'Format email tidak valid.';
        else if (error.code === 'auth/network-request-failed') message = 'Koneksi internet bermasalah.';
        return { success: false, message: message };
    }
}

// ============================================================
// LOGIN - FIXED: ERROR CODE MAPPING
// ============================================================
async function loginUserCloud(email, password) {
    try {
        if (!firebaseAuth) {
            throw new Error('Firebase Auth belum siap. Refresh halaman.');
        }
        
        const userCredential = await firebaseAuth.signInWithEmailAndPassword(email, password);
        const userData = await getCurrentUserData();
        
        if (userData) {
            currentUser = userData;
            localStorage.setItem('joellUser', JSON.stringify(currentUser));
            updateUserUI();
            renderProfilePage();
            if (typeof renderOrdersList === 'function') renderOrdersList();
        }
        
        return { success: true, user: currentUser };
        
    } catch (error) {
        let message = 'Terjadi kesalahan saat login';
        if (error.code === 'auth/user-not-found') message = 'Akun tidak ditemukan. Silakan daftar dulu.';
        else if (error.code === 'auth/wrong-password') message = 'Password salah.';
        else if (error.code === 'auth/invalid-credential') message = 'Email atau password salah.';
        else if (error.code === 'auth/too-many-requests') message = 'Terlalu banyak percobaan. Coba lagi nanti.';
        else if (error.code === 'auth/network-request-failed') message = 'Koneksi internet bermasalah.';
        return { success: false, message: message };
    }
}

// ============================================================
// LOGOUT - FIXED: BERSIH TOTAL + REFRESH
// ============================================================
async function logoutUserCloud() {
    try {
        if (firebaseAuth) {
            await firebaseAuth.signOut();
        }
        
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('joellUser') || key.includes('firebase'))) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        localStorage.removeItem('joellUser');
        currentUser = null;
        
        updateUserUI();
        renderProfilePage();
        
        showToast('Logout Berhasil', 'Anda telah keluar dari akun.', 'info');
        
        setTimeout(() => window.location.reload(), 800);
        
    } catch (error) {
        showToast('Error', 'Gagal logout: ' + error.message, 'error');
    }
}

// ============================================================
// GOOGLE LOGIN
// ============================================================
function handleGoogleLogin(response) {
    try {
        const credential = response.credential;
        const payload = JSON.parse(atob(credential.split('.')[1]));
        
        if (firebaseAuth) {
            const credential2 = firebase.auth.GoogleAuthProvider.credential(credential);
            firebaseAuth.signInWithCredential(credential2).then((result) => {
                const user = result.user;
                currentUser = {
                    id: user.uid,
                    name: user.displayName || payload.name,
                    email: user.email || payload.email,
                    picture: user.photoURL || payload.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(payload.name || 'User')}&background=random`,
                    token: credential
                };
                localStorage.setItem('joellUser', JSON.stringify(currentUser));
                updateUserUI();
                document.getElementById('loginOverlay').classList.remove('open');
                showToast('Login Berhasil', `Selamat datang, ${currentUser.name}!`, 'success');
                renderOrdersList();
                renderProfilePage();
            }).catch((error) => {
                console.error("Google sign in error:", error);
                showToast('Error', 'Gagal login dengan Google', 'error');
            });
        } else {
            currentUser = {
                id: payload.sub,
                name: payload.name,
                email: payload.email,
                picture: payload.picture,
                token: credential
            };
            localStorage.setItem('joellUser', JSON.stringify(currentUser));
            updateUserUI();
            document.getElementById('loginOverlay').classList.remove('open');
            showToast('Login Berhasil', `Selamat datang, ${currentUser.name}!`, 'success');
            renderOrdersList();
            renderProfilePage();
        }
    } catch (e) {
        console.error("Login Error:", e);
        showToast('Error', 'Gagal login dengan Google', 'error');
    }
}

// ============================================================
// HANDLE REGISTER & LOGIN (BUTTON CLICK)
// ============================================================

async function handleRegister() {
    console.log("✅ Register button clicked!");
    
    const nama = document.getElementById('regFirstName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirmPassword').value;

    if (!nama || !email || !password || !confirm) {
        showToast('Error', 'Semua field harus diisi.', 'error');
        return;
    }
    if (password.length < 6) {
        showToast('Error', 'Password minimal 6 karakter.', 'error');
        return;
    }
    if (password !== confirm) {
        showToast('Error', 'Konfirmasi password tidak cocok.', 'error');
        return;
    }
    if (!email.includes('@')) {
        showToast('Error', 'Email tidak valid.', 'error');
        return;
    }

    showToast('Loading', 'Mendaftarkan akun...', 'info', 2000);

    try {
        const result = await registerUserCloud(nama, email, password);
        if (result.success) {
            showToast('Berhasil', 'Akun terdaftar di cloud!', 'success');
            document.getElementById('loginOverlay').classList.remove('open');
            document.getElementById('regFirstName').value = '';
            document.getElementById('regEmail').value = '';
            document.getElementById('regPassword').value = '';
            document.getElementById('regConfirmPassword').value = '';
        } else {
            showToast('Error', result.message, 'error');
        }
    } catch (error) {
        console.error("Register error:", error);
        showToast('Error', 'Terjadi kesalahan. Coba lagi.', 'error');
    }
}

async function handleLogin() {
    console.log("✅ Login button clicked!");
    
    const identifier = document.getElementById('loginIdentifier').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!identifier || !password) {
        showToast('Error', 'Isi semua field.', 'error');
        return;
    }

    let email = identifier;
    if (!identifier.includes('@') && firestore) {
        try {
            const snapshot = await firestore.collection('users').where('nama', '==', identifier).get();
            if (!snapshot.empty) {
                email = snapshot.docs[0].data().email;
            } else {
                showToast('Gagal', 'Nama tidak ditemukan.', 'error');
                return;
            }
        } catch (e) {
            showToast('Error', 'Gagal mencari user.', 'error');
            return;
        }
    }

    try {
        const result = await loginUserCloud(email, password);
        if (result.success) {
            document.getElementById('loginOverlay').classList.remove('open');
            document.getElementById('loginIdentifier').value = '';
            document.getElementById('loginPassword').value = '';
            showToast('Selamat datang', `Halo, ${window.currentUser?.name || 'User'}!`, 'success');
        } else {
            showToast('Gagal', result.message, 'error');
        }
    } catch (error) {
        console.error("Login error:", error);
        showToast('Error', 'Terjadi kesalahan. Coba lagi.', 'error');
    }
}

// ============================================================
// RENDER FUNCTIONS
// ============================================================
function renderTopupGames() {
    const grid = document.getElementById('topupGrid');
    if (!grid) return;
    grid.innerHTML = topupGames.map(g => `
        <div class="topup-item" onclick="window.open('${g.url}', '_blank')">
            <img src="${g.logo}" alt="${g.name}" loading="lazy">
            <span>${g.name}</span>
        </div>
    `).join('');
}

function renderMenus() {
    const hostingGrid = document.getElementById('gridHosting');
    const scriptGrid = document.getElementById('gridScript');
    const topupGrid = document.getElementById('gridTopup');
    
    if (hostingGrid) hostingGrid.innerHTML = renderMenuCards(products.filter(p => p.category === 'hosting'));
    if (scriptGrid) scriptGrid.innerHTML = renderMenuCards(products.filter(p => p.category === 'script'));
    if (topupGrid) topupGrid.innerHTML = renderMenuCards(products.filter(p => p.category === 'topup'));
}

function renderMenuCards(productList) {
    return productList.map(p => {
        const badgeHtml = p.badge ? `<span class="card-badge ${p.badge}">${p.badge.toUpperCase()}</span>` : '';
        return `
            <div class="menu-card" data-id="${p.id}" data-topup="${p.isTopup||false}">
                ${badgeHtml}
                <i class="fas ${p.icon}"></i>
                <span>${p.name}</span>
            </div>
        `;
    }).join('');
}

// ============================================================
// DETAIL MODAL
// ============================================================
function openDetail(productId) {
    const p = products.find(x => x.id === productId);
    if (!p) {
        showToast('Error', 'Produk tidak ditemukan', 'error');
        return;
    }
    currentProductId = p.id;
    selectedVariant = p.variants[0];
    document.getElementById('detailName').textContent = p.name;
    document.getElementById('detailPrice').textContent = 'Rp ' + (p.variants[0].price || 0).toLocaleString();
    document.getElementById('detailDesc').textContent = p.desc;
    const list = document.getElementById('variantList');
    list.innerHTML = p.variants.map((v, i) => {
        const priceText = v.price === 0 ? 'Hubungi Admin' : 'Rp ' + v.price.toLocaleString();
        return `
            <div class="variant-item ${i === 0 ? 'active' : ''}" data-index="${i}" onclick="selectVariant(this, ${i})">
                <span class="vname">${v.name}</span>
                <span class="vprice">${priceText}</span>
                <span class="vstock"><i class="fas fa-check-circle"></i> ${v.stock}</span>
            </div>
        `;
    }).join('');
    document.getElementById('detailOverlay').classList.add('open');
}

function selectVariant(el, index) {
    document.querySelectorAll('.variant-item').forEach(v => v.classList.remove('active'));
    el.classList.add('active');
    const p = products.find(x => x.id === currentProductId);
    if (p) {
        selectedVariant = p.variants[index];
        const priceText = selectedVariant.price === 0 ? 'Hubungi Admin' : 'Rp ' + selectedVariant.price.toLocaleString();
        document.getElementById('detailPrice').textContent = priceText;
    }
}

// ============================================================
// CART FUNCTIONS
// ============================================================
function updateCartUI() {
    const count = cart.reduce((a, i) => a + i.qty, 0);
    const navBadge = document.getElementById('navCartBadge');
    const totalBadge = document.getElementById('cartBadgeTotal');
    if (navBadge) navBadge.textContent = count;
    if (totalBadge) totalBadge.textContent = count;
    
    const container = document.getElementById('cartItems');
    const footer = document.getElementById('cartFooter');

    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-bag"></i>
                <h3>Keranjang kosong</h3>
                <p>Yuk, isi dengan produk favoritmu!</p>
            </div>`;
        if (footer) footer.style.display = 'none';
        return;
    }
    if (footer) footer.style.display = 'block';
    
    let subtotal = 0;
    container.innerHTML = cart.map((item, idx) => {
        const sub = item.price * item.qty;
        subtotal += sub;
        const priceText = item.price === 0 ? 'Hubungi Admin' : 'Rp ' + sub.toLocaleString();
        return `
            <div class="cart-item" data-index="${idx}">
                <div class="item-icon"><i class="fas ${item.icon || 'fa-box'}"></i></div>
                <div class="item-info">
                    <div class="item-name">${item.name}</div>
                    <div class="item-variant">${item.variant}</div>
                    <div class="item-price">${priceText}</div>
                </div>
                <div class="item-actions">
                    <div class="qty-control">
                        <button onclick="updateQty(${idx}, -1)"><i class="fas fa-minus"></i></button>
                        <span class="qty-num">${item.qty}</span>
                        <button onclick="updateQty(${idx}, 1)"><i class="fas fa-plus"></i></button>
                    </div>
                    <button class="item-remove" onclick="removeItem(${idx})"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
        `;
    }).join('');

    let discount = 0;
    if (activePromo) {
        if (activePromo.type === 'percent') {
            discount = Math.min(subtotal * activePromo.discount, activePromo.max || Infinity);
        } else {
            discount = activePromo.discount;
        }
    }
    const total = Math.max(0, subtotal - discount);

    document.getElementById('cartSubtotal').textContent = 'Rp ' + subtotal.toLocaleString();
    document.getElementById('cartDiscount').textContent = discount > 0 ? '- Rp ' + discount.toLocaleString() : 'Rp 0';
    document.getElementById('cartShipping').textContent = 'Rp 0';
    document.getElementById('cartTotalDisplay').textContent = 'Rp ' + total.toLocaleString();
    
    localStorage.setItem('joellCart', JSON.stringify(cart));
}

function updateQty(idx, delta) {
    if (!cart[idx]) return;
    if (cart[idx].qty + delta < 1) {
        removeItem(idx);
        return;
    }
    cart[idx].qty += delta;
    updateCartUI();
}

function removeItem(idx) {
    cart.splice(idx, 1);
    updateCartUI();
    showToast('Keranjang', 'Item dihapus', 'info');
}

function addToCart(productId, variantName, variantPrice) {
    const p = products.find(x => x.id === productId);
    if (!p) return;
    const existing = cart.find(c => c.id === productId && c.variant === variantName);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ id: p.id, name: p.name, price: variantPrice, variant: variantName, qty: 1, icon: p.icon || 'fa-box' });
    }
    localStorage.setItem('joellCart', JSON.stringify(cart));
    updateCartUI();
    showToast('Keranjang', `${p.name} ditambahkan!`, 'success');
}

// ============================================================
// ORDERS
// ============================================================
function renderOrdersList() {
    const container = document.getElementById('ordersListContainer');
    if (!container) return;
    
    const myOrders = currentUser ? orders.filter(o => o.userId === currentUser.id) : [];

    if (!myOrders.length) {
        container.innerHTML = `
            <div class="empty-orders">
                <i class="fas fa-box-open"></i>
                <h3>Belum ada pesanan</h3>
                <p>Yuk mulai berbelanja!</p>
            </div>`;
        return;
    }

    const statusClass = {
        'pending': 'pending', 'read': 'read', 'processing': 'processing',
        'shipped': 'shipped', 'completed': 'completed'
    };
    const statusLabel = {
        'pending': 'Menunggu', 'read': 'Dibaca', 'processing': 'Diproses',
        'shipped': 'Dikirim', 'completed': 'Selesai'
    };

    container.innerHTML = '<div class="orders-list">' + myOrders.map(o => {
        const itemsText = o.items.map(i => `${i.name} (${i.variant})`).join(', ');
        return `
            <div class="order-card" onclick="openOrderChat('${o.id}')">
                <div class="order-card-header">
                    <span class="order-id">#${o.id}</span>
                    <span class="order-status ${statusClass[o.status] || 'pending'}">${statusLabel[o.status] || o.status}</span>
                </div>
                <div class="order-products">${itemsText}</div>
                <div class="order-meta">
                    <span>${new Date(o.createdAt).toLocaleString('id-ID', {day:'2-digit', month:'short', year:'numeric'})}</span>
                    <span class="order-total">Rp ${o.total.toLocaleString()}</span>
                </div>
            </div>
        `;
    }).join('') + '</div>';
}

function openOrderChat(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    currentOrderChatId = orderId;
    document.getElementById('orderChatOrderId').textContent = 'Order: #' + orderId;
    renderOrderChatMessages();
    document.getElementById('orderChatOverlay').classList.add('open');
}

function renderOrderChatMessages() {
    const order = orders.find(o => o.id === currentOrderChatId);
    if (!order) return;
    const container = document.getElementById('orderChatMessages');
    if (!container) return;
    
    container.innerHTML = order.chat.map(c => {
        const isAdmin = c.from === 'admin';
        const imgHtml = c.image ? `
            <div class="chat-img-container">
                <img src="${c.image}" alt="chat-img" onclick="window.open('${c.image}', '_blank')">
            </div>` : '';
        
        const avatar = isAdmin ? 
            `<div class="chat-avatar" style="background:var(--accent);"><i class="fas fa-robot"></i></div>` : 
            `<div class="chat-avatar" style="background:var(--purple);">${currentUser ? currentUser.name.charAt(0) : 'U'}</div>`;

        return `
            <div class="chat-row ${isAdmin ? 'admin-row' : 'user-row'}">
                ${avatar}
                <div class="msg ${isAdmin ? 'admin' : 'user'}">
                    ${c.text || ''}
                    ${imgHtml}
                    <span class="time">${c.time}</span>
                </div>
            </div>
        `;
    }).join('');
    container.scrollTop = container.scrollHeight;
}

// ============================================================
// ADMIN
// ============================================================
function enterAdminMode() {
    localStorage.setItem('joellCurrentPage', 'admin');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-admin').classList.add('active');
    document.getElementById('bottomNav').style.display = 'none';
    document.getElementById('adminLoginView').style.display = 'block';
    document.getElementById('adminDashboardView').style.display = 'none';
    window.scrollTo(0,0);
}

function renderAdminOrders() {
    const container = document.getElementById('adminOrdersList');
    if (!container) return;
    
    if (!orders.length) {
        container.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:20px;">Belum ada pesanan</p>';
        return;
    }
    const statusOptions = {
        'pending': 'Menunggu', 'read': 'Dibaca', 'processing': 'Diproses',
        'shipped': 'Dikirim', 'completed': 'Selesai'
    };
    container.innerHTML = orders.map(o => {
        const itemsText = o.items.map(i => `${i.name} (${i.variant}) x${i.qty}`).join(', ');
        return `
            <div class="admin-order-item">
                <div class="admin-order-header">
                    <span class="admin-order-id">#${o.id}</span>
                    <select class="admin-status-select" onchange="updateOrderStatus('${o.id}', this.value)">
                        ${Object.entries(statusOptions).map(([k,v]) => `<option value="${k}" ${o.status===k?'selected':''}>${v}</option>`).join('')}
                    </select>
                </div>
                <div class="admin-order-meta">
                    <strong>${o.userName}</strong> · ${o.userEmail} · ${o.userPhone || '-'}
                </div>
                <div class="admin-order-products">${itemsText}</div>
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-weight:800;color:var(--accent-light);">Rp ${o.total.toLocaleString()}</span>
                    <button class="admin-chat-btn" onclick="openAdminChat('${o.id}')">
                        <i class="fas fa-comments"></i> Balas Chat
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function updateAdminStats() {
    document.getElementById('adminStatTotal').textContent = orders.length;
    document.getElementById('adminStatPending').textContent = orders.filter(o => o.status === 'pending').length;
    document.getElementById('adminStatProcessing').textContent = orders.filter(o => o.status === 'processing').length;
    document.getElementById('adminStatCompleted').textContent = orders.filter(o => o.status === 'completed').length;
}

function updateOrderStatus(orderId, newStatus) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    order.status = newStatus;
    order.statusLabel = {pending:'Menunggu',read:'Dibaca',processing:'Diproses',shipped:'Dikirim',completed:'Selesai'}[newStatus];
    localStorage.setItem('joellOrders', JSON.stringify(orders));
    syncOrdersToCloud();
    updateAdminStats();
    renderAdminOrders();
    showToast('Status Updated', `Order #${orderId} → ${order.statusLabel}`, 'success');
}

function openAdminChat(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    currentAdminChatId = orderId;
    document.getElementById('adminChatUserName').textContent = order.userName;
    document.getElementById('adminChatOrderId').textContent = 'Order: #' + orderId;
    
    const userImg = document.getElementById('adminChatUserImg');
    if (userImg) {
        userImg.innerHTML = `<img src="https://ui-avatars.com/api/?name=${encodeURIComponent(order.userName)}&background=random" style="width:100%;height:100%;border-radius:50%;">`;
    }

    renderAdminChatMessages();
    document.getElementById('adminChatOverlay').classList.add('open');
}

function renderAdminChatMessages() {
    const order = orders.find(o => o.id === currentAdminChatId);
    if (!order) return;
    const container = document.getElementById('adminChatMessages');
    if (!container) return;
    
    container.innerHTML = order.chat.map(c => {
        const isAdmin = c.from === 'admin';
        const imgHtml = c.image ? `
            <div class="chat-img-container">
                <img src="${c.image}" alt="chat-img" onclick="window.open('${c.image}', '_blank')">
            </div>` : '';

        const avatar = isAdmin ? 
            `<div class="chat-avatar" style="background:var(--accent);"><i class="fas fa-robot"></i></div>` : 
            `<div class="chat-avatar" style="background:var(--purple);">${order.userName.charAt(0)}</div>`;

        return `
            <div class="chat-row ${isAdmin ? 'user-row' : 'admin-row'}">
                ${avatar}
                <div class="msg ${isAdmin ? 'user' : 'admin'}">
                    ${c.text || ''}
                    ${imgHtml}
                    <span class="time">${c.time}</span>
                </div>
            </div>
        `;
    }).join('');
    container.scrollTop = container.scrollHeight;
}

function refreshAdminOrders() {
    const btn = document.getElementById('btnRefreshAdmin');
    if (btn) btn.querySelector('i').classList.add('fa-spin');
    
    if (db) {
        db.ref('orders').once('value').then((snapshot) => {
            const data = snapshot.val();
            if (data) {
                orders = data;
                localStorage.setItem('joellOrders', JSON.stringify(orders));
                renderAdminOrders();
                updateAdminStats();
                showToast('Berhasil', 'Data pesanan diperbarui!', 'success', 2000);
            }
        }).finally(() => {
            if (btn) btn.querySelector('i').classList.remove('fa-spin');
        });
    } else {
        showToast('Error', 'Database tidak terhubung', 'error');
        if (btn) btn.querySelector('i').classList.remove('fa-spin');
    }
}

// ============================================================
// NAVIGATION
// ============================================================
function navigateTo(page) {
    if (page === 'admin') {
        enterAdminMode();
        return;
    }
    localStorage.setItem('joellCurrentPage', page);

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.admin-page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('page-' + page);
    if (target) target.classList.add('active');
    document.querySelectorAll('.bottom-nav .nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });
    document.getElementById('bottomNav').style.display = 'flex';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (page === 'orders') renderOrdersList();
    if (page === 'profile') renderProfilePage();
}

function renderProfilePage() {
    const userView = document.getElementById('userProfileView');
    const guestView = document.getElementById('guestProfileView');
    if (currentUser) {
        if (userView) userView.style.display = 'block';
        if (guestView) guestView.style.display = 'none';
        document.getElementById('userProfileImg').src = currentUser.picture;
        document.getElementById('userProfileName').textContent = currentUser.name;
        document.getElementById('userProfileEmail').textContent = currentUser.email;
        const userOrders = orders.filter(o => o.userId === currentUser.id);
        document.getElementById('statOrderCount').textContent = userOrders.length;
        
        // ✅ FIXED: Logout button with confirm
        const logoutBtn = document.getElementById('btnProfileLogoutPage');
        if (logoutBtn) {
            logoutBtn.onclick = async function() {
                if (confirm('Apakah Anda yakin ingin keluar?')) {
                    await logoutUserCloud();
                }
            };
        }
    } else {
        if (userView) userView.style.display = 'none';
        if (guestView) guestView.style.display = 'block';
    }
}

function updateUserUI() {
    const section = document.getElementById('userSection');
    if (currentUser) {
        section.innerHTML = `
            <div class="user-chip" id="userChip" title="${currentUser.name}">
                <img src="${currentUser.picture}" alt="avatar">
                <span class="user-name">${currentUser.name.split(' ')[0]}</span>
            </div>
        `;
        document.getElementById('userChip').addEventListener('click', openProfileSettings);
    } else {
        section.innerHTML = `
            <button class="header-btn" id="loginBtn" title="Login">
                <i class="fas fa-sign-in-alt"></i>
            </button>
        `;
        document.getElementById('loginBtn').addEventListener('click', function() {
            document.getElementById('loginOverlay').classList.add('open');
        });
    }
}

function openProfileSettings() {
    if (!currentUser) return;
    document.getElementById('profileNameInput').value = currentUser.name;
    document.getElementById('profileEmailInput').value = currentUser.email;
    document.getElementById('profilePreview').src = currentUser.picture;
    document.getElementById('profileOverlay').classList.add('open');
}

function handleProfilePhotoUpload(input) {
    const file = input.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showToast('Error', 'Ukuran file maksimal 2MB', 'error'); return; }
    const reader = new FileReader();
    reader.onload = function(e) {
        const base64 = e.target.result;
        document.getElementById('profilePreview').src = base64;
        currentUser.picture = base64;
        localStorage.setItem('joellUser', JSON.stringify(currentUser));
    };
    reader.readAsDataURL(file);
}

// ============================================================
// TOAST
// ============================================================
function showToast(title, message, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle', warning: 'fa-exclamation-circle' };
    toast.innerHTML = `
        <div class="toast-icon ${type}"><i class="fas ${icons[type] || icons.info}"></i></div>
        <div class="toast-content"><h4>${title}</h4><p>${message}</p></div>
    `;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('toast-out');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ============================================================
// SEARCH
// ============================================================
function doSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    const keyword = searchInput.value.toLowerCase().trim();
    const cats = ['hosting', 'script', 'topup'];
    cats.forEach(cat => {
        const filtered = products.filter(p => {
            const matchText = p.name.toLowerCase().includes(keyword) || p.desc.toLowerCase().includes(keyword);
            return p.category === cat && matchText;
        });
        const grid = document.getElementById('grid' + cat.charAt(0).toUpperCase() + cat.slice(1));
        if (grid) grid.innerHTML = renderMenuCards(filtered);
    });
}

// ============================================================
// EVENT LISTENERS - DOMContentLoaded (FIXED)
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ JOELL SHOP Initializing...');

    renderMenus();
    renderTopupGames();
    updateCartUI();
    updateUserUI();
    renderOrdersList();
    renderProfilePage();

    // ===== TAB SWITCH LOGIN/REGISTER =====
    const loginTabs = document.querySelectorAll('.login-tab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    loginTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const target = this.dataset.tab;
            loginTabs.forEach(t => {
                t.classList.remove('active');
                t.style.background = 'transparent';
                t.style.color = 'var(--text-secondary)';
            });
            this.classList.add('active');
            this.style.background = 'var(--accent)';
            this.style.color = '#fff';

            if (target === 'login') {
                loginForm.style.display = 'block';
                registerForm.style.display = 'none';
            } else {
                loginForm.style.display = 'none';
                registerForm.style.display = 'block';
            }
        });
    });

    // ===== ✅ FIXED: Login & Register Button - PAKAI onclick DI HTML =====
    // Tombol sudah pakai onclick="handleLogin()" dan onclick="handleRegister()" di HTML
    // Jangan tambahkan addEventListener lagi supaya tidak konflik!

    // ===== CLICK EVENT UNTUK MENU CARD =====
    document.querySelectorAll('.grid-menu').forEach(grid => {
        grid.addEventListener('click', function(e) {
            const card = e.target.closest('.menu-card');
            if (!card) return;
            const id = parseInt(card.dataset.id);
            const product = products.find(p => p.id === id);
            if (!product) return;
            
            if (product.isTopup) {
                const overlay = document.getElementById('topupOverlay');
                if (overlay) overlay.classList.add('open');
                return;
            }
            openDetail(id);
        });
    });

    // ===== ADD TO CART BUTTON =====
    const addBtn = document.getElementById('addToCartBtn');
    if (addBtn) {
        addBtn.addEventListener('click', function() {
            if (!selectedVariant) { showToast('Error', 'Pilih varian dulu', 'error'); return; }
            addToCart(currentProductId, selectedVariant.name, selectedVariant.price);
            document.getElementById('detailOverlay').classList.remove('open');
        });
    }

    // ===== BUY NOW BUTTON =====
    const buyBtn = document.getElementById('buyNowBtn');
    if (buyBtn) {
        buyBtn.addEventListener('click', function() {
            if (!selectedVariant) { showToast('Error', 'Pilih varian dulu', 'error'); return; }
            addToCart(currentProductId, selectedVariant.name, selectedVariant.price);
            document.getElementById('detailOverlay').classList.remove('open');
            document.getElementById('cartOverlay').classList.add('open');
        });
    }

    // ===== CHECKOUT BUTTON =====
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (!cart.length) { showToast('Error', 'Keranjang kosong', 'error'); return; }
            if (!currentUser) {
                showToast('Login Diperlukan', 'Silakan login untuk checkout', 'warning');
                document.getElementById('loginOverlay').classList.add('open');
                return;
            }
            const container = document.getElementById('checkoutItems');
            let total = 0;
            container.innerHTML = cart.map(item => {
                const sub = item.price * item.qty;
                total += sub;
                return `<div class="order-item-line">${item.name} (${item.variant}) x${item.qty} = Rp ${sub.toLocaleString()}</div>`;
            }).join('');
            document.getElementById('checkoutTotal').textContent = 'Total: Rp ' + total.toLocaleString();
            document.getElementById('coName').value = currentUser.name || '';
            document.getElementById('coEmail').value = currentUser.email || '';
            document.getElementById('cartOverlay').classList.remove('open');
            document.getElementById('checkoutOverlay').classList.add('open');
        });
    }

    // ===== CHECKOUT FORM - AUTO INVOICE =====
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            if (!cart.length) {
                showToast('Error', 'Keranjang kosong', 'error');
                return;
            }
            
            const name = document.getElementById('coName').value.trim();
            const email = document.getElementById('coEmail').value.trim();
            const phone = document.getElementById('coPhone').value.trim();
            
            if (!name || !email || !phone) {
                showToast('Error', 'Harap lengkapi semua data', 'error');
                return;
            }
            
            const total = cart.reduce((a, i) => a + i.price * i.qty, 0);
            const orderId = 'JOELL-' + Math.random().toString(36).substr(2, 4).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
            
            const order = {
                id: orderId,
                userId: currentUser ? currentUser.id : 'guest',
                userName: name,
                userEmail: email,
                userPhone: phone,
                address: document.getElementById('coAddress').value || '',
                payment: 'online',
                items: [...cart],
                total: total,
                status: 'pending',
                statusLabel: 'Menunggu Pembayaran',
                createdAt: new Date().toISOString(),
                timeline: [
                    { step: 'Menunggu Pembayaran', desc: 'Silakan selesaikan pembayaran', time: '-', completed: false },
                    { step: 'Pembayaran Diverifikasi', desc: 'Menunggu konfirmasi pembayaran', time: '-', completed: false },
                    { step: 'Sedang Diproses', desc: 'Tim menyiapkan pesanan Anda', time: '-', completed: false },
                    { step: 'Pesanan Selesai', desc: 'Detail produk dikirim ke akun Anda', time: '-', completed: false }
                ],
                chat: [
                    { 
                        from: 'admin', 
                        text: `Halo ${name}! Terima kasih telah memesan. Silakan selesaikan pembayaran Anda.`,
                        time: new Date().toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'}) 
                    }
                ]
            };
            
            orders.unshift(order);
            localStorage.setItem('joellOrders', JSON.stringify(orders));
            syncOrdersToCloud();
            
            cart = [];
            activePromo = null;
            localStorage.setItem('joellCart', JSON.stringify(cart));
            updateCartUI();
            
            document.getElementById('checkoutOverlay').classList.remove('open');
            
            showToast('⏳ Membuat Invoice...', 'Silakan tunggu sebentar', 'info', 2000);

            setTimeout(function() {
                if (typeof window.openPaymentModal === 'function') {
                    window.openPaymentModal(order);
                }
            }, 300);
            renderOrdersList();
        });
    }

    // ===== CLEAR CART =====
    const clearBtn = document.getElementById('clearCartBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            if (!cart.length) return;
            if (confirm('Kosongkan keranjang?')) {
                cart = [];
                activePromo = null;
                document.getElementById('promoInput').value = '';
                document.getElementById('promoMessage').textContent = '';
                updateCartUI();
                showToast('Keranjang', 'Keranjang dikosongkan', 'info');
            }
        });
    }

    // ===== PROMO BUTTON =====
    const promoBtn = document.getElementById('promoBtn');
    if (promoBtn) {
        promoBtn.addEventListener('click', function() {
            const code = document.getElementById('promoInput').value.trim().toUpperCase();
            const msgEl = document.getElementById('promoMessage');
            if (!code) { msgEl.textContent = 'Masukkan kode promo'; msgEl.className = 'promo-message error'; return; }
            if (CONFIG.promoCodes[code]) {
                activePromo = { code, ...CONFIG.promoCodes[code] };
                msgEl.textContent = '✅ ' + activePromo.desc + ' berhasil diterapkan!';
                msgEl.className = 'promo-message success';
                showToast('Promo Applied', activePromo.desc, 'success');
                updateCartUI();
            } else {
                activePromo = null;
                msgEl.textContent = '❌ Kode promo tidak valid';
                msgEl.className = 'promo-message error';
            }
        });
    }

    // ===== THEME TOGGLE =====
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const savedTheme = localStorage.getItem('joellTheme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        themeToggle.innerHTML = `<i class="fas fa-${savedTheme === 'dark' ? 'sun' : 'moon'}"></i>`;
        themeToggle.addEventListener('click', function() {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('joellTheme', next);
            this.innerHTML = `<i class="fas fa-${next === 'dark' ? 'sun' : 'moon'}"></i>`;
            showToast('Theme Changed', `Switched to ${next} mode`, 'info');
        });
    }

    // ===== LOGIN BUTTON =====
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            document.getElementById('loginOverlay').classList.add('open');
        });
    }

    // ===== ADMIN LOGIN =====
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', function() {
            const input = document.getElementById('adminPasswordInput').value;
            if (input === CONFIG.adminPassword) {
                isAdminLoggedIn = true;
                document.getElementById('adminLoginView').style.display = 'none';
                document.getElementById('adminDashboardView').style.display = 'block';
                showToast('Admin', 'Login berhasil!', 'success');
                renderAdminOrders();
                updateAdminStats();
            } else {
                showToast('Error', 'Password salah!', 'error');
            }
        });
    }

    // ===== ADMIN BACK BUTTON =====
    const adminBackBtn = document.getElementById('adminBackBtn');
    if (adminBackBtn) {
        adminBackBtn.addEventListener('click', function() {
            localStorage.removeItem('joellCurrentPage');
            document.getElementById('page-admin').classList.remove('active');
            document.getElementById('page-home').classList.add('active');
            document.getElementById('bottomNav').style.display = 'flex';
            isAdminLoggedIn = false;
        });
    }

    // ===== LOGO CLICK FOR ADMIN =====
    const logoArea = document.getElementById('logoArea');
    if (logoArea) {
        logoArea.addEventListener('click', function() {
            logoClickCount++;
            if (logoClickCount >= 5) {
                logoClickCount = 0;
                enterAdminMode();
            }
            setTimeout(() => { if (logoClickCount > 0) logoClickCount--; }, 2000);
        });
    }

    // ===== NAVIGATION =====
    document.querySelectorAll('.bottom-nav .nav-item').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            if (page === 'cart') {
                document.getElementById('cartOverlay').classList.toggle('open');
                return;
            }
            if (page) {
                navigateTo(page);
            }
        });
    });

    // ===== BACK TO TOP =====
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', function() {
            backToTop.classList.toggle('visible', window.scrollY > 300);
        });
        backToTop.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ===== TRACKING BUTTON =====
    const trackBtn = document.getElementById('trackBtn');
    if (trackBtn) {
        trackBtn.addEventListener('click', function() {
            const input = document.getElementById('trackInput').value.trim();
            if (!input) { showToast('Error', 'Masukkan ID pesanan', 'error'); return; }
            
            const order = orders.find(o => o.id === input.replace('#', ''));
            if (!order) {
                showToast('Tidak Ditemukan', 'ID pesanan tidak valid', 'error');
                return;
            }
            
            document.getElementById('trackOrderId').textContent = '#' + order.id;
            const statusConfig = {
                'pending': { label: 'Menunggu', color: 'var(--gold)', bg: 'rgba(251,191,36,0.15)' },
                'read': { label: 'Dibaca Admin', color: 'var(--accent-light)', bg: 'rgba(99,102,241,0.15)' },
                'processing': { label: 'Sedang Diproses', color: 'var(--accent-secondary)', bg: 'rgba(6,182,212,0.15)' },
                'shipped': { label: 'Dikirim', color: 'var(--purple)', bg: 'rgba(168,85,247,0.15)' },
                'completed': { label: 'Selesai', color: 'var(--green)', bg: 'rgba(16,185,129,0.15)' }
            };
            const cfg = statusConfig[order.status] || statusConfig['pending'];
            const badge = document.getElementById('trackStatusBadge');
            badge.innerHTML = `<i class="fas fa-circle"></i> ${cfg.label}`;
            badge.style.background = cfg.bg;
            badge.style.color = cfg.color;
            
            document.getElementById('trackProducts').textContent = order.items.map(i => `${i.name} (${i.variant}) x${i.qty}`).join(', ');
            document.getElementById('trackDate').textContent = new Date(order.createdAt).toLocaleString('id-ID');
            
            const timeline = document.getElementById('trackingTimeline');
            timeline.innerHTML = order.timeline.map((t, i) => {
                const isCompleted = t.completed;
                const isActive = !t.completed && (i === 0 || order.timeline[i-1].completed);
                return `
                    <div class="tracking-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}">
                        <div class="tracking-dot">${isCompleted ? '<i class="fas fa-check"></i>' : (isActive ? '<i class="fas fa-circle"></i>' : '<i class="fas fa-clock"></i>')}</div>
                        <div class="tracking-info">
                            <h4>${t.step}</h4>
                            <p>${t.desc}</p>
                            <div class="time">${t.time}</div>
                        </div>
                    </div>
                `;
            }).join('');
            
            const trackChatBtn = document.getElementById('trackChatBtn');
            if (trackChatBtn) {
                trackChatBtn.onclick = function() {
                    document.getElementById('trackResult').style.display = 'none';
                    openOrderChat(order.id);
                };
            }
            
            document.getElementById('trackResult').style.display = 'block';
            showToast('Tracking', 'Data pesanan ditemukan', 'success');
        });
    }

    // ===== SERVER STATUS REFRESH =====
    const refreshStatusBtn = document.getElementById('refreshStatus');
    if (refreshStatusBtn) {
        refreshStatusBtn.addEventListener('click', function() {
            this.classList.add('spinning');
            setTimeout(() => {
                this.classList.remove('spinning');
                const pings = document.querySelectorAll('.server-ping');
                pings.forEach(p => {
                    const newPing = Math.floor(Math.random() * 100) + 5;
                    p.textContent = newPing + 'ms';
                    p.style.color = newPing > 80 ? 'var(--orange)' : 'var(--green)';
                });
                showToast('Server Status', 'Status server diperbarui', 'success');
            }, 1000);
        });
    }

    // ===== ORDER CHAT SEND =====
    const orderChatSend = document.getElementById('orderChatSend');
    if (orderChatSend) {
        orderChatSend.addEventListener('click', function() {
            const input = document.getElementById('orderChatInput');
            const text = input.value.trim();
            if (!text || !currentOrderChatId) return;
            const order = orders.find(o => o.id === currentOrderChatId);
            if (!order) return;
            
            order.chat.push({
                from: 'user',
                text: text,
                time: new Date().toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})
            });
            localStorage.setItem('joellOrders', JSON.stringify(orders));
            syncOrdersToCloud();
            input.value = '';
            renderOrderChatMessages();
        });
    }

    // ===== ADMIN CHAT SEND =====
    const adminChatSend = document.getElementById('adminChatSend');
    if (adminChatSend) {
        adminChatSend.addEventListener('click', function() {
            const input = document.getElementById('adminChatInput');
            const text = input.value.trim();
            if (!text || !currentAdminChatId) return;
            const order = orders.find(o => o.id === currentAdminChatId);
            if (!order) return;
            order.chat.push({
                from: 'admin',
                text: text,
                time: new Date().toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})
            });
            localStorage.setItem('joellOrders', JSON.stringify(orders));
            syncOrdersToCloud();
            input.value = '';
            renderAdminChatMessages();
            showToast('Chat', 'Balasan terkirim ke pelanggan', 'success');
        });
    }

    // ===== REFRESH ADMIN ORDERS =====
    const refreshAdmin = document.getElementById('btnRefreshAdmin');
    if (refreshAdmin) {
        refreshAdmin.addEventListener('click', function() {
            refreshAdminOrders();
        });
    }

    // ============================================================
    // ===== FIX: SEMUA TOMBOL CLOSE (X) DI MODAL =====
    // ============================================================
    document.querySelectorAll('.modal-close, .detail-close, .cart-close').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            var overlay = this.closest('.modal-overlay, .detail-overlay, .cart-overlay');
            if (overlay) {
                overlay.classList.remove('open');
            }
            var cartPanel = this.closest('.cart-panel');
            if (cartPanel) {
                var cartOverlay = document.getElementById('cartOverlay');
                if (cartOverlay) cartOverlay.classList.remove('open');
            }
        });
    });

    document.querySelectorAll('.modal-overlay, .detail-overlay, .cart-overlay').forEach(function(overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('open');
            }
        });
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.open, .detail-overlay.open, .cart-overlay.open').forEach(function(el) {
                el.classList.remove('open');
            });
        }
    });

    // ===== TOMBOL CLOSE KHUSUS =====
    const closeButtons = ['loginCloseBtn', 'profileCloseBtn', 'checkoutCloseBtn', 'detailCloseBtn', 
                          'topupCloseBtn', 'paymentCloseBtn', 'orderChatCloseBtn', 'adminChatCloseBtn', 'cartCloseBtn'];
    closeButtons.forEach(function(id) {
        var btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', function() {
                var overlay = this.closest('.modal-overlay, .detail-overlay, .cart-overlay');
                if (overlay) overlay.classList.remove('open');
                if (id === 'paymentCloseBtn' && window.timerInterval) clearInterval(window.timerInterval);
            });
        }
    });

    // ===== PROFILE SAVE =====
    var profileSaveBtn = document.getElementById('profileSaveBtn');
    if (profileSaveBtn) {
        profileSaveBtn.addEventListener('click', function() {
            const newName = document.getElementById('profileNameInput').value.trim();
            if (!newName) { showToast('Error', 'Nama tidak boleh kosong', 'error'); return; }
            currentUser.name = newName;
            localStorage.setItem('joellUser', JSON.stringify(currentUser));
            updateUserUI();
            renderProfilePage();
            if (currentOrderChatId) renderOrderChatMessages();
            document.getElementById('profileOverlay').classList.remove('open');
            showToast('Berhasil', 'Profil Anda telah diperbarui!', 'success');
        });
    }

    // ===== COUNTDOWN TIMER =====
    function updateCountdown() {
        const now = new Date();
        const diff = CONFIG.flashSaleEnd - now;
        if (diff <= 0) {
            document.getElementById('flashSaleBar').style.display = 'none';
            return;
        }
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        document.getElementById('cdHours').textContent = String(h).padStart(2, '0');
        document.getElementById('cdMinutes').textContent = String(m).padStart(2, '0');
        document.getElementById('cdSeconds').textContent = String(s).padStart(2, '0');
    }
    updateCountdown();
    setInterval(updateCountdown, 1000);

    console.log('✅ All systems ready! No errors!');
});

// ============================================================
// INIT CLOUD SYNC
// ============================================================
initCloudSync();

// ============================================================
// UNREAD BADGES
// ============================================================
function updateUnreadBadges() {
    if (!orders || !Array.isArray(orders)) return;
    
    let totalUnreadUser = 0;
    let totalUnreadAdmin = 0;

    orders.forEach(order => {
        if (!order.chat || !Array.isArray(order.chat)) return;
        const lastMsg = order.chat[order.chat.length - 1];
        if (!lastMsg) return;

        if (lastMsg.from === 'admin') {
            if (currentUser && order.userId === currentUser.id) {
                totalUnreadUser++;
            }
        } else if (lastMsg.from === 'user') {
            totalUnreadAdmin++;
        }
    });

    const navBadge = document.getElementById('navOrdersBadge');
    if (navBadge) {
        if (totalUnreadUser > 0) {
            navBadge.textContent = totalUnreadUser;
            navBadge.style.display = 'block';
        } else {
            navBadge.style.display = 'none';
        }
    }

    const adminBadge = document.getElementById('adminChatBadge');
    if (adminBadge) {
        if (totalUnreadAdmin > 0) {
            adminBadge.textContent = totalUnreadAdmin;
            adminBadge.style.display = 'block';
        } else {
            adminBadge.style.display = 'none';
        }
    }
}

// ============================================================
// HANDLE CHAT FILE UPLOAD
// ============================================================
function handleChatFileUpload(input, senderType) {
    const file = input.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
        showToast('Error', 'Gambar terlalu besar (Maks 10MB)', 'error');
        input.value = '';
        return;
    }

    const orderId = senderType === 'user' ? currentOrderChatId : currentAdminChatId;
    if (!orderId) {
        showToast('Error', 'Sesi chat tidak ditemukan.', 'error');
        input.value = '';
        return;
    }

    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
        showToast('Error', 'Data pesanan tidak ditemukan.', 'error');
        input.value = '';
        return;
    }

    showToast('Chat', 'Sedang mengirim gambar...', 'info');

    const formData = new FormData();
    formData.append('image', file);

    try {
        fetch('https://api.imgur.com/3/image', {
            method: 'POST',
            headers: { 'Authorization': 'Client-ID ' + CONFIG.imgurClientId },
            body: formData
        })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(result => {
            if (result.success && result.data && result.data.link) {
                const newMessage = {
                    from: senderType,
                    text: '',
                    image: result.data.link,
                    time: new Date().toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})
                };

                if (!orders[orderIndex].chat) orders[orderIndex].chat = [];
                orders[orderIndex].chat.push(newMessage);

                localStorage.setItem('joellOrders', JSON.stringify(orders));
                syncOrdersToCloud();

                if (senderType === 'user') renderOrderChatMessages();
                else renderAdminChatMessages();

                showToast('Berhasil', 'Gambar berhasil dikirim!', 'success');
            } else {
                throw new Error('Gagal mendapatkan link gambar.');
            }
        })
        .catch(error => {
            console.error("Image Upload Error:", error);
            showToast('Error', 'Gagal kirim gambar: ' + error.message, 'error', 5000);
        });
    } catch (error) {
        showToast('Error', 'Gagal kirim gambar: ' + error.message, 'error', 5000);
    } finally {
        input.value = '';
    }
}

function handleAdminDocUpload(input) {
    const file = input.files[0];
    if (!file) return;
    
    const orderId = currentAdminChatId;
    if (!orderId) {
        showToast('Error', 'ID Pesanan tidak ditemukan.', 'error');
        input.value = '';
        return;
    }
    
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
        showToast('Error', 'Data pesanan tidak ditemukan.', 'error');
        input.value = '';
        return;
    }

    if (file.size <= 500 * 1024) {
        showToast('Admin', 'Mengkonversi file ke base64...', 'info');
        try {
            const reader = new FileReader();
            reader.onload = function(e) {
                const base64 = e.target.result;
                const newMessage = {
                    from: 'admin',
                    text: `📄 File: ${file.name}`,
                    file: base64,
                    fileName: file.name,
                    time: new Date().toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})
                };
                
                if (!orders[orderIndex].chat) orders[orderIndex].chat = [];
                orders[orderIndex].chat.push(newMessage);
                
                localStorage.setItem('joellOrders', JSON.stringify(orders));
                syncOrdersToCloud();
                renderAdminChatMessages();
                showToast('Berhasil', 'File berhasil dikirim (Base64)!', 'success');
            };
            reader.readAsDataURL(file);
        } catch (err) {
            showToast('Error', 'Gagal memproses file.', 'error');
        } finally {
            input.value = '';
        }
        return;
    }

    if (file.size > 20 * 1024 * 1024) {
        showToast('Error', 'File terlalu besar. Maksimal 20MB.', 'error');
        input.value = '';
        return;
    }

    showToast('Admin', 'Sedang mengupload file...', 'info');
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        fetch('https://file.io/?expires=1w&autoDelete=false', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) throw new Error(`Server error: ${response.status}`);
            return response.json();
        })
        .then(result => {
            if (result.success || result.link) {
                const fileUrl = result.link || result.url || result.file;
                if (!fileUrl) throw new Error('URL file tidak ditemukan.');
                
                const newMessage = {
                    from: 'admin',
                    text: `📄 File: ${file.name}`,
                    file: fileUrl,
                    fileName: file.name,
                    time: new Date().toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})
                };
                
                if (!orders[orderIndex].chat) orders[orderIndex].chat = [];
                orders[orderIndex].chat.push(newMessage);
                
                localStorage.setItem('joellOrders', JSON.stringify(orders));
                syncOrdersToCloud();
                renderAdminChatMessages();
                showToast('Berhasil', 'File berhasil dikirim!', 'success');
            } else {
                throw new Error(result.message || 'Gagal mengunggah file.');
            }
        })
        .catch(error => {
            console.error("File Upload Error:", error);
            showToast('Error', 'Gagal upload: ' + error.message, 'error', 5000);
        });
    } catch (error) {
        showToast('Error', 'Gagal upload: ' + error.message, 'error', 5000);
    } finally {
        input.value = '';
    }
}

console.log('✅ JOELL SHOP Script v2.4.1 Loaded Successfully!');