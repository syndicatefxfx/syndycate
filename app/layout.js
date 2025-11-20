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
        {/* Meta Pixel Code */}
        <Script
          id="meta-pixel-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '867736822388456');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=867736822388456&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* End Meta Pixel Code */}
      </body>
    </html>
  );
}
