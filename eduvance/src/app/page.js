"use client";

import { useState, useEffect } from 'react';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white relative">
      {/* Gradient Box in Background */}
      <div className="absolute w-[95vw] h-[85vh] bg-gradient-to-b from-[#679CFF] to-[#0C60FB] rounded-2xl shadow-xl z-0" />

      <h1 className="poppins-semibold text-5xl lg:text-5xl tracking-tight text-center z-10 relative text-white">
        Advancing with
        <br />
        ducation
      </h1>
    </main>
  );
}
