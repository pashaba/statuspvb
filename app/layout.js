// app/layout.js

export const metadata = {
  title: "Status Bot WhatsApp",
  description: "Monitoring status bot WhatsApp by PVB",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        style={{
          margin: 0,
          backgroundColor: "#0f172a",
          color: "#f8fafc",
          fontFamily: "Segoe UI, sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}
