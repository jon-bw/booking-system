export function CTABlock({ config = {} }) {
  const { title = 'Ready to Book?', subtitle = '', buttonText = 'Get Started', buttonLink = '#' } = config;

  return (
    <section className="border-b border-border py-16">
      <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
        <h2 className="font-display text-4xl text-text">{title}</h2>
        {subtitle && (
          <p className="font-sans text-lg text-text-muted">{subtitle}</p>
        )}
        {buttonText && (
          <a
            href={buttonLink}
            className="inline-block font-mono uppercase rounded-full border border-border px-8 py-3 text-sm text-text hover:bg-surface hover:border-accent hover:text-accent transition-colors"
          >
            {buttonText}
          </a>
        )}
      </div>
    </section>
  );
}
