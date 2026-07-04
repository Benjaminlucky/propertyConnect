"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Props {
  photos: string[];
  title: string;
}

function thumb(url: string) {
  return url.replace("/upload/", "/upload/w_600,h_400,c_fill/");
}
function full(url: string) {
  return url.replace("/upload/", "/upload/w_1400,h_900,c_limit/");
}

export function PhotoGallery({ photos, title }: Props) {
  const [index, setIndex] = useState<number | null>(null);
  const indexRef = useRef<number | null>(null);
  indexRef.current = index;

  const close = useCallback(() => setIndex(null), []);
  const prev = useCallback(() => {
    const cur = indexRef.current;
    if (cur !== null && cur > 0) setIndex(cur - 1);
  }, []);
  const next = useCallback(() => {
    const cur = indexRef.current;
    if (cur !== null && cur < photos.length - 1) setIndex(cur + 1);
  }, [photos.length]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (indexRef.current === null) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, prev, next]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = index !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [index]);

  const cur = index ?? 0;
  const extraCount = photos.length - 4;

  return (
    <>
      {/* ── Gallery grid ── */}
      <div className="det-gal">
        {photos.slice(0, 4).map((url, i) => (
          <div
            key={url}
            className="g"
            style={{ padding: 0, overflow: "hidden", cursor: "pointer" }}
            onClick={() => setIndex(i)}
            role="button"
            aria-label={`View photo ${i + 1}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumb(url)}
              alt={`${title} photo ${i + 1}`}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
        ))}
        <div
          className="g more"
          style={{ cursor: "pointer" }}
          onClick={() => setIndex(Math.min(4, photos.length - 1))}
          role="button"
          aria-label="View all photos"
        >
          {extraCount > 0
            ? `+ ${extraCount} more photo${extraCount === 1 ? "" : "s"}`
            : `${photos.length} photo${photos.length === 1 ? "" : "s"}`}
        </div>
      </div>

      {/* ── Lightbox ── */}
      {index !== null && (
        <div className="lb" onClick={close} role="dialog" aria-modal aria-label="Photo viewer">
          {/* Close */}
          <button className="lb-close" onClick={close} aria-label="Close">✕</button>

          {/* Counter */}
          <div className="lb-counter">{cur + 1} / {photos.length}</div>

          {/* Prev */}
          {cur > 0 && (
            <button
              className="lb-nav lb-nav--prev"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Previous photo"
            >
              ‹
            </button>
          )}

          {/* Image */}
          <div className="lb-img-wrap" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={full(photos[cur])}
              alt={`${title} — photo ${cur + 1} of ${photos.length}`}
              className="lb-img"
            />
          </div>

          {/* Next */}
          {cur < photos.length - 1 && (
            <button
              className="lb-nav lb-nav--next"
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Next photo"
            >
              ›
            </button>
          )}

          {/* Thumbnail strip */}
          {photos.length > 1 && (
            <div className="lb-strip" onClick={(e) => e.stopPropagation()}>
              {photos.map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={url}
                  src={thumb(url)}
                  alt=""
                  className={`lb-thumb${i === cur ? " lb-thumb--active" : ""}`}
                  onClick={() => setIndex(i)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
