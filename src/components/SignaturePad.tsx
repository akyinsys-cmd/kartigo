import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { motion } from 'motion/react';
import { Type, PenTool, Upload, Trash2, Check, X } from 'lucide-react';

interface SignaturePadProps {
  onSave: (signatureData: string) => void;
  onClose: () => void;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, onClose }) => {
  const [mode, setMode] = useState<'draw' | 'type' | 'upload'>('draw');
  const [typedName, setTypedName] = useState('');
  const [selectedFont, setSelectedFont] = useState('font-serif italic');
  const sigCanvas = useRef<SignatureCanvas>(null);

  const handleSave = () => {
    if (mode === 'draw' && sigCanvas.current) {
      if (sigCanvas.current.isEmpty()) return;
      onSave(sigCanvas.current.getTrimmedCanvas().toDataURL('image/png'));
    } else if (mode === 'type' && typedName) {
      // In a real app, we'd render this to a canvas or SVG
      onSave(`TEXT:${typedName}:${selectedFont}`);
    }
  };

  const fonts = [
    { name: 'Elegant', class: 'font-serif italic' },
    { name: 'Modern', class: 'font-sans font-bold' },
    { name: 'Cursive-like', class: 'font-serif' },
    { name: 'Classic', class: 'font-mono' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-vanilla-main shadow-2xl overflow-hidden max-w-md w-full">
      <div className="p-4 border-b border-vanilla-main flex items-center justify-between bg-vanilla-secondary/30">
        <h3 className="text-sm font-bold text-brand-secondary">Digital Signature</h3>
        <button onClick={onClose} className="text-text-light hover:text-brand-primary cursor-pointer">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Mode Selector */}
        <div className="flex bg-vanilla-secondary rounded-lg p-1">
          {[
            { id: 'draw', icon: PenTool, label: 'Draw' },
            { id: 'type', icon: Type, label: 'Type' },
            { id: 'upload', icon: Upload, label: 'Upload' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id as any)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                mode === m.id ? 'bg-white text-brand-primary shadow-xs' : 'text-text-light hover:text-brand-secondary'
              }`}
            >
              <m.icon className="h-3 w-3" />
              {m.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="h-40 border border-dashed border-vanilla-main rounded-xl overflow-hidden relative bg-neutral-50/50">
          {mode === 'draw' && (
            <SignatureCanvas
              ref={sigCanvas}
              penColor="#3C1A47"
              canvasProps={{
                className: 'signature-canvas w-full h-full cursor-crosshair'
              }}
            />
          )}

          {mode === 'type' && (
            <div className="h-full flex flex-col p-4 space-y-4">
              <input
                type="text"
                placeholder="Type your name..."
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                className="w-full bg-white border border-vanilla-main rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-brand-primary transition-colors"
              />
              <div className="flex gap-2">
                {fonts.map((f) => (
                  <button
                    key={f.name}
                    onClick={() => setSelectedFont(f.class)}
                    className={`flex-1 py-1 rounded border text-[10px] transition-all cursor-pointer ${
                      selectedFont === f.class ? 'border-brand-primary bg-brand-primary/5 text-brand-primary' : 'border-vanilla-main text-text-light'
                    } ${f.class}`}
                  >
                    {typedName || 'Sample'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === 'upload' && (
            <div className="h-full flex flex-col items-center justify-center p-4 text-center">
              <Upload className="h-8 w-8 text-text-light mb-2" />
              <p className="text-[10px] text-text-light mb-4">Upload a clear photo of your handwritten signature</p>
              <button className="px-4 py-1.5 bg-vanilla-secondary text-brand-secondary text-[10px] font-bold rounded-lg border border-vanilla-main hover:bg-vanilla-main transition-colors cursor-pointer">
                Select File
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => {
              if (mode === 'draw') sigCanvas.current?.clear();
              else setTypedName('');
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-vanilla-main text-text-secondary text-[11px] font-bold rounded-xl hover:bg-vanilla-secondary transition-colors cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </button>
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-brand-primary text-white text-[11px] font-bold rounded-xl shadow-md hover:opacity-95 transition-all cursor-pointer"
          >
            <Check className="h-3.5 w-3.5" />
            Apply Signature
          </button>
        </div>
      </div>
    </div>
  );
};
