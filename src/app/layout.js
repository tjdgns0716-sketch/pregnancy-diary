import { Gowun_Dodum } from "next/font/google";
import "./globals.css";

const gowunDodum = Gowun_Dodum({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Dear Baby - 우리의 열달",
  description: "파트너와 함께 쓰는 프라이빗 임신 일지",
  manifest: "/manifest.json",
  icons: {
    apple: "/icon-192x192.png",
  },
};

export const viewport = {
  themeColor: "#FCF9F2",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className={gowunDodum.className}>
        <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-color)' }}>
          <div style={{ flex: 1 }}>
            {children}
          </div>
          <footer style={{ 
            textAlign: 'center', 
            padding: '20px 10px', 
            fontSize: '0.75rem', 
            color: 'var(--text-secondary)',
            opacity: 0.8,
            borderTop: '1px solid var(--border-color)',
            marginTop: 'auto'
          }}>
            © 2026 우리의 열달 스튜디오. Crafted for Our Ten Months & Happy Pregnancy.
          </footer>
        </div>
      </body>
    </html>
  );
}
