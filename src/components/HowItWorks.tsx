import React from 'react';
import { ChevronRight } from 'lucide-react';
import LayoutContainer from './LayoutContainer';
import { 
  StepSearchIllustration, 
  StepFormIllustration, 
  StepReviewIllustration, 
  StepExportIllustration 
} from './Illustrations';

export default function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Choose your document',
      description: 'Select from over 100+ expert-certified templates or search what you need.',
      illustration: StepSearchIllustration,
      bgColor: 'bg-vanilla-main border-brand-primary/10'
    },
    {
      step: '02',
      title: 'Answer simple questions',
      description: 'Our document assistant guides you step-by-step. No legal jargon required.',
      illustration: StepFormIllustration,
      bgColor: 'bg-vanilla-main border-brand-primary/10'
    },
    {
      step: '03',
      title: 'Review your draft',
      description: 'Inspect the generated document, customize details, and see instant updates.',
      illustration: StepReviewIllustration,
      bgColor: 'bg-vanilla-main border-brand-primary/10'
    },
    {
      step: '04',
      title: 'Download and share',
      description: 'Export in pristine PDF or Word formats, or share secure view links with your team.',
      illustration: StepExportIllustration,
      bgColor: 'bg-vanilla-main border-brand-primary/10'
    }
  ];

  return (
    <section id="how-it-works-section" className="py-16 bg-vanilla-alt border-y border-vanilla-main relative">
      <LayoutContainer className="relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-primary font-mono bg-vanilla-main px-3.5 py-1.5 rounded-full border border-brand-primary/10">
            Simple Workflow
          </span>
          <h2 className="text-3xl font-bold font-display tracking-tight text-brand-secondary sm:text-4xl mt-4">
            How It Works
          </h2>
          <p className="mt-4 text-sm text-text-secondary leading-relaxed max-w-xl mx-auto">
            Create professional documents in four simple stages. No expensive retainers, legal terms, or complex setups required.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          
          {/* Connector lines for desktop layout */}
          <div className="hidden md:block absolute top-1/2 left-4 right-4 h-0.5 bg-vanilla-main -z-10" />

          {steps.map((item, idx) => {
            const Illustration = item.illustration;
            return (
              <div
                id={`how-it-works-step-${item.step}`}
                key={item.step}
                className="flex flex-col items-center text-center bg-white p-6 rounded-[16px] border border-vanilla-main shadow-xs hover:shadow-md transition-all relative group"
              >
                {/* Number Badge */}
                <span className="absolute -top-3.5 left-6 inline-flex h-7 w-12 items-center justify-center rounded-full bg-brand-secondary text-xs font-extrabold text-white shadow-xs">
                  Step {item.step}
                </span>

                {/* Animated Icon Circle */}
                <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-5 border transition-all group-hover:scale-105 ${item.bgColor}`}>
                  <Illustration />
                </div>

                <h3 className="text-base font-bold font-display text-brand-secondary tracking-tight">
                  {item.title}
                </h3>
                
                <p className="text-xs text-text-secondary mt-2.5 leading-relaxed">
                  {item.description}
                </p>

                {/* Decorative right arrow indicators for steps (except final) */}
                {idx < 3 && (
                  <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 h-8 w-8 items-center justify-center rounded-full bg-vanilla-secondary border border-vanilla-main shadow-xs">
                    <ChevronRight className="h-4 w-4 text-brand-secondary" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </LayoutContainer>
    </section>
  );
}
