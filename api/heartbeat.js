// api/heartbeat.js
let bots = {}; // penyimpanan sementara status bot

// fungsi konversi waktu ke WIB (UTC+7)
function toWIB(date) {
  return new Date(date.getTime() + 7 * 60 * 60 * 1000);
}

export default async function handler(req, res) {
  // Tangani POST request (dari bot)
  if (req.method === "POST") {
    try {
      const { botId, time } = req.body;

      if (!botId || !time) {
        return res.status(400).json({ error: "botId dan time wajib dikirim" });
      }

      bots[botId] = {
        lastPing: toWIB(new Date(time)).toISOString(),
        lastCheck: toWIB(new Date()).toISOString(),
      };

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Terjadi kesalahan di server" });
    }
  }

  // Tangani GET request (dashboard)
  else if (req.method === "GET") {
    const now = Date.now();
    const result = Object.entries(bots).map(([botId, data]) => {
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

  // Selain POST & GET, tolak (405)
  else {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
