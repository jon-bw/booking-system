import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DEFAULT_SLIDES = [
  { url: '', caption: '' },
];

export function BannerCarouselBlock({ config = {} }) {
  const { title, slides = DEFAULT_SLIDES, autoPlay = true, interval = 5000, height = 64 } = config;
  const [current, setCurrent] = useState(0);
  const validSlides = slides.filter((s) => s.url && s.url.trim());

  const next = useCallback(() => {
    if (validSlides.length <= 1) return;
    setCurrent((prev) => (prev + 1) % validSlides.length);
  }, [validSlides.length]);

  const prev = useCallback(() => {
    if (validSlides.length <= 1) return;
    setCurrent((prev) => (prev - 1 + validSlides.length) % validSlides.length);
  }, [validSlides.length]);

  useEffect(() => {
    if (!autoPlay || validSlides.length <= 1) return;
    const timer = setInterval(next, interval * 1000);
    return () => clearInterval(timer);
  }, [autoPlay, interval, next, validSlides.length]);

  if (validSlides.length === 0) {
    return (
      <div className="bg-bg border-b border-border py-16 text-center">
        <p className="font-mono uppercase text-sm text-text-muted">Add images to create a carousel</p>
      </div>
    );
  }

  return (
    <section className="relative overflow-hidden" style={{ height: `calc(${height}vh)` }}>
      {/* Slides */}
      {validSlides.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
        >
          <img
            src={slide.url}
            alt={slide.caption || ''}
            className="w-full h-full object-cover"
          />
          {slide.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
              <p className="font-sans text-lg text-white">{slide.caption}</p>
            </div>
          )}
        </div>
      ))}

      {/* Title overlay */}
      {title && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/40 to-transparent p-6">
          <h2 className="font-display text-3xl text-white text-center drop-shadow-lg">{title}</h2>
        </div>
      )}

      {/* Prev button */}
      {validSlides.length > 1 && (
        <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Next button */}
      {validSlides.length > 1 && (
        <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors">
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Dots indicator */}
      {validSlides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {validSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-white w-4' : 'bg-white/50'}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
