import React from 'react';
import { motion } from 'motion/react';
import { Check, Clock, FileText, CreditCard, Download, Eye } from 'lucide-react';

interface TimelineStep {
  id: string;
  label: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
  icon: React.ElementType;
}

interface OrderTrackingTimelineProps {
  currentStage: 'draft' | 'info' | 'preview' | 'payment' | 'unlocked' | 'downloaded';
}

export const OrderTrackingTimeline: React.FC<OrderTrackingTimelineProps> = ({ currentStage }) => {
  const steps: TimelineStep[] = [
    { id: 'draft', label: 'Draft Created', description: 'Template selected and initialized.', status: 'pending', icon: FileText },
    { id: 'info', label: 'Info Completed', description: 'Your inputs have been captured.', status: 'pending', icon: Clock },
    { id: 'preview', label: 'Preview Generated', description: 'AI has synthesized your document.', status: 'pending', icon: Eye },
    { id: 'payment', label: 'Payment Successful', description: 'Secure transaction processed.', status: 'pending', icon: CreditCard },
    { id: 'unlocked', label: 'Document Unlocked', description: 'Full version is ready for you.', status: 'pending', icon: Check },
    { id: 'downloaded', label: 'Downloaded', description: 'PDF/Word file exported.', status: 'pending', icon: Download },
  ];

  const stageIndex = steps.findIndex(s => s.id === currentStage);
  
  const processedSteps = steps.map((step, idx) => {
    let status: 'completed' | 'current' | 'pending' = 'pending';
    if (idx < stageIndex) status = 'completed';
    else if (idx === stageIndex) status = 'current';
    return { ...step, status };
  });

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      <div className="relative">
        {/* Background Line */}
        <div className="absolute top-5 left-8 right-8 h-0.5 bg-vanilla-main -z-10" />
        
        {/* Progress Line */}
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(stageIndex / (steps.length - 1)) * 100}%` }}
          className="absolute top-5 left-8 h-0.5 bg-brand-primary -z-10"
        />

        <div className="flex justify-between items-start">
          {processedSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="flex flex-col items-center text-center w-32 relative">
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor: step.status === 'completed' ? '#003366' : step.status === 'current' ? '#F4EDE4' : '#FFFFFF',
                    borderColor: step.status === 'pending' ? '#E5E7EB' : '#003366',
                    scale: step.status === 'current' ? 1.1 : 1
                  }}
                  className={`h-10 w-10 rounded-full border-2 flex items-center justify-center transition-all duration-500 z-10`}
                >
                  {step.status === 'completed' ? (
                    <Check className="h-5 w-5 text-white" />
                  ) : (
                    <Icon className={`h-5 w-5 ${step.status === 'current' ? 'text-brand-primary' : 'text-gray-300'}`} />
                  )}
                </motion.div>
                
                <div className="mt-3 space-y-1">
                  <h4 className={`text-[11px] font-bold tracking-tight uppercase ${step.status === 'pending' ? 'text-gray-400' : 'text-brand-secondary'}`}>
                    {step.label}
                  </h4>
                  <p className="text-[9px] text-gray-400 leading-tight px-2">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
