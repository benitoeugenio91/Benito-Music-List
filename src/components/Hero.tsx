import React from 'react';
import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-bg-primary">
      {/* Decorative Halo */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3" />
      
      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-4">
            BENITO <span className="text-accent">EUGENIO</span>
          </h1>
          <p className="text-xl md:text-2xl text-text-secondary font-light tracking-widest uppercase mb-12">
            Саунд, який рве шаблони
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a href="#order" className="btn-accent w-full sm:w-auto">
              Замовити трек
            </a>
            <a href="#player" className="btn-glass w-full sm:w-auto">
              Слухати B-PLAYER
            </a>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-text-secondary"
      >
        <ChevronDown className="w-8 h-8" />
      </motion.div>
    </section>
  );
}
