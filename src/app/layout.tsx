import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import GlobalBackButton from "@/components/GlobalBackButton";

export const metadata: Metadata = {
  title: "المنيعة لقادة الإلقاء | DZ Young Leaders",
  description: "منصة المنيعة لقادة الإلقاء، إحدى مبادرات برنامج DZ Young Leaders لتطوير مهارات الإلقاء والخطابة والقيادة للشباب الجزائري.",
  keywords: "خطابة, قيادة, إلقاء, تدريب, دورات, مهارات",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          {children}
          <GlobalBackButton />
        </AuthProvider>
      </body>
    </html>
  );
}
