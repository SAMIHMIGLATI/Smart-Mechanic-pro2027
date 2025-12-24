
import React, { useState, useEffect } from 'react';
import { X, Shield, FileText } from 'lucide-react';
import { Language } from '../types';

interface LegalModalsProps {
  lang: Language;
}

export const LegalModals: React.FC<LegalModalsProps> = ({ lang }) => {
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | null>(null);

  useEffect(() => {
    const handlePrivacy = () => setActiveModal('privacy');
    const handleTerms = () => setActiveModal('terms');

    window.addEventListener('open-privacy', handlePrivacy);
    window.addEventListener('open-terms', handleTerms);

    return () => {
      window.removeEventListener('open-privacy', handlePrivacy);
      window.removeEventListener('open-terms', handleTerms);
    };
  }, []);

  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 w-full max-w-2xl rounded-2xl border border-zinc-700 shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50 rounded-t-2xl">
           <h2 className="text-xl font-bold text-white flex items-center gap-2">
             {activeModal === 'privacy' ? <Shield className="w-5 h-5 text-green-500"/> : <FileText className="w-5 h-5 text-blue-500"/>}
             {activeModal === 'privacy' ? (lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy') : (lang === 'ar' ? 'شروط الخدمة' : 'Terms of Service')}
           </h2>
           <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors">
             <X className="w-5 h-5" />
           </button>
        </div>
        <div className="p-6 overflow-y-auto text-zinc-300 space-y-4 text-sm leading-relaxed scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
           {activeModal === 'privacy' ? (
             <>
               <p className="text-zinc-500 text-xs uppercase font-bold mb-4">Last updated: March 2024</p>
               <p>
                 {lang === 'ar' 
                   ? 'مرحباً بك في تطبيق Smart Mechanic. نحن نقدر خصوصيتك ونلتزم بحماية بياناتك الشخصية.' 
                   : 'Welcome to Smart Mechanic. We value your privacy and are committed to protecting your personal data.'}
               </p>
               
               <h3 className="text-white font-bold mt-6 text-lg">1. {lang === 'ar' ? 'من نحن' : 'Who We Are'}</h3>
               <p className="bg-zinc-800 p-4 rounded-lg border border-zinc-700">
                 <strong>Smart Mechanic</strong><br/>
                 {lang === 'ar' 
                   ? 'تطبيق Smart Mechanic للذكاء الاصطناعي وتطوير التطبيقات.' 
                   : 'Smart Mechanic for Artificial Intelligence and Application Development.'}
                 <br/><br/>
                 <span className="text-amber-500 font-bold">Operated and Developed by Samih Meguelati</span>
               </p>
               <p className="mt-2 text-zinc-400 italic">
                 {lang === 'ar'
                   ? 'مهمتنا هي تبسيط فهم الأعطال المعقدة للسائقين والحرفيين (الميكانيكيين) باستخدام أحدث تقنيات الذكاء الاصطناعي.'
                   : 'Our mission is to simplify the understanding of complex faults for drivers and craftsmen (mechanics) using the latest AI technologies.'}
               </p>

               <h3 className="text-white font-bold mt-6 text-lg">2. {lang === 'ar' ? 'المعلومات التي نجمعها' : 'Information We Collect'}</h3>
               <ul className="list-disc pl-5 space-y-2 text-zinc-400">
                 <li><strong>Usage Data:</strong> We may collect anonymous data about how you interact with the app to improve performance.</li>
                 <li><strong>Diagnostic Data:</strong> Fault codes entered are processed to provide solutions but are not permanently linked to your personal identity on our public servers.</li>
                 <li><strong>Images:</strong> Photos taken for diagnosis are processed locally or temporarily for analysis and are not stored permanently.</li>
               </ul>

               <h3 className="text-white font-bold mt-6 text-lg">3. AI Processing</h3>
               <p>This application uses <strong>Google Gemini AI</strong> to analyze fault codes. By using the diagnosis features, you acknowledge that technical data is sent to the AI model for processing.</p>
               
               <h3 className="text-white font-bold mt-6 text-lg">4. Data Security</h3>
               <p>We implement advanced security measures to protect your data. All communication is encrypted using SSL/TLS protocols.</p>
             </>
           ) : (
             <>
               <p className="text-zinc-500 text-xs uppercase font-bold mb-4">Effective Date: March 2024</p>
               <p>Welcome to Smart Mechanic. By accessing or using our application, you agree to be bound by these Terms of Service.</p>
               
               <h3 className="text-white font-bold mt-6 text-lg">1. Disclaimer of Liability</h3>
               <div className="bg-red-950/30 border border-red-900/50 p-4 rounded-lg text-red-200">
                 <p><strong>Important:</strong> This application is a diagnostic aid tool developed by <strong>Smart Mechanic</strong>. The results provided by the AI are suggestions based on data. We are not responsible for any damage to vehicles, financial loss, or injury resulting from the use of this information.</p>
                 <p className="mt-2 font-bold">Always consult a certified professional mechanic for final repairs.</p>
               </div>

               <h3 className="text-white font-bold mt-6 text-lg">2. User License</h3>
               <p>You are granted a limited, non-exclusive, non-transferable license to use the application for personal or professional diagnostic purposes.</p>

               <h3 className="text-white font-bold mt-6 text-lg">3. Pro Subscription</h3>
               <p>Certain features are reserved for Pro users. Subscriptions are billed according to the plan selected (Monthly/Yearly) and are non-refundable except where required by law.</p>
             </>
           )}
        </div>
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 text-center rounded-b-2xl">
          <button onClick={() => setActiveModal(null)} className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold text-sm transition-colors">
            {lang === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
