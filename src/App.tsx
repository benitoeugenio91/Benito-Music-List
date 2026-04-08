import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import Hero from './components/Hero';
import BPlayer from './components/BPlayer';
import Services from './components/Services';
import Process from './components/Process';
import OrderForm from './components/OrderForm';
import Footer from './components/Footer';

type ViewState = 'home' | 'player' | 'services' | 'process' | 'order';

export default function App() {
  const [activeView, setActiveView] = useState<ViewState>('home');

  const closeModal = () => setActiveView('home');

  const Modal = ({ children, title }: { children: React.ReactNode, title: string }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
    >
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-xl" 
        onClick={closeModal}
      />
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        className="glass w-full max-w-5xl max-h-[90vh] overflow-hidden relative z-10 flex flex-col"
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
          <h2 className="text-xl font-bold tracking-tight uppercase">{title}</h2>
          <button 
            onClick={closeModal}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="h-screen w-screen overflow-hidden bg-bg-primary relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/5 blur-[150px] rounded-full translate-y-1/2 -translate-x-1/3 pointer-events-none" />

      <Hero onNavigate={setActiveView} />

      <AnimatePresence>
        {activeView === 'player' && (
          <Modal title="B-PLAYER">
            <BPlayer />
          </Modal>
        )}
        {activeView === 'services' && (
          <Modal title="Послуги">
            <Services />
          </Modal>
        )}
        {activeView === 'process' && (
          <Modal title="Як це працює">
            <Process />
          </Modal>
        )}
        {activeView === 'order' && (
          <Modal title="Замовити трек">
            <OrderForm />
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
