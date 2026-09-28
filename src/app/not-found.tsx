import Link from "next/link";

// Root-level fallback (outside the site chrome), e.g. for unknown admin routes.
export default function RootNotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-paper px-6 text-center">
      <div>
        <p className="kicker justify-center">404</p>
        <h1 className="t-h1 mt-4">Not found.</h1>
        <Link href="/" className="btn btn-red mt-8">
          Go home
        </Link>
      </div>
    </main>
  );
}
