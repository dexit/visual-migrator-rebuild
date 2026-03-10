import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-zinc-950 text-white">
      <h2 className="text-2xl font-bold">404 - Page Not Found</h2>
      <p className="mt-2 text-zinc-400">Could not find the requested resource</p>
      <Link href="/" className="mt-4 text-emerald-500 hover:underline">
        Return Home
      </Link>
    </div>
  );
}
