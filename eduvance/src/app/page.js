"use client";
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white relative">
      {/* Gradient Box in Background */}
      <div className="absolute w-[95vw] h-[85vh] bg-gradient-to-b from-[#679CFF] to-[#0C60FB] rounded-2xl shadow-xl z-0" />

      <h1 className="font-grand-local text-6xl lg:text-6xl tracking-tight text-center z-10 relative text-white">
        Advancing with
        <br />
        ducation
      </h1>

      <img
        src="/Logo 1.png"
        alt="Eduvance Logo"
        className="w-48 h-auto z-10"
      />
    </main>
  );
}
