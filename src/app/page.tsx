import Link from 'next/link';

export default function Page() {
  return (
    <main className="min-h-dvh bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <h1 className="mb-8 text-3xl font-bold">EyeJockey</h1>
      <div className="space-x-4">
        <Link href="/visual" className="underline text-blue-600">Visual</Link>
      </div>
    </main>
  );
}
