const PAYMENT_API = {
    // ============================================================
    // LZPEDIA API INTEGRATION - V3.1 (FIXED TYPO)
    // ============================================================

    apiKey: 'LXZ_015d8a759df64d48',
    baseUrl: 'https://app.lzpedia.my.id/api',
    backendUrl: window.location.origin + '/lzproxy.php',
    mode: 'proxy',

    // ============================================================
    // 1. BUAT INVOICE
    // ============================================================
    async createInvoice(amount) {
        try {
            let url, response, text, data;

            // ===== COBA VIA PROXY DULU =====
            if (this.mode === 'proxy') {
                url = `${this.backendUrl}?action=create&amount=${amount}`;
                console.log('📤 [PROXY] Create Invoice URL:', url);

                try {
                    response = await fetch(url, {
                        method: 'GET',
                        headers: { 'Accept': 'application/json' }
                    });
                    text = await response.text();
                    console.log('📄 [PROXY] Raw Response:', text.substring(0, 300));

                    try {
                        data = JSON.parse(text);
                        if (data.success === true && data.invoice_id) {
                            return this._formatResponse(data);
                        }
                    } catch (e) {
                        console.warn('⚠️ Proxy response bukan JSON, coba direct...');
                    }
                } catch (proxyError) {
                    console.warn('⚠️ Proxy error:', proxyError.message);
                }
            }

            // ===== FALLBACK: DIRECT CALL KE LZPEDIA =====
            url = `${this.baseUrl}/invoice?apikey=${this.apiKey}&amount=${amount}`;
            console.log('📤 [DIRECT] Create Invoice URL:', url);

            response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Origin': window.location.origin
                },
                mode: 'cors'
            });

            text = await response.text();
            console.log('📄 [DIRECT] Raw Response:', text.substring(0, 500));

            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error('❌ JSON Parse Error:', e);
                return {
                    success: false,
                    error: 'Response bukan JSON valid',
                    debug: {
                        httpStatus: response.status,
                        rawResponse: text.substring(0, 500),
                        proxyUrl: this.backendUrl,
                        directUrl: url
                    }
                };
            }

            if (data.success === true && data.invoice_id) {
                return this._formatResponse(data);
            } else {
                return {
                    success: false,
                    error: data.message || data.error || 'Gagal membuat invoice',
                    debug: { raw: data }
                };
            }

        } catch (error) {
            console.error('❌ Create Invoice Error:', error);
            return {
                success: false,
                error: error.message,
                debug: {
                    proxyUrl: this.backendUrl,
                    directUrl: `${this.baseUrl}/invoice?apikey=***&amount=${amount}`
                }
            };
        }
    },

    // ============================================================
    // 2. CEK STATUS INVOICE
    // ============================================================
    async checkInvoiceStatus(invoiceId) {
        try {
            let url, response, text, data;

            // ===== COBA VIA PROXY DULU =====
            if (this.mode === 'proxy') {
                url = `${this.backendUrl}?action=status&invoice_id=${invoiceId}`;
                console.log('📤 [PROXY] Check Status URL:', url);

                try {
                    response = await fetch(url, {
                        method: 'GET',
                        headers: { 'Accept': 'application/json' }
                    });
                    text = await response.text();
                    console.log('📊 [PROXY] Raw Response:', text.substring(0, 300));

                    try {
                        data = JSON.parse(text);
                        if (data.invoice_id) {
                            return this._formatStatusResponse(data);
                        }
                    } catch (e) {
                        console.warn('⚠️ Proxy response bukan JSON, coba direct...');
                    }
                } catch (proxyError) {
                    console.warn('⚠️ Proxy error:', proxyError.message);
                }
            }

            // ===== FALLBACK: DIRECT CALL =====
            url = `${this.baseUrl}/invoice/status?apikey=${this.apiKey}&invoice_id=${invoiceId}`;
            console.log('📤 [DIRECT] Check Status URL:', url);

            response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Origin': window.location.origin
                },
                mode: 'cors'
            });

            text = await response.text();
            console.log('📊 [DIRECT] Raw Response:', text.substring(0, 500));

            try {
                data = JSON.parse(text);
            } catch (e) {
                return {
                    success: false,
                    error: 'Response bukan JSON valid',
                    debug: { rawResponse: text.substring(0, 500) }
                };
            }

            if (data.invoice_id) {
                return this._formatStatusResponse(data);
            } else {
                return {
                    success: false,
                    error: data.message || data.error || 'Gagal mengecek status',
                    debug: { raw: data }
                };
            }

        } catch (error) {
            console.error('❌ Check Status Error:', error);
            return { success: false, error: error.message };
        }
    },

    // Helper: Format response create invoice
    _formatResponse(data) {
        return {
            success: true,
            invoiceId: data.invoice_id,
            amount: data.amount,
            fee: data.fee || 0,
            total: data.total,
            qrisImage: data.qris_image,
            paymentLink: data.payment_link,
            expiredAt: data.expired_at,
            raw: data
        };
    },

    // Helper: Format response status
    _formatStatusResponse(data) {
        const statusMap = {
            'pending': 'pending',
            'paid': 'paid',
            'expired': 'expired'
        };
        return {
            success: true,
            invoiceId: data.invoice_id,
            amount: data.amount || 0,
            fee: data.fee || 0,
            total: data.total || 0,
            status: statusMap[data.status] || 'pending',
            qrisImage: data.qris_image,
            paymentLink: data.payment_link,
            expiredAt: data.expired_at,
            createdAt: data.created_at,
            raw: data
        };
    }
};

