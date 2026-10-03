import { CaptureForm } from "@/components/home/CaptureForm";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold text-white">New project</h1>
      <CaptureForm />
    </main>
  );
}
