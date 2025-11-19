import "./globals.css";
import IntercomMessenger from "@/components/Intercom";
import { LanguageProvider } from "@/components/LanguageProvider";
import { Inter, Anton, Black_Ops_One } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-inter",
});

const anton = Anton({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-anton",
});

const blackOps = Black_Ops_One({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-blackops",
});

const stencil = localFont({
  src: "/fonts/SolidStencil2023.ttf",
  display: "swap",
  variable: "--font-stencil",
});

export const metadata = {
  title: "SNDCT",
  description: "THE NEW ERA OF TRADING IN ISRAEL",
  icons: {
    icon: [
      { url: "/favicon-light-theme.svg", type: "image/svg+xml" },
      {
        url: "/favicon-light-theme.svg",
        type: "image/svg+xml",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/favicon-dark-theme.svg",
        type: "image/svg+xml",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${stencil.variable} ${inter.variable} ${anton.variable} ${blackOps.variable}`}
      >
        <LanguageProvider>
          {children}
          <IntercomMessenger />
        </LanguageProvider>
        {/* Start of Tawk.to Script */}
        <Script
          id="tawk-to-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
              (function(){
              var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
              s1.async=true;
              s1.src='https://embed.tawk.to/691da0c8832c61195c8c787e/1jadro41e';
              s1.charset='UTF-8';
              s1.setAttribute('crossorigin','*');
              s0.parentNode.insertBefore(s1,s0);
              })();
            `,
          }}
        />
        {/* End of Tawk.to Script */}
      </body>
    </html>
  );
}
