'use client';

import { useEffect } from 'react';

export default function FluidGlass() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

    // Create cursor div — pure DOM, no React
    const cursor = document.createElement('div');
    cursor.id = 'fluid-cursor';
    cursor.style.cssText = `
      position: fixed;
      width: 40px;
      height: 40px;
      border: 1.5px solid rgba(200, 164, 107, 0.8);
      border-radius: 50%;
      pointer-events: none;
      z-index: 99999;
      transform: translate(-50%, -50%);
      left: -100px;
      top: -100px;
      transition: width 0.2s, height 0.2s, border-color 0.2s;
      backdrop-filter: blur(2px);
      background: rgba(200, 164, 107, 0.06);
    `;

    const dot = document.createElement('div');
    dot.style.cssText = `
      position: absolute;
      width: 4px;
      height: 4px;
      background: #C8A46B;
      border-radius: 50%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    `;
    cursor.appendChild(dot);
    document.body.appendChild(cursor);
    document.documentElement.style.cursor = 'none';

    let mx = -100, my = -100;
    let cx = -100, cy = -100;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };
    document.addEventListener('mousemove', onMove);

    let rafId: number;
    const animate = () => {
      cx += (mx - cx) * 0.12;
      cy += (my - cy) * 0.12;
      cursor.style.left = cx + 'px';
      cursor.style.top = cy + 'px';
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);

    // Grow on hover over clickables
    const onEnter = () => {
      cursor.style.width = '60px';
      cursor.style.height = '60px';
      cursor.style.borderColor = 'rgba(200, 164, 107, 1)';
    };
    const onLeave = () => {
      cursor.style.width = '40px';
      cursor.style.height = '40px';
      cursor.style.borderColor = 'rgba(200, 164, 107, 0.8)';
    };
    document.querySelectorAll('a, button').forEach(el => {
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
    });

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('mousemove', onMove);
      document.documentElement.style.cursor = '';
      cursor.remove();
    };
  }, []);

  return null;
}
