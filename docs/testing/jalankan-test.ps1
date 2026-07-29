
# untuk menjalankan K6 dan memompa data ke Grafana/Prometheus

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Memulai Stress Test My Better Grade    " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Menyiapkan URL Prometheus (127.0.0.1:9090)..." -ForegroundColor Yellow
$env:K6_PROMETHEUS_RW_SERVER_URL="http://127.0.0.1:9090/api/v1/write"
$env:K6_FEATURES="native-histograms"

Write-Host "2. Menjalankan K6..." -ForegroundColor Yellow
k6 run -o experimental-prometheus-rw k6-script.js

Write-Host ""
Write-Host "Pengujian Selesai! Silakan cek Dashboard Grafana ." -ForegroundColor Green
