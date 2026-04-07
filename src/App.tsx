import React from 'react';
import Hero from './components/Hero';
import BPlayer from './components/BPlayer';
import Services from './components/Services';
import Process from './components/Process';
import OrderForm from './components/OrderForm';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen selection:bg-accent selection:text-white">
      <Hero />
      <BPlayer />
      <Services />
      <Process />
      <OrderForm />
      <Footer />
    </div>
  );
}
