import React from 'react';
import { 
  WhyQualityIllustration, 
  WhyFastIllustration, 
  WhySecureIllustration, 
  WhyMobileIllustration,
  CategoryHRIllustration,
  CategoryTechIllustration,
  CategoryLegalIllustration,
  SuccessIllustration
} from './Illustrations';

export default function WhyChooseUs() {
  const values = [
    {
      id: 'why-expert',
      title: 'Expert-grade quality',
      description: 'Every template is drafted and periodically updated by experienced corporate legal counsels and senior HR practitioners.',
      illustration: WhyQualityIllustration,
      color: 'bg-vanilla-main'
    },
    {
      id: 'why-simple',
      title: 'Simple questions',
      description: 'Skip the complex legalese. Our assistant asks straightforward, intuitive questions to structure your custom clauses.',
      illustration: CategoryHRIllustration,
      color: 'bg-vanilla-main'
    },
    {
      id: 'why-fast',
      title: 'Fast document creation',
      description: 'Your tailored, commercial-grade document is prepared and formatted for review in under three minutes.',
      illustration: WhyFastIllustration,
      color: 'bg-vanilla-main'
    },
    {
      id: 'why-edit',
      title: 'Editable documents',
      description: 'Add custom riders, fine-tune wording, or structure sections directly inside our clean, built-in rich text editor.',
      illustration: CategoryTechIllustration,
      color: 'bg-vanilla-main'
    },
    {
      id: 'why-formats',
      title: 'PDF & Word downloads',
      description: 'Export pristine, perfectly styled PDFs for signing, or download editable Word (.docx) files to share with partners.',
      illustration: CategoryLegalIllustration,
      color: 'bg-vanilla-main'
    },
    {
      id: 'why-secure',
      title: 'Secure account',
      description: 'Drafts are fully encrypted with bank-grade AES-256 standards, remaining private, secure, and accessible only by you.',
      illustration: WhySecureIllustration,
      color: 'bg-vanilla-main'
    },
    {
      id: 'why-mobile',
      title: 'Mobile friendly',
      description: 'Designed perfectly to let you answer prompts, preview generated drafts, and email PDF exports directly from your phone.',
      illustration: WhyMobileIllustration,
      color: 'bg-vanilla-main'
    },
    {
      id: 'why-english',
      title: 'Easy English',
      description: 'All explanations and questions are structured in clean, natural English to make contract drafting clear to anyone.',
      illustration: SuccessIllustration,
      color: 'bg-vanilla-main'
    }
  ];

  return (
    <section id="why-choose-us-section" className="py-20 bg-vanilla-secondary border-y border-vanilla-main relative">
      <div className="absolute inset-0 bg-[radial-gradient(#3C1A47_0.04rem,transparent_0.04rem)] [background-size:2rem_2rem] opacity-[0.015] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-primary font-mono bg-vanilla-main px-3.5 py-1.5 rounded-full border border-brand-primary/10">
            Uncompromised Standards
          </span>
          <h2 className="text-3xl font-bold font-display tracking-tight text-brand-secondary sm:text-4xl mt-4">
            Why Choose Kartigo Draft
          </h2>
          <p className="mt-4 text-sm text-text-secondary max-w-lg mx-auto">
            Discover why business owners, remote freelancers, and HR managers rely on us to execute their commercial transactions.
          </p>
        </div>

        {/* Values Grid */}
        <div id="why-choose-us-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((item) => {
            const Illustration = item.illustration;
            return (
              <div
                id={item.id}
                key={item.id}
                className="bg-white p-6 rounded-[20px] border border-vanilla-main card-shadow hover:shadow-md transition-all duration-300 group hover:border-brand-primary/30"
              >
                {/* Colored Icon box */}
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center mb-4 transition-all group-hover:scale-105 ${item.color}`}>
                  <div className="scale-[0.8] origin-center">
                    <Illustration />
                  </div>
                </div>

                <h3 className="text-sm font-extrabold font-display text-brand-secondary tracking-tight">
                  {item.title}
                </h3>
                
                <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