// ============================================================
// GLOBAL STATE
// ============================================================
window.currentInvoiceId = null;
window.timerInterval = null;
window.autoCheckInterval = null;

function getInvoiceHistory() {
    return JSON.parse(localStorage.getItem('joellInvoiceHistory') || '[]');
}

function setInvoiceHistory(history) {
    localStorage.setItem('joellInvoiceHistory', JSON.stringify(history));
}

// ============================================================
// BUAT INVOICE - QRIS DARI LZPEDIA
// ============================================================
window.createInvoice = async function(amount) {
    const qrisPlaceholder = document.getElementById('qrisPlaceholder');
    const qrisWrapper = document.getElementById('qrisImageWrapper');
    const qrisImage = document.getElementById('qrisImage');
    const createBtn = document.getElementById('createInvoiceBtn');

    if (!amount || amount <= 0) {
        showToast('Error', 'Jumlah pembayaran tidak valid', 'error');
        return;
    }

    // LOADING STATE
    if (qrisPlaceholder) {
        qrisPlaceholder.style.display = 'flex';
        qrisPlaceholder.innerHTML = `
            <div style="text-align:center;">
                <i class="fas fa-spinner fa-spin" style="font-size:2.5rem;color:var(--accent-light);display:block;margin-bottom:12px;"></i>
                <p style="font-weight:700;font-size:1rem;margin-bottom:4px;">Menghubungi LZPedia...</p>
                <small style="color:var(--text-muted);">Sedang membuat invoice QRIS</small>
            </div>
        `;
    }
    if (qrisWrapper) qrisWrapper.style.display = 'none';
    if (createBtn) {
        createBtn.disabled = true;
        createBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Membuat Invoice...';
    }

    try {
        const result = await PAYMENT_API.createInvoice(amount);
        console.log('📄 Invoice Result:', result);

        if (result.success && result.invoiceId) {
            window.currentInvoiceId = result.invoiceId;

            // ✅ TAMPILKAN QRIS
            if (qrisImage && result.qrisImage) {
                qrisImage.src = result.qrisImage;
                qrisImage.style.display = 'block';
                qrisImage.style.maxWidth = '280px';
                qrisImage.style.width = '100%';
                qrisImage.style.height = 'auto';
                qrisImage.style.borderRadius = '16px';
                qrisImage.style.background = '#ffffff';
                qrisImage.style.padding = '16px';
                qrisImage.style.boxShadow = '0 8px 32px rgba(0,0,0,0.15)';
                qrisImage.style.border = '2px solid #e5e7eb';
                qrisImage.style.margin = '0 auto';
                qrisImage.style.cursor = 'pointer';
                qrisImage.title = 'QRIS dari LZPedia - Klik untuk memperbesar';
                qrisImage.onclick = function() {
                    window.open(this.src, '_blank');
                };
            }

            if (qrisWrapper) {
                qrisWrapper.style.display = 'block';
                qrisWrapper.style.textAlign = 'center';
            }
            if (qrisPlaceholder) qrisPlaceholder.style.display = 'none';

            // ✅ TAMPILKAN DETAIL INVOICE (dengan null check)
            const invoiceIdEl = document.getElementById('invoiceId');
            if (invoiceIdEl) invoiceIdEl.textContent = result.invoiceId;

            const invoiceTotalEl = document.getElementById('invoiceTotal');
            if (invoiceTotalEl) invoiceTotalEl.textContent = 'Rp ' + Number(result.total).toLocaleString('id-ID');

            const invoiceFeeEl = document.getElementById('invoiceFee');
            if (invoiceFeeEl) invoiceFeeEl.textContent = 'Rp ' + Number(result.fee || 0).toLocaleString('id-ID');

            // Parse expired_at dari LZPedia (format: "2025-01-01 12:00:00")
            let expiryDate;
            if (result.expiredAt) {
                expiryDate = new Date(result.expiredAt.replace(' ', 'T'));
            } else {
                expiryDate = new Date(Date.now() + 15 * 60000);
            }

            const invoiceExpiryEl = document.getElementById('invoiceExpiry');
            if (invoiceExpiryEl) invoiceExpiryEl.textContent = expiryDate.toLocaleString('id-ID');

            const paymentDetailsEl = document.getElementById('paymentDetails');
            if (paymentDetailsEl) paymentDetailsEl.style.display = 'block';

            const checkStatusBtnEl = document.getElementById('checkStatusBtn');
            if (checkStatusBtnEl) checkStatusBtnEl.style.display = 'inline-flex';

            // ✅ START TIMER
            window.startPaymentTimer(expiryDate);
            window.startAutoCheckStatus(result.invoiceId);

            // ✅ SIMPAN KE HISTORY
            const invoiceData = {
                invoice_id: result.invoiceId,
                total: result.total,
                amount: result.amount,
                fee: result.fee,
                status: 'pending',
                created_at: new Date().toISOString(),
                expired_at: expiryDate.toISOString(),
                qris_image: result.qrisImage,
                payment_link: result.paymentLink
            };

            let history = getInvoiceHistory();
            history.unshift(invoiceData);
            setInvoiceHistory(history);
            window.renderInvoiceHistory();

            showToast('✅ Invoice Berhasil Dibuat', 'Scan QRIS untuk membayar', 'success');

        } else {
            // ERROR DENGAN DEBUG INFO
            let errorHtml = `
                <div style="text-align:center;max-width:100%;">
                    <i class="fas fa-exclamation-triangle" style="font-size:3rem;color:var(--red);display:block;margin-bottom:12px;"></i>
                    <p style="color:var(--red);font-weight:700;margin-bottom:8px;font-size:1rem;">Gagal Membuat Invoice</p>
                    <p style="color:var(--text-muted);font-size:0.8rem;margin-bottom:12px;word-break:break-word;">${result.error || 'Unknown error'}</p>
            `;

            if (result.debug) {
                errorHtml += `
                    <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:12px;margin-bottom:16px;text-align:left;overflow-x:auto;">
                        <p style="color:var(--text-muted);font-size:0.7rem;margin-bottom:4px;font-weight:700;">Debug Info:</p>
                        <pre style="color:#fbbf24;font-size:0.65rem;margin:0;white-space:pre-wrap;word-break:break-all;">${JSON.stringify(result.debug, null, 2)}</pre>
                    </div>
                `;
            }

            errorHtml += `
                    <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:12px;margin-bottom:16px;text-align:left;">
                        <p style="color:var(--text-muted);font-size:0.7rem;margin-bottom:4px;font-weight:700;">Tips Perbaikan:</p>
                        <ol style="color:var(--text-muted);font-size:0.7rem;padding-left:16px;margin:0;">
                            <li>Pastikan file <b>lzproxy.php</b> sudah di-upload ke server</li>
                            <li>Pastikan API Key di lzproxy.php sudah benar</li>
                            <li>Cek console browser (F12) untuk detail error</li>
                            <li>Pastikan hosting support PHP & cURL</li>
                            <li>Coba akses proxy langsung di browser</li>
                        </ol>
                    </div>
                    <button onclick="window.createInvoice(${amount})" style="padding:12px 28px;background:linear-gradient(135deg,var(--accent),var(--purple));color:#fff;border:none;border-radius:60px;cursor:pointer;font-weight:800;">
                        <i class="fas fa-redo"></i> Coba Lagi
                    </button>
                </div>
            `;

            if (qrisPlaceholder) {
                qrisPlaceholder.style.display = 'flex';
                qrisPlaceholder.innerHTML = errorHtml;
            }
            if (qrisWrapper) qrisWrapper.style.display = 'none';
            showToast('❌ Gagal', result.error || 'Error tidak diketahui', 'error');
        }
    } catch (error) {
        console.error('❌ Error Create Invoice:', error);
        if (qrisPlaceholder) {
            qrisPlaceholder.style.display = 'flex';
            qrisPlaceholder.innerHTML = `
                <div style="text-align:center;">
                    <i class="fas fa-exclamation-triangle" style="font-size:3rem;color:var(--red);display:block;margin-bottom:12px;"></i>
                    <p style="color:var(--red);font-weight:700;margin-bottom:8px;">Error: ${error.message}</p>
                    <button onclick="window.createInvoice(${amount})" style="padding:12px 28px;background:linear-gradient(135deg,var(--accent),var(--purple));color:#fff;border:none;border-radius:60px;cursor:pointer;font-weight:800;">
                        <i class="fas fa-redo"></i> Coba Lagi
                    </button>
                </div>
            `;
        }
        if (qrisWrapper) qrisWrapper.style.display = 'none';
    } finally {
        if (createBtn) {
            createBtn.disabled = false;
            createBtn.innerHTML = '<i class="fas fa-qrcode"></i> Buat Invoice QRIS';
        }
    }
};

