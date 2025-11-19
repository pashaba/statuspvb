"use client";
import { useEffect, useState } from "react";

// Interface untuk type safety
interface BotStatus {
  botId: string;
  status: string;
  lastPing?: string;
  lastCheck?: string;
  diffSeconds?: number;
}

export default function Home() {
  const [bots, setBots] = useState<BotStatus[]>([]);
  const [updateTime, setUpdateTime] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Format waktu konsisten
  const formatDateTime = (dateString?: string): string => {
    if (!dateString) return "-";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta",
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return "-";
    }
  };

  // Format waktu untuk update time
  const getCurrentTime = (): string => {
    return new Date().toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  async function loadStatus() {
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await fetch("/api/heartbeat");
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data: BotStatus[] = await res.json();
      setBots(data);
      setUpdateTime(getCurrentTime());
    } catch (err) {
      console.error("Failed to load bot status:", err);
      setError(err instanceof Error ? err.message : "Gagal memuat status bot");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 3000);
    
    return () => clearInterval(interval);
  }, []);

  // Fungsi untuk menentukan warna status
  const getStatusColor = (status: string): string => {
    if (status.includes("Online")) return "#22c55e";
    if (status.includes("Offline")) return "#ef4444";
    if (status.includes("Error")) return "#f59e0b";
    return "#6b7280";
  };

  // Fungsi untuk menentukan warna selisih waktu
  const getDiffColor = (diffSeconds?: number): string => {
    if (!diffSeconds) return "#6b7280";
    if (diffSeconds <= 10) return "#22c55e";
    if (diffSeconds <= 30) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <main style={{ 
      padding: "2rem", 
      minHeight: "100vh",
      backgroundColor: "#0f172a",
      color: "#f8fafc"
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <header style={{ marginBottom: "2rem" }}>
          <h1 style={{ 
            color: "#38bdf8", 
            fontSize: "2.5rem",
            marginBottom: "0.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            📡 Status Bot WhatsApp
          </h1>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "1rem",
            flexWrap: "wrap"
          }}>
            <p style={{ margin: 0, color: "#cbd5e1" }}>
              Terakhir diperbarui: {updateTime}
            </p>
            {isLoading && (
              <span style={{ 
                color: "#f59e0b",
                display: "flex",
                alignItems: "center",
                gap: "0.25rem"
              }}>
                ● Memperbarui...
              </span>
            )}
          </div>
        </header>

        {error && (
          <div style={{
            backgroundColor: "#ef4444",
            color: "white",
            padding: "1rem",
            borderRadius: "0.5rem",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            ⚠️ {error}
            <button 
              onClick={loadStatus}
              style={{
                marginLeft: "auto",
                backgroundColor: "rgba(255,255,255,0.2)",
                border: "none",
                color: "white",
                padding: "0.5rem 1rem",
                borderRadius: "0.25rem",
                cursor: "pointer"
              }}
            >
              Coba Lagi
            </button>
          </div>
        )}

        <div style={{ 
          overflowX: "auto",
          borderRadius: "0.5rem",
          border: "1px solid #334155"
        }}>
          <table
            style={{
              borderCollapse: "collapse",
              width: "100%",
              minWidth: "800px"
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#1e293b" }}>
                <th style={{ 
                  padding: "1rem",
                  textAlign: "left",
                  borderBottom: "2px solid #334155",
                  color: "#38bdf8"
                }}>
                  Bot ID
                </th>
                <th style={{ 
                  padding: "1rem",
                  textAlign: "left",
                  borderBottom: "2px solid #334155",
                  color: "#38bdf8"
                }}>
                  Status
                </th>
                <th style={{ 
                  padding: "1rem",
                  textAlign: "left",
                  borderBottom: "2px solid #334155",
                  color: "#38bdf8"
                }}>
                  Terakhir Ping (WIB)
                </th>
                <th style={{ 
                  padding: "1rem",
                  textAlign: "left",
                  borderBottom: "2px solid #334155",
                  color: "#38bdf8"
                }}>
                  Terakhir Dicek (WIB)
                </th>
                <th style={{ 
                  padding: "1rem",
                  textAlign: "left",
                  borderBottom: "2px solid #334155",
                  color: "#38bdf8"
                }}>
                  Selisih (detik)
                </th>
              </tr>
            </thead>
            <tbody>
              {bots.length === 0 && !isLoading ? (
                <tr>
                  <td 
                    colSpan={5} 
                    style={{ 
                      padding: "2rem", 
                      textAlign: "center",
                      color: "#94a3b8"
                    }}
                  >
                    {error ? "Gagal memuat data" : "Tidak ada bot yang terdaftar"}
                  </td>
                </tr>
              ) : (
                bots.map((bot, index) => (
                  <tr
                    key={bot.botId}
                    style={{
                      backgroundColor: index % 2 ? "#1e293b" : "#0f172a",
                      transition: "background-color 0.2s"
                    }}
                  >
                    <td style={{ 
                      padding: "1rem",
                      borderBottom: "1px solid #334155",
                      fontFamily: "monospace",
                      fontWeight: "bold"
                    }}>
                      {bot.botId}
                    </td>
                    <td style={{ 
                      padding: "1rem",
                      borderBottom: "1px solid #334155"
                    }}>
                      <span style={{ 
                        color: getStatusColor(bot.status),
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem"
                      }}>
                        <span style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: getStatusColor(bot.status),
                          display: "inline-block"
                        }}></span>
                        {bot.status}
                      </span>
                    </td>
                    <td style={{ 
                      padding: "1rem",
                      borderBottom: "1px solid #334155",
                      fontFamily: "monospace"
                    }}>
                      {formatDateTime(bot.lastPing)}
                    </td>
                    <td style={{ 
                      padding: "1rem",
                      borderBottom: "1px solid #334155",
                      fontFamily: "monospace"
                    }}>
                      {formatDateTime(bot.lastCheck)}
                    </td>
                    <td style={{ 
                      padding: "1rem",
                      borderBottom: "1px solid #334155",
                      fontFamily: "monospace",
                      fontWeight: "bold",
                      color: getDiffColor(bot.diffSeconds)
                    }}>
                      {bot.diffSeconds ?? "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Loading indicator */}
        {isLoading && bots.length === 0 && (
          <div style={{ 
            textAlign: "center", 
            padding: "3rem",
            color: "#38bdf8"
          }}>
            Memuat status bot...
          </div>
        )}

        <footer style={{ 
          marginTop: "2rem",
          paddingTop: "1rem",
          borderTop: "1px solid #334155",
          color: "#64748b",
          fontSize: "0.875rem",
          textAlign: "center"
        }}>
          <p>Auto refresh setiap 3 detik • {bots.length} bot terdeteksi</p>
        </footer>
      </div>
    </main>
  );
}
