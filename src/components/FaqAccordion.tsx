import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { useCMSContext } from '../context/CMSContext';
import LayoutContainer from './LayoutContainer';

export default function FaqAccordion() {
  const { faqs } = useCMSContext();
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq-section" className="py-16 bg-vanilla-secondary">
      <LayoutContainer className="max-w-4xl">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-primary font-mono bg-brand-primary/5 px-3.5 py-1.5 rounded-full border border-brand-primary/10">
            Got Questions?
          </span>
          <h2 className="text-3xl font-bold font-display tracking-tight text-brand-secondary sm:text-4xl mt-4">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-sm text-text-secondary">
            Everything you need to know about preparing professional legal drafts on Kartigo Draft.
          </p>
        </div>

        {/* Accordions List */}
        <div id="faq-accordions-container" className="space-y-4">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                id={`faq-item-box-${faq.id}`}
                key={faq.id}
                className="border border-vanilla-main rounded-[20px] bg-white overflow-hidden transition-all duration-300 hover:border-brand-primary/40 card-shadow"
              >
                <button
                  id={`faq-trigger-${faq.id}`}
                  onClick={() => toggleAccordion(faq.id)}
                  type="button"
                  className="w-full flex items-center justify-between text-left p-5 text-sm sm:text-base font-bold font-display text-brand-secondary hover:text-brand-primary transition-colors focus:outline-hidden cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-text-light shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-brand-primary' : ''
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-content-box-${faq.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-text-secondary leading-relaxed border-t border-vanilla-main">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </LayoutContainer>
    </section>
  );
}
