import { useState, useEffect, useRef, useCallback } from 'react';

// Tell TS about the SpeechRecognition types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function useVoiceInput(lang: 'ro' | 'en' | 'de', onResult: (text: string, isFinal: boolean) => void) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("SpeechRecognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    switch (lang) {
        case 'ro': recognition.lang = 'ro-RO'; break;
        case 'de': recognition.lang = 'de-DE'; break;
        case 'en': default: recognition.lang = 'en-US'; break;
    }

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      if (finalTranscript) {
          onResult(finalTranscript.trim(), true);
      } else if (interimTranscript) {
          onResult(interimTranscript.trim(), false);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [lang, onResult]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
        alert("Recunoașterea vocală nu este suportată de acest browser. Vă rugăm să folosiți Chrome, Safari sau Edge.");
        return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("Failed to start voice recognition", e);
      }
    }
  }, [isListening]);

  return { isListening, toggleListening };
}
