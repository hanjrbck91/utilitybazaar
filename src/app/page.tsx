import { Calculator } from "@/components/Calculator";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-[464px] flex-1 flex-col px-5 pb-20 pt-10 sm:pt-16">
      <header className="mb-6 px-1">
        <h1 className="text-xl font-semibold tracking-tight text-text">GST Calculator</h1>
        <p className="mt-1 text-sm text-muted">Calculate GST in seconds.</p>
      </header>
      <Calculator />
    </main>
  );
}
