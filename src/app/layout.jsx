import PWARegister from "@/components/PWARegister";
import "./globals.css";

export const metadata = {
  title: "Sadhak Directory",
  description: "Keli Kunj Sadhak Directory and ID Verification App",
  manifest: "/manifest.json",
  themeColor: "#102a56",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sadhak Directory",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#102a56",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <PWARegister />
        {children}
      </body>
    </html>
  );
}