'use client';
import { useState } from 'react';
import Link from 'next/link';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Listings', href: '/listings' },
  { label: 'Invest', href: '/invest' },
  { label: 'About Us', href: '#' },
  { label: 'Contact', href: '/contact' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', suburbs: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const subject = encodeURIComponent(form.suburbs || 'Enquiry via Settlement OS');
    const body = encodeURIComponent(
      [
        form.name  ? `Name: ${form.name}`    : '',
        form.email ? `Email: ${form.email}`  : '',
        form.phone ? `Phone: ${form.phone}`  : '',
        '',
        form.message,
      ].filter(Boolean).join('\n')
    );
    window.location.href = `mailto:contact@settlementos.com.au?subject=${subject}&body=${body}`;
    setSubmitting(false);
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 antialiased">

      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-base">Settlement OS</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`transition-colors hover:text-indigo-600 ${l.label === 'Contact' ? 'text-indigo-600 font-semibold' : ''}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <Link href="/login" className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
            Sign in →
          </Link>
        </div>
      </header>

      {/* Hero banner */}
      <section className="bg-indigo-700 text-white">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <p className="text-indigo-300 text-sm font-semibold uppercase tracking-widest mb-3">Get in touch</p>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">Contact Settlement OS</h1>
          <p className="text-indigo-200 text-lg max-w-2xl mx-auto leading-relaxed">
            Our team specialises in Australian and Bali property settlement coordination.
            Make Settlement OS your property partner today.
          </p>
        </div>
      </section>

      {/* Form card */}
      <section className="max-w-3xl mx-auto px-6 -mt-10 pb-6 relative z-10">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 md:p-10">
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Message sent!</h3>
              <p className="text-gray-500 mb-6 max-w-xs">Thanks for reaching out. We'll get back to you within one business day.</p>
              <button
                onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', suburbs: '', message: '' }); }}
                className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Send another message
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Connect With Us</h2>
              <p className="text-gray-500 text-sm mb-8">Fill in the form below and our team will be in touch within one business day.</p>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="name">
                      Name                    </label>
                    <input id="name" name="name" type="text" value={form.name} onChange={handleChange}
                      placeholder="Jane Smith"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">
                      Email                    </label>
                    <input id="email" name="email" type="email" value={form.email} onChange={handleChange}
                      placeholder="jane@example.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="phone">
                      Phone Number                    </label>
                    <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange}
                      placeholder=""
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="suburbs">
                      Subject
                    </label>
                    <input id="suburbs" name="suburbs" type="text" value={form.suburbs} onChange={handleChange}
                      placeholder="e.g. Property enquiry"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="message">
                    Message                  </label>
                  <textarea id="message" name="message" rows={5} value={form.message} onChange={handleChange}
                    placeholder="Tell us about your property or enquiry…"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none" />
                </div>
                <button type="submit" disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 transition-colors">
                  {submitting
                    ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending…</>
                    : 'Send Message →'}
                </button>
              </form>
            </>
          )}
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-6">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <span className="font-bold text-gray-900">Settlement OS</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Coordinating property settlements and co-investment across Australia and Bali.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <p className="font-semibold text-gray-700 mb-3">Quick Links</p>
                <ul className="space-y-2 text-gray-500">
                  {[['Home', '/'], ['Listings', '/listings'], ['Invest', '/invest'], ['About Us', '#']].map(([label, href]) => (
                    <li key={label}><Link href={href} className="hover:text-indigo-600 transition-colors">{label}</Link></li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-3">Support</p>
                <ul className="space-y-2 text-gray-500">
                  {[['Contact', '/contact'], ['Privacy Policy', '#'], ['Terms of Use', '#'], ['Disclaimer', '#']].map(([label, href]) => (
                    <li key={label}><Link href={href} className="hover:text-indigo-600 transition-colors">{label}</Link></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-100 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
            <span>&copy; {new Date().getFullYear()} BALIPROP LLC. All rights reserved.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
