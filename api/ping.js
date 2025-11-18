// api/ping.js - Simpan status di memory
let botStatus = {};

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method === 'POST') {
            // Handle ping dari bot
            const { botName, status, timestamp } = req.body;

            if (!botName) {
                return res.status(400).json({ error: 'Nama bot diperlukan' });
            }

            // Simpan status di memory
            botStatus[botName] = {
                botName,
                status: status || 'online',
                lastPing: new Date().toISOString(),
                timestamp: timestamp || Date.now()
            };

            console.log(`✅ Ping diterima dari ${botName}`);
            
            return res.status(200).json({ 
                success: true, 
                message: 'Ping berhasil',
                botName,
                timeWIB: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
            });

        } else if (req.method === 'GET') {
            // Handle status check
            const { bot } = req.query;

            if (!bot) {
                // Kembalikan semua bot status
                const bots = Object.values(botStatus);
                return res.status(200).json({
                    success: true,
                    bots: bots,
                    total: bots.length,
                    serverTimeWIB: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
                });
            }

            // Cek status bot tertentu
            const botData = botStatus[bot];
            if (!botData) {
                return res.status(404).json({ 
                    success: false, 
                    error: 'Bot tidak ditemukan',
                    bot 
                });
            }

            // Hitung status online/offline (offline jika >2 menit tidak ping)
            const lastPing = new Date(botData.lastPing);
            const now = new Date();
            const minutesSinceLastPing = (now - lastPing) / (1000 * 60);
            const isOnline = minutesSinceLastPing < 2; // Offline jika >2 menit

            // Format waktu WIB
            const lastPingWIB = new Date(botData.lastPing).toLocaleString('id-ID', { 
                timeZone: 'Asia/Jakarta' 
            });

            return res.status(200).json({
                success: true,
                bot: {
                    name: botData.botName,
                    status: botData.status,
                    isOnline: isOnline,
                    lastPing: lastPingWIB,
                    minutesSinceLastPing: Math.round(minutesSinceLastPing * 100) / 100,
                    serverTimeWIB: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
                }
            });

        } else {
            return res.status(405).json({ error: 'Method tidak diizinkan' });
        }
    } catch (error) {
        console.error('API error:', error);
        return res.status(500).json({ 
            error: 'Server error',
            message: error.message 
        });
    }
}
