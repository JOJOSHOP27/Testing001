<?php
// ============================================================
// LZPEDIA PROXY - TEST & DEBUG VERSION
// ============================================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$apiKey = 'LXZ_015d8a759df64d48';
$baseUrl = 'https://app.lzpedia.my.id/api';

// Test 1: Cek apakah PHP & cURL aktif
$tests = [];
$tests['php_version'] = PHP_VERSION;
$tests['curl_enabled'] = function_exists('curl_init');
$tests['json_enabled'] = function_exists('json_encode');

// Test 2: Coba koneksi ke LZPedia
if (function_exists('curl_init')) {
    $testUrl = $baseUrl . '/invoice?apikey=' . urlencode($apiKey) . '&amount=5000';

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $testUrl,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTPHEADER => ['Accept: application/json']
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    $tests['lzpedia_http_code'] = $httpCode;
    $tests['lzpedia_curl_error'] = $curlError ?: null;

    // Coba parse response
    $data = json_decode($response, true);
    if (json_last_error() === JSON_ERROR_NONE) {
        $tests['lzpedia_response_valid_json'] = true;
        $tests['lzpedia_response'] = $data;
    } else {
        $tests['lzpedia_response_valid_json'] = false;
        $tests['lzpedia_raw_response'] = substr($response, 0, 500);
    }
} else {
    $tests['error'] = 'cURL tidak tersedia di server ini';
}

echo json_encode($tests, JSON_PRETTY_PRINT);
