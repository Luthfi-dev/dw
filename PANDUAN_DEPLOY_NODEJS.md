# 🚀 Panduan Deploy OmniSave Pro ke Hosting Node.js (cPanel / Hostinger / VPS)

Proyek ini 100% menggunakan **React (Vite) + TypeScript + Tailwind CSS** di sisi frontend dan **Express Node.js** di sisi backend sebagai proxy download streaming tanpa redirect.

---

## 🛠️ Cara Deploy ke cPanel (Fitur "Setup Node.js App")

Layanan hosting seperti Niagahoster, DomaiNesia, IDCloudHost, Hostinger, dan cPanel modern memiliki fitur **Setup Node.js App** bawaan (CloudLinux Phusion Passenger).

### Langkah 1: Buat Build Proyek
Di komputer/terminal Anda:
```bash
npm run build
```
Perintah ini akan:
- Mem-bundle frontend Vite ke dalam folder `dist/`
- Mengompilasi `server.ts` menjadi file siap jalan `dist/server.js`

### Langkah 2: Setup Aplikasi di cPanel
1. Login ke **cPanel** akun hosting Anda.
2. Cari dan klik menu **"Setup Node.js App"**.
3. Klik tombol **"Create Application"**.
4. Isi konfigurasi berikut:
   - **Node.js version**: Pilih versi **18.x, 20.x, atau 22.x** (LTS).
   - **Application mode**: Pilih **Production**.
   - **Application root**: Isi nama folder (misal: `omnisave` atau `app`).
   - **Application URL**: Pilih domain atau subdomain Anda.
   - **Application startup file**: Isi dengan `server.js` (atau `dist/server.js`).
5. Klik tombol **Create** di kanan atas.

### Langkah 3: Upload File ke Hosting
1. Kompres seluruh file proyek (folder `dist/`, `package.json`, `server.js`, `public/`) menjadi satu file `.zip`.
   *(Catatan: Anda **TIDAK PERLU** mengikutsertakan folder `node_modules` dalam zip karena ukurannya besar).*
2. Buka **cPanel File Manager** -> masuk ke folder Application Root yang tadi dibuat (misal `/omnisave/`).
3. Upload dan **Extract** file `.zip` tersebut.

### Langkah 4: Install Dependencies & Jalankan
1. Kembali ke menu **Setup Node.js App** di cPanel.
2. Klik ikon pensil (**Edit**) pada aplikasi yang tadi dibuat.
3. Klik tombol **"Run NPM Install"** (atau jalankan `npm install --omit=dev` melalui terminal cPanel).
4. Klik tombol **"Restart"** di bagian atas.
5. Selesai! Buka domain Anda, aplikasi kini aktif secara penuh.

---

## 💻 Cara Menjalankan di VPS / Local Server (PM2)

Jika menggunakan VPS (Ubuntu / Debian / CentOS):

```bash
# 1. Install dependencies
npm install

# 2. Build proyek
npm run build

# 3. Jalankan dengan PM2
npm install -g pm2
pm2 start dist/server.js --name "omnisave-pro"
pm2 save
pm2 startup
```

---

## 📋 Keunggulan Arsitektur Ini:
- **Streaming Tanpa Redirect**: Backend Node.js menangani request `/api/download-file` secara langsung via *chunked stream*, sehingga browser user langsung mengunduh file secara lokal tanpa membuka tab baru dan tanpa membebani memori server.
- **Pure React + TypeScript**: Antarmuka modern, responsif, dan bebas dari dependensi file PHP.
