
import { useState, useEffect, useCallback, useRef } from 'react';
import { AppMode, Language } from '../types';
import { soundEngine } from '../utils/sound';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface UseVoiceNavigationProps {
  lang: Language;
  setMode: (mode: AppMode) => void;
  onSearch: (term: string) => void;
}

export const useVoiceNavigation = ({ lang, setMode, onSearch }: UseVoiceNavigationProps) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [isSupported, setIsSupported] = useState(false);

  // Use refs to access the latest functions without triggering re-renders
  const setModeRef = useRef(setMode);
  const onSearchRef = useRef(onSearch);

  useEffect(() => {
    setModeRef.current = setMode;
    onSearchRef.current = onSearch;
  }, [setMode, onSearch]);

  useEffect(() => {
    // Safety check for SSR or environments without window
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      const reco = new SpeechRecognition();
      reco.continuous = false;
      reco.interimResults = false;
      
      // Map app languages to speech recognition codes
      const langMap: Record<Language, string> = {
        'ar': 'ar-SA',
        'en': 'en-US',
        'fr': 'fr-FR'
      };
      
      reco.lang = langMap[lang] || 'en-US';
      
      reco.onstart = () => setIsListening(true);
      reco.onend = () => setIsListening(false);
      reco.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        // Only play error sound for actual errors, not aborts/no-speech
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
             soundEngine.playError();
        }
      };
      
      reco.onresult = (event: any) => {
        if (!event.results || !event.results[0] || !event.results[0][0]) return;
        
        const transcript = event.results[0][0].transcript?.toLowerCase();
        if (!transcript) return;
        
        // Define command processing logic using refs to avoid stale closures
        const handleCommand = (text: string) => {
            if (!text) return; // Added guard clause
            
            let commandRecognized = false;
            const currentSetMode = setModeRef.current;
            const currentOnSearch = onSearchRef.current;

            if (text.includes('home') || text.includes('الرئيسية') || text.includes('accueil') || text.includes('عودة')) {
                currentSetMode(AppMode.HOME);
                commandRecognized = true;
            } 
            else if (text.includes('decoder') || text.includes('diagnostic') || text.includes('scan') || text.includes('فحص') || text.includes('كود') || text.includes('تشخيص')) {
                currentSetMode(AppMode.DECODER);
                commandRecognized = true;
            } 
            else if (text.includes('sensor') || text.includes('gallery') || text.includes('حساس') || text.includes('capteur')) {
                currentSetMode(AppMode.SENSORS);
                commandRecognized = true;
            } 
            else if (text.includes('maintenance') || text.includes('log') || text.includes('صيانة') || text.includes('سجل') || text.includes('entretien')) {
                currentSetMode(AppMode.MAINTENANCE);
                commandRecognized = true;
            } 
            else if (text.includes('assistant') || text.includes('chat') || text.includes('مساعد') || text.includes('شات')) {
                currentSetMode(AppMode.CHAT);
                commandRecognized = true;
            }

            const searchPatterns = [
                /search (for )?(.+)/i,
                /find (.+)/i,
                /بحث (عن )?(.+)/,
                /chercher (.+)/i,
                /trouver (.+)/i
            ];

            if (!commandRecognized) {
                for (const pattern of searchPatterns) {
                    const match = text.match(pattern);
                    if (match && match[match.length - 1]) {
                        const term = match[match.length - 1].replace(/[?.,!]/g, '').trim();
                        currentOnSearch(term);
                        commandRecognized = true;
                        break;
                    }
                }
            }

            if (commandRecognized) {
                soundEngine.playSuccess();
            }
        };

        console.log('Voice Command:', transcript);
        handleCommand(transcript);
      };

      setRecognition(reco);
    }
  }, [lang]); // Only re-run if language changes

  const toggleListening = useCallback(() => {
    if (!recognition) return;
    
    if (isListening) {
      recognition.stop();
      soundEngine.playClick();
    } else {
      try {
        recognition.start();
        soundEngine.playScan();
      } catch (e) {
        console.error(e);
      }
    }
  }, [isListening, recognition]);

  return { isListening, toggleListening, isSupported };
};
