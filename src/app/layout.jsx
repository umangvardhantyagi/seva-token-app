import "./globals.css";

export const metadata = {
  title: "Seva Token App",
  description: "Seva token management app",
  manifest: "/manifest.json",
  icons: {
    icon: "/app-icon.jpg",
    apple: "/app-icon.jpg",
  },
};

export const viewport = {
  themeColor: "#7b4f32",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}