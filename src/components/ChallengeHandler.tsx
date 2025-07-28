
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

interface ChallengeHandlerProps {
  setChallengeSession: (session: any) => void;
  setIsChallengeMode: (isChallenge: boolean) => void;
}

export function ChallengeHandler({ setChallengeSession, setIsChallengeMode }: ChallengeHandlerProps) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const savedSession = localStorage.getItem('challengeSession');
    if (savedSession && searchParams) {
      setChallengeSession(JSON.parse(savedSession));
      const isChallenge = searchParams.get('challenge_mode');
      setIsChallengeMode(isChallenge === 'true');
    }
  }, [searchParams, setChallengeSession, setIsChallengeMode]);

  return null;
}
