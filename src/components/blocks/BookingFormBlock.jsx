export function BookingFormBlock({ config = {} }) {
  const { title = 'Book a Room', showDatePicker = true, showTimePicker = true, note = '' } = config;

  return (
    <section className="border-b border-border py-16">
      <div className="max-w-4xl mx-auto px-6 space-y-6">
        <h2 className="font-display text-4xl text-text">{title}</h2>
        <div className="bg-surface border border-border p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {showDatePicker && (
              <div className="space-y-1">
                <label className="font-mono uppercase text-xs text-text-muted">Date</label>
                <input
                  type="date"
                  className="w-full bg-bg border border-border rounded-full px-4 py-2 text-sm text-text font-mono focus:outline-none focus:border-accent"
                />
              </div>
            )}
            {showTimePicker && (
              <div className="space-y-1">
                <label className="font-mono uppercase text-xs text-text-muted">Time</label>
                <input
                  type="time"
                  className="w-full bg-bg border border-border rounded-full px-4 py-2 text-sm text-text font-mono focus:outline-none focus:border-accent"
                />
              </div>
            )}
          </div>
          <button className="font-mono uppercase rounded-full border border-border px-6 py-2 text-sm text-text hover:bg-surface hover:border-accent hover:text-accent transition-colors">
            Check Availability
          </button>
          {note && (
            <p className="font-mono text-xs text-text-muted">{note}</p>
          )}
        </div>
      </div>
    </section>
  );
}
