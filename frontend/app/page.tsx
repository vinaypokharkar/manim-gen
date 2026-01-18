import Navbar from "@/components/landing/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center pt-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
            Animind
          </h1>
          <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-xl">
            Create stunning mathematical animations with AI. Just describe it,
            and we'll render it.
          </p>
        </div>
      </main>
    </div>
  );
}