// ============================================================
// CEK STATUS PEMBAYARAN
// ============================================================
window.checkInvoiceStatus = async function(invoiceId) {
    if (!invoiceId) {
        showToast('Error', 'Tidak ada invoice aktif', 'error');
        return;
    }

    const btn = document.getElementById('checkStatusBtn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengecek...';
    }

    try {
        const result = await PAYMENT_API.checkInvoiceStatus(invoiceId);
        console.log('📊 Status Result:', result);

        if (result.success) {
            const badge = document.getElementById('invoiceStatusBadge');
            const statusMap = {
                'pending': { label: '⏳ Menunggu Pembayaran', class: 'pending' },
                'paid': { label: '✅ Lunas / Dibayar', class: 'paid' },
                'expired': { label: '❌ Kadaluarsa', class: 'expired' }
            };
            const info = statusMap[result.status] || statusMap['pending'];
            if (badge) {
                badge.textContent = info.label;
                badge.className = 'payment-status-badge ' + info.class;
            }

            // UPDATE HISTORY
            let history = getInvoiceHistory();
            const historyItem = history.find(i => i.invoice_id === invoiceId);
            if (historyItem) {
                historyItem.status = result.status;
                setInvoiceHistory(history);
                window.renderInvoiceHistory();
            }

            if (result.status === 'paid') {
                showToast('✅ Pembayaran Berhasil!', 'Invoice telah dibayar. Terima kasih!', 'success', 5000);
                if (window.autoCheckInterval) {
                    clearInterval(window.autoCheckInterval);
                    window.autoCheckInterval = null;
                }
                setTimeout(() => {
                    const paymentOverlay = document.getElementById('paymentOverlay');
                    if (paymentOverlay) paymentOverlay.classList.remove('open');
                }, 3000);
            } else if (result.status === 'expired') {
                showToast('⏰ Invoice Kadaluarsa', 'Silakan buat invoice baru.', 'warning');
                if (window.autoCheckInterval) {
                    clearInterval(window.autoCheckInterval);
                    window.autoCheckInterval = null;
                }
            } else {
                showToast('⏳ Menunggu', 'Pembayaran belum diterima. Scan QRIS untuk membayar.', 'info');
            }
        } else {
            showToast('Error', result.error || 'Gagal mengecek status', 'error');
        }
    } catch (error) {
        showToast('Error', 'Gagal mengecek status: ' + error.message, 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-sync-alt"></i> Cek Status';
        }
    }
};

