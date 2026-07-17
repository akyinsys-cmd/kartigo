import { useState, useEffect, useCallback } from 'react';

export interface LanguageSettings {
  defaultLanguage: 'English' | 'Hinglish';
  autoDetect: boolean;
  greetingEnglish: string;
  greetingHinglish: string;
}

const DEFAULT_SETTINGS: LanguageSettings = {
  defaultLanguage: 'English',
  autoDetect: true,
  greetingEnglish: "Hello! I'm AI Assistant, your document assistant.\n\nTell me what document you'd like to create today.",
  greetingHinglish: "Namaste! Main AI Assistant hoon, aapka document assistant. Mujhe batayein, aaj kaunsa document banana hai?"
};

export const useLanguageDetection = () => {
  const [settings, setSettings] = useState<LanguageSettings>(DEFAULT_SETTINGS);
  const [conversationLanguage, setConversationLanguage] = useState<'English' | 'Hinglish'>('English');

  // Load language settings from localStorage
  const loadSettings = useCallback(() => {
    const stored = localStorage.getItem('kartigo_admin_language_settings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const mergedSettings = { ...DEFAULT_SETTINGS, ...parsed };
        setSettings(mergedSettings);
        return mergedSettings;
      } catch (e) {
        console.error("Failed to parse language settings", e);
      }
    }
    setSettings(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }, []);

  // Sync settings initially and on storage events
  useEffect(() => {
    const activeSettings = loadSettings();
    setConversationLanguage(activeSettings.defaultLanguage);

    const handleStorageChange = () => {
      const updatedSettings = loadSettings();
      // If a chat session hasn't started yet or active tab is fresh, update style to default
      setConversationLanguage(updatedSettings.defaultLanguage);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadSettings]);

  // Robust language detection algorithm for Indian Hinglish
  const detectLanguage = useCallback((text: string): 'English' | 'Hinglish' => {
    const clean = text.toLowerCase().trim();
    if (!clean) return 'English';

    // Extensive corpus of Hinglish words used by Indian users
    const hinglishKeywords = [
      'hai', 'hain', 'mujhe', 'banana', 'banao', 'banaen', 'banaein', 'karta', 'hoon', 'aap', 'raha', 'rahi', 
      'karte', 'mera', 'meri', 'kaise', 'karo', 'karna', 'kijiye', 'ko', 'ki', 'ke', 'se', 'par', 'bhi', 
      'toh', 'aur', 'ek', 'kuch', 'bilkul', 'haan', 'na', 'mat', 'kar', 'hoga', 'kya', 'kab', 'kahan', 
      'idhar', 'udhar', 'sabse', 'pehle', 'chahiye', 'dena', 'le', 'lo', 'mil', 'gaya', 'bana', 'likho', 
      'likhna', 'likh', 'ye', 'wo', 'voh', 'vha', 'yha', 'vahan', 'yahan', 'kuchh', 'hoga', 'hogi', 
      'honge', 'rha', 'rhi', 'rhe', 'kr', 'kra', 'kri', 'kre', 'kro', 'hi', 'bhai', 'dijiye', 'lijiye', 
      'bataiye', 'bataye', 'batao', 'boliye', 'bolo', 'samajh', 'nhi', 'nahi', 'krna', 'rkho', 'rakho', 'rakha',
      'achha', 'acha', 'theek', 'thik', 'shuru', 'chaliye', 'batao', 'karo', 'namaste', 'shukriya', 'dhanyawad'
    ];

    const words = clean.split(/[^a-zA-Z]+/);
    let hinglishCount = 0;
    for (const w of words) {
      if (hinglishKeywords.includes(w)) {
        hinglishCount++;
      }
    }

    return hinglishCount > 0 ? 'Hinglish' : 'English';
  }, []);

  // Detect and set active conversation style (if auto-detect is active)
  const interceptMessage = useCallback((text: string) => {
    if (!settings.autoDetect) {
      return settings.defaultLanguage;
    }
    const detected = detectLanguage(text);
    setConversationLanguage(detected);
    return detected;
  }, [settings, detectLanguage]);

  // Translate/transform agent's responses dynamically to Hinglish
  const translateAgentMessage = useCallback(async (englishText: string, targetLanguage?: 'English' | 'Hinglish'): Promise<string> => {
    const lang = targetLanguage || conversationLanguage;
    if (lang === 'English') return englishText;

    try {
      const res = await fetch('/api/translate-to-hinglish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: englishText })
      });
      const data = await res.json();
      return data.translatedText || englishText;
    } catch (err) {
      console.error("Hinglish translation service fallback used due to network issue", err);
      return englishText;
    }
  }, [conversationLanguage]);

  return {
    conversationLanguage,
    setConversationLanguage,
    settings,
    detectLanguage,
    interceptMessage,
    translateAgentMessage
  };
};
