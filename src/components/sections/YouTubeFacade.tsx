"use client";

import { useState } from "react";

// DSGVO-freundliche YouTube-Einbettung: Es wird zunächst nur ein Vorschaubild
// (von YouTube) gezeigt. Erst per Klick lädt der eigentliche Player – und dann
// über die cookiefreie Domain youtube-nocookie.com. So werden ohne Einwilligung
// keine YouTube-Cookies gesetzt.
export function YouTubeFacade({ id, title }: { id: string; title: string }) {
  const [play, setPlay] = useState(false);

  if (play) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-[18px] shadow-md ring-1 ring-black/5">
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerate meter; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlay(true)}
      className="group relative block aspect-video w-full overflow-hidden rounded-[18px] shadow-md ring-1 ring-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={`Video abspielen: ${title}`}
    >
      {/* Vorschaubild von YouTube (statisch, ohne Cookies) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
        alt=""
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <span className="absolute inset-0 bg-navy/25 transition-colors group-hover:bg-navy/10" />
      <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform group-hover:scale-110">
        <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7 text-primary" fill="currentColor" aria-hidden>
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
      {title && (
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/80 to-transparent p-3 text-left text-sm font-semibold text-white">
          {title}
        </span>
      )}
    </button>
  );
}

// Extrahiert die Video-ID aus verschiedenen YouTube-URL-Formen (oder nimmt eine
// bereits reine ID unverändert).
export function youtubeId(input: string): string {
  const v = input.trim();
  if (!v) return "";
  // reine ID (11 Zeichen, keine Slashes)
  if (/^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
  const m =
    v.match(/[?&]v=([a-zA-Z0-9_-]{11})/) ||
    v.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/) ||
    v.match(/\/embed\/([a-zA-Z0-9_-]{11})/) ||
    v.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : "";
}