// ============================================================
// TIMER COUNTDOWN
// ============================================================
window.startPaymentTimer = function(expiryDate) {
    const timerEl = document.getElementById('paymentTimer');
    const displayEl = document.getElementById('timerDisplay');
    if (timerEl) timerEl.style.display = 'block';
    if (window.timerInterval) clearInterval(window.timerInterval);

    window.timerInterval = setInterval(() => {
        const now = new Date();
        const diff = expiryDate - now;

        if (diff <= 0) {
            clearInterval(window.timerInterval);
            window.timerInterval = null;
            if (displayEl) displayEl.textContent = '00:00';
            if (timerEl) timerEl.classList.add('expired');

            const badge = document.getElementById('invoiceStatusBadge');
            if (badge) {
                badge.textContent = '❌ Kadaluarsa';
                badge.className = 'payment-status-badge expired';
            }

            if (window.autoCheckInterval) {
                clearInterval(window.autoCheckInterval);
                window.autoCheckInterval = null;
            }

            let history = getInvoiceHistory();
            const item = history.find(i => i.invoice_id === window.currentInvoiceId);
            if (item) {
                item.status = 'expired';
                setInvoiceHistory(history);
                window.renderInvoiceHistory();
            }
            return;
        }

        const m = Math.floor(diff / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        if (displayEl) displayEl.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
        if (timerEl) timerEl.classList.remove('expired');
    }, 1000);
};

// ============================================================
// AUTO CHECK STATUS (setiap 10 detik)
// ============================================================
window.startAutoCheckStatus = function(invoiceId) {
    if (window.autoCheckInterval) clearInterval(window.autoCheckInterval);

    window.autoCheckInterval = setInterval(function() {
        if (window.currentInvoiceId) {
            console.log('🔄 Auto check status for:', window.currentInvoiceId);
            window.checkInvoiceStatus(window.currentInvoiceId);
        } else {
            clearInterval(window.autoCheckInterval);
            window.autoCheckInterval = null;
        }
    }, 10000);
};

// ============================================================
// RENDER INVOICE HISTORY
// ============================================================
window.renderInvoiceHistory = function() {
    const container = document.getElementById('invoiceHistoryList');
    if (!container) return;

    const history = getInvoiceHistory();

    if (!history.length) {
        container.innerHTML = `
            <div style="text-align:center;padding:20px;color:var(--text-muted);">
                <i class="fas fa-file-invoice" style="font-size:2rem;display:block;margin-bottom:8px;opacity:0.5;"></i>
                <p>Belum ada invoice</p>
            </div>
        `;
        return;
    }

    container.innerHTML = history.slice(0, 10).map(item => {
        const statusMap = {
            'pending': { label: '⏳ Menunggu', class: 'pending', color: '#fbbf24', bg: 'rgba(251,191,36,0.15)' },
            'paid': { label: '✅ Lunas', class: 'paid', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
            'expired': { label: '❌ Kadaluarsa', class: 'expired', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' }
        };
        const status = statusMap[item.status] || statusMap['pending'];
        const date = item.created_at ? new Date(item.created_at).toLocaleString('id-ID') : '-';

        return `
            <div class="invoice-history-item" onclick="window.openInvoiceDetail('${item.invoice_id}')" style="cursor:pointer;">
                <div style="display:flex;flex-direction:column;gap:2px;flex:1;">
                    <span style="font-weight:700;color:var(--accent-light);font-size:0.8rem;">#${item.invoice_id}</span>
                    <span style="font-weight:700;color:var(--text-primary);font-size:0.9rem;">Rp ${Number(item.total || item.amount).toLocaleString('id-ID')}</span>
                    <span style="font-size:0.65rem;color:var(--text-muted);">${date}</span>
                </div>
                <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
                    <span style="font-weight:700;font-size:0.65rem;padding:3px 12px;border-radius:30px;background:${status.bg};color:${status.color};">
                        ${status.label}
                    </span>
                    ${item.status === 'pending' ? `
                        <button onclick="event.stopPropagation(); window.checkInvoiceStatus('${item.invoice_id}')"
                                style="background:var(--accent);color:#fff;border:none;border-radius:30px;padding:4px 10px;font-size:0.6rem;cursor:pointer;">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    ` : ''}
                    <i class="fas fa-chevron-right" style="color:var(--text-muted);font-size:0.7rem;"></i>
                </div>
            </div>
        `;
    }).join('');
};

// ============================================================
// BUKA DETAIL INVOICE DARI HISTORY (FIXED TYPO)
// ============================================================
window.openInvoiceDetail = function(invoiceId) {
    const overlay = document.getElementById('paymentOverlay');
    if (!overlay) return;

    const history = getInvoiceHistory();
    const invoice = history.find(i => i.invoice_id === invoiceId);
    if (!invoice) {
        showToast('Error', 'Invoice tidak ditemukan', 'error');
        return;
    }

    // Set detail invoice (dengan null check)
    const invoiceIdEl = document.getElementById('invoiceId');
    if (invoiceIdEl) invoiceIdEl.textContent = invoice.invoice_id;

    const invoiceTotalEl = document.getElementById('invoiceTotal');
    if (invoiceTotalEl) invoiceTotalEl.textContent = 'Rp ' + Number(invoice.total || invoice.amount).toLocaleString('id-ID');

    const invoiceFeeEl = document.getElementById('invoiceFee');
    if (invoiceFeeEl) invoiceFeeEl.textContent = 'Rp ' + Number(invoice.fee || 0).toLocaleString('id-ID');

    const invoiceExpiryEl = document.getElementById('invoiceExpiry');
    if (invoiceExpiryEl) invoiceExpiryEl.textContent = invoice.expired_at ? new Date(invoice.expired_at).toLocaleString('id-ID') : '-';

    const paymentDetailsEl = document.getElementById('paymentDetails');
    if (paymentDetailsEl) paymentDetailsEl.style.display = 'block';

    // ✅ FIXED: getElementById (bukan getKeyById)
    const checkStatusBtnEl = document.getElementById('checkStatusBtn');
    if (checkStatusBtnEl) checkStatusBtnEl.style.display = 'inline-flex';

    // Tampilkan QRIS
    const qrisWrapper = document.getElementById('qrisImageWrapper');
    const qrisImage = document.getElementById('qrisImage');
    const qrisPlaceholder = document.getElementById('qrisPlaceholder');

    if (qrisImage && invoice.qris_image) {
        qrisImage.src = invoice.qris_image;
        qrisImage.style.display = 'block';
        qrisImage.style.maxWidth = '280px';
        qrisImage.style.width = '100%';
        qrisImage.style.height = 'auto';
        qrisImage.style.borderRadius = '16px';
        qrisImage.style.background = '#ffffff';
        qrisImage.style.padding = '16px';
        qrisImage.style.boxShadow = '0 8px 32px rgba(0,0,0,0.15)';
        qrisImage.style.border = '2px solid #e5e7eb';
        qrisImage.style.margin = '0 auto';
        qrisImage.style.cursor = 'pointer';
        qrisImage.onclick = function() {
            window.open(this.src, '_blank');
        };
    }

    if (qrisWrapper) {
        qrisWrapper.style.display = 'block';
        qrisWrapper.style.textAlign = 'center';
    }
    if (qrisPlaceholder) qrisPlaceholder.style.display = 'none';

    const statusMap = {
        'pending': { label: '⏳ Menunggu', class: 'pending' },
        'paid': { label: '✅ Lunas', class: 'paid' },
        'expired': { label: '❌ Kadaluarsa', class: 'expired' }
    };
    const status = statusMap[invoice.status] || statusMap['pending'];
    const badge = document.getElementById('invoiceStatusBadge');
    if (badge) {
        badge.textContent = status.label;
        badge.className = 'payment-status-badge ' + status.class;
    }

    window.currentInvoiceId = invoiceId;
    overlay.classList.add('open');

    if (invoice.status === 'pending' && invoice.expired_at) {
        const expiryDate = new Date(invoice.expired_at);
        if (expiryDate > new Date()) {
            window.startPaymentTimer(expiryDate);
            window.startAutoCheckStatus(invoiceId);
        } else {
            const timerEl = document.getElementById('paymentTimer');
            const displayEl = document.getElementById('timerDisplay');
            if (timerEl) {
                timerEl.style.display = 'block';
                timerEl.classList.add('expired');
            }
            if (displayEl) displayEl.textContent = '00:00';
        }
    }

    const btnCreate = document.getElementById('createInvoiceBtn');
    if (btnCreate) btnCreate.style.display = 'none';
};

// ============================================================
// BUKA MODAL PEMBAYARAN
// ============================================================
window.openPaymentModal = function(orderData) {
    const overlay = document.getElementById('paymentOverlay');
    if (!overlay) {
        showToast('Error', 'Modal pembayaran tidak ditemukan', 'error');
        return;
    }

    const itemsContainer = document.getElementById('paymentOrderItems');
    const totalEl = document.getElementById('paymentOrderTotal');

    let total = 0;
    if (orderData && orderData.items) {
        if (itemsContainer) {
            itemsContainer.innerHTML = orderData.items.map(item => `
                <div class="order-item-line">${item.name} (${item.variant}) x${item.qty} = Rp ${(item.price * item.qty).toLocaleString('id-ID')}</div>
            `).join('');
        }
        total = orderData.total || orderData.items.reduce((sum, i) => sum + i.price * i.qty, 0);
    } else {
        const cart = JSON.parse(localStorage.getItem('joellCart')) || [];
        if (itemsContainer) {
            itemsContainer.innerHTML = cart.map(item => `
                <div class="order-item-line">${item.name} (${item.variant}) x${item.qty} = Rp ${(item.price * item.qty).toLocaleString('id-ID')}</div>
            `).join('');
        }
        total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    }

    if (totalEl) totalEl.textContent = 'Total: Rp ' + total.toLocaleString('id-ID');

    // RESET UI
    const qrisWrapper = document.getElementById('qrisImageWrapper');
    if (qrisWrapper) qrisWrapper.style.display = 'none';

    const paymentDetailsEl = document.getElementById('paymentDetails');
    if (paymentDetailsEl) paymentDetailsEl.style.display = 'none';

    const paymentTimerEl = document.getElementById('paymentTimer');
    if (paymentTimerEl) paymentTimerEl.style.display = 'none';

    const checkStatusBtnEl = document.getElementById('checkStatusBtn');
    if (checkStatusBtnEl) checkStatusBtnEl.style.display = 'none';

    const qrisPlaceholder = document.getElementById('qrisPlaceholder');
    if (qrisPlaceholder) {
        qrisPlaceholder.style.display = 'flex';
        qrisPlaceholder.innerHTML = `
            <div style="text-align:center;">
                <i class="fas fa-qrcode" style="font-size:3rem;color:var(--accent-light);display:block;margin-bottom:8px;"></i>
                <p style="font-weight:700;color:var(--text-primary);margin-bottom:4px;">Siap Membuat Invoice</p>
                <small style="color:var(--text-muted);display:block;">Klik tombol di bawah untuk generate QRIS dari LZPedia</small>
            </div>
        `;
    }

    const qrisImage = document.getElementById('qrisImage');
    if (qrisImage) {
        qrisImage.src = '';
        qrisImage.style.display = 'none';
    }

    const statusBadge = document.getElementById('invoiceStatusBadge');
    if (statusBadge) {
        statusBadge.textContent = '⏳ Menunggu';
        statusBadge.className = 'payment-status-badge pending';
    }

    const btnCreate = document.getElementById('createInvoiceBtn');
    if (btnCreate) {
        btnCreate.style.display = 'inline-flex';
        btnCreate.disabled = false;
        btnCreate.innerHTML = '<i class="fas fa-qrcode"></i> Buat Invoice QRIS';
    }

    if (window.timerInterval) clearInterval(window.timerInterval);
    if (window.autoCheckInterval) {
        clearInterval(window.autoCheckInterval);
        window.autoCheckInterval = null;
    }
    window.currentInvoiceId = null;

    overlay.classList.add('open');
    window.renderInvoiceHistory();
};

// ============================================================
// COPY BANK INFO
// ============================================================
window.copyBankInfo = function() {
    const bankInfo = `Bank: BCA\nNo Rek: 1234567890\nAtas Nama: JOELL SHOP`;
    navigator.clipboard.writeText(bankInfo).then(() => {
        showToast('Berhasil', 'Info bank disalin ke clipboard', 'success');
    }).catch(() => {
        showToast('Error', 'Gagal menyalin', 'error');
    });
};

// ============================================================
// INIT - EVENT LISTENERS
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Payment System - LZPedia API v3.1 (Fixed)');
    console.log('🔗 Proxy:', PAYMENT_API.backendUrl);
    console.log('🔗 Direct:', PAYMENT_API.baseUrl);

    const createBtn = document.getElementById('createInvoiceBtn');
    if (createBtn) {
        createBtn.addEventListener('click', function() {
            const totalEl = document.getElementById('paymentOrderTotal');
            if (totalEl) {
                const total = parseInt(totalEl.textContent.replace(/[^0-9]/g, ''));
                if (total > 0) {
                    window.createInvoice(total);
                } else {
                    showToast('Error', 'Total pembayaran tidak valid', 'error');
                }
            }
        });
    }

    const checkBtn = document.getElementById('checkStatusBtn');
    if (checkBtn) {
        checkBtn.addEventListener('click', function() {
            if (window.currentInvoiceId) {
                window.checkInvoiceStatus(window.currentInvoiceId);
            } else {
                showToast('Info', 'Belum ada invoice aktif', 'info');
            }
        });
    }

    const closeBtn = document.getElementById('paymentCloseBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            const overlay = document.getElementById('paymentOverlay');
            if (overlay) overlay.classList.remove('open');
            if (window.timerInterval) clearInterval(window.timerInterval);
            if (window.autoCheckInterval) {
                clearInterval(window.autoCheckInterval);
                window.autoCheckInterval = null;
            }
        });
    }

    const methodBtns = document.querySelectorAll('.payment-method-btn');
    methodBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            methodBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const method = this.dataset.method;

            const paymentQrisSection = document.getElementById('paymentQrisSection');
            if (paymentQrisSection) paymentQrisSection.style.display = method === 'qris' ? 'block' : 'none';

            const paymentBankSection = document.getElementById('paymentBankSection');
            if (paymentBankSection) paymentBankSection.style.display = method === 'bank' ? 'block' : 'none';
        });
    });

    const bankTotalEl = document.getElementById('bankTotal');
    if (bankTotalEl) {
        const totalEl = document.getElementById('paymentOrderTotal');
        if (totalEl) {
            bankTotalEl.textContent = totalEl.textContent;
        }
    }

    window.renderInvoiceHistory();
    console.log('✅ Payment System Ready!');
});

console.log('✅ payment-api.js v3.1 (Fixed) Loaded!');
