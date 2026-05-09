export function ContactBlock({ config = {} }) {
  const { title = 'Contact Us', email = '', phone = '', address = '', additional = '' } = config;

  return (
    <section className="border-b border-border py-16">
      <div className="max-w-4xl mx-auto px-6 space-y-8">
        <h2 className="font-display text-4xl text-text">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-sans">
          {email && (
            <div className="space-y-1">
              <p className="font-mono uppercase text-xs text-text-muted">Email</p>
              <a href={`mailto:${email}`} className="text-text hover:text-accent transition-colors">{email}</a>
            </div>
          )}
          {phone && (
            <div className="space-y-1">
              <p className="font-mono uppercase text-xs text-text-muted">Phone</p>
              <a href={`tel:${phone}`} className="text-text hover:text-accent transition-colors">{phone}</a>
            </div>
          )}
          {address && (
            <div className="space-y-1">
              <p className="font-mono uppercase text-xs text-text-muted">Address</p>
              <p className="text-text">{address}</p>
            </div>
          )}
          {additional && (
            <div className="space-y-1">
              <p className="font-mono uppercase text-xs text-text-muted">Additional Info</p>
              <p className="text-text">{additional}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
