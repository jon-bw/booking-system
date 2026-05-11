export function GalleryBlock({ config = {} }) {
  const { title = 'Gallery', images = '' } = config;

  // Parse images: support newline-separated URL string from editor, or array format
  const parsedImages = (() => {
    if (typeof images === 'string') {
      return images.split('\n').map((u) => u.trim()).filter(Boolean).map((url, i) => ({ url, alt: `Gallery image ${i + 1}` }));
    }
    if (Array.isArray(images)) {
      return images.map((img, i) => ({
        url: img.src || img.url || '',
        alt: img.alt || `Gallery image ${i + 1}`,
      }));
    }
    return [];
  })();

  if (parsedImages.length === 0) {
    return (
      <section className="border-b border-border py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-display text-4xl text-text text-center">{title}</h2>
          <p className="font-mono uppercase text-sm text-text-muted text-center mt-8">No images yet</p>
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-border py-16">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="font-display text-4xl text-text text-center mb-12">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {parsedImages.map((img, i) => (
            <div key={i} className="border border-border aspect-video overflow-hidden">
              <img
                src={img.url}
                alt={img.alt}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
