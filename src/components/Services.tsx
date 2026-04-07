import React from 'react';
import { Mic2, Music2, Radio, Zap } from 'lucide-react';
import { motion } from 'motion/react';

const services = [
  {
    icon: <Mic2 className="w-8 h-8 text-accent" />,
    title: "Авторський текст",
    description: "Індивідуальні тексти з твоїми іменами та спогадами. Кожне слово має значення."
  },
  {
    icon: <Music2 className="w-8 h-8 text-accent" />,
    title: "Будь-який жанр",
    description: "Поп, реп, рок, оркестр — під твій настрій. Ми не обмежені форматами."
  },
  {
    icon: <Radio className="w-8 h-8 text-accent" />,
    title: "Студійний звук",
    description: "Рівень, що звучить на кіловатній апаратурі. Професійний зведення та мастеринг."
  },
  {
    icon: <Zap className="w-8 h-8 text-accent" />,
    title: "Швидкий результат",
    description: "Ніякої тяганини, чіткий процес. Твій шедевр буде готовий вчасно."
  }
];

export default function Services() {
  return (
    <section id="services" className="p-8 md:p-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass p-8 hover:bg-white/10 transition-all group"
            >
              <div className="mb-6 group-hover:scale-110 transition-transform duration-300">
                {service.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
              <p className="text-text-secondary leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
      </div>
    </section>
  );
}
