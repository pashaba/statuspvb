export const metadata = {
  title: "Status Bot WhatsApp",
  description: "Monitoring status bot WhatsApp by PVB",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body style={{ margin: 0, backgroundColor: "#0f172a", color: "#f8fafc" }}>
        {children}
      </body>
    </html>
  );
}
