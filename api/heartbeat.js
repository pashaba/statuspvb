// api/heartbeat.js
let bots = {}; // Menyimpan status bot (in-memory)

function toWIB(date) {
  return new Date(date.getTime() + 7 * 60 * 60 * 1000);
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { botId, time } = req.body;

    if (!botId || !time) {
      return res.status(400).json({ error: "botId dan time wajib dikirim" });
    }

    bots[botId] = {
      lastPing: toWIB(new Date(time)).toISOString(),
      lastCheck: toWIB(new Date()).toISOString(),
    };

    return res.status(200).json({ success: true });
  }

  // Menampilkan status semua bot
  if (req.method === "GET") {
    const now = Date.now();
    const result = Object.entries(bots).map(([botId, data]) => {
      const lastPing = new Date(data.lastPing);
      const diff = now - new Date(data.lastPing).getTime();
      const isOnline = diff < 10 * 1000; // lebih dari 10 detik = offline

      return {
        botId,
        status: isOnline ? "🟢 Online" : "🔴 Offline",
        lastPing: data.lastPing,
        lastCheck: toWIB(new Date()).toISOString(),
        diffSeconds: Math.floor(diff / 1000),
      };
    });

    return res.status(200).json(result);
  }

  res.status(405).json({ error: "Method not allowed" });
}
