import React, { createContext, useContext, useState } from 'react';

const SessionContext = createContext();

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

export const SessionProvider = ({ children }) => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const [sessionData, setSessionData] = useState({
    startTime: null,
    endTime: null,
    toolsUsed: [],
    notes: '',
  });

  const startSession = () => {
    setIsSessionActive(true);
    setSessionTime(0);
    setSessionXp(0);
    setSessionData(prev => ({
      ...prev,
      startTime: new Date(),
      toolsUsed: [],
      notes: '',
    }));
  };

  const pauseSession = () => {
    setIsSessionActive(false);
  };

  const resumeSession = () => {
    setIsSessionActive(true);
  };

  const resetSession = () => {
    setIsSessionActive(false);
    setSessionTime(0);
    setSessionXp(0);
    setSessionData({
      startTime: null,
      endTime: null,
      toolsUsed: [],
      notes: '',
    });
  };

  const endSession = () => {
    setIsSessionActive(false);
    setSessionData(prev => ({
      ...prev,
      endTime: new Date(),
    }));
    
    // Calculate final XP and save session
    const finalXp = sessionXp + 20; // Base + tool bonus
    
    // Here you would typically save the session to your backend
    console.log('Session ended:', {
      duration: sessionTime,
      xp: finalXp,
      toolsUsed: sessionData.toolsUsed,
      notes: sessionData.notes,
    });
    
    // Reset session state
    setTimeout(() => {
      setSessionTime(0);
      setSessionXp(0);
      setSessionData({
        startTime: null,
        endTime: null,
        toolsUsed: [],
        notes: '',
      });
    }, 1000);
    
    return finalXp;
  };

  const updateSessionTime = (time) => {
    setSessionTime(time);
  };

  const updateSessionXp = (xp) => {
    setSessionXp(xp);
  };

  const addToolUsed = (tool) => {
    if (!sessionData.toolsUsed.includes(tool)) {
      setSessionData(prev => ({
        ...prev,
        toolsUsed: [...prev.toolsUsed, tool],
      }));
    }
  };

  const updateSessionNotes = (notes) => {
    setSessionData(prev => ({
      ...prev,
      notes,
    }));
  };

  const value = {
    isSessionActive,
    sessionTime,
    sessionXp,
    sessionData,
    startSession,
    pauseSession,
    resumeSession,
    resetSession,
    endSession,
    updateSessionTime,
    updateSessionXp,
    addToolUsed,
    updateSessionNotes,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};
