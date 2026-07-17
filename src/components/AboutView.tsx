import React from 'react';
import { motion } from 'motion/react';
import { Shield, Target, Eye, Star, Zap, CheckCircle, Users, ExternalLink, ArrowRight, Globe, FileText } from 'lucide-react';
import LayoutContainer from './LayoutContainer';
import { useCMSContext } from '../context/CMSContext';

import Breadcrumbs from './Breadcrumbs';

interface AboutViewProps {
  onStartDrafting: () => void;
  onBackHome?: () => void;
}

export default function AboutView({ onStartDrafting, onBackHome }: AboutViewProps) {
  const { aboutContent } = useCMSContext();

  // Retrieve dynamic fields with local safe defaults
  const heroTitle = aboutContent?.heroTitle || "Expert-Grade Business & Legal Documents";
  const heroSubtitle = aboutContent?.heroSubtitle || "The smartest way to build, manage, and scale your business documentation with professional precision.";
  const ourStory = aboutContent?.ourStory || "Kartigo Draft was born out of a simple observation: creating high-quality legal and business documents is either too expensive or too risky. Professionals and startups often find themselves trapped between high-cost legal firms and unverified, generic templates found online.\n\nWe created Kartigo Draft to solve this problem. Our platform provides a middle ground—expertly crafted, industry-standard documents that are accessible, affordable, and incredibly fast to generate.\n\nOur mission is to simplify document creation for individuals, professionals, startups, and businesses across India, ensuring that high-quality drafting is never a bottleneck for growth.";
  const missionText = aboutContent?.mission || "To make professional, expert-grade documents accessible, affordable, and fast for every business and individual in India.";
  const visionText = aboutContent?.vision || "To become India's most trusted and widely used document drafting platform, empowering millions with the power of professional documentation.";
  const values = aboutContent?.values || [
    { title: "Trust", desc: "Every document is meticulously reviewed to meet industry standards." },
    { title: "Simplicity", desc: "Interactive flows that guide you through every step of the process." },
    { title: "Privacy", desc: "Bank-grade encryption to ensure your data stays private and safe." },
    { title: "Innovation", desc: "Documents are built in real-time based on your specific requirements." },
    { title: "Reliability", desc: "Access and manage all your drafts and downloads from a secure dashboard." }
  ];

  const getIconForValue = (val: string) => {
    switch (val.toLowerCase()) {
      case 'trust': return <Shield className="w-6 h-6" />;
      case 'simplicity': return <Zap className="w-6 h-6" />;
      case 'privacy': return <CheckCircle className="w-6 h-6" />;
      case 'innovation': return <Target className="w-6 h-6" />;
      default: return <Star className="w-6 h-6" />;
    }
  };

  return (
    <div className="bg-vanilla-secondary min-h-screen pt-24">
      <LayoutContainer className="pt-4 pb-2">
        <Breadcrumbs 
          onBackHome={onBackHome}
          items={[{ label: 'About', isActive: true }]} 
        />
      </LayoutContainer>
      {/* Hero Section */}
      <section className="pt-12 pb-20 bg-[#3C1A47] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#E5F5B8_0%,transparent_50%)]" />
        </div>
        
        <LayoutContainer>
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-4 py-1.5 bg-[#E5F5B8]/10 border border-[#E5F5B8]/20 rounded-full text-[#E5F5B8] text-[10px] font-bold uppercase tracking-widest mb-6"
            >
              Kartigo Draft
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-extrabold text-white font-display mb-6 leading-tight"
            >
              {heroTitle}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-white/80 leading-relaxed font-medium"
            >
              {heroSubtitle}
            </motion.p>
          </div>
        </LayoutContainer>
      </section>

      {/* Our Story Section */}
      <section className="py-24 bg-white">
        <LayoutContainer>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="w-12 h-1 bg-brand-primary rounded-full mb-6" />
              <h2 className="text-3xl md:text-4xl font-extrabold text-brand-secondary font-display">Our Story</h2>
              <div className="space-y-4 text-text-secondary leading-relaxed whitespace-pre-line">
                {ourStory}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-vanilla-main"
            >
              <img 
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1000" 
                alt="Our Team Collaborating" 
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-brand-secondary/20 mix-blend-multiply" />
            </motion.div>
          </div>
        </LayoutContainer>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-24 bg-vanilla-secondary">
        <LayoutContainer>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-10 bg-[#3C1A47] text-white rounded-[40px] shadow-xl border border-[#E5F5B8]/10"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#E5F5B8]/10 flex items-center justify-center text-[#E5F5B8] mb-8">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-extrabold font-display mb-4">Our Mission</h3>
              <p className="text-white/80 leading-relaxed text-lg">
                {missionText}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-10 bg-white border-2 border-vanilla-main rounded-[40px] shadow-sm"
            >
              <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-8">
                <Eye className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-extrabold font-display text-brand-secondary mb-4">Our Vision</h3>
              <p className="text-text-secondary leading-relaxed text-lg">
                {visionText}
              </p>
            </motion.div>
          </div>
        </LayoutContainer>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 bg-white">
        <LayoutContainer>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand-secondary font-display mb-4">Why Choose Kartigo Draft</h2>
            <p className="text-text-secondary leading-relaxed font-medium">
              We combine professional expertise with cutting-edge technology to deliver the best drafting experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <Shield className="w-6 h-6" />, title: "Expert-grade drafts", desc: "Every document is meticulously reviewed to meet industry standards." },
              { icon: <Zap className="w-6 h-6" />, title: "Guided document creation", desc: "Interactive flows that guide you through every step of the process." },
              { icon: <CheckCircle className="w-6 h-6" />, title: "Secure platform", desc: "Bank-grade encryption to ensure your data stays private and safe." },
              { icon: <Users className="w-6 h-6" />, title: "Dynamic generation", desc: "Documents are built in real-time based on your specific requirements." },
              { icon: <Star className="w-6 h-6" />, title: "Saved documents", desc: "Access and manage all your drafts and downloads from a secure dashboard." },
              { icon: <FileText className="w-6 h-6" />, title: "Simple pricing", desc: "Transparent, pay-per-document pricing with no hidden fees." }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-8 bg-vanilla-secondary/30 border border-vanilla-main rounded-3xl hover:border-brand-primary/30 transition-all hover:bg-white hover:shadow-xl group"
              >
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-brand-primary mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h4 className="text-lg font-bold text-brand-secondary mb-2">{item.title}</h4>
                <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </LayoutContainer>
      </section>

      {/* About AI Assistant Section */}
      <section className="py-24 bg-[#3C1A47] text-white relative overflow-hidden">
        <LayoutContainer>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E5F5B8]/10 rounded-full text-[#E5F5B8] text-[10px] font-bold uppercase tracking-wider">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E5F5B8] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E5F5B8]"></span>
                </span>
                Active Assistant
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold font-display leading-tight">
                Meet AI Assistant: Your Intelligent <br className="hidden md:block" />
                Document Assistant
              </h2>
              <p className="text-white/80 leading-relaxed text-lg">
                AI Assistant is Kartigo Draft's signature intelligent document assistant. AI Assistant guides you through the entire document creation process, asking smart follow-up questions to ensure every detail of your requirement is captured.
              </p>
              <p className="text-white/80 leading-relaxed">
                Whether you're building a complex commercial contract or a simple agreement, AI Assistant makes the process conversational and intuitive, eliminating the need for tedious manual drafting.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-[#E5F5B8]/10 blur-3xl rounded-full" />
              <div className="relative p-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-[40px] shadow-2xl overflow-hidden">
                 <div className="aspect-square bg-gradient-to-br from-brand-primary/30 to-brand-secondary/30 flex items-center justify-center">
                    <div className="text-center p-8">
                       <div className="w-24 h-24 bg-[#E5F5B8] rounded-3xl mx-auto mb-6 flex items-center justify-center text-brand-secondary shadow-lg">
                          <Users className="w-12 h-12" />
                       </div>
                       <h3 className="text-2xl font-bold mb-2">AI Assistant v1.0</h3>
                       <p className="text-sm text-white/60">Optimized for Commercial & Legal Indian Drafts</p>
                    </div>
                  </div>
              </div>
            </motion.div>
          </div>
        </LayoutContainer>
      </section>

      {/* AKYIN Ventures Section */}
      <section className="py-24 bg-vanilla-secondary">
        <LayoutContainer>
          <div className="max-w-3xl mx-auto text-center space-y-8">
             <div className="w-20 h-20 bg-white rounded-2xl mx-auto shadow-sm flex items-center justify-center border border-vanilla-main">
                <Globe className="w-10 h-10 text-brand-primary" />
             </div>
             <div className="space-y-4">
                <h2 className="text-3xl font-extrabold text-brand-secondary font-display">A Product of AKYIN Ventures</h2>
                <p className="text-text-secondary leading-relaxed text-lg">
                  Kartigo Draft is a flagship product of AKYIN Ventures, a forward-thinking firm dedicated to building innovative solutions that solve real-world problems. 
                </p>
                <p className="text-text-secondary leading-relaxed">
                   AKYIN Ventures focuses on creating technologies that improve efficiency and access across various industries, with a strong emphasis on reliability and user-centric design.
                </p>
             </div>
             <a 
               href="https://akyin.com" 
               target="_blank" 
               rel="noreferrer"
               className="inline-flex items-center gap-2 text-brand-primary font-bold hover:underline"
             >
               Visit akyin.com <ExternalLink className="w-4 h-4" />
             </a>
          </div>
        </LayoutContainer>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-white">
        <LayoutContainer>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-[#3C1A47] font-display">Our Core Values</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {values.map((val, idx) => (
               <motion.div
                 key={idx}
                 initial={{ opacity: 0, scale: 0.9 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true }}
                 transition={{ delay: idx * 0.05 }}
                 className="flex flex-col items-start gap-4 p-6 bg-vanilla-secondary/20 rounded-3xl border border-vanilla-main"
               >
                 <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-brand-primary shadow-xs">
                   {getIconForValue(val.title)}
                 </div>
                 <h4 className="font-bold text-[#3c1a47] text-lg">{val.title}</h4>
                 <p className="text-sm text-text-secondary leading-relaxed">{val.desc}</p>
               </motion.div>
             ))}
          </div>
        </LayoutContainer>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <LayoutContainer>
           <motion.div
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="bg-[#3C1A47] rounded-[48px] p-12 text-center text-white relative overflow-hidden shadow-2xl"
           >
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 blur-3xl rounded-full -mr-32 -mt-32" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#E5F5B8]/5 blur-3xl rounded-full -ml-32 -mb-32" />
              
              <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                 <h2 className="text-4xl font-extrabold font-display leading-tight">Ready to build your next professional document?</h2>
                 <p className="text-white/70 text-lg">Start creating your first document with Kartigo Draft today.</p>
                 <div className="pt-4">
                    <button
                      onClick={onStartDrafting}
                      className="inline-flex items-center gap-2 bg-[#E5F5B8] text-brand-secondary px-8 py-4 rounded-full text-lg font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-primary/20 cursor-pointer"
                    >
                      Start Creating Your First Document
                      <ArrowRight className="w-5 h-5" />
                    </button>
                 </div>
              </div>
           </motion.div>
        </LayoutContainer>
      </section>
    </div>
  );
}
