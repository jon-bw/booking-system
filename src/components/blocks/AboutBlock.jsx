export function AboutBlock({ config = {} }) {
  const { title = 'About Us', content = '' } = config;

  return (
    <section className="border-b border-border py-16">
      <div className="max-w-4xl mx-auto px-6 space-y-6">
        <h2 className="font-display text-4xl text-text">{title}</h2>
        {content && (
          <p className="font-sans text-text-muted whitespace-pre-wrap leading-relaxed">
            {content}
          </p>
        )}
      </div>
    </section>
  );
}
