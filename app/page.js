"use client";
import { useEffect, useState } from "react";

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

  // Statistik
  const onlineBots = bots.filter(bot => bot.status.includes("Online")).length;
  const offlineBots = bots.filter(bot => bot.status.includes("Offline")).length;
  const totalBots = bots.length;
  const onlinePercentage = totalBots > 0 ? (onlineBots / totalBots) * 100 : 0;

  // Data untuk chart
  const statusData = [
    { status: 'Online', count: onlineBots, color: '#22c55e' },
    { status: 'Offline', count: offlineBots, color: '#ef4444' }
  ];

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
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
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

  const getStatusColor = (status: string): string => {
    if (status.includes("Online")) return "#22c55e";
    if (status.includes("Offline")) return "#ef4444";
    if (status.includes("Error")) return "#f59e0b";
    return "#6b7280";
  };

  const getDiffColor = (diffSeconds?: number): string => {
    if (!diffSeconds) return "#6b7280";
    if (diffSeconds <= 10) return "#22c55e";
    if (diffSeconds <= 30) return "#f59e0b";
    return "#ef4444";
  };

  // Komponen Pie Chart sederhana
  const PieChart = ({ data, size = 120 }) => {
    const total = data.reduce((sum, item) => sum + item.count, 0);
    let accumulatedAngle = 0;

    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {data.map((item, index) => {
          const percentage = total > 0 ? item.count / total : 0;
          const angle = percentage * 360;
          const largeArcFlag = angle > 180 ? 1 : 0;
          
          const x1 = size/2 + (size/2) * Math.cos(accumulatedAngle * Math.PI / 180);
          const y1 = size/2 + (size/2) * Math.sin(accumulatedAngle * Math.PI / 180);
          
          accumulatedAngle += angle;
          
          const x2 = size/2 + (size/2) * Math.cos(accumulatedAngle * Math.PI / 180);
          const y2 = size/2 + (size/2) * Math.sin(accumulatedAngle * Math.PI / 180);

          const pathData = [
            `M ${size/2} ${size/2}`,
            `L ${x1} ${y1}`,
            `A ${size/2} ${size/2} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
          ].join(' ');

          return (
            <path
              key={index}
              d={pathData}
              fill={item.color}
              stroke="#ffffff"
              strokeWidth="2"
            />
          );
        })}
        <text
          x={size/2}
          y={size/2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#1f2937"
        >
          {total}
        </text>
      </svg>
    );
  };

  return (
    <main style={{ 
      minHeight: "100vh",
      backgroundColor: "#f8fafc",
      color: "#1f2937",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      <div style={{ 
        maxWidth: "1400px", 
        margin: "0 auto",
        padding: "2rem 1.5rem"
      }}>
        {/* Header */}
        <header style={{ 
          marginBottom: "2rem",
          borderBottom: "2px solid #e5e7eb",
          paddingBottom: "1.5rem"
        }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "1rem"
          }}>
            <div>
              <h1 style={{ 
                fontSize: "2.25rem",
                fontWeight: "bold",
                marginBottom: "0.5rem",
                background: "linear-gradient(135deg, #1f2937 0%, #4b5563 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>
                🤖 Dashboard Status Bot WhatsApp
              </h1>
              <p style={{ 
                color: "#6b7280",
                fontSize: "1rem",
                margin: 0
              }}>
                Monitoring Real-time • Terakhir update: {updateTime}
                {isLoading && (
                  <span style={{ 
                    color: "#f59e0b",
                    marginLeft: "0.5rem",
                    fontWeight: "500"
                  }}>
                    ● Memperbarui...
                  </span>
                )}
              </p>
            </div>
            
            <button 
              onClick={loadStatus}
              style={{
                backgroundColor: "#1f2937",
                color: "white",
                border: "none",
                padding: "0.75rem 1.5rem",
                borderRadius: "0.75rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#374151"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#1f2937"}
            >
              🔄 Refresh Data
            </button>
          </div>
        </header>

        {error && (
          <div style={{
            backgroundColor: "#fee2e2",
            color: "#dc2626",
            padding: "1rem 1.5rem",
            borderRadius: "0.75rem",
            marginBottom: "2rem",
            border: "1px solid #fecaca",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem"
          }}>
            <span style={{ fontSize: "1.25rem" }}>⚠️</span>
            <div style={{ flex: 1 }}>
              <strong>Error:</strong> {error}
            </div>
            <button 
              onClick={loadStatus}
              style={{
                backgroundColor: "#dc2626",
                color: "white",
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                fontWeight: "500",
                cursor: "pointer"
              }}
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Statistik Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2.5rem"
        }}>
          <div style={{
            backgroundColor: "white",
            padding: "1.5rem",
            borderRadius: "1rem",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            border: "1px solid #e5e7eb"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ color: "#6b7280", margin: "0 0 0.5rem 0", fontWeight: "500" }}>Total Bots</p>
                <h3 style={{ fontSize: "2rem", fontWeight: "bold", margin: 0, color: "#1f2937" }}>{totalBots}</h3>
              </div>
              <div style={{
                backgroundColor: "#1f2937",
                padding: "0.75rem",
                borderRadius: "0.75rem",
                fontSize: "1.5rem"
              }}>
                🤖
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: "white",
            padding: "1.5rem",
            borderRadius: "1rem",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            border: "1px solid #e5e7eb"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ color: "#6b7280", margin: "0 0 0.5rem 0", fontWeight: "500" }}>Online</p>
                <h3 style={{ fontSize: "2rem", fontWeight: "bold", margin: 0, color: "#22c55e" }}>{onlineBots}</h3>
                <p style={{ color: "#6b7280", margin: "0.25rem 0 0 0", fontSize: "0.875rem" }}>
                  {onlinePercentage.toFixed(1)}% dari total
                </p>
              </div>
              <div style={{
                backgroundColor: "#dcfce7",
                padding: "0.75rem",
                borderRadius: "0.75rem",
                fontSize: "1.5rem",
                color: "#16a34a"
              }}>
                ✅
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: "white",
            padding: "1.5rem",
            borderRadius: "1rem",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            border: "1px solid #e5e7eb"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ color: "#6b7280", margin: "0 0 0.5rem 0", fontWeight: "500" }}>Offline</p>
                <h3 style={{ fontSize: "2rem", fontWeight: "bold", margin: 0, color: "#ef4444" }}>{offlineBots}</h3>
                <p style={{ color: "#6b7280", margin: "0.25rem 0 0 0", fontSize: "0.875rem" }}>
                  {totalBots > 0 ? ((offlineBots / totalBots) * 100).toFixed(1) : 0}% dari total
                </p>
              </div>
              <div style={{
                backgroundColor: "#fef2f2",
                padding: "0.75rem",
                borderRadius: "0.75rem",
                fontSize: "1.5rem",
                color: "#dc2626"
              }}>
                ❌
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: "white",
            padding: "1.5rem",
            borderRadius: "1rem",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            border: "1px solid #e5e7eb"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: "100%" }}>
              <div>
                <p style={{ color: "#6b7280", margin: "0 0 0.5rem 0", fontWeight: "500" }}>Status Distribution</p>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <PieChart data={statusData} size={60} />
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                      <div style={{ width: "8px", height: "8px", backgroundColor: "#22c55e", borderRadius: "50%" }}></div>
                      <span style={{ fontSize: "0.875rem" }}>Online: {onlineBots}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <div style={{ width: "8px", height: "8px", backgroundColor: "#ef4444", borderRadius: "50%" }}></div>
                      <span style={{ fontSize: "0.875rem" }}>Offline: {offlineBots}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "1rem",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          border: "1px solid #e5e7eb",
          overflow: "hidden"
        }}>
          <div style={{
            padding: "1.5rem",
            borderBottom: "1px solid #e5e7eb",
            backgroundColor: "#f9fafb"
          }}>
            <h2 style={{ 
              fontSize: "1.25rem", 
              fontWeight: "600", 
              margin: 0,
              color: "#1f2937"
            }}>
              📋 Detail Status Bot
            </h2>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{
              borderCollapse: "collapse",
              width: "100%",
              minWidth: "800px"
            }}>
              <thead>
                <tr style={{ backgroundColor: "#f9fafb" }}>
                  {["Bot ID", "Status", "Terakhir Ping (WIB)", "Terakhir Dicek (WIB)", "Selisih (detik)"].map((header, index) => (
                    <th 
                      key={index}
                      style={{ 
                        padding: "1rem 1.5rem",
                        textAlign: "left",
                        borderBottom: "1px solid #e5e7eb",
                        fontWeight: "600",
                        color: "#374151",
                        fontSize: "0.875rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em"
                      }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bots.length === 0 && !isLoading ? (
                  <tr>
                    <td 
                      colSpan={5} 
                      style={{ 
                        padding: "3rem", 
                        textAlign: "center",
                        color: "#6b7280"
                      }}
                    >
                      {error ? "❌ Gagal memuat data" : "🤖 Tidak ada bot yang terdaftar"}
                    </td>
                  </tr>
                ) : (
                  bots.map((bot, index) => (
                    <tr
                      key={bot.botId}
                      style={{
                        backgroundColor: index % 2 ? "#f9fafb" : "white",
                        transition: "background-color 0.2s"
                      }}
                    >
                      <td style={{ 
                        padding: "1rem 1.5rem",
                        borderBottom: "1px solid #e5e7eb",
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: "600",
                        color: "#1f2937"
                      }}>
                        {bot.botId}
                      </td>
                      <td style={{ 
                        padding: "1rem 1.5rem",
                        borderBottom: "1px solid #e5e7eb"
                      }}>
                        <span style={{ 
                          color: getStatusColor(bot.status),
                          fontWeight: "600",
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
                        padding: "1rem 1.5rem",
                        borderBottom: "1px solid #e5e7eb",
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: "0.875rem",
                        color: "#4b5563"
                      }}>
                        {formatDateTime(bot.lastPing)}
                      </td>
                      <td style={{ 
                        padding: "1rem 1.5rem",
                        borderBottom: "1px solid #e5e7eb",
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: "0.875rem",
                        color: "#4b5563"
                      }}>
                        {formatDateTime(bot.lastCheck)}
                      </td>
                      <td style={{ 
                        padding: "1rem 1.5rem",
                        borderBottom: "1px solid #e5e7eb",
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: "600",
                        color: getDiffColor(bot.diffSeconds)
                      }}>
                        {bot.diffSeconds ? `${bot.diffSeconds}s` : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Loading */}
          {isLoading && bots.length === 0 && (
            <div style={{ 
              textAlign: "center", 
              padding: "3rem",
              color: "#6b7280"
            }}>
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</div>
              Memuat status bot...
            </div>
          )}
        </div>

        {/* Footer */}
        <footer style={{ 
          marginTop: "3rem",
          paddingTop: "2rem",
          borderTop: "1px solid #e5e7eb",
          color: "#6b7280",
          fontSize: "0.875rem",
          textAlign: "center"
        }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem"
          }}>
            <p style={{ margin: 0 }}>
              🚀 <strong>WhatsApp Bot Monitor</strong> • Auto refresh setiap 3 detik
            </p>
            <p style={{ margin: 0 }}>
              📊 <strong>{totalBots}</strong> bot terdeteksi • 
              <span style={{ color: "#22c55e", fontWeight: "600" }}> {onlineBots} online</span> • 
              <span style={{ color: "#ef4444", fontWeight: "600" }}> {offlineBots} offline</span>
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
