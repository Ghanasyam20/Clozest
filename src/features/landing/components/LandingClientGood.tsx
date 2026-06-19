'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import dynamic from 'next/dynamic';

const FluidGlass = dynamic(() => import('./FluidGlass'), { ssr: false });

export default function LandingClient() {
  const [navVisible, setNavVisible] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 600], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 600], [1, 1.08]);
  const contentY = useTransform(scrollY, [0, 400], [0, -60]);

  // Scroll-triggered navbar
  useEffect(() => {
    const handleScroll = () => {
      setNavVisible(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Video playback fix
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tryPlay = () => {
      video.play().catch(() => {
        // Fallback: play on first user gesture
        const onGesture = () => {
          video.play();
          window.removeEventListener('click', onGesture);
          window.removeEventListener('touchstart', onGesture);
        };
        window.addEventListener('click', onGesture);
        window.addEventListener('touchstart', onGesture);
      });
      setVideoReady(true);
    };

    if (video.readyState >= 3) {
      tryPlay();
    } else {
      video.addEventListener('canplay', tryPlay, { once: true });
    }

    return () => video.removeEventListener('canplay', tryPlay);
  }, []);

  const features = [
    {
      icon: '✦',
      title: 'AI Wardrobe Intelligence',
      description:
        'Upload your clothing once. Our CLIP-powered AI understands color, texture, style, and occasion — building a living inventory that knows your wardrobe better than you do.',
    },
    {
      icon: '◈',
      title: 'Daily Outfit Generation',
      description:
        'Wake up to curated outfit suggestions tuned to today\'s weather, your calendar, and your personal aesthetic. No decision fatigue, just dressed.',
    },
    {
      icon: '⬡',
      title: 'Style Analytics',
      description:
        'Discover what you actually wear vs. what\'s collecting dust. Clozest surfaces patterns across your wardrobe — cost-per-wear, color gaps, seasonal readiness.',
    },
    {
      icon: '◎',
      title: 'Personal Style Profile',
      description:
        'Set your style language once during onboarding. Clozest calibrates every recommendation to your palette, fit preferences, and lifestyle — not generic trends.',
    },
  ];

  const stats = [
    { value: '2.3s', label: 'avg. outfit decision time' },
    { value: '94%', label: 'wardrobe utilization rate' },
    { value: '0$', label: 'monthly cost, forever' },
  ];

  return (
    <>
      <FluidGlass />

      {/* ── Scroll-triggered Navbar ── */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={navVisible ? { y: 0, opacity: 1 } : { y: -80, opacity: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2.5rem',
          height: '64px',
          background: 'rgba(15, 15, 16, 0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(200, 164, 107, 0.12)',
        }}
      >
        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: '#C8A46B', letterSpacing: '0.08em' }}>
          CLOZEST
        </span>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link href="/auth/login" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.9rem', letterSpacing: '0.04em' }}>
            Sign In
          </Link>
          <Link
            href="/auth/register"
            style={{
              background: '#C8A46B',
              color: '#0F0F10',
              padding: '0.5rem 1.2rem',
              borderRadius: '4px',
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              letterSpacing: '0.06em',
            }}
          >
            Get Started
          </Link>
        </div>
      </motion.nav>

      {/* ── Hero: Fullscreen Video ── */}
      <div ref={heroRef} style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
        <motion.div
          style={{ position: 'absolute', inset: 0, opacity: heroOpacity, scale: heroScale }}
        >
          {/* Video */}
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              opacity: videoReady ? 1 : 0,
              transition: 'opacity 0.8s ease',
            }}
          >
            <source src="/videos/hero.mp4" type="video/mp4" />
          </video>

          {/* Fallback gradient when video isn't ready */}
          {!videoReady && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, #0F0F10 0%, #1a1510 50%, #0F0F10 100%)',
              }}
            />
          )}

          {/* Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, rgba(15,15,16,0.35) 0%, rgba(15,15,16,0.55) 60%, rgba(15,15,16,0.95) 100%)',
            }}
          />
        </motion.div>

        {/* Hero content — no text over video, just minimal brand mark */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            y: contentY,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ textAlign: 'center' }}
          >
            <div
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 'clamp(3.5rem, 10vw, 7rem)',
                color: '#C8A46B',
                letterSpacing: '0.2em',
                lineHeight: 1,
                marginBottom: '1.2rem',
                textShadow: '0 0 80px rgba(200,164,107,0.3)',
              }}
            >
              CLOZEST
            </div>
            <div
              style={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: 'clamp(0.85rem, 2vw, 1rem)',
                letterSpacing: '0.35em',
                textTransform: 'uppercase',
                marginBottom: '3rem',
              }}
            >
              Your wardrobe. Intelligent.
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/auth/register"
                style={{
                  background: '#C8A46B',
                  color: '#0F0F10',
                  padding: '0.85rem 2.2rem',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                Start Free
              </Link>
              <Link
                href="/auth/login"
                style={{
                  background: 'transparent',
                  color: 'rgba(255,255,255,0.8)',
                  padding: '0.85rem 2.2rem',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  letterSpacing: '0.08em',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                Sign In
              </Link>
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            style={{
              position: 'absolute',
              bottom: '2.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'rgba(255,255,255,0.4)',
              fontSize: '0.7rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            <span>Scroll</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              style={{ width: '1px', height: '32px', background: 'rgba(200,164,107,0.5)' }}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* ── Stats Bar ── */}
      <section
        style={{
          background: '#0F0F10',
          borderTop: '1px solid rgba(200,164,107,0.15)',
          borderBottom: '1px solid rgba(200,164,107,0.15)',
          padding: '3rem 2rem',
          display: 'flex',
          justifyContent: 'center',
          gap: 'clamp(3rem, 8vw, 8rem)',
          flexWrap: 'wrap',
        }}
      >
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
            style={{ textAlign: 'center' }}
          >
            <div
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                color: '#C8A46B',
                lineHeight: 1,
                marginBottom: '0.4rem',
              }}
            >
              {s.value}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              {s.label}
            </div>
          </motion.div>
        ))}
      </section>

      {/* ── Features ── */}
      <section
        style={{
          background: '#0F0F10',
          padding: 'clamp(5rem, 10vw, 9rem) clamp(1.5rem, 6vw, 6rem)',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{ marginBottom: '5rem', maxWidth: '480px' }}
        >
          <div
            style={{
              color: '#C8A46B',
              fontSize: '0.75rem',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            What Clozest does
          </div>
          <h2
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: '#ffffff',
              fontWeight: 400,
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            A wardrobe that thinks with you
          </h2>
        </motion.div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2px',
            background: 'rgba(200,164,107,0.08)',
          }}
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
              style={{
                background: '#0F0F10',
                padding: '2.5rem',
                borderTop: '1px solid rgba(200,164,107,0.12)',
              }}
            >
              <div
                style={{
                  color: '#C8A46B',
                  fontSize: '1.4rem',
                  marginBottom: '1.2rem',
                  fontFamily: 'monospace',
                }}
              >
                {f.icon}
              </div>
              <h3
                style={{
                  color: '#ffffff',
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  marginBottom: '0.75rem',
                  letterSpacing: '0.02em',
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '0.9rem',
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {f.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section
        style={{
          background: 'linear-gradient(135deg, #1a1208 0%, #0F0F10 50%, #0d0d10 100%)',
          padding: 'clamp(5rem, 10vw, 9rem) 2rem',
          textAlign: 'center',
          borderTop: '1px solid rgba(200,164,107,0.12)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div
            style={{
              color: '#C8A46B',
              fontSize: '0.75rem',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              marginBottom: '1.5rem',
            }}
          >
            Free. Forever.
          </div>
          <h2
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              color: '#ffffff',
              fontWeight: 300,
              lineHeight: 1.1,
              marginBottom: '1.5rem',
            }}
          >
            Ready to meet your wardrobe?
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.45)',
              fontSize: '1rem',
              maxWidth: '460px',
              margin: '0 auto 2.5rem',
              lineHeight: 1.7,
            }}
          >
            Set up takes under three minutes. No credit card. No trial period. Just a smarter relationship with what you own.
          </p>
          <Link
            href="/auth/register"
            style={{
              display: 'inline-block',
              background: '#C8A46B',
              color: '#0F0F10',
              padding: '1rem 3rem',
              borderRadius: '4px',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            Create Your Wardrobe
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          background: '#0F0F10',
          borderTop: '1px solid rgba(200,164,107,0.1)',
          padding: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <span
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            color: '#C8A46B',
            fontSize: '1.1rem',
            letterSpacing: '0.1em',
          }}
        >
          CLOZEST
        </span>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>
          © {new Date().getFullYear()} Clozest. All rights reserved.
        </span>
      </footer>
    </>
  );
}
