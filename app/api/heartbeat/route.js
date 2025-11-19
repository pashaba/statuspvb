let bots = {};

function toWIB(date) {
  return new Date(date.getTime() + 7 * 60 * 60 * 1000);
}

export async function POST(request) {
  try {
    const { botId, time } = await request.json();

    if (!botId || !time) {
      return Response.json({ error: "botId dan time wajib dikirim" }, { status: 400 });
    }

    bots[botId] = {
      lastPing: toWIB(new Date(time)).toISOString(),
      lastCheck: toWIB(new Date()).toISOString(),
    };

    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  const now = Date.now();
  const result = Object.entries(bots).map(([botId, data]) => {
    const diff = now - new Date(data.lastPing).getTime();
    const isOnline = diff < 10 * 1000;

    return {
      botId,
      status: isOnline ? "🟢 Online" : "🔴 Offline",
      lastPing: data.lastPing,
      lastCheck: toWIB(new Date()).toISOString(),
      diffSeconds: Math.floor(diff / 1000),
    };
  });

  return Response.json(result);
}
