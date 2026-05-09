export function RichTextBlock({ config = {} }) {
  const { content = '' } = config;

  if (!content) {
    return null;
  }

  return (
    <section className="border-b border-border py-16">
      <div
        className="max-w-4xl mx-auto px-6 font-sans text-text-muted leading-relaxed prose prose-invert"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </section>
  );
}
