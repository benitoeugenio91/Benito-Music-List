import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { motion } from 'motion/react';

export default function OrderForm() {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    event: '',
    genre: 'Поп',
    details: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = `Привіт, Беніто! Хочу замовити трек.%0A%0AІм'я: ${formData.name}%0AКонтакт: ${formData.contact}%0AПривід: ${formData.event}%0AЖанр: ${formData.genre}%0AДеталі: ${formData.details}`;
    window.open(`https://t.me/Benito_Eugenio?text=${message}`, '_blank');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section id="order" className="py-24 bg-bg-secondary">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass p-8 md:p-12"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Замовити шедевр</h2>
              <p className="text-text-secondary">Заповни форму, і ми створимо щось неймовірне разом.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">Ім'я замовника</label>
                  <input 
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-accent transition-colors"
                    placeholder="Як до тебе звертатися?"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">Контакт (TG / Тел)</label>
                  <input 
                    required
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-accent transition-colors"
                    placeholder="@username або +380..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">Привід / Подія</label>
                <input 
                  required
                  name="event"
                  value={formData.event}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-accent transition-colors"
                  placeholder="День народження, річниця, весілля..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">Жанр / Настрій</label>
                <select 
                  name="genre"
                  value={formData.genre}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-accent transition-colors appearance-none"
                >
                  <option className="bg-bg-secondary">Поп</option>
                  <option className="bg-bg-secondary">Реп</option>
                  <option className="bg-bg-secondary">Рок</option>
                  <option className="bg-bg-secondary">Оркестр</option>
                  <option className="bg-bg-secondary">Інше</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">Деталі та побажання</label>
                <textarea 
                  required
                  name="details"
                  value={formData.details}
                  onChange={handleChange}
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-accent transition-colors resize-none"
                  placeholder="Розкажи більше про людину, історію або особливі моменти..."
                />
              </div>

              <button type="submit" className="btn-accent w-full flex items-center justify-center gap-3">
                <Send className="w-5 h-5" />
                Відправити замовлення
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
