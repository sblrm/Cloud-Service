# 🚀 Monitoring Stack dengan Prometheus & Grafana

> **Stack monitoring untuk memantau kesehatan sistem (infrastruktur) dan aplikasi (backend) menggunakan Prometheus dan Grafana.**

[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![Prometheus](https://img.shields.io/badge/Prometheus-v2.48-orange.svg)](https://prometheus.io/)
[![Grafana](https://img.shields.io/badge/Grafana-v10.2-yellow.svg)](https://grafana.com/)
[![Node.js](https://img.shields.io/badge/Node.js-v18-green.svg)](https://nodejs.org/)

---

## 📋 Daftar Isi

- [Overview](#-overview)
- [Arsitektur](#-arsitektur)
- [Prerequisites](#-prerequisites)
- [Instalasi & Setup](#-instalasi--setup)
- [Akses Service](#-akses-service)
- [Konfigurasi Grafana Dashboard](#-konfigurasi-grafana-dashboard)
- [Load Testing](#-load-testing)
- [Analisis Metrics](#-analisis-metrics)
- [Alert Configuration](#-alert-configuration)
- [Troubleshooting](#-troubleshooting)
- [Best Practices](#-best-practices)

---

## 🎯 Overview

Proyek ini menyediakan setup lengkap untuk monitoring sistem dan aplikasi dengan komponen:

### Komponen Stack:
- **🔍 Prometheus**: Time-series database untuk scraping dan menyimpan metrics
- **📊 Grafana**: Dashboard untuk visualisasi metrics
- **💻 Node Exporter**: Exporter untuk system metrics (CPU, Memory, Disk, Network)
- **📝 To-Do List App**: Aplikasi Node.js CRUD sederhana dengan custom Prometheus metrics + Frontend Web UI

### Metrics yang Dimonitor:

**System Metrics:**
- ✅ CPU Usage (per core dan aggregate)
- ✅ Memory Usage (used, available, total)
- ✅ Disk I/O (read/write rate, IOPS, usage)
- ✅ Network I/O (receive/transmit rate, errors)

**Application Metrics:**
- ✅ Request Rate (RPS)
- ✅ Error Rate (4xx, 5xx)
- ✅ Request Latency (P50, P90, P95, P99)
- ✅ Active Connections
- ✅ HTTP Status Code Distribution
- ✅ Custom Business Metrics

---

## 🏗 Arsitektur

```
┌─────────────────────────────────────────────────────────┐
│                      Docker Network                     │
│                   (monitoring-network)                  │
│                                                         │
│  ┌──────────────┐      ┌──────────────┐                 │
│  │              │      │              │                 │
│  │  Node.js App │──────│  Prometheus  │                 │
│  │  Port: 3000  │      │  Port: 9090  │                 │
│  │              │      │              │                 │
│  └──────────────┘      └───────┬──────┘                 │
│         │                      │                        │
│         │ /metrics             │ scrape                 │
│         │                      │                        │
│         │              ┌───────▼──────┐                 │
│         │              │              │                 │
│         │              │   Grafana    │                 │
│         │              │  Port: 3001  │                 │
│         │              │              │                 │
│         │              └──────────────┘                 │
│         │                                               │
│  ┌──────▼───────┐                                       │
│  │              │                                       │
│  │Node Exporter │──────────────────────────────────┐    │
│  │  Port: 9100  │                                  │    │
│  │              │                                  │    │
│  └──────────────┘                                  │    │
│         │                                          │    │
│         │ system metrics                           │    │
│         │                                          │    │
│         └──────────────────────────────────────────┘    │
│                                                         │
└─────────────────────────────────────────────────────────┘

External Access:
- http://localhost:3000  → Application
- http://localhost:9090  → Prometheus
- http://localhost:3001  → Grafana
- http://localhost:9100  → Node Exporter
```

---

## 📦 Prerequisites

Pastikan sistem Anda sudah memiliki:

- ✅ **Docker** (version 20.x atau lebih baru)
- ✅ **Docker Compose** (version 2.x atau lebih baru)
- ✅ **Git** (untuk clone repository)
- ✅ Minimal **4GB RAM** free
- ✅ Minimal **10GB disk space** free

### Verifikasi Prerequisites:

```powershell
# Check Docker
docker --version
# Output expected: Docker version 20.x.x atau lebih baru

# Check Docker Compose
docker compose version
# Output expected: Docker Compose version v2.x.x atau lebih baru

# Check Docker is running
docker ps
# Jika error, jalankan Docker Desktop terlebih dahulu
```

---

## 🚀 Instalasi & Setup

### Step 1: Persiapan Project

```powershell
# Pastikan Anda berada di direktori project
cd "c:\Users\RAMA\Downloads\Tugas Cloud Service"

# Verifikasi struktur folder
ls
```

Expected output:
```
app/
prometheus/
grafana/
docs/
docker-compose.yml
README.md
```

### Step 2: Build dan Start Services

```powershell
# Build dan start semua services
docker compose up -d --build

# Output expected:
# [+] Building ...
# [+] Running 5/5
#  ✔ Network monitoring-network    Created
#  ✔ Volume prometheus-data        Created
#  ✔ Volume grafana-data           Created
#  ✔ Container node-exporter       Started
#  ✔ Container monitoring-app      Started
#  ✔ Container prometheus          Started
#  ✔ Container grafana             Started
```

**Penjelasan Flag:**
- `-d`: Detached mode (run in background)
- `--build`: Build image sebelum start (penting untuk first run)

### Step 3: Verifikasi Services Running

```powershell
# Check status semua containers
docker compose ps

# Output expected:
# NAME                IMAGE                      STATUS
# grafana             grafana/grafana:10.2.2     Up (healthy)
# monitoring-app      tugas-cloud-service-app    Up (healthy)
# node-exporter       prom/node-exporter:v1.7.0  Up
# prometheus          prom/prometheus:v2.48.0    Up
```

Semua services harus berstatus **"Up"**. Jika ada yang **"Exit"** atau **"Restarting"**, lihat troubleshooting section.

### Step 4: Verifikasi Logs

```powershell
# Check logs aplikasi
docker compose logs app

# Check logs prometheus
docker compose logs prometheus

# Check logs grafana
docker compose logs grafana

# Follow logs (real-time)
docker compose logs -f app
```

---

## 🌐 Akses Service

Setelah semua services running, Anda dapat mengakses:

### 1. **Application** (Node.js Demo App)
- URL: `http://localhost:3000` (Frontend Web UI)
- Health Check: `http://localhost:3000/health`
- Metrics Endpoint: `http://localhost:3000/metrics`
- API Base: `http://localhost:3000/api/todos`

**Test Application:**
```powershell
# Open web interface
start http://localhost:3000

# Test health check
curl http://localhost:3000/health

# Test metrics endpoint
curl http://localhost:3000/metrics

# Test API endpoint
curl http://localhost:3000/api/todos
```

### 2. **Prometheus**
- URL: `http://localhost:9090`
- Status: `http://localhost:9090/targets`
- Alerts: `http://localhost:9090/alerts`

**Verifikasi Targets:**
1. Buka `http://localhost:9090/targets`
2. Pastikan semua targets berstatus **UP**:
   - `nodejs-app` (app:3000)
   - `node-exporter` (node-exporter:9100)
   - `prometheus` (localhost:9090)

### 3. **Grafana**
- URL: `http://localhost:3001`
- **Username**: `admin`
- **Password**: `admin123`

**First Login:**
1. Buka `http://localhost:3001`
2. Login dengan credentials di atas
3. (Optional) Skip change password prompt atau ganti password

### 4. **Node Exporter**
- URL: `http://localhost:9100`
- Metrics: `http://localhost:9100/metrics`

---

## 📊 Konfigurasi Grafana Dashboard

### Step 1: Add Prometheus Data Source

1. Login ke Grafana (`http://localhost:3001`)
2. Klik **☰ Menu** → **Connections** → **Data sources**
3. Klik **Add data source**
4. Pilih **Prometheus**
5. Konfigurasi:
   ```
   Name: Prometheus
   URL: http://prometheus:9090
   Access: Server (default)
   ```
6. Scroll ke bawah, klik **Save & Test**
7. Pastikan muncul pesan: ✅ **"Data source is working"**

### Step 2: Create Dashboard

#### Option A: Import Pre-built Dashboard (Recommended)

**Untuk Node Exporter Metrics:**
1. Klik **☰ Menu** → **Dashboards**
2. Klik **New** → **Import**
3. Masukkan Dashboard ID: **1860** (Node Exporter Full)
4. Klik **Load**
5. Select Prometheus data source
6. Klik **Import**

**Untuk Application Metrics:**
1. Buat dashboard baru: **New** → **New Dashboard**
2. Klik **Add visualization**
3. Select **Prometheus** data source
4. Gunakan query dari file `docs/PROMQL_QUERIES.md`

#### Option B: Build Custom Dashboard

### Dashboard Layout Recommendation:

```
┌───────────────────────────────────────────────────┐
│  📊 Monitoring Dashboard - Overview               │
├───────────────────────────────────────────────────┤
│                                                   │
│  Row 1: Key Metrics (Stats)                       │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐      │
│  │  RPS   │ │ Error  │ │Latency │ │ Active │      │
│  │  156   │ │ 0.2%   │ │ 45ms   │ │  24    │      │
│  └────────┘ └────────┘ └────────┘ └────────┘      │
│                                                   │
│  Row 2: System Metrics                            │
│  ┌─────────────────┐ ┌──────────────────┐         │
│  │  CPU Usage      │ │  Memory Usage     │        │
│  │  [Graph]        │ │  [Graph]          │        │
│  └─────────────────┘ └──────────────────┘         │
│                                                   │
│  Row 3: Application Performance                   │
│  ┌─────────────────────────────────────────────┐  │
│  │  Request Rate (Time Series)                 │  │
│  │  [Graph showing RPS over time]              │  │
│  └─────────────────────────────────────────────┘  │
│                                                   │
│  Row 4: Latency Analysis                          │
│  ┌─────────────────────────────────────────────┐  │
│  │  Latency Percentiles (P50/P90/P95/P99)      │  │
│  │  [Multi-line graph]                         │  │
│  └─────────────────────────────────────────────┘  │
│                                                   │
└───────────────────────────────────────────────────┘
```

### Step 3: Add Panels dengan PromQL Queries

**Contoh Panel 1: CPU Usage**

1. Klik **Add Panel** → **Add visualization**
2. Select **Prometheus** data source
3. Masukkan query:
   ```promql
   100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
   ```
4. Panel options:
   - **Title**: CPU Usage
   - **Unit**: Percent (0-100)
   - **Legend**: {{instance}}
5. Threshold:
   - Warning: 80
   - Critical: 95
6. Klik **Apply**

**Contoh Panel 2: Request Rate**

Query:
```promql
sum(rate(http_requests_total[1m]))
```
- Title: Request Rate (RPS)
- Unit: req/s
- Graph Type: Time series

**Contoh Panel 3: Error Rate**

Query:
```promql
(sum(rate(http_requests_total{status_code=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))) * 100
```
- Title: Error Rate
- Unit: Percent (0-100)
- Color: Red
- Threshold: Warning at 1%, Critical at 5%

**Contoh Panel 4: P95 Latency**

Query:
```promql
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))
```
- Title: P95 Latency
- Unit: seconds (s)
- Format: ms

**Lebih lengkap:** Lihat file `docs/PROMQL_QUERIES.md` untuk daftar lengkap queries.

### Step 4: Save Dashboard

1. Klik **Save dashboard** (icon 💾 di top right)
2. Nama: "Monitoring Overview"
3. Klik **Save**

---

## 🔥 Load Testing

Load testing penting untuk men-generate traffic dan melihat bagaimana sistem bereaksi under pressure.

### Option 1: Apache Bench (Simple)

**Install Apache Bench:**
```powershell
# Di Windows, download Apache dan extract
# Atau gunakan Docker:
docker run --rm --network host httpd ab -n 10000 -c 100 http://host.docker.internal:3000/
```

**Test Commands:**

```bash
# Test 1: Simple load test (10k requests, 100 concurrent)
ab -n 10000 -c 100 http://localhost:3000/api/fast

# Test 2: Sustained load (1000 RPS for 60 seconds)
ab -n 60000 -c 100 -t 60 http://localhost:3000/api/slow

# Test 3: POST requests
ab -n 5000 -c 50 -p data.json -T application/json http://localhost:3000/api/orders
```

### Option 2: wrk (Advanced)

**Install wrk:**
```powershell
# Di Windows, gunakan WSL atau Docker
docker run --rm --network host williamyeh/wrk -t4 -c100 -d30s http://host.docker.internal:3000/
```

**Test Scenarios:**

```bash
# Scenario 1: Baseline test
wrk -t4 -c50 -d30s http://localhost:3000/api/fast

# Scenario 2: Stress test (high concurrency)
wrk -t8 -c200 -d60s http://localhost:3000/api/slow

# Scenario 3: Mixed endpoints
wrk -t4 -c100 -d30s -s script.lua http://localhost:3000/

# script.lua content:
# wrk.method = "GET"
# request = function()
#   local paths = {"/api/fast", "/api/slow", "/api/cpu-intensive"}
#   path = paths[math.random(#paths)]
#   return wrk.format(nil, path)
# end
```

### Option 3: k6 (Professional)

**Install k6:**
```powershell
# Via Chocolatey
choco install k6

# Atau via Docker
docker run --rm -i grafana/k6 run - <script.js
```

**Create test script** (`load-test.js`):

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 50 },  // Ramp up to 50 users
    { duration: '1m', target: 100 },  // Stay at 100 users for 1 min
    { duration: '30s', target: 200 }, // Spike to 200 users
    { duration: '1m', target: 100 },  // Back to 100
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% requests < 500ms
    http_req_failed: ['rate<0.05'],   // Error rate < 5%
  },
};

export default function () {
  // Test different endpoints
  let responses = http.batch([
    ['GET', 'http://localhost:3000/api/fast'],
    ['GET', 'http://localhost:3000/api/slow'],
    ['GET', 'http://localhost:3000/api/cpu-intensive'],
  ]);

  check(responses[0], {
    'fast endpoint status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
```

**Run k6 test:**
```powershell
k6 run load-test.js
```

### Load Test Best Practices:

1. **Start Small**: Mulai dengan load rendah, tingkatkan bertahap
2. **Monitor**: Buka Grafana dashboard sebelum start test
3. **Baseline**: Establish baseline performance sebelum optimization
4. **Multiple Scenarios**: Test berbagai endpoint dan scenarios
5. **Document**: Catat hasil setiap test untuk comparison

### Monitoring During Load Test:

**Di Grafana, perhatikan:**
- ⚠️ CPU usage spike
- ⚠️ Memory consumption
- ⚠️ Latency increase (P95, P99)
- ⚠️ Error rate increase
- ⚠️ Active connections

**Di Prometheus, query:**
```promql
# Current RPS
sum(rate(http_requests_total[1m]))

# Error rate
(sum(rate(http_requests_total{status_code=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))) * 100
```

---

## 📈 Analisis Metrics

### Step-by-Step Analysis Guide:

#### 1. Baseline Analysis (Normal Operation)

**Tanpa load test**, catat baseline metrics:

```promql
# CPU Idle (normal: 90-95%)
avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100

# Memory Usage (normal: 20-40%)
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100

# Request Rate (normal: low, depends on application)
sum(rate(http_requests_total[1m]))
```

**Expected Values:**
- CPU Usage: < 20%
- Memory Usage: 20-40%
- Latency P95: < 100ms
- Error Rate: 0%

#### 2. Under Load Analysis

**Saat load test berjalan**, monitor:

**Query untuk Correlation Analysis:**

```promql
# CPU vs Request Rate
{
  CPU: 100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
  RPS: sum(rate(http_requests_total[1m]))
}

# Latency vs CPU
{
  Latency_P95: histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))
  CPU: 100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
}
```

**Pertanyaan untuk Dijawab:**
1. Pada RPS berapa sistem mulai bottleneck?
2. Berapa CPU usage saat latency mulai meningkat signifikan?
3. Apakah error rate meningkat saat high load?
4. Apakah memory usage stabil atau terus meningkat?

#### 3. Anomaly Detection

**Look for patterns:**

✅ **Normal Pattern:**
- CPU usage naik → RPS naik (proportional)
- CPU usage turun → RPS turun
- Latency stabil atau sedikit naik saat load meningkat

⚠️ **Anomaly Patterns:**
- CPU spike tanpa RPS increase → Possible inefficient code
- Memory continuously increasing → Possible memory leak
- Latency spike sudden tanpa load increase → Database/external API issue
- Error rate increase under moderate load → Application bug

#### 4. Root Cause Analysis

Jika menemukan anomali, investigate:

**Check Application Logs:**
```powershell
docker compose logs app | Select-String "error|Error|ERROR"
```

**Check Resource Limits:**
```powershell
# Container resource usage
docker stats
```

**Query Specific Metrics:**
```promql
# Which endpoint causing high latency?
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, route))

# Which status code most common?
sum by(status_code) (rate(http_requests_total[5m]))

# Error breakdown
sum by(error_type) (rate(http_errors_total[5m]))
```

---

## 🔔 Alert Configuration

### View Active Alerts

**Di Prometheus:**
1. Buka `http://localhost:9090/alerts`
2. Lihat daftar alert rules dan statusnya

**Alert States:**
- 🟢 **Inactive**: Kondisi normal
- 🟡 **Pending**: Kondisi terpenuhi, menunggu `for` duration
- 🔴 **Firing**: Alert aktif, kondisi terpenuhi lebih dari threshold time

### Test Alerts

**Trigger CPU Alert:**

```powershell
# Method 1: Via load test
wrk -t8 -c200 -d60s http://localhost:3000/api/cpu-intensive

# Method 2: Via curl loop
for ($i=0; $i -lt 100; $i++) { 
    curl http://localhost:3000/api/cpu-intensive 
}
```

Monitor di `http://localhost:9090/alerts` → **HighCPUUsage** alert akan firing.

**Trigger Error Rate Alert:**

```powershell
# Hit error endpoint repeatedly
for ($i=0; $i -lt 1000; $i++) { 
    curl http://localhost:3000/api/error 
}
```

### Configure AlertManager (Optional)

Untuk mendapat notifikasi alert via Slack/Email:

**1. Create `alertmanager.yml`:**

```yaml
global:
  resolve_timeout: 5m

route:
  group_by: ['alertname', 'severity']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: 'slack-notifications'

receivers:
  - name: 'slack-notifications'
    slack_configs:
      - api_url: 'YOUR_SLACK_WEBHOOK_URL'
        channel: '#alerts'
        title: '🚨 Alert: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
```

**2. Update `docker-compose.yml`:**

```yaml
  alertmanager:
    image: prom/alertmanager:v0.26.0
    container_name: alertmanager
    volumes:
      - ./prometheus/alertmanager.yml:/etc/alertmanager/alertmanager.yml
    ports:
      - "9093:9093"
    networks:
      - monitoring-network
```

**3. Update `prometheus.yml`:**

```yaml
alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

---

## 🔧 Troubleshooting

### Common Issues & Solutions:

#### Issue 1: Container Won't Start

**Symptom:**
```
docker compose ps
# Output: monitoring-app   Exited (1)
```

**Solution:**
```powershell
# Check logs
docker compose logs app

# Common causes:
# - Port already in use
# - Build failed
# - Missing dependencies

# Fix: Rebuild from scratch
docker compose down -v
docker compose up -d --build --force-recreate
```

#### Issue 2: Prometheus Targets Down

**Symptom:**
Di `http://localhost:9090/targets` → Target status: DOWN

**Solution:**
```powershell
# Check network connectivity
docker compose exec prometheus wget -O- http://app:3000/metrics

# If failed, check app is running
docker compose ps app

# Restart services
docker compose restart prometheus app
```

#### Issue 3: Grafana Can't Connect to Prometheus

**Symptom:**
Data source test failed: "Connection refused"

**Solution:**
- URL harus: `http://prometheus:9090` (bukan `localhost`)
- Access mode: `Server` (bukan Browser)
- Restart Grafana: `docker compose restart grafana`

#### Issue 4: No Metrics Showing in Grafana

**Symptom:**
Dashboard panels empty atau "No data"

**Solutions:**
1. **Check time range**: Set to "Last 5 minutes"
2. **Verify query**: Test di Prometheus first (`http://localhost:9090`)
3. **Generate traffic**: Hit aplikasi beberapa kali
4. **Check data source**: Ensure Prometheus is selected

#### Issue 5: High Memory Usage

**Symptom:**
Docker containers consuming too much RAM

**Solution:**
```powershell
# Limit Prometheus retention
# Edit prometheus/prometheus.yml, add:
# --storage.tsdb.retention.time=7d

# Restart
docker compose restart prometheus
```

#### Issue 6: "Permission Denied" Errors

**Symptom:**
Node Exporter can't read `/proc` or `/sys`

**Solution:**
```yaml
# In docker-compose.yml, ensure node-exporter has:
privileged: true
# Or use proper volume mounts (already configured)
```

### Debugging Commands:

```powershell
# Check all containers
docker compose ps

# Check logs
docker compose logs -f app
docker compose logs prometheus
docker compose logs grafana

# Check container resource usage
docker stats

# Inspect container
docker compose exec app sh
docker compose exec prometheus sh

# Check networks
docker network ls
docker network inspect monitoring-network

# Check volumes
docker volume ls
docker volume inspect tugas-cloud-service_prometheus-data

# Restart specific service
docker compose restart app

# Restart all services
docker compose restart

# Stop all services
docker compose down

# Stop and remove volumes (CAUTION: data loss)
docker compose down -v

# Rebuild from scratch
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

---

## ⚡ Best Practices

### 1. Monitoring Best Practices

✅ **DO:**
- Monitor both infrastructure AND application metrics
- Set appropriate alert thresholds (not too sensitive)
- Use percentiles (P95, P99) for latency, not just average
- Keep dashboard simple and focused
- Document baseline metrics
- Regular load testing untuk validate capacity

❌ **DON'T:**
- Don't monitor everything (focus on what matters)
- Don't set too many alerts (alert fatigue)
- Don't rely only on averages (can hide issues)
- Don't ignore slow query (P99 matters!)

### 2. PromQL Best Practices

✅ **DO:**
```promql
# Use rate() for counters
rate(http_requests_total[5m])

# Use irate() for volatile data
irate(http_requests_total[5m])

# Use avg_over_time() for gauges
avg_over_time(cpu_usage[5m])

# Use histogram_quantile for percentiles
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

❌ **DON'T:**
```promql
# Don't use rate() on gauges
rate(memory_usage[5m])  # WRONG

# Don't use counter directly without rate()
http_requests_total  # WRONG (use rate())

# Don't use too short time range
rate(http_requests_total[10s])  # Too short, noisy
```

### 3. Dashboard Best Practices

**Layout:**
- Most important metrics at top
- Group related metrics together
- Use consistent time ranges
- Use appropriate visualization types

**Panel Types:**
- **Stat**: For single values (current RPS, error rate)
- **Time Series**: For trends over time
- **Gauge**: For percentage values (CPU, memory)
- **Table**: For detailed breakdown
- **Heatmap**: For latency distribution

### 4. Alerting Best Practices

**Alert Naming:**
- Clear and descriptive
- Include severity in name
- Example: `HighCPUUsage`, `CriticalMemoryUsage`

**Alert Thresholds:**
- **Info**: FYI, no action needed
- **Warning**: Investigate soon (< 1 hour)
- **Critical**: Immediate action required (< 5 minutes)

**Alert Duration:**
```yaml
for: 5m  # Wait 5 minutes before firing (avoid flapping)
```

### 5. Production Considerations

**Security:**
```yaml
# Change default passwords!
GF_SECURITY_ADMIN_PASSWORD: "STRONG_PASSWORD_HERE"

# Use HTTPS in production
# Add authentication to Prometheus
# Restrict network access
```

**Data Retention:**
```yaml
# Prometheus retention
--storage.tsdb.retention.time=30d

# Grafana data source settings
# Adjust scrape interval based on needs
scrape_interval: 15s  # Reduce to 30s-60s in prod to save resources
```

**Scaling:**
```yaml
# For production, consider:
# - Prometheus HA setup (multiple instances)
# - Thanos for long-term storage
# - Grafana clustering
# - Separate Prometheus per environment
```

---

## 📚 Additional Resources

### Documentation:
- **Prometheus Docs**: https://prometheus.io/docs/
- **Grafana Docs**: https://grafana.com/docs/
- **PromQL Guide**: https://prometheus.io/docs/prometheus/latest/querying/basics/
- **Node Exporter**: https://github.com/prometheus/node_exporter

### Project Files:
- `docs/PROMQL_QUERIES.md` - Daftar lengkap PromQL queries
- `docs/TEMPLATE_LAPORAN_ANALISIS.md` - Template untuk reporting
- `prometheus/alert.rules.yml` - Alert rules configuration
- `prometheus/prometheus.yml` - Prometheus configuration

### Pre-built Grafana Dashboards:
- Node Exporter Full: Dashboard ID **1860**
- Docker Container Metrics: Dashboard ID **193**
- Prometheus Stats: Dashboard ID **3662**

---

## 🛑 Stop & Cleanup

### Stop Services (Data Preserved)

```powershell
# Stop semua services (volumes tetap ada)
docker compose down

# Start lagi nanti:
docker compose up -d
```

### Complete Cleanup (Remove All Data)

```powershell
# Stop dan hapus SEMUA (termasuk volumes)
docker compose down -v

# Remove images juga (optional)
docker compose down -v --rmi all

# Manual cleanup jika perlu
docker system prune -a --volumes
```

**⚠️ WARNING**: `docker compose down -v` akan menghapus semua data Prometheus dan Grafana (dashboards, settings, metrics history).

---

## 📞 Support & Contact

Jika ada pertanyaan atau issue:

1. **Check Logs**: Selalu cek logs terlebih dahulu
   ```powershell
   docker compose logs app
   ```

2. **Verify Configuration**: Pastikan semua file konfigurasi benar

3. **Restart Services**: Banyak issue teratasi dengan restart
   ```powershell
   docker compose restart
   ```

4. **Rebuild**: Jika masih bermasalah, rebuild from scratch
   ```powershell
   docker compose down -v
   docker compose up -d --build
   ```

---

## 📝 Checklist untuk Laporan

Setelah menjalankan monitoring dan load testing, gunakan template di `docs/TEMPLATE_LAPORAN_ANALISIS.md` untuk membuat laporan.

**Checklist:**
- [ ] Setup stack monitoring (Docker Compose)
- [ ] Konfigurasi Grafana dashboard
- [ ] Jalankan baseline test (no load)
- [ ] Jalankan load test (Apache Bench / wrk / k6)
- [ ] Screenshot dashboard metrics
- [ ] Identifikasi anomali (jika ada)
- [ ] Analisis root cause
- [ ] Buat rekomendasi optimasi
- [ ] Lengkapi template laporan
- [ ] Review dan submit laporan

---

## 🎓 Learning Path

**Beginner:**
1. ✅ Jalankan stack dengan Docker Compose
2. ✅ Explore Grafana dashboard
3. ✅ Generate traffic dengan curl
4. ✅ Observe metrics changes

**Intermediate:**
5. ✅ Create custom dashboard
6. ✅ Write PromQL queries
7. ✅ Conduct load testing
8. ✅ Analyze metrics correlation

**Advanced:**
9. ✅ Configure alerting
10. ✅ Optimize application based on metrics
11. ✅ Implement auto-scaling rules
12. ✅ Long-term capacity planning

---

## 🚀 Next Steps

Setelah comfortable dengan setup ini:

1. **Add More Metrics**: 
   - Database query latency
   - Cache hit/miss ratio
   - External API call duration

2. **Advanced Monitoring**:
   - Distributed tracing (Jaeger)
   - Log aggregation (ELK Stack)
   - APM (Application Performance Monitoring)

3. **Production Deployment**:
   - Kubernetes integration
   - Cloud provider monitoring (AWS CloudWatch, Azure Monitor)
   - SLO/SLI tracking

4. **Automation**:
   - Auto-scaling based on metrics
   - Automated alerting and incident response
   - CI/CD integration

---

**Happy Monitoring! 🎉**

Semoga stack monitoring ini membantu Anda untuk:
- ✅ Detect issues early
- ✅ Understand system behavior
- ✅ Optimize performance
- ✅ Make data-driven decisions

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Author**: DevOps Team
