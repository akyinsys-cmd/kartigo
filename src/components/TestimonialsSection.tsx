import React from 'react';
import { Star, ShieldAlert } from 'lucide-react';
import { testimonials } from '../data/landingData';

export default function TestimonialsSection() {
  return (
    <section id="testimonials-section" className="py-20 bg-vanilla-alt">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-primary font-mono bg-brand-primary/5 px-3.5 py-1.5 rounded-full border border-brand-primary/10">
            Client Stories
          </span>
          <h2 className="text-3xl font-bold font-display tracking-tight text-brand-secondary sm:text-4xl mt-4">
            Trusted by Builders & Managers
          </h2>
          
          {/* Vetting disclaimer badge */}
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-[10px] text-amber-700 font-bold uppercase tracking-wider font-mono">
            <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
            <span>Demonstration Sample Content — Simulated for Preview</span>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div id="testimonials-grid" className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((test) => (
            <div
              id={test.id}
              key={test.id}
              className="bg-white p-6 sm:p-8 rounded-[20px] border border-vanilla-main card-shadow flex flex-col justify-between hover:border-brand-primary/40 transition-all duration-300"
            >
              <div>
                {/* Stars group */}
                <div className="flex gap-0.5 text-amber-400 mb-5">
                  {Array.from({ length: test.rating }).map((_, i) => (
                    <Star key={i} className="h-4.5 w-4.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <blockquote className="text-xs sm:text-sm text-text-secondary leading-relaxed italic">
                  "{test.content}"
                </blockquote>
              </div>

              <div className="mt-6 pt-5 border-t border-vanilla-main flex items-center gap-3">
                {/* Avatar Initials circle */}
                <div className="h-10 w-10 rounded-full bg-brand-secondary text-white font-bold text-xs flex items-center justify-center font-display">
                  {test.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <span className="block text-xs font-extrabold text-brand-secondary font-display">
                    {test.name}
                  </span>
                  <span className="block text-[10px] font-medium text-text-light">
                    {test.role}, <span className="font-semibold text-text-secondary">{test.company}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
