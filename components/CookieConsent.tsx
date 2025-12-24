
import React, { useState, useEffect } from 'react';
import { Cookie, Check } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/translations';

interface CookieConsentProps {
  lang: Language;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ lang }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('sm_cookie_consent');
    if (!consent) {
      setTimeout(() => setShow(true), 2000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('sm_cookie_consent', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] p-4 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-4xl mx-auto bg-zinc-900/95 backdrop-blur-md border border-zinc-700 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-center gap-6">
        <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center shrink-0">
           <Cookie className="w-6 h-6 text-amber-500" />
        </div>
        <div className="flex-1 text-center md:text-start">
          <h3 className="text-white font-bold mb-1">Cookie Policy</h3>
          <p className="text-zinc-400 text-sm">
            We use cookies to improve your experience, analyze traffic, and ensure security. By continuing to use Smart Mechanic, you agree to our terms.
          </p>
        </div>
        <div className="flex gap-3">
           <button 
             onClick={() => setShow(false)}
             className="px-4 py-2 text-zinc-400 hover:text-white font-bold text-sm"
           >
             Decline
           </button>
           <button 
             onClick={handleAccept}
             className="px-6 py-2 bg-white text-black hover:bg-zinc-200 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg"
           >
             <Check className="w-4 h-4" />
             Accept
           </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
