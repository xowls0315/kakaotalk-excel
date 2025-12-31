import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthInitializer from "@/components/AuthInitializer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/remixicon@4.2.0/fonts/remixicon.css"
          rel="stylesheet"
        />
      </head>
      <body className="bg-sky-50">
        <AuthInitializer />
        <Header />
        <main className="min-h-[calc(100vh-120px)] px-4">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
