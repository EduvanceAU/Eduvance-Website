// app/hello/page.tsx
import Image from 'next/image';

export default function HelloPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white">
      <header className="w-full flex items-center justify-center py-6">
        <Image src="/BlueSolo.png" alt="Eduvance Logo" width={40} height={40} />
      </header>
      <h1 className="text-3xl font-bold text-black">Hello World</h1>
    </main>
  );
}
