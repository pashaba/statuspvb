<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Status Bot WhatsApp - Monitor</title>
  <style>
    body {
      font-family: "Segoe UI", sans-serif;
      background: #0f172a;
      color: #f8fafc;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px;
    }
    h1 {
      color: #38bdf8;
    }
    table {
      border-collapse: collapse;
      width: 80%;
      margin-top: 20px;
    }
    th, td {
      border: 1px solid #475569;
      padding: 10px 15px;
      text-align: center;
    }
    th {
      background-color: #1e293b;
    }
    tr:nth-child(even) {
      background-color: #1e293b;
    }
    .online {
      color: #22c55e;
    }
    .offline {
      color: #ef4444;
    }
  </style>
</head>
<body>
  <h1>📡 Status Bot WhatsApp</h1>
  <p>Terakhir diperbarui: <span id="update-time"></span></p>
  <table>
    <thead>
      <tr>
        <th>Bot ID</th>
        <th>Status</th>
        <th>Terakhir Ping (WIB)</th>
        <th>Terakhir Dicek (WIB)</th>
        <th>Selisih (detik)</th>
      </tr>
    </thead>
    <tbody id="table-body"></tbody>
  </table>

  <script>
    async function loadStatus() {
      const res = await fetch("/api/heartbeat");
      const data = await res.json();
      const tbody = document.getElementById("table-body");
      const now = new Date();
      document.getElementById("update-time").textContent = now.toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });

      tbody.innerHTML = data
        .map(
          (b) => `
          <tr>
            <td>${b.botId}</td>
            <td class="${b.status.includes('Online') ? 'online' : 'offline'}">${b.status}</td>
            <td>${b.lastPing.replace('T', ' ').split('.')[0]}</td>
            <td>${b.lastCheck.replace('T', ' ').split('.')[0]}</td>
            <td>${b.diffSeconds}</td>
          </tr>`
        )
        .join("");
    }

    loadStatus();
    setInterval(loadStatus, 3000);
  </script>
</body>
</html>
