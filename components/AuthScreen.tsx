
import React, { useState, useEffect } from 'react';
import { User, Language } from '../types';
import { translations } from '../utils/translations';
import { Truck, Lock, User as UserIcon, ArrowRight, ShieldCheck, AlertTriangle, Facebook, Twitter, Share2, CheckCircle2 } from 'lucide-react';
import { soundEngine } from '../utils/sound';

interface AuthScreenProps {
  onLogin: (user: User) => void;
  lang: Language;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, lang }) => {
  const [step, setStep] = useState<'auth' | 'verify'>('auth');
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  
  const t = translations[lang];

  useEffect(() => {
    soundEngine.playScan();
  }, []);

  const saveUserToLocal = (newUser: {name: string, password?: string}) => {
    const users = JSON.parse(localStorage.getItem('sm_registered_users') || '[]');
    if (!users.find((u: any) => u.name === newUser.name)) {
      users.push(newUser);
      localStorage.setItem('sm_registered_users', JSON.stringify(users));
    }
  };

  const checkUserCredentials = (nameInput: string, passInput: string) => {
    const users = JSON.parse(localStorage.getItem('sm_registered_users') || '[]');
    return users.find((u: any) => u.name === nameInput && u.password === passInput);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !password) {
      setError(t.fillAllFields);
      soundEngine.playError();
      return;
    }

    if (isRegister) {
      const users = JSON.parse(localStorage.getItem('sm_registered_users') || '[]');
      if (users.find((u: any) => u.name === name)) {
        setError(t.userExists);
        soundEngine.playError();
        return;
      }
      soundEngine.playSuccess();
      setStep('verify');
    } else {
      if (checkUserCredentials(name, password)) {
        soundEngine.playSuccess();
        setStep('verify');
      } else {
        setError(t.invalidCredentials);
        soundEngine.playError();
      }
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.playSuccess();
    if (isRegister) saveUserToLocal({ name, password });
    onLogin({ name: name || 'User', isRegistered: true });
  };

  const handleSocialLogin = (provider: string) => {
    soundEngine.playClick();
    setSocialLoading(provider);
    setStatusMessage(lang === 'ar' ? `جاري الاتصال...` : `Connecting...`);
    
    setTimeout(() => {
      soundEngine.playSuccess();
      const user = { name: `${provider} User`, isRegistered: true };
      saveUserToLocal({ name: user.name, password: 'social-login' });
      onLogin(user);
      setSocialLoading(null);
    }, 3000);
  };

  return (
    <div className="min-h-full flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-zinc-100 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-red-600"></div>
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-zinc-900 rounded-2xl flex items-center justify-center shadow-xl border-4 border-zinc-50">
               {step === 'verify' ? <ShieldCheck className="text-emerald-500" /> : <Truck className="text-red-600" />}
            </div>
          </div>

          {step === 'auth' ? (
            <div className="animate-in fade-in duration-500">
              <h2 className="text-3xl font-black text-center text-zinc-900 mb-6 tracking-tight">
                {isRegister ? t.register : t.login}
              </h2>
              {error && <div className="bg-red-50 text-red-600 p-2 rounded mb-4 text-center text-sm font-bold">{error}</div>}
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-4 bg-zinc-50 border-2 rounded-xl" placeholder={t.name} required />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 bg-zinc-50 border-2 rounded-xl" placeholder={t.password} required />
                <button type="submit" className="w-full bg-zinc-900 text-white font-bold py-4 rounded-xl">
                  {isRegister ? t.register : t.login}
                </button>
              </form>
              <div className="mt-8 text-center">
                <button onClick={() => setIsRegister(!isRegister)} className="text-zinc-500 text-sm font-bold">
                  {isRegister ? t.login : t.register}
                </button>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in duration-500">
               <h2 className="text-2xl font-black text-center text-zinc-900 mb-6">{t.securityCheck}</h2>
               <form onSubmit={handleVerifySubmit}>
                 <div className="flex justify-center gap-2 mb-8" dir="ltr">
                    {otp.map((digit, index) => (
                      <input key={index} id={`otp-${index}`} type="text" maxLength={1} value={digit} onChange={(e) => handleOtpChange(index, e.target.value)} className="w-12 h-14 border-2 rounded-lg text-center text-2xl font-bold" />
                    ))}
                 </div>
                 <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl">{t.verify}</button>
               </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
