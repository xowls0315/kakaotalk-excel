import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-sky-50">
        <Header />
        <main className="min-h-[calc(100vh-120px)] px-4">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
