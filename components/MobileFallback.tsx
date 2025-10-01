"use client";

import Image from "next/image";

export function MobileFallback() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-neutral-950 px-6 py-10 text-center text-neutral-100">
      <div className="max-w-md space-y-4">
        <h1 className="text-2xl font-semibold">ContriSonics</h1>
        <p className="text-base leading-relaxed text-neutral-300">
          This demo is optimized for larger screens. For the full 3D experience, please open on a desktop.
        </p>
      </div>
      <div className="relative h-48 w-80 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
        <Image
          src="/preview-light.svg"
          alt="Preview of the ContriSonics 3D scene"
          fill
          className="object-cover opacity-80"
          sizes="320px"
          priority
        />
      </div>
      <p className="text-sm text-neutral-500">
        Tip: rotate your device or visit again on a tablet/desktop for an interactive mode.
      </p>
    </main>
  );
}
