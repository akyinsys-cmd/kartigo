import React from 'react';
import { Check, ShieldCheck, HelpCircle } from 'lucide-react';
import { SecureBadgeIllustration } from './Illustrations';

interface PricingSectionProps {
  onOpenComingSoon: (featureName: string) => void;
}

export default function PricingSection({ onOpenComingSoon }: PricingSectionProps) {
  const tiers = [
    {
      name: 'Basic Agreement',
      price: '₹49',
      period: 'per document',
      description: 'Simple templates for quick agreements.',
      features: ['Basic templates', 'PDF export', 'Single draft retention', 'Standard formatting'],
      cta: 'Create Document',
      popular: false,
      btnStyle: 'border-2 border-brand-primary text-brand-primary bg-white hover:bg-vanilla-secondary'
    },
    {
      name: 'Essential Contract',
      price: '₹79',
      period: 'per document',
      description: 'Standard contracts for freelancers and individuals.',
      features: ['Advanced templates', 'PDF & DOCX export', 'Interactive wizard', '1-day revision'],
      cta: 'Create Contract',
      popular: false,
      btnStyle: 'border-2 border-brand-primary text-brand-primary bg-white hover:bg-vanilla-secondary'
    },
    {
      name: 'Professional',
      price: '₹149',
      period: 'per document',
      description: 'Ideal for founders and small business operators.',
      features: ['All Premium Templates', 'Pristine downloads', 'AI Assistant wizard', 'Direct email support'],
      cta: 'Create Premium Document',
      popular: true,
      btnStyle: 'bg-brand-primary text-white card-shadow hover:opacity-95'
    },
    {
      name: 'Business Suite',
      price: '₹299',
      period: 'per document',
      description: 'Comprehensive business operations documents.',
      features: ['Corporate templates', 'Multiple profiles', 'Priority support', '7-day revisions'],
      cta: 'Get Business Suite',
      popular: false,
      btnStyle: 'border-2 border-brand-primary text-brand-primary bg-white hover:bg-vanilla-secondary'
    },
    {
      name: 'Enterprise Custom',
      price: '₹499',
      period: 'per document',
      description: 'Complex custom-tailored agreements.',
      features: ['Custom drafting', 'Legal formatting', 'Unlimited revisions', 'Dedicated account manager'],
      cta: 'Request Custom Draft',
      popular: false,
      btnStyle: 'bg-brand-secondary text-white hover:bg-brand-secondary/90'
    }
  ];

  return (
    <section id="pricing-section" className="py-16 bg-vanilla-main border-b border-vanilla-main/25 relative max-w-100vw">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-primary font-mono bg-white px-3.5 py-1.5 rounded-full border border-brand-primary/10">
            Straightforward Costing
          </span>
          <h2 className="text-3xl font-bold font-display tracking-tight text-brand-secondary sm:text-4xl mt-4">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-sm text-text-secondary max-w-lg mx-auto">
            No expensive billing hours, custom quotes, or hidden fees. Draft for free or select our professional standard plans.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div id="pricing-cards-grid" className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
          {tiers.map((tier) => (
            <div
              id={`pricing-tier-${tier.name.toLowerCase().replace(/\s+/g, '-')}`}
              key={tier.name}
              className={`rounded-[20px] p-8 border flex flex-col justify-between transition-all duration-300 relative ${
                tier.popular
                  ? 'border-brand-primary ring-1 ring-brand-primary card-shadow bg-vanilla-secondary'
                  : 'border-vanilla-main bg-white hover:border-brand-primary/40 card-shadow'
              }`}
            >
              {/* Popular Badge */}
              {tier.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-primary text-[10px] font-bold text-white uppercase tracking-widest shadow-xs">
                  <ShieldCheck className="h-3 w-3" />
                  Most Popular
                </span>
              )}

              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-text-light font-mono">
                  {tier.name}
                </span>
                
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-brand-secondary font-display tracking-tight">
                    {tier.price}
                  </span>
                  <span className="text-xs font-semibold text-text-light">
                    {tier.period}
                  </span>
                </div>

                <p className="mt-3 text-xs text-text-secondary leading-relaxed">
                  {tier.description}
                </p>

                {/* Features list */}
                <ul className="mt-6 space-y-3.5">
                  {tier.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-text-secondary">
                      <span className={`p-0.5 rounded-full mt-0.5 shrink-0 flex items-center justify-center ${
                        tier.popular ? 'bg-brand-primary/15 text-brand-primary' : 'bg-vanilla-main text-brand-secondary'
                      }`}>
                        <Check className="h-3 w-3 stroke-[3px]" />
                      </span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <button
                id={`pricing-action-${tier.name.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => onOpenComingSoon(`Pricing Tier: ${tier.name}`)}
                className={`w-full mt-8 rounded-xl py-3 text-xs font-extrabold transition-all active:scale-98 cursor-pointer ${tier.btnStyle}`}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Guarantee Banner */}
        <div className="mt-12 text-center flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-text-light font-medium">
          <SecureBadgeIllustration />
          <span>All transactions secured with banking-grade SSL. Subject to our clear 14-day refund policy.</span>
        </div>

      </div>
    </section>
  );
}
