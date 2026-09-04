import { createContext, useCallback, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { AppState, Platform } from 'react-native';
import * as Speech from 'expo-speech';
import { interpretarComando, type ComandoVoz } from '@/utils/voiceCommands';

export type VoiceMode = 'inactive' | 'prompt' | 'active';

type VoiceContextValue = {
  mode: VoiceMode;
  microphoneAvailable: boolean;
  listening: boolean;
  startRepairVoice: () => Promise<void>;
  enableVoice: () => Promise<void>;
  disableVoice: () => void;
  speak: (texto: string, depois?: () => void) => void;
  setCommandHandler: (handler: ((comando: ComandoVoz) => void) | null) => void;
};

const VoiceAssistantContext = createContext<VoiceContextValue | null>(null);

let SpeechRecognitionModule: any = null;
let SpeechRecognitionHook: any = null;

if (Platform.OS === 'ios' || Platform.OS === 'android') {
  try {
    const mod = require('expo-speech-recognition');
    SpeechRecognitionModule = mod.ExpoSpeechRecognitionModule;
    SpeechRecognitionHook = mod.useSpeechRecognitionEvent;
  } catch {
    SpeechRecognitionModule = null;
    SpeechRecognitionHook = null;
  }
}

function VoiceAssistantInner({ children }: PropsWithChildren) {
  const useSpeechRecognitionEvent = SpeechRecognitionHook;
  const ExpoSpeechRecognitionModule = SpeechRecognitionModule;
  const [mode, setMode] = useState<VoiceMode>('inactive');
  const [microphoneAvailable, setMicrophoneAvailable] = useState(false);
  const [listening, setListening] = useState(false);
  const modeRef = useRef<VoiceMode>('inactive');
  const micRef = useRef(false);
  const handlerRef = useRef<((comando: ComandoVoz) => void) | null>(null);
  const mountedRef = useRef(true);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setModeSafe = useCallback((next: VoiceMode) => {
    modeRef.current = next;
    setMode(next);
  }, []);

  const pararEscuta = useCallback(() => {
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    restartTimerRef.current = null;
    try { ExpoSpeechRecognitionModule.stop(); } catch {}
    if (mountedRef.current) setListening(false);
  }, []);

  const iniciarEscuta = useCallback(() => {
    if (!micRef.current || modeRef.current === 'inactive') return;
    try {
      ExpoSpeechRecognitionModule.start({
        lang: 'pt-BR',
        interimResults: false,
        continuous: true,
      });
    } catch {}
  }, []);

  const falaIdRef = useRef(0);

  const falar = useCallback((texto: string, depois?: () => void) => {
    const falaId = ++falaIdRef.current;
    pararEscuta();
    Speech.stop();
    Speech.speak(texto, {
      language: 'pt-BR',
      onDone: () => {
        if (falaId !== falaIdRef.current) return;
        depois?.();
        if (modeRef.current !== 'inactive') iniciarEscuta();
      },
      onError: () => {
        if (falaId !== falaIdRef.current) return;
        depois?.();
        if (modeRef.current !== 'inactive') iniciarEscuta();
      },
    });
  }, [iniciarEscuta, pararEscuta]);

  const enableVoice = useCallback(async () => {
    const permissao = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    const disponivel = Boolean(permissao.granted);
    micRef.current = disponivel;
    setMicrophoneAvailable(disponivel);
    if (!disponivel) {
      setModeSafe('inactive');
      pararEscuta();
      Speech.speak('O microfone está desativado. Ative a permissão do microfone para usar o auxílio de voz.', { language: 'pt-BR' });
      return;
    }
    setModeSafe('active');
    falar('Auxílio de voz ativado.');
  }, [falar, pararEscuta, setModeSafe]);

  const disableVoice = useCallback(() => {
    setModeSafe('inactive');
    pararEscuta();
    Speech.stop();
  }, [pararEscuta, setModeSafe]);

  const startRepairVoice = useCallback(async () => {
    const permissao = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    const disponivel = Boolean(permissao.granted);
    micRef.current = disponivel;
    setMicrophoneAvailable(disponivel);
    setModeSafe('prompt');
    falar('Deseja ativar o auxílio de voz?', () => {
      if (modeRef.current === 'prompt' && disponivel) iniciarEscuta();
    });
  }, [falar, iniciarEscuta, setModeSafe]);

  const setCommandHandler = useCallback((handler: ((comando: ComandoVoz) => void) | null) => {
    handlerRef.current = handler;
  }, []);

  useSpeechRecognitionEvent('start', () => {
    if (mountedRef.current) setListening(true);
  });

  useSpeechRecognitionEvent('end', () => {
    if (mountedRef.current) setListening(false);
    if (modeRef.current === 'inactive' || !micRef.current) return;
    restartTimerRef.current = setTimeout(iniciarEscuta, 250);
  });

  useSpeechRecognitionEvent('result', (event: any) => {
    const texto = event.results?.[0]?.transcript;
    if (!texto) return;
    const comando = interpretarComando(texto);
    if (modeRef.current === 'prompt') {
      if (comando.tipo === 'YES') enableVoice();
      else if (comando.tipo === 'NO') disableVoice();
      return;
    }
    if (modeRef.current === 'active' && comando.tipo !== 'UNKNOWN') {
      handlerRef.current?.(comando);
    }
  });

  useSpeechRecognitionEvent('error', () => {
    if (mountedRef.current) setListening(false);
  });

  useEffect(() => {
    mountedRef.current = true;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') pararEscuta();
      else if (modeRef.current !== 'inactive' && micRef.current) iniciarEscuta();
    });
    return () => {
      mountedRef.current = false;
      subscription.remove();
      pararEscuta();
      Speech.stop();
      handlerRef.current = null;
    };
  }, [iniciarEscuta, pararEscuta]);

  return (
    <VoiceAssistantContext.Provider value={{ mode, microphoneAvailable, listening, startRepairVoice, enableVoice, disableVoice, speak: falar, setCommandHandler }}>
      {children}
    </VoiceAssistantContext.Provider>
  );
}

function VoiceAssistantFallback({ children }: PropsWithChildren) {
  const speak = useCallback((texto: string) => {
    Speech.speak(texto, { language: 'pt-BR' });
  }, []);

  const value: VoiceContextValue = {
    mode: 'inactive',
    microphoneAvailable: false,
    listening: false,
    startRepairVoice: async () => {
      Speech.speak('O auxílio de voz não está disponível nesta versão.', { language: 'pt-BR' });
    },
    enableVoice: async () => {
      Speech.speak('O auxílio de voz não está disponível nesta versão.', { language: 'pt-BR' });
    },
    disableVoice: () => {},
    speak,
    setCommandHandler: () => {},
  };

  return (
    <VoiceAssistantContext.Provider value={value}>
      {children}
    </VoiceAssistantContext.Provider>
  );
}

export function VoiceAssistantProvider({ children }: PropsWithChildren) {
  if (SpeechRecognitionModule) {
    return <VoiceAssistantInner>{children}</VoiceAssistantInner>;
  }
  return <VoiceAssistantFallback>{children}</VoiceAssistantFallback>;
}

export function useVoiceAssistant() {
  const context = useContext(VoiceAssistantContext);
  if (!context) throw new Error('useVoiceAssistant deve ser usado dentro de VoiceAssistantProvider');
  return context;
}
