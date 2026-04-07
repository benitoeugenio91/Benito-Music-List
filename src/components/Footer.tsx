import React from 'react';
import { Send, Instagram, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="py-12 bg-bg-primary border-t border-white/5">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-black tracking-tighter mb-2">BENITO EUGENIO</h2>
            <p className="text-text-secondary text-sm">Преміальний саунд для твоїх особливих моментів.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <a 
              href="https://t.me/Benito_Eugenio" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-12 h-12 glass flex items-center justify-center hover:bg-accent hover:border-accent transition-all group"
            >
              <Send className="w-5 h-5 group-hover:text-white" />
            </a>
            <a 
              href="https://instagram.com/benito_eugenio_cse" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-12 h-12 glass flex items-center justify-center hover:bg-accent hover:border-accent transition-all group"
            >
              <Instagram className="w-5 h-5 group-hover:text-white" />
            </a>
            <a 
              href="https://facebook.com/eugenio.benito.411274" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-12 h-12 glass flex items-center justify-center hover:bg-accent hover:border-accent transition-all group"
            >
              <Facebook className="w-5 h-5 group-hover:text-white" />
            </a>
          </div>
        </div>
        
        <div className="text-center pt-8 border-t border-white/5">
          <p className="text-text-secondary text-xs uppercase tracking-widest">
            © 2025 Benito Eugenio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
