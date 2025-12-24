
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CreditCard, Calendar, Lock, ShieldCheck, CheckCircle, Smartphone, Play } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/translations';
import { soundEngine } from '../utils/sound';

interface PaymentModalProps {
  onClose: () => void;
  onSuccess: () => void;
  lang: Language;
  plan: 'monthly' | 'yearly';
}

const PaymentModal: React.FC<PaymentModalProps> = ({ onClose, onSuccess, lang, plan }) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'google'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const [googleCode, setGoogleCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const t = translations[lang];
  const price = plan === 'monthly' ? t.priceMonth : t.priceYear;

  const toEnglishDigits = (str: string) => {
    return str
      .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString())
      .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString());
  };

  const getCardType = (number: string) => {
    if (number.startsWith('4')) return 'visa';
    if (number.startsWith('5')) return 'mastercard';
    return null;
  };

  const cardType = getCardType(cardNumber);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = toEnglishDigits(e.target.value).replace(/\D/g, '');
    value = value.substring(0, 16);
    // Add spaces every 4 digits
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = toEnglishDigits(e.target.value).replace(/\D/g, '');
    value = value.substring(0, 4);
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2);
    }
    setExpiry(value);
  };
  
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     let value = toEnglishDigits(e.target.value).replace(/\D/g, '');
     setCvv(value.substring(0, 3));
  };

  const handleGoogleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    value = value.substring(0, 16);
    // Add dashes every 4 chars
    const formatted = value.replace(/([A-Z0-9]{4})(?=[A-Z0-9])/g, '$1-');
    setGoogleCode(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'card' && (!cardNumber || !expiry || !cvv || !name)) return;
    if (paymentMethod === 'google' && !googleCode) return;

    soundEngine.playClick();
    setIsProcessing(true);

    // Simulate API Call
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      soundEngine.playSuccess();
      setTimeout(() => {
        onSuccess();
      }, 1500);
    }, 2000);
  };

  const VisaLogo = () => (
    <svg className="w-12 h-8" viewBox="0 0 36 11" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.2109 0.697266L8.03857 10.3804H5.32275L3.37451 2.37305C3.25928 1.93311 3.12988 1.77246 2.73193 1.54248C2.06787 1.18945 0.983887 0.817383 0 0.609375L0.244141 0.697266H4.28857C4.83496 0.697266 5.31885 1.05615 5.44189 1.73291L6.46338 7.37695L9.17627 0.697266H12.2109ZM22.9961 7.2915C23.0137 4.58252 19.3364 4.45557 19.3491 3.2373C19.3491 2.85986 19.7026 2.45703 20.4355 2.35596C20.8018 2.30811 21.8013 2.2749 22.9961 2.82764L23.4658 0.662109C22.8223 0.433594 21.9961 0.329102 20.9419 0.329102C18.2329 0.329102 16.3276 1.75879 16.3276 3.86426C16.3276 5.39062 17.728 6.24023 18.7305 6.72412C19.752 7.21826 20.0947 7.53076 20.0947 7.96289C20.0947 8.62988 19.3237 8.93262 18.6011 8.93262C17.3364 8.93262 16.606 8.58301 16.0312 8.31934L15.3467 10.4902C16.2236 10.8936 17.8481 11.0859 18.7837 11.0859C21.603 11.0859 23.4736 9.68066 23.4736 7.49854L22.9961 7.2915ZM29.4292 0.697266H26.7573C25.9087 0.697266 25.6841 0.938477 25.3716 1.6709L21.7251 10.3804H24.5776L25.145 8.78369H28.6675L28.9897 10.3804H31.5791L29.4292 0.697266ZM25.9688 6.55176L27.3208 2.82764L27.708 6.55176H25.9688ZM16.2993 0.697266L14.0728 10.3804H11.3657L13.5923 0.697266H16.2993Z" fill="white"/>
    </svg>
  );

  const MastercardLogo = () => (
    <svg className="w-12 h-8" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="12" fill="#EB001B" fillOpacity="0.8"/>
      <circle cx="26" cy="12" r="12" fill="#F79E1B" fillOpacity="0.8"/>
    </svg>
  );

  const GooglePlayLogo = () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24">
      <path fill="#00C853" d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
    </svg>
  );

  const PayPalLogo = () => (
     <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.946 5.05-4.336 6.794-9.052 6.794h-1.015c-.46 0-.853.333-.923.788l-.723 4.636c-.032.203.123.385.328.385H7.076z" fill="#003087"/>
        <path d="M19.16 2.097c1.112 1.268 1.405 2.536 1.114 4.404-.023.143-.047.288-.076.436-.947 5.05-4.337 6.795-9.053 6.795h-1.015c-.46 0-.853.333-.923.787l-.724 4.637c-.03.203.124.385.33.385h4.86c.458 0 .85-.33.92-.78l.024-.16c.196-1.256.466-2.98.6-3.834.07-.45.46-.778.916-.778h.49c4.14 0 7.37-2.023 8.16-7.394.02-.132.04-.265.057-.4.32-2.317-.43-4.137-3.77-4.137-3.77-4.137h-1.89z" fill="#009cde"/>
        <path d="M9.77 13.335h-1.015c-.46 0-.853.333-.923.787l-.724 4.637c-.03.203.124.385.33.385h4.86c.458 0 .85-.33.92-.78l.024-.16c.196-1.256.466-2.98.6-3.834.07-.45.46-.778.916-.778h.49c.563 0 1.096-.037 1.597-.107-5.013.122-6.732-2.015-7.076-4.99l-.008.05z" fill="#012169"/>
     </svg>
  );

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto overflow-x-hidden supports-[height:100dvh]:h-[100dvh]">
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="bg-zinc-900 w-full max-w-md rounded-3xl border border-zinc-700 shadow-2xl relative animate-in zoom-in-95 duration-200 my-auto">
          
          {/* Decorative Top */}
          <div className="h-2 w-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 rounded-t-3xl"></div>
          
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {isSuccess ? (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.4)] animate-in zoom-in duration-300">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">{t.paymentSuccess}</h2>
              <p className="text-zinc-400">{t.proDesc}</p>
            </div>
          ) : (
            <div className="p-6 md:p-8">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-white mb-1 flex items-center justify-center gap-2">
                  <Lock className="w-5 h-5 text-amber-500" />
                  {t.paymentTitle}
                </h2>
                <p className="text-zinc-400 text-sm">{t.secureCheckout}</p>
                <div className="mt-4 inline-block bg-zinc-800 px-4 py-1 rounded-full border border-zinc-700">
                  <span className="text-white font-mono font-bold">{price}</span>
                  <span className="text-zinc-500 text-xs ml-2">/ {plan === 'monthly' ? t.monthly : t.yearly}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 transition-all font-bold text-xs md:text-sm
                    ${paymentMethod === 'card' 
                      ? 'bg-white text-black border-white shadow-lg' 
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'}`}
                >
                  <CreditCard className="w-4 h-4" />
                  {t.payWithCard}
                </button>
                <button
                  onClick={() => setPaymentMethod('paypal')}
                  className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 transition-all font-bold text-xs md:text-sm
                    ${paymentMethod === 'paypal' 
                      ? 'bg-[#003087] text-white border-[#003087] shadow-lg shadow-blue-900/40' 
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'}`}
                >
                  <PayPalLogo />
                  {t.payWithPaypal}
                </button>
                <button
                  onClick={() => setPaymentMethod('google')}
                  className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 transition-all font-bold text-xs md:text-sm
                    ${paymentMethod === 'google' 
                      ? 'bg-[#00C853] text-white border-[#00C853] shadow-lg shadow-green-900/40' 
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'}`}
                >
                  <GooglePlayLogo />
                  Play
                </button>
              </div>

              {/* Credit Card / Google Card View */}
              {(paymentMethod === 'card' || paymentMethod === 'google') && (
                <>
                  {/* Virtual Card Preview */}
                  <div className={`bg-gradient-to-br p-5 rounded-xl border border-zinc-700 shadow-lg mb-8 relative overflow-hidden transition-colors duration-500
                    ${paymentMethod === 'google' 
                       ? 'from-zinc-800 to-zinc-900 border-green-500/50'
                       : cardType === 'mastercard' 
                          ? 'from-orange-900 to-red-900' 
                          : cardType === 'visa' 
                             ? 'from-blue-900 to-indigo-900' 
                             : 'from-zinc-800 to-black'}
                  `}>
                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                     <div className="flex justify-between items-start mb-6 h-8">
                       <div className="w-12 h-8 bg-gradient-to-r from-yellow-500 to-amber-300 rounded flex opacity-80"></div>
                       {paymentMethod === 'google' ? <div className="bg-white rounded-full p-1"><GooglePlayLogo /></div> : (
                          <>
                             {cardType === 'visa' && <VisaLogo />}
                             {cardType === 'mastercard' && <MastercardLogo />}
                             {!cardType && <span className="text-white/30 font-mono text-xs mt-1">CARD</span>}
                          </>
                       )}
                     </div>
                     
                     {paymentMethod === 'google' ? (
                        <div className="text-white font-mono text-lg tracking-widest mb-4 shadow-black drop-shadow-md text-center">
                          {googleCode || 'XXXX-XXXX-XXXX-XXXX'}
                        </div>
                     ) : (
                        <div className="text-white font-mono text-lg tracking-widest mb-4 shadow-black drop-shadow-md">
                          {cardNumber || '•••• •••• •••• ••••'}
                        </div>
                     )}

                     <div className="flex justify-between items-end">
                       <div>
                         <div className="text-[10px] text-zinc-400/80 uppercase">
                           {paymentMethod === 'google' ? 'Google Play' : 'Card Holder'}
                         </div>
                         <div className="text-zinc-200 text-sm font-bold uppercase truncate max-w-[150px]">
                           {paymentMethod === 'google' ? 'GIFT CARD' : (name || 'YOUR NAME')}
                         </div>
                       </div>
                       {paymentMethod === 'card' && (
                          <div>
                             <div className="text-[10px] text-zinc-400/80 uppercase">Expires</div>
                             <div className="text-zinc-200 text-sm font-bold">{expiry || 'MM/YY'}</div>
                          </div>
                       )}
                     </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {paymentMethod === 'google' ? (
                       <div className="space-y-2">
                         <label className="text-xs font-bold text-zinc-400 uppercase ml-1">{t.googlePlayCode}</label>
                         <div className="relative">
                           <input 
                             type="text"
                             value={googleCode}
                             onChange={handleGoogleCodeChange}
                             placeholder="XXXX-XXXX-XXXX-XXXX"
                             maxLength={19}
                             className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 pl-10 text-white placeholder-zinc-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all font-mono uppercase select-text z-20"
                             required
                           />
                           <Play className="w-4 h-4 text-green-500 absolute left-3 top-1/2 -translate-y-1/2 fill-green-500 z-10 pointer-events-none" />
                         </div>
                       </div>
                    ) : (
                       <>
                          <div className="space-y-2">
                             <label className="text-xs font-bold text-zinc-400 uppercase ml-1">{t.cardHolder}</label>
                             <input 
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value.toUpperCase())}
                                placeholder="SAM SMITH"
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white placeholder-zinc-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all select-text z-20"
                                required
                             />
                          </div>

                          <div className="space-y-2">
                             <label className="text-xs font-bold text-zinc-400 uppercase ml-1">{t.cardNumber}</label>
                             <div className="relative">
                                <input 
                                type="text"
                                value={cardNumber}
                                onChange={handleCardNumberChange}
                                placeholder="0000 0000 0000 0000"
                                maxLength={19}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 pl-10 text-white placeholder-zinc-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all font-mono select-text z-20"
                                required
                                />
                                <CreditCard className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
                                
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2 opacity-50 z-10 pointer-events-none">
                                {!cardType && (
                                   <>
                                      <div className="w-6 h-4 bg-zinc-700 rounded-sm"></div>
                                      <div className="w-6 h-4 bg-zinc-700 rounded-sm"></div>
                                   </>
                                )}
                                </div>
                             </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-400 uppercase ml-1">{t.expiryDate}</label>
                                <div className="relative">
                                <input 
                                   type="text"
                                   value={expiry}
                                   onChange={handleExpiryChange}
                                   placeholder="MM/YY"
                                   maxLength={5}
                                   className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 pl-10 text-white placeholder-zinc-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all font-mono select-text z-20"
                                   required
                                />
                                <Calendar className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
                                </div>
                             </div>
                             <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-400 uppercase ml-1">{t.cvv}</label>
                                <div className="relative">
                                <input 
                                   type="text"
                                   value={cvv}
                                   onChange={handleCvvChange}
                                   placeholder="123"
                                   maxLength={3}
                                   className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 pl-10 text-white placeholder-zinc-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all font-mono select-text z-20"
                                   required
                                />
                                <ShieldCheck className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
                                </div>
                             </div>
                          </div>
                       </>
                    )}

                    <button
                      type="submit"
                      disabled={isProcessing}
                      className={`w-full font-black py-4 rounded-xl shadow-lg hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed
                       ${paymentMethod === 'google' 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-green-500/20' 
                          : 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black hover:shadow-amber-500/20'}`}
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          <span>{t.processingPayment}</span>
                        </>
                      ) : (
                        <>
                          {paymentMethod === 'google' ? <Play className="w-4 h-4 fill-current" /> : <Lock className="w-4 h-4" />}
                          {paymentMethod === 'google' ? t.redeem : t.payNow}
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
              
              {paymentMethod === 'paypal' && (
                // PayPal View
                <div className="animate-in fade-in duration-300">
                  <div className="bg-[#003087] rounded-xl p-8 text-center text-white mb-6 shadow-lg shadow-blue-900/30">
                     <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-[#003087]">
                       <PayPalLogo />
                     </div>
                     <h3 className="font-bold text-xl mb-2">PayPal Checkout</h3>
                     <p className="text-blue-200 text-sm leading-relaxed px-4">
                       {t.redirectPaypal}
                     </p>
                  </div>
                  
                  <button
                      onClick={handleSubmit}
                      disabled={isProcessing}
                      className="w-full bg-[#FFC439] hover:bg-[#ffbb20] text-[#003087] font-black py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
                  >
                      {isProcessing ? t.processingPayment : t.payWithPaypal}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PaymentModal;
