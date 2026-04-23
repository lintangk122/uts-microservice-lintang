const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const stompit = require('stompit');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('views'));

// Konfigurasi ActiveMQ
const activemqConfig = {
    host: 'localhost',
    port: 61613,
    connectHeaders: {
        'host': '/',
        'login': 'admin',
        'passcode': 'admin',
        'heart-beat': '5000,5000'
    }
};

// Fungsi kirim pesan ke queue
function sendToQueue(userData, callback) {
    stompit.connect(activemqConfig, (error, client) => {
        if (error) {
            console.error('Gagal konek ke ActiveMQ:', error.message);
            return callback(error);
        }

        const frame = client.send({
            'destination': '/queue/registration_queue',
            'content-type': 'application/json'
        });

        const message = JSON.stringify(userData);
        frame.write(message);
        frame.end();

        console.log(`[Producer] Pesan terkirim: ${message}`);
        client.disconnect();
        callback(null, 'OK');
    });
}

// Endpoint halaman utama
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Endpoint registrasi
app.post('/register', (req, res) => {
    const { nama, email, prodi } = req.body;

    // Validasi sederhana
    if (!nama || !email || !prodi) {
        return res.json({
            success: false,
            message: 'Semua field harus diisi!'
        });
    }

    const userData = {
        id: Date.now(),
        nama: nama,
        email: email,
        prodi: prodi,
        timestamp: new Date().toISOString()
    };

    // Kirim ke ActiveMQ (tanpa mengirim email langsung)
    sendToQueue(userData, (error) => {
        if (error) {
            console.error('Gagal mengirim ke queue:', error);
            return res.json({
                success: false,
                message: 'Gagal memproses pendaftaran, silakan coba lagi.'
            });
        }

        // Respon cepat ke user
        res.json({
            success: true,
            message: '✅ Pendaftaran sedang diproses, silakan cek email secara berkala.'
        });
    });
});

// Jalankan server
app.listen(PORT, () => {
    console.log(`🚀 Registration Service running at http://localhost:${PORT}`);
    console.log(`📡 ActiveMQ STOMP: ${activemqConfig.host}:${activemqConfig.port}`);
});