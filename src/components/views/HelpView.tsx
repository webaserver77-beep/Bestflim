import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { HelpCircle, Send, CheckCircle2, MessageCircle } from 'lucide-react';
import { addSupportMessage } from '../../data/adsAndMessages';

export const HelpView: React.FC = () => {
  const { lang, t } = useLanguage();

  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    addSupportMessage({
      name: formData.name,
      email: formData.email,
      subject: formData.subject || 'Support & Feedback Request',
      message: formData.message,
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 5000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
      
      {/* Header Banner */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-800/40 text-red-400 text-xs font-bold uppercase tracking-wider">
          <HelpCircle className="w-4 h-4" />
          <span>{t('navHelp')} Best Films</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          {t('helpTitle')}
        </h1>

        <p className="text-zinc-400 text-sm leading-relaxed">
          {lang === 'rw' 
            ? 'Murakaza neza mu ruhande rw\'ubufasha bwa Best Films. Twandikire igitekerezo cyangwa ikibazo kuri WhatsApp cyangwa uduhereze ubutumwa.'
            : 'Welcome to Best Films support. Contact us directly on WhatsApp or send us a message below.'}
        </p>
      </div>

      {/* WhatsApp Quick Direct Contact Card */}
      <div className="bg-gradient-to-r from-emerald-950/90 via-zinc-900 to-zinc-900 border border-emerald-600/40 rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <MessageCircle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-black text-white">
              {t('whatsappContactTitle')}
            </h3>
            <p className="text-xs md:text-sm text-zinc-300 mt-1">
              {t('whatsappSubtext')}
            </p>
          </div>
        </div>

        <a
          id="whatsapp-direct-link"
          href="https://wa.me/250796119924?text=Muraho%20Best%20Films%20Support!%20Nshaka%20gutanga%20igitekerezo:"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/80 flex items-center justify-center space-x-2 transition-transform hover:scale-105 whitespace-nowrap text-sm"
        >
          <MessageCircle className="w-5 h-5 fill-current" />
          <span>{t('whatsappContactBtn')}</span>
        </a>
      </div>

      {/* Support & Feedback Contact Form */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl max-w-2xl mx-auto">
        <div>
          <h2 className="text-xl font-black text-white flex items-center space-x-2">
            <Send className="w-5 h-5 text-blue-500" />
            <span>{t('contactFormTitle')}</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {lang === 'rw' 
              ? 'Twandikire igitekerezo, ikibazo cyangwa isaba rya filme nshya.'
              : 'Send us feedback, report issues, or request new movies.'}
          </p>
        </div>

        {submitted ? (
          <div className="p-6 rounded-2xl bg-emerald-950/50 border border-emerald-600/50 text-emerald-200 space-y-3 text-center animate-fadeIn">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="font-bold text-lg text-white">
              {t('messageSentSuccess')}
            </h3>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-400 block mb-1">
                {t('contactName')} *
              </label>
              <input
                id="contact-form-name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Kagabo Alex"
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-red-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 block mb-1">
                {t('contactEmail')} *
              </label>
              <input
                id="contact-form-email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="alex@gmail.com"
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-red-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 block mb-1">
                {t('contactSubject')}
              </label>
              <input
                id="contact-form-subject"
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Isaba rya filme nshya / Feedback"
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-red-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 block mb-1">
                {t('contactMessage')} *
              </label>
              <textarea
                id="contact-form-message"
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder={lang === 'rw' ? 'Ndashaka gusaba ko mushyiramo...' : 'I would like to request...'}
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-red-600"
              />
            </div>

            <button
              id="contact-form-submit-btn"
              type="submit"
              className="w-full py-3.5 rounded-xl font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/50 transition-all flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{t('sendBtn')}</span>
            </button>
          </form>
        )}

      </div>

    </div>
  );
};
