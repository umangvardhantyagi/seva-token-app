import "./globals.css";

export const metadata = {
  title: "Seva Token App",
  description: "Simple seva token management app",
  manifest: "/manifest.json",
  themeColor: "#7b4f32",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}