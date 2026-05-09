export function TestimonialsBlock({ config = {} }) {
  const { title = 'What People Say', testimonials = [] } = config;

  if (!testimonials || testimonials.length === 0) {
    return (
      <section className="border-b border-border py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-display text-4xl text-text">{title}</h2>
          <p className="font-mono uppercase text-sm text-text-muted mt-8">No testimonials yet</p>
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-border py-16">
      <div className="max-w-4xl mx-auto px-6 space-y-8">
        <h2 className="font-display text-4xl text-text text-center">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="border border-border p-6 space-y-3">
              <p className="font-sans text-text-muted italic">
                &ldquo;{t.quote}&rdquo;
              </p>
              <p className="font-mono text-xs text-text">
                — {t.author}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
