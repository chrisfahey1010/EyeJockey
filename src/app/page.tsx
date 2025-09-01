import ControlPanel from '@/app/components/ControlPanel';

export default function Page() {
  return (
    <main className="min-h-dvh bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <h1 className="mb-8 text-3xl font-bold">Next + Tailwind + Zustand</h1>
      <ControlPanel />
    </main>
  );
}
