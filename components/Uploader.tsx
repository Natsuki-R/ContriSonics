'use client';

import React, { useRef, useState } from 'react';

type Props = {
  onImageLoaded?: (file: File) => void;
};

export default function Uploader({ onImageLoaded }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [name, setName] = useState<string>('');

  return (
    <div className="p-3 border border-neutral-800 rounded-md">
      <div className="flex items-center gap-3">
        <input
          type="file"
          ref={ref}
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setName(file.name);
              onImageLoaded?.(file);
            }
          }}
        />
        <button
          className="px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700"
          onClick={() => ref.current?.click()}
        >
          Upload GitHub screenshot
        </button>
        <span className="opacity-70 text-sm">{name}</span>
      </div>
      <p className="text-xs opacity-70 mt-2">
        (MVP) This upload path is a stub. Parsing/color-bucketing can be added next.
      </p>
    </div>
  );
}
