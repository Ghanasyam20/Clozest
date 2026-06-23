import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: {
    default: "Clozest — Your AI-Powered Digital Wardrobe",
    template: "%s | Clozest",
  },
  description:
    "Transform your wardrobe into a smart, AI-driven styling ecosystem. Upload clothes, generate outfits, and maximise what you already own.",
  keywords: [
    "wardrobe",
    "fashion",
    "AI stylist",
    "outfit generator",
    "digital closet",
  ],
  authors: [{ name: "Clozest" }],
  openGraph: {
    title: "Clozest — Your AI-Powered Digital Wardrobe",
    description:
      "Transform your wardrobe into a smart, AI-driven styling ecosystem.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Clozest",
    description: "Your AI-Powered Digital Wardrobe & Personal Stylist",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0F0F10",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="grain antialiased min-h-screen">
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  if ('ontouchstart' in window) return;

  var styleTag = document.createElement('style');
  styleTag.innerHTML = '*, *:hover { cursor: none !important; }';
  document.head.appendChild(styleTag);

  var svgNS = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(svgNS, 'svg');
  svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;';
  svg.innerHTML = [
    '<filter id="liquidGlass" x="-50%" y="-50%" width="200%" height="200%">',
      '<feTurbulence type="fractalNoise" baseFrequency="0.015 0.025" numOctaves="2" seed="7" result="noise"/>',
      '<feDisplacementMap in="SourceGraphic" in2="noise" scale="16" xChannelSelector="R" yChannelSelector="G"/>',
    '</filter>'
  ].join('');
  document.body.appendChild(svg);

  var cur = document.createElement('div');
  cur.style.cssText = [
    'position:fixed',
    'width:30px',
    'height:30px',
    'border-radius:50%',
    'pointer-events:none',
    'z-index:99999',
    'left:-100px',
    'top:-100px',
    'backdrop-filter:url(#liquidGlass) blur(3px) saturate(150%)',
    '-webkit-backdrop-filter:blur(6px) saturate(150%)',
    'background:radial-gradient(circle at 30% 28%, rgba(255,255,255,0.22), rgba(255,255,255,0.04) 45%, rgba(255,255,255,0.015) 70%)',
    'box-shadow:0 3px 14px rgba(0,0,0,0.14)',
    'transform:translate(-50%,-50%)',
    'transition:width 0.25s cubic-bezier(.22,1,.36,1), height 0.25s cubic-bezier(.22,1,.36,1), background 0.3s'
  ].join(';');

  document.addEventListener('DOMContentLoaded', function() {
    document.body.appendChild(cur);

    var mx = window.innerWidth/2, my = window.innerHeight/2;
    var cx = mx, cy = my;

    document.addEventListener('mousemove', function(e){
      mx = e.clientX;
      my = e.clientY;
    });

    function loop() {
      cx += (mx - cx) * 0.18;
      cy += (my - cy) * 0.18;
      cur.style.left = cx + 'px';
      cur.style.top = cy + 'px';
      requestAnimationFrame(loop);
    }
    loop();

    function attach() {
      document.querySelectorAll('a, button, [role="button"], input, textarea, select').forEach(function(el) {
        if (el.__cursorBound) return;
        el.__cursorBound = true;
        el.addEventListener('mouseenter', function() {
          cur.style.width = '38px';
          cur.style.height = '38px';
          cur.style.background = 'radial-gradient(circle at 30% 28%, rgba(255,255,255,0.32), rgba(255,255,255,0.07) 45%, rgba(255,255,255,0.03) 70%)';
        });
        el.addEventListener('mouseleave', function() {
          cur.style.width = '30px';
          cur.style.height = '30px';
          cur.style.background = 'radial-gradient(circle at 30% 28%, rgba(255,255,255,0.22), rgba(255,255,255,0.04) 45%, rgba(255,255,255,0.015) 70%)';
        });
      });
    }
    attach();
    var observer = new MutationObserver(attach);
    observer.observe(document.body, { childList: true, subtree: true });
  });
})();
`,
          }}
        />
        <a href="#main-content" className="skip-to-content">
          Skip to content
        </a>
        <Providers>
          {children}
          <Toaster />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
