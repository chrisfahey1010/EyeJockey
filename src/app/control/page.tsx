'use client';

import ControlPanel from '@/app/components/ControlPanel';

export default function ControlPage() {
  return (
    <main className="min-h-dvh bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <h1 className="mb-8 text-3xl font-bold">Control Room</h1>
      <ControlPanel />
    </main>
  );
}


