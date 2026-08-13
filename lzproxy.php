<?php
// ============================================================
// LZPEDIA PROXY - V2 (API KEY BARU)
// ============================================================

// 🔴 API KEY BARU DARI USER
define('API_KEY', 'LXZ_015d8a759df64d48');
define('BASE_URL', 'https://app.lzpedia.my.id/api');

// ============================================================
// HEADER CORS
// ============================================================
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// ============================================================
// DEBUG MODE - Set true untuk development
// ============================================================
$DEBUG = false;

function logDebug($msg) {
    global $DEBUG;
    if ($DEBUG) {
        error_log('[LZPROXY DEBUG] ' . $msg);
    }
}

function sendResponse($success, $data = null, $error = null) {
    $response = ['success' => $success];
    if ($data !== null) $response = array_merge($response, $data);
    if ($error !== null) $response['error'] = $error;
    echo json_encode($response);
    exit;
}

// ============================================================
// 1. BUAT INVOICE
// ============================================================
if (isset($_GET['action']) && $_GET['action'] === 'create') {
    $amount = isset($_GET['amount']) ? intval($_GET['amount']) : 0;

    if ($amount <= 0) {
        sendResponse(false, null, 'Jumlah pembayaran tidak valid. Minimal Rp 1.000');
    }

    // Build URL sesuai dokumentasi LZPedia
    $url = BASE_URL . '/invoice?apikey=' . urlencode(API_KEY) . '&amount=' . $amount;
    logDebug("Create Invoice URL: $url");

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTPHEADER => [
            'Accept: application/json',
            'User-Agent: JOELL-SHOP/2.0'
        ]
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    $totalTime = curl_getinfo($ch, CURLINFO_TOTAL_TIME);
    curl_close($ch);

    logDebug("HTTP Code: $httpCode, Time: {$totalTime}s, Error: " . ($curlError ?: 'none'));

    if ($curlError) {
        sendResponse(false, null, 'Koneksi error: ' . $curlError);
    }

    if ($httpCode !== 200) {
        sendResponse(false, [
            'http_code' => $httpCode,
            'raw_response' => substr($response, 0, 500)
        ], 'Server LZPedia merespons dengan HTTP ' . $httpCode);
    }

    if (empty($response)) {
        sendResponse(false, null, 'Respons kosong dari server LZPedia');
    }

    // Validasi JSON
    $data = json_decode($response, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        sendResponse(false, [
            'raw_response' => substr($response, 0, 500),
            'json_error' => json_last_error_msg()
        ], 'Respons bukan JSON valid');
    }

    // Forward response asli dari LZPedia
    echo $response;
    exit;
}

// ============================================================
// 2. CEK STATUS
// ============================================================
if (isset($_GET['action']) && $_GET['action'] === 'status') {
    $invoiceId = isset($_GET['invoice_id']) ? trim($_GET['invoice_id']) : '';

    if (empty($invoiceId)) {
        sendResponse(false, null, 'Invoice ID tidak valid');
    }

    $url = BASE_URL . '/invoice/status?apikey=' . urlencode(API_KEY) . '&invoice_id=' . urlencode($invoiceId);
    logDebug("Check Status URL: $url");

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTPHEADER => [
            'Accept: application/json',
            'User-Agent: JOELL-SHOP/2.0'
        ]
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    logDebug("HTTP Code: $httpCode, Error: " . ($curlError ?: 'none'));

    if ($curlError) {
        sendResponse(false, null, 'Koneksi error: ' . $curlError);
    }

    if ($httpCode !== 200) {
        sendResponse(false, [
            'http_code' => $httpCode,
            'raw_response' => substr($response, 0, 500)
        ], 'Server LZPedia merespons dengan HTTP ' . $httpCode);
    }

    if (empty($response)) {
        sendResponse(false, null, 'Respons kosong dari server LZPedia');
    }

    $data = json_decode($response, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        sendResponse(false, [
            'raw_response' => substr($response, 0, 500),
            'json_error' => json_last_error_msg()
        ], 'Respons bukan JSON valid');
    }

    echo $response;
    exit;
}

// ============================================================
// DEFAULT
// ============================================================
sendResponse(false, null, 'Action tidak valid. Gunakan ?action=create&amount=XXX atau ?action=status&invoice_id=XXX');
