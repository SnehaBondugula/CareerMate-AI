"use client"

import { createContext, useContext, useState, ReactNode } from 'react';

interface MetricsContextType {
  handDetectionCounter: number;
  setHandDetectionCounter: (count: number) => void;
  handDetectionDuration: number;
  setHandDetectionDuration: (duration: number) => void;
  notFacingCounter: number;
  setNotFacingCounter: (count: number) => void;
  notFacingDuration: number;
  setNotFacingDuration: (duration: number) => void;
  badPostureDetectionCounter: number;
  setBadPostureDetectionCounter: (count: number) => void;
  badPostureDuration: number;
  setBadPostureDuration: (duration: number) => void;
}

const MetricsContext = createContext<MetricsContextType | undefined>(undefined);

export const MetricsProvider = ({ children }: { children: ReactNode }) => {
  const [handDetectionCounter, setHandDetectionCounter] = useState(0);
  const [handDetectionDuration, setHandDetectionDuration] = useState(0);
  const [notFacingCounter, setNotFacingCounter] = useState(0);
  const [notFacingDuration, setNotFacingDuration] = useState(0);
  const [badPostureDetectionCounter, setBadPostureDetectionCounter] = useState(0);
  const [badPostureDuration, setBadPostureDuration] = useState(0);

  return (
    <MetricsContext.Provider value={{
      handDetectionCounter,
      setHandDetectionCounter,
      handDetectionDuration,
      setHandDetectionDuration,
      notFacingCounter,
      setNotFacingCounter,
      notFacingDuration,
      setNotFacingDuration,
      badPostureDetectionCounter,
      setBadPostureDetectionCounter,
      badPostureDuration,
      setBadPostureDuration,
    }}>
      {children}
    </MetricsContext.Provider>
  );
};

export const useMetrics = () => {
  const context = useContext(MetricsContext);
  if (context === undefined) {
    throw new Error('useMetrics must be used within a MetricsProvider');
  }
  return context;
};