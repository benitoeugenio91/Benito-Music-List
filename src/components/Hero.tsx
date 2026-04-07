import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music, Zap, MessageSquare, Info, Send, Instagram, Facebook, ChevronRight } from 'lucide-react';

interface HeroProps {
  onNavigate: (view: any) => void;
}

const authorSteps = [
  {
    id: 0,
    text: "Автор оригінальних текстів пісень різних жанрів, композитор унікальних саундів та майстер музичного продакшну."
  },
  {
    id: 1,
    text: "Замість банальних дрібниць чи чергового конверта з грошима подаруйте близькій людині справжню емоцію — те, що неможливо купити, але про що завжди можна домовитися з Беніто Еудженіо."
  },
  {
    id: 2,
    text: "Я обіцяю три речі: ваша пісня обов'язково викличе три головні почуття — ностальгію, щирий сміх та сльози радості."
  }
];

export default function Hero({ onNavigate }: HeroProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    setCurrentStep((prev) => (prev + 1) % authorSteps.length);
  };

  return (
    <section className="h-full flex flex-col items-center justify-between py-12 px-4 relative overflow-y-auto custom-scrollbar">
      {/* Top Branding */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <span className="text-accent font-mono text-[10px] tracking-[0.5em] uppercase mb-2 block">
          Benito Eugenio Official
        </span>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
          BENITO<br/><span className="text-accent">EUGENIO</span>
        </h1>
      </motion.div>

      {/* Interactive Proposition Card */}
      <div className="w-full max-w-2xl my-6 flex flex-col items-center">
        <motion.div
          onClick={nextStep}
          className="glass p-8 md:p-12 w-full border-white/10 relative overflow-hidden cursor-pointer group min-h-[200px] flex items-center justify-center"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          {/* Subtle background glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/10 blur-3xl rounded-full group-hover:bg-accent/20 transition-colors duration-500" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
              transition={{ duration: 0.4, ease: "circOut" }}
              className="relative z-10 w-full"
            >
              <p className="text-lg md:text-2xl text-white font-medium leading-[1.4] text-center max-w-[90%] mx-auto">
                {authorSteps[currentStep].text}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Step Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {authorSteps.map((_, idx) => (
              <div 
                key={idx}
                className={`h-1 transition-all duration-300 rounded-full ${
                  idx === currentStep ? 'w-6 bg-accent' : 'w-2 bg-white/20'
                }`}
              />
            ))}
          </div>

          {/* Hint */}
          <div className="absolute top-4 right-4 opacity-30 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[8px] uppercase tracking-widest font-bold">
            <span>Далі</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </motion.div>
      </div>

      {/* Main Navigation Grid */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-xl mb-8">
        <NavButton 
          icon={<Music className="w-5 h-5" />} 
          label="B-PLAYER" 
          onClick={() => onNavigate('player')}
          primary
        />
        <NavButton 
          icon={<MessageSquare className="w-5 h-5" />} 
          label="Замовити" 
          onClick={() => onNavigate('order')}
        />
        <NavButton 
          icon={<Zap className="w-5 h-5" />} 
          label="Послуги" 
          onClick={() => onNavigate('services')}
        />
        <NavButton 
          icon={<Info className="w-5 h-5" />} 
          label="Процес" 
          onClick={() => onNavigate('process')}
        />
      </div>

      {/* Bottom Socials & Copyright */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col items-center gap-6"
      >
        <div className="flex items-center gap-4">
          <SocialLink href="https://t.me/Benito_Eugenio" icon={<Send className="w-4 h-4" />} />
          <SocialLink href="https://instagram.com/benito_eugenio_cse" icon={<Instagram className="w-4 h-4" />} />
          <SocialLink href="https://facebook.com/eugenio.benito.411274" icon={<Facebook className="w-4 h-4" />} />
        </div>
        <p className="text-[9px] text-text-secondary uppercase tracking-[0.2em] font-mono">
          © 2025 Benito Eugenio. All rights reserved.
        </p>
      </motion.div>
    </section>
  );
}

function NavButton({ icon, label, onClick, primary = false }: { icon: any, label: string, onClick: () => void, primary?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center justify-center gap-3 p-5 rounded-2xl transition-all duration-300 group ${
        primary 
        ? 'bg-accent text-white shadow-[0_10px_25px_rgba(255,107,0,0.3)] hover:scale-105 active:scale-95' 
        : 'glass hover:bg-white/10 active:scale-95'
      }`}
    >
      <div className={`${primary ? 'text-white' : 'text-accent'} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </button>
  );
}

function SocialLink({ href, icon }: { href: string, icon: any }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="w-10 h-10 glass flex items-center justify-center hover:bg-accent hover:border-accent transition-all group"
    >
      <div className="text-text-secondary group-hover:text-white transition-colors">
        {icon}
      </div>
    </a>
  );
}
