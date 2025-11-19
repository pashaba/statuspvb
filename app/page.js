"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [bots, setBots] = useState([]);
  const [updateTime, setUpdateTime] = useState("");

  async function loadStatus() {
    try {
      const res = await fetch("/api/heartbeat");
      const data = await res.json();
      setBots(data);
      setUpdateTime(
        new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })
      );
    } catch (e) {
      console.error("Gagal ambil status:", e);
    }
  }

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main
      style={{
        fontFamily: "Segoe UI, sans-serif",
        backgroundColor: "#0f172a",
        color: "#f8fafc",
        minHeight: "100vh",
        padding: "2rem",
      }}
    >
      <h1 style={{ color: "#38bdf8" }}>📡 Status Bot WhatsApp</h1>
      <p>Terakhir diperbarui: {updateTime}</p>
      <table
        style={{
          borderCollapse: "collapse",
          width: "100%",
          marginTop: "20px",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#1e293b" }}>
            <th>Bot ID</th>
            <th>Status</th>
            <th>Terakhir Ping (WIB)</th>
            <th>Terakhir Dicek (WIB)</th>
            <th>Selisih (detik)</th>
          </tr>
        </thead>
        <tbody>
          {bots.map((b, i) => (
            <tr
              key={i}
              style={{
                backgroundColor: i % 2 ? "#1e293b" : "#0f172a",
                textAlign: "center",
              }}
            >
              <td>{b.botId}</td>
              <td style={{ color: b.status.includes("Online") ? "#22c55e" : "#ef4444" }}>
                {b.status}
              </td>
              <td>{b.lastPing?.replace("T", " ").split(".")[0]}</td>
              <td>{b.lastCheck?.replace("T", " ").split(".")[0]}</td>
              <td>{b.diffSeconds}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
