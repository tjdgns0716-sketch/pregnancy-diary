import { Gowun_Dodum } from "next/font/google";
import "./globals.css";

const gowunDodum = Gowun_Dodum({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL('https://pregnancy-diary-q1r.pages.dev'),
  title: "우리의 열달 🤍",
  description: "아내와 남편이 함께 기록하는 가장 특별한 280일의 임신 다이어리",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.png?v=3",
    apple: "/icon-192x192.png",
  },
  openGraph: {
    title: "우리의 열달 🤍",
    description: "아내와 남편이 함께 기록하는 280일의 임신 다이어리",
    siteName: "우리의 열달",
    images: [
      {
        url: "/mother_icon.jpg",
        width: 800,
        height: 800,
      },
    ],
    locale: "ko_KR",
    type: "website",
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
        <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-color)' }}>
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
