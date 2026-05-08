import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Shield,
  Users,
  Building2,
  Clock,
  BarChart3,
  Zap,
  ArrowRight,
  Star,
  Menu,
  X,
} from 'lucide-react';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-bg/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="font-display text-xl text-text tracking-tight">
          BookSpace
        </a>

        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="font-mono text-xs uppercase text-text-muted hover:text-text transition-colors"
            >
              {l.label}
            </a>
          ))}
          <Link
            to="/login"
            className="font-mono text-xs uppercase text-bg bg-text rounded-full px-5 py-2 hover:opacity-90 transition-opacity"
          >
            Sign In
          </Link>
        </div>

        <button
          className="md:hidden text-text"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-surface border-b border-border px-6 py-4 space-y-3">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block font-mono text-xs uppercase text-text-muted hover:text-text transition-colors"
            >
              {l.label}
            </a>
          ))}
          <Link
            to="/login"
            onClick={() => setOpen(false)}
            className="inline-block font-mono text-xs uppercase text-bg bg-text rounded-full px-5 py-2"
          >
            Sign In
          </Link>
        </div>
      )}
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-surface border border-border rounded-full px-4 py-1.5 mb-8">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="font-mono text-xs text-text-muted uppercase">
            Now open for early access
          </span>
        </div>

        <h1 className="font-display text-5xl md:text-7xl text-text leading-[1.05] max-w-4xl mx-auto">
          Room booking,
          <br />
          <span className="text-accent">without the chaos.</span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-text-muted max-w-2xl mx-auto leading-relaxed">
          A multi-tenant booking platform with built-in role-based access.
          Manage rooms, teams, and reservations across organizations from one place.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/home"
            className="inline-flex items-center gap-2 bg-accent text-white font-mono uppercase text-sm rounded-full px-8 py-4 hover:opacity-90 transition-opacity"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#demo"
            className="inline-flex items-center gap-2 border border-border text-text font-mono uppercase text-sm rounded-full px-8 py-4 hover:bg-surface transition-colors"
          >
            See the Demo
          </a>
        </div>

        <p className="mt-4 font-mono text-xs text-text-muted">
          No credit card required. Free for up to 2 tenants.
        </p>
      </div>

      {/* Decorative gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/5 rounded-full blur-3xl -z-10 pointer-events-none" />
    </section>
  );
}

function StatsBar() {
  const stats = [
    { value: '10K+', label: 'Bookings managed' },
    { value: '500+', label: 'Teams onboarded' },
    { value: '99.9%', label: 'Uptime SLA' },
    { value: '<2min', label: 'Setup time' },
  ];

  return (
    <section className="border-y border-border bg-surface/50">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl md:text-4xl text-text">{s.value}</p>
              <p className="font-mono text-xs uppercase text-text-muted mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ValueProp() {
  const beforeAfter = [
    {
      title: 'Before BookSpace',
      icon: <Clock className="w-5 h-5 text-destructive" />,
      items: [
        'Double-booked rooms with no visibility',
        'Manual spreadsheets and back-and-forth emails',
        'No control over who can book what',
      ],
    },
    {
      title: 'After BookSpace',
      icon: <Zap className="w-5 h-5 text-success" />,
      items: [
        'Real-time availability across all tenants',
        'One dashboard. Zero confusion.',
        'RBAC: admins, managers, users — each with clear limits',
      ],
    },
  ];

  return (
    <section id="value" className="py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="font-mono text-xs uppercase text-accent mb-3">The Value Add</p>
          <h2 className="font-display text-3xl md:text-5xl text-text">
            Stop losing time to scheduling mess.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {beforeAfter.map((col) => (
            <div
              key={col.title}
              className="bg-surface border border-border p-8 space-y-6"
            >
              <div className="flex items-center gap-3">
                {col.icon}
                <h3 className="font-sans text-lg font-medium text-text">{col.title}</h3>
              </div>
              <ul className="space-y-4">
                {col.items.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-text-muted">
                    {col.title.startsWith('Before') ? (
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-destructive/60 shrink-0" />
                    ) : (
                      <Check className="w-4 h-4 text-success mt-0.5 shrink-0" />
                    )}
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: <Building2 className="w-6 h-6 text-accent" />,
      title: 'Multi-tenant Architecture',
      desc: 'Each organization gets its own isolated space with rooms, bookings, and user roles.',
    },
    {
      icon: <Shield className="w-6 h-6 text-accent" />,
      title: 'Role-Based Access Control',
      desc: 'Superadmin, admin, manager, and user roles with precisely scoped permissions.',
    },
    {
      icon: <Calendar className="w-6 h-6 text-accent" />,
      title: 'Conflict-Free Booking',
      desc: 'Real-time availability checks prevent double bookings automatically.',
    },
    {
      icon: <Users className="w-6 h-6 text-accent" />,
      title: 'Team Management',
      desc: 'Admins create tenants and assign managers and users within their organization.',
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-accent" />,
      title: 'Admin Dashboards',
      desc: 'Tenant-scoped and global superadmin panels to monitor usage and manage assets.',
    },
    {
      icon: <Clock className="w-6 h-6 text-accent" />,
      title: 'Soft-delete & History',
      desc: 'Rooms can be soft-deleted while preserving historical booking records.',
    },
  ];

  return (
    <section id="features" className="py-24 md:py-32 bg-surface/30">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="font-mono text-xs uppercase text-accent mb-3">Features</p>
          <h2 className="font-display text-3xl md:text-5xl text-text">
            Everything you need to run bookings at scale.
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="group bg-bg border border-border p-6 hover:border-accent transition-colors"
            >
              <div className="mb-4">{f.icon}</div>
              <h3 className="font-sans text-lg font-medium text-text mb-2">{f.title}</h3>
              <p className="text-text-muted text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DemoPreview() {
  return (
    <section id="demo" className="py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="font-mono text-xs uppercase text-accent mb-3">Interactive Demo</p>
          <h2 className="font-display text-3xl md:text-5xl text-text">
            See it in action.
          </h2>
        </div>

        <div className="relative bg-surface border border-border rounded-lg overflow-hidden">
          {/* Fake browser chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-bg">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-destructive/60" />
              <div className="w-3 h-3 rounded-full bg-text-muted/40" />
              <div className="w-3 h-3 rounded-full bg-success/60" />
            </div>
            <div className="flex-1 mx-4">
              <div className="max-w-md mx-auto bg-bg border border-border rounded-full px-4 py-1 text-center font-mono text-xs text-text-muted">
                bookspace.io / acme-corp / admin
              </div>
            </div>
          </div>

          {/* Fake dashboard content */}
          <div className="p-6 md:p-10 grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-sans text-lg text-text">Dashboard</div>
                  <div className="font-mono text-xs text-text-muted mt-1">Acme Corp — 12 rooms</div>
                </div>
                <div className="bg-accent text-white font-mono text-xs uppercase rounded-full px-4 py-2">
                  + New Room
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-bg border border-border p-4">
                  <div className="font-mono text-xs text-text-muted uppercase">Bookings today</div>
                  <div className="font-display text-3xl text-text mt-1">24</div>
                </div>
                <div className="bg-bg border border-border p-4">
                  <div className="font-mono text-xs text-text-muted uppercase">Available now</div>
                  <div className="font-display text-3xl text-text mt-1">8</div>
                </div>
              </div>
              <div className="bg-bg border border-border p-4 space-y-3">
                <div className="font-mono text-xs text-text-muted uppercase">Recent bookings</div>
                {['Conference A — 2:00 PM', 'Focus Room B — 3:30 PM', 'Zoom Pod 1 — 4:00 PM'].map(
                  (b) => (
                    <div
                      key={b}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <span className="text-sm text-text">{b}</span>
                      <span className="font-mono text-xs text-success uppercase">Confirmed</span>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-bg border border-border p-4">
                <div className="font-mono text-xs text-text-muted uppercase mb-3">Team</div>
                {['Sarah Chen', 'Mike Ross', 'Emily Park'].map((name, i) => (
                  <div key={name} className="flex items-center gap-3 py-2">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center font-mono text-xs text-accent">
                      {name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm text-text">{name}</div>
                      <div className="font-mono text-xs text-text-muted">
                        {i === 0 ? 'Admin' : 'User'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-bg border border-border p-4">
                <div className="font-mono text-xs text-text-muted uppercase mb-2">Quick Actions</div>
                <div className="space-y-2">
                  <div className="text-sm text-text hover:text-accent cursor-pointer transition-colors">
                    Manage rooms
                  </div>
                  <div className="text-sm text-text hover:text-accent cursor-pointer transition-colors">
                    View calendar
                  </div>
                  <div className="text-sm text-text hover:text-accent cursor-pointer transition-colors">
                    Invite user
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Create your tenant',
      desc: 'Sign up and create an organization. Each tenant is fully isolated with its own rooms and users.',
    },
    {
      num: '02',
      title: 'Add rooms & roles',
      desc: 'Set up rooms, assign managers to handle day-to-day bookings, and invite team members.',
    },
    {
      num: '03',
      title: 'Book with confidence',
      desc: 'Team members browse availability, book rooms in real time, and managers track everything.',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-surface/30">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="font-mono text-xs uppercase text-accent mb-3">How It Works</p>
          <h2 className="font-display text-3xl md:text-5xl text-text">
            Up and running in minutes.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.num} className="relative">
              <div className="font-display text-6xl text-text-muted/10">{s.num}</div>
              <h3 className="font-sans text-xl font-medium text-text mt-2 mb-3">{s.title}</h3>
              <p className="text-text-muted text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const reviews = [
    {
      quote:
        'We went from spreadsheet chaos to a clean booking system in under an hour. The RBAC setup is exactly what we needed.',
      author: 'Alex Rivera',
      role: 'Operations Lead, Studio Nine',
    },
    {
      quote:
        'Managing three coworking locations used to be a nightmare. Now each location is a tenant with its own managers and rooms.',
      author: 'Priya K.',
      role: 'Founder, Desk Collective',
    },
    {
      quote:
        'The conflict prevention alone saved us 5+ hours a week. No more angry emails about double-booked conference rooms.',
      author: 'Marcus L.',
      role: 'Office Manager, Volt Systems',
    },
  ];

  return (
    <section className="py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="font-mono text-xs uppercase text-accent mb-3">Customer Proof</p>
          <h2 className="font-display text-3xl md:text-5xl text-text">
            Loved by teams who ship.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div key={r.author} className="bg-surface border border-border p-6 flex flex-col">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-accent fill-accent" />
                ))}
              </div>
              <p className="text-text text-sm leading-relaxed flex-1">&ldquo;{r.quote}&rdquo;</p>
              <div className="mt-6 pt-4 border-t border-border">
                <p className="font-sans text-sm font-medium text-text">{r.author}</p>
                <p className="font-mono text-xs text-text-muted mt-0.5">{r.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    {
      name: 'Starter',
      price: '$0',
      period: '/mo',
      desc: 'For small teams getting started.',
      features: [
        'Up to 2 tenants',
        '5 rooms per tenant',
        'Unlimited bookings',
        'Basic RBAC',
        'Email support',
      ],
      cta: 'Start Free',
      highlight: false,
    },
    {
      name: 'Pro',
      price: '$49',
      period: '/mo',
      desc: 'For growing organizations.',
      features: [
        'Up to 10 tenants',
        'Unlimited rooms',
        'Unlimited bookings',
        'Full RBAC + custom roles',
        'Priority support',
        'Booking analytics',
      ],
      cta: 'Get Started',
      highlight: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      desc: 'For large-scale deployments.',
      features: [
        'Unlimited tenants',
        'Unlimited rooms',
        'SSO & SAML',
        'Audit logs',
        'Dedicated support',
        'Custom integrations',
      ],
      cta: 'Contact Sales',
      highlight: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 md:py-32 bg-surface/30">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="font-mono text-xs uppercase text-accent mb-3">Pricing</p>
          <h2 className="font-display text-3xl md:text-5xl text-text">
            Simple, transparent pricing.
          </h2>
          <p className="text-text-muted mt-4 max-w-lg mx-auto">
            Start free. Upgrade when you need more tenants, rooms, or advanced controls.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative border p-8 flex flex-col ${
                plan.highlight
                  ? 'border-accent bg-surface'
                  : 'border-border bg-bg'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white font-mono text-xs uppercase px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              <h3 className="font-sans text-lg font-medium text-text">{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-4xl text-text">{plan.price}</span>
                <span className="font-mono text-sm text-text-muted">{plan.period}</span>
              </div>
              <p className="text-text-muted text-sm mt-2">{plan.desc}</p>

              <ul className="mt-6 space-y-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-text">
                    <Check className="w-4 h-4 text-success mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/home"
                className={`mt-8 inline-flex items-center justify-center font-mono uppercase text-sm rounded-full py-3 transition-opacity hover:opacity-90 ${
                  plan.highlight
                    ? 'bg-accent text-white'
                    : 'border border-border text-text hover:bg-surface'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    {
      q: 'What is a tenant?',
      a: 'A tenant is an isolated organization space. Think of it as a container that holds its own rooms, bookings, and users. You can manage multiple tenants from a single account.',
    },
    {
      q: 'Can I assign different roles to my team?',
      a: 'Absolutely. BookSpace supports superadmin, admin, manager, and user roles. Admins create tenants and assign managers to run day-to-day operations. Managers can manage rooms and bookings within their tenant.',
    },
    {
      q: 'Is there a free plan?',
      a: 'Yes. The Starter plan is free forever for up to 2 tenants and 5 rooms per tenant. No credit card required to sign up.',
    },
    {
      q: 'How does conflict prevention work?',
      a: 'When a booking is created or updated, the system checks for overlapping reservations in real time. If a conflict is detected, the booking is rejected with a clear message.',
    },
    {
      q: 'Can I export booking data?',
      a: 'Yes. Pro and Enterprise plans include analytics dashboards and CSV export functionality for all bookings within a tenant.',
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="faq" className="py-24 md:py-32">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="font-mono text-xs uppercase text-accent mb-3">FAQ</p>
          <h2 className="font-display text-3xl md:text-5xl text-text">
            Questions? Answered.
          </h2>
        </div>

        <div className="space-y-4">
          {items.map((item, i) => (
            <div key={i} className="bg-surface border border-border">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="font-sans text-base font-medium text-text pr-4">{item.q}</span>
                {openIndex === i ? (
                  <ChevronUp className="w-5 h-5 text-text-muted shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-text-muted shrink-0" />
                )}
              </button>
              {openIndex === i && (
                <div className="px-6 pb-6 text-text-muted text-sm leading-relaxed">{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTABanner() {
  return (
    <section className="py-24 md:py-32 bg-surface/30">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="font-display text-3xl md:text-5xl text-text">
          Ready to end the booking chaos?
        </h2>
        <p className="text-text-muted mt-4 max-w-lg mx-auto">
          Join hundreds of teams who use BookSpace to manage rooms, teams, and reservations without the headaches.
        </p>
        <div className="mt-10">
          <Link
            to="/home"
            className="inline-flex items-center gap-2 bg-accent text-white font-mono uppercase text-sm rounded-full px-8 py-4 hover:opacity-90 transition-opacity"
          >
            Start Today — It&apos;s Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-bg">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <a href="/" className="font-display text-xl text-text">
              BookSpace
            </a>
            <p className="text-text-muted text-sm leading-relaxed">
              Multi-tenant room booking with built-in access control.
            </p>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase text-text-muted mb-4">Product</h4>
            <ul className="space-y-3">
              <li>
                <a href="#features" className="text-sm text-text-muted hover:text-text transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-sm text-text-muted hover:text-text transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#demo" className="text-sm text-text-muted hover:text-text transition-colors">
                  Demo
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase text-text-muted mb-4">Resources</h4>
            <ul className="space-y-3">
              <li>
                <a href="#faq" className="text-sm text-text-muted hover:text-text transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <span className="text-sm text-text-muted/50 cursor-not-allowed">Documentation</span>
              </li>
              <li>
                <span className="text-sm text-text-muted/50 cursor-not-allowed">API Reference</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase text-text-muted mb-4">Company</h4>
            <ul className="space-y-3">
              <li>
                <span className="text-sm text-text-muted/50 cursor-not-allowed">About</span>
              </li>
              <li>
                <span className="text-sm text-text-muted/50 cursor-not-allowed">Careers</span>
              </li>
              <li>
                <span className="text-sm text-text-muted/50 cursor-not-allowed">Contact</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono text-xs text-text-muted">
            &copy; {new Date().getFullYear()} BookSpace. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="font-mono text-xs text-text-muted/50 cursor-not-allowed">Privacy</span>
            <span className="font-mono text-xs text-text-muted/50 cursor-not-allowed">Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg text-text font-sans">
      <Nav />
      <Hero />
      <StatsBar />
      <ValueProp />
      <Features />
      <DemoPreview />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTABanner />
      <Footer />
    </div>
  );
}
