"use client";
import Image from 'next/image';
import Link from "next/link";
import { useState, useEffect } from 'react';

export default function Resources() {

  const [selected, setSelected] = useState('option1');

  return (
    <main className="flex w-full h-screen">
      <img src="/Physics_Banner.png" alt="Physics" className="w-full h-[210px]"/>

      <div className="absolute top-[300px] left-[100px] flex flex-col items-center gap-8">
        <h3 className="font-semibold text-2xl text-[#153064] tracking-[-1px] absolute top-[-50px] left-[1px]" style={{ fontFamily: 'Poppins, sans-serif' }}>Choose your exam board</h3>
        {/* Selection Bar */}
        <div className="flex rounded-[15px] bg-[#F2F6FF] border-[#153064] border-2 p-1 w-[1200px] h-[65px] justify-between">
          <button
            onClick={() => setSelected('option1')}
            className={`w-1/2 py-2 text-center rounded-[10px] transition-all ease-in-out duration-500 ${
              selected === 'option1' ? 'bg-[#D0E0FF] shadow-md font-semibold text-xl tracking-[-0.75px]' : ''
            }`} style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            International A Levels
          </button>
          <button
            onClick={() => setSelected('option2')}
            className={`w-1/2 py-2 text-center rounded-[10px] transition-all ease-in-out duration-500 ${
              selected === 'option2' ? 'bg-[#D0E0FF] shadow-md font-semibold text-xl tracking-[-0.75px]' : 'bg transparent'
            }`} style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            IGCSEs
            </button>
        </  div>
          
        {/* Conditional content below */}
        <div className="mt-10 transition-all duration-500 ease-in-out w-full flex justify-center">
          {selected === "option1" ? (
            <div className="p-4 w-[300px] bg-blue-100 rounded-xl text-center">
              <h1 className="text-2xl font-semibold text-[#153064]">📘 You selected Option 1</h1>
              <p className="mt-2 text-[#153064]">This is the content shown for Option 1.</p>
            </div>
          ) : (
            <div className="p-4 w-[300px] bg-green-100 rounded-xl text-center">
              <h1 className="text-2xl font-semibold text-[#153064]">📗 You selected Option 2</h1>
              <p className="mt-2 text-[#153064]">This is the content shown for Option 2.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}