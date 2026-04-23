# 📘 README - Sistem Notifikasi Pendaftaran UMUKA dengan ActiveMQ

## 📋 Prasyarat

Pastikan sudah terinstall:
- [Node.js](https://nodejs.org/) (v14 atau lebih baru)
- [Laragon](https://laragon.org/download/) (opsional, untuk environment)
- [ActiveMQ Classic](https://activemq.apache.org/components/classic/download/) (sudah diekstrak)

---

## 🚀 Cara Menjalankan Program

### 1. Jalankan ActiveMQ

Buka **Command Prompt / Terminal** dan jalankan:

```bash
# Masuk ke folder ActiveMQ (sesuaikan dengan path Anda)
cd C:\path\apache-activemq-6.1.2\bin\win64

# Jalankan ActiveMQ
activemq.bat start
```

> **Atau** jika ingin melihat log langsung:
> ```bash
> activemq.bat
> ```

**Cek ActiveMQ berjalan:**
- Buka browser: http://localhost:8161
- Login: `admin` / `admin`

---

### 2. Jalankan Service 1 (Registration - Producer)

Buka **terminal baru**:

```bash
# Masuk ke folder registration-service
cd C:\laragon\www\uts-microservices\registration-service

# Install dependencies (cukup sekali)
npm install

# Jalankan server
npm start
```

**Hasil sukses:**
```
🚀 Registration Service running at http://localhost:3000
📡 ActiveMQ STOMP: localhost:61613
```

**Akses di browser:** http://localhost:3000

---

### 3. Jalankan Service 2 (Notification Worker - Consumer)

Buka **terminal baru** (ketiga):

```bash
# Masuk ke folder notification-worker
cd C:\laragon\www\uts-microservices\notification-worker

# Install dependencies (cukup sekali)
npm install

# Jalankan worker
npm start
```

**Hasil sukses:**
```
🎯 NOTIFICATION WORKER - UMUKA
========================================
🔄 Worker mulai berjalan...
📡 Memantau queue: registration_queue
⏳ Menunggu pesan masuk...
✅ Terkoneksi ke ActiveMQ
```

---

## 🧪 Skenario Pengujian

### Test Normal (Worker Hidup)
1. Buka http://localhost:3000
2. Isi form pendaftaran
3. Klik **Daftar Sekarang**
4. Lihat terminal Worker akan menampilkan:
   ```
   📧 [LOG] Mengirim email verifikasi ke: user@example.com...
   👤 [LOG] Berhasil! User Budi dari prodi Teknik Informatika telah terdaftar.
   ```

### Test Asinkron (Worker Mati)
1. Matikan Worker (Ctrl+C di terminal worker)
2. Lakukan **5 kali pendaftaran** di web
3. Buka dashboard ActiveMQ: http://localhost:8161
4. Klik tab **Queues** → Lihat `registration_queue`:
   - **Number Of Pending Messages: 5**

### Test Resilience (Worker Hidup Kembali)
1. Jalankan ulang Worker:
   ```bash
   npm start
   ```
2. Lihat terminal worker akan langsung memproses 5 pesan yang tertunda
3. Cek dashboard ActiveMQ:
   - **Pending Messages: 0**
   - **Dequeued: 5**

---

## 🛑 Cara Menghentikan Program

| Program | Cara Stop |
|---------|-----------|
| **Registration Service** | `Ctrl + C` di terminal |
| **Notification Worker** | `Ctrl + C` di terminal |
| **ActiveMQ** | `Ctrl + C` atau `activemq.bat stop` |

---

## 📂 Struktur Folder

```
uts-microservices/
├── registration-service/
│   ├── package.json
│   ├── app.js
│   └── views/
│       └── index.html
└── notification-worker/
    ├── package.json
    └── worker.js
```

---

## ⚙️ Konfigurasi Penting

| Komponen | Nilai |
|----------|-------|
| **ActiveMQ Host** | localhost |
| **STOMP Port** | 61613 |
| **Dashboard Port** | 8161 |
| **Queue Name** | registration_queue |
| **Username/Password** | admin/admin |

---

## ❗ Troubleshooting Cepat

| Masalah | Solusi |
|---------|--------|
| `ECONNREFUSED` | Pastikan ActiveMQ sudah jalan, cek http://localhost:8161 |
| `Cannot find module` | Jalankan `npm install` di folder masing-masing service |
| Port 3000 sudah terpakai | Ganti PORT di `app.js` baris 10 |
| Worker tidak memproses | Cek nama queue di kedua service harus sama: `registration_queue` |

---

## ✅ Verifikasi Semua Berjalan

- [ ] ActiveMQ dashboard bisa diakses (http://localhost:8161)
- [ ] Registration Service menampilkan halaman web (http://localhost:3000)
- [ ] Worker menampilkan "Menunggu pesan masuk..."
- [ ] Pendaftaran menghasilkan response sukses
- [ ] Worker mencetak log email simulasi

---

**Selesai! 🎉**

Link Drive
https://drive.google.com/file/d/1uCeGnHXSicHufPURPGFRh4ejil3EGcFD/view?usp=sharing
