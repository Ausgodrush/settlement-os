'use client';
import { useState } from 'react';

interface Props {
  images: string[];
  alt: string;
  flag: string;
  className?: string;
}

export default function ListingImageCarousel({ images, alt, flag, className = 'h-44' }: Props) {
  const [idx, setIdx] = useState(0);
  const total = images.length;

  function prev(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIdx((i) => (i - 1 + total) % total);
  }

  function next(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIdx((i) => (i + 1) % total);
  }

  return (
    <div className={`relative bg-gray-100 overflow-hidden group/car ${className}`}>
      {/* Sliding images — each absolutely placed, shifted by (i - idx) * 100% */}
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={`${alt}, image ${i + 1} of ${total}`}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(${(i - idx) * 100}%)` }}
          loading="lazy"
        />
      ))}

      {/* Country flag */}
      <span className="absolute top-3 left-3 text-xl z-10 drop-shadow">{flag}</span>

      {/* "N of M" counter */}
      {total > 1 && (
        <span className="absolute bottom-2 right-2 z-10 text-[11px] font-medium text-white bg-black/50 rounded-full px-2 py-0.5 leading-none">
          {idx + 1} of {total}
        </span>
      )}

      {/* Prev / Next arrows — visible on hover */}
      {total > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow opacity-0 group-hover/car:opacity-100 transition-opacity duration-150"
          >
            <svg className="w-4 h-4 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            aria-label="Next image"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow opacity-0 group-hover/car:opacity-100 transition-opacity duration-150"
          >
            <svg className="w-4 h-4 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dot indicators */}
      {total > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex gap-1">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIdx(i); }}
              aria-label={`Image ${i + 1}`}
              className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? 'bg-white scale-125' : 'bg-white/50'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
