export function HeroBlock({ config = {} }) {
  const { title = 'Welcome', subtitle = '', ctaText = '', ctaLink = '#', backgroundImage = '' } = config;

  return (
    <section
      className="relative border-b border-border py-24 sm:py-32"
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
    >
      <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
        <h1 className="font-display text-5xl sm:text-7xl text-text leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="font-sans text-xl text-text-muted max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
        {ctaText && (
          <a
            href={ctaLink}
            className="inline-block font-mono uppercase rounded-full border border-border px-8 py-3 text-sm text-text hover:bg-surface hover:border-accent hover:text-accent transition-colors"
          >
            {ctaText}
          </a>
        )}
      </div>
    </section>
  );
}
