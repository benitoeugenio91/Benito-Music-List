import React from 'react';
import { motion } from 'motion/react';

const steps = [
  {
    number: "01",
    title: "Надаєш інфо",
    description: "Розповідаєш про людину або подію, яку хочеш увічнити в музиці."
  },
  {
    number: "02",
    title: "Узгоджуємо настрій",
    description: "Обираємо жанр, стиль та емоційне забарвлення майбутнього треку."
  },
  {
    number: "03",
    title: "Отримуєш шедевр",
    description: "Готовий трек із студійним звучанням, що перевершить очікування."
  }
];

export default function Process() {
  return (
    <section className="p-8 md:p-12 overflow-hidden">
      <div className="relative max-w-6xl mx-auto">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-px bg-white/10 -translate-y-1/2" />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-bg-primary border-2 border-accent rounded-full flex items-center justify-center mx-auto mb-8 relative">
                  <span className="text-2xl font-black text-accent">{step.number}</span>
                  {/* Pulse effect */}
                  <div className="absolute inset-0 bg-accent/20 rounded-full animate-ping" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-text-secondary max-w-xs mx-auto">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
      </div>
    </section>
  );
}
