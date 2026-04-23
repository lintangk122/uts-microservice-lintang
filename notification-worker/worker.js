const stompit = require('stompit');

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

// Fungsi simulasi kirim email
function sendEmailNotification(userData) {
    console.log('\n' + '='.repeat(60));
    console.log(`📧 [LOG] Mengirim email verifikasi ke: ${userData.email}...`);
    console.log(`👤 [LOG] Berhasil! User ${userData.nama} dari prodi ${userData.prodi} telah terdaftar.`);
    console.log(`🕐 [LOG] Waktu registrasi: ${userData.timestamp}`);
    console.log('='.repeat(60) + '\n');
}

// Fungsi untuk consume pesan dari queue
function consumeMessages() {
    console.log('🔄 Worker mulai berjalan...');
    console.log(`📡 Memantau queue: registration_queue`);
    console.log('⏳ Menunggu pesan masuk...\n');

    stompit.connect(activemqConfig, (error, client) => {
        if (error) {
            console.error('❌ Gagal konek ke ActiveMQ:', error.message);
            console.log('🔄 Mencoba reconnect dalam 5 detik...');
            setTimeout(consumeMessages, 5000);
            return;
        }

        console.log('✅ Terkoneksi ke ActiveMQ');

        // Subscribe ke queue
        const subscribeHeaders = {
            'destination': '/queue/registration_queue',
            'ack': 'client-individual',
            'activemq.prefetchSize': '1'
        };

        client.subscribe(subscribeHeaders, (error, message) => {
            if (error) {
                console.error('❌ Error subscribe:', error.message);
                return;
            }

            // Baca pesan
            let body = '';
            message.on('readable', () => {
                const chunk = message.read();
                if (chunk !== null) {
                    body += chunk;
                }
            });

            message.on('end', () => {
                try {
                    const userData = JSON.parse(body);
                    console.log(`📨 Mendapat pesan baru untuk: ${userData.email}`);

                    // Proses simulasi email
                    sendEmailNotification(userData);

                    // Kirim ack ke ActiveMQ (hapus dari queue)
                    client.ack(message);
                    console.log('✅ Pesan telah diproses dan dihapus dari queue\n');

                } catch (err) {
                    console.error('❌ Error memproses pesan:', err.message);
                    // Tetap ack agar tidak looping
                    client.ack(message);
                }
            });
        });

        // Handle disconnect
        client.on('error', (error) => {
            console.error('❌ Koneksi terputus:', error.message);
            setTimeout(consumeMessages, 5000);
        });
    });
}

// Mulai worker
console.log('🎯 NOTIFICATION WORKER - UMUKA');
console.log('='.repeat(40));
consumeMessages();

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Worker dihentikan...');
    process.exit();
});