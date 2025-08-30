import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

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
  const [isPaused, setIsPaused] = useState(false); // New state to track if the session is paused
  const [sessionTime, setSessionTime] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const [sessionData, setSessionData] = useState({
    startTime: null,
    endTime: null,
    toolsUsed: [],
    notes: '',
  });

  // Practice Tools State
  const [activeTool, setActiveTool] = useState(null);
  const [metronomeBpm, setMetronomeBpm] = useState(120);
  const [isMetronomeOn, setIsMetronomeOn] = useState(false);
  const [tunerNote, setTunerNote] = useState('A');
  const [tunerCents, setTunerCents] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');

  // Timer effect
  useEffect(() => {
    let interval = null;
    // The timer now runs only if the session is active AND not paused
    if (isSessionActive && !isPaused) {
      interval = setInterval(() => {
        setSessionTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSessionActive, isPaused]); // Now depends on both states

  const startSession = () => {
    setIsSessionActive(true);
    setIsPaused(false);
    setSessionTime(0);
    setSessionXp(0);
    setActiveTool(null);
    setSessionData(prev => ({
      ...prev,
      startTime: new Date(),
      toolsUsed: [],
      notes: '',
    }));
  };

  const pauseSession = () => {
    setIsPaused(true);
  };

  const resumeSession = () => {
    setIsPaused(false);
  };

  const endSession = () => {
    setIsSessionActive(false);
    setIsPaused(false);
    setActiveTool(null);
    setSessionData(prev => ({
      ...prev,
      endTime: new Date(),
      notes: sessionNotes,
    }));
    
    // Calculate final XP and save session
    const finalXp = sessionXp + 20;
    
    console.log('Session ended:', {
      duration: sessionTime,
      xp: finalXp,
      toolsUsed: sessionData.toolsUsed,
      notes: sessionNotes,
    });
    
    // Reset session state
    setTimeout(() => {
      setSessionTime(0);
      setSessionXp(0);
      setSessionNotes('');
      setSessionData({
        startTime: null,
        endTime: null,
        toolsUsed: [],
        notes: '',
      });
    }, 1000);
    
    return finalXp;
  };

  const resetSession = () => {
    setIsSessionActive(false);
    setIsPaused(false);
    setSessionTime(0);
    setSessionXp(0);
    setActiveTool(null);
    setSessionData({
      startTime: null,
      endTime: null,
      toolsUsed: [],
      notes: '',
    });
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
      setSessionXp(prev => prev + 5);
    }
  };

  const updateSessionNotes = (notes) => {
    setSessionNotes(notes);
  };

  // Practice Tool Functions
  const toggleTool = (tool) => {
    if (activeTool === tool) {
      setActiveTool(null);
    } else {
      setActiveTool(tool);
      addToolUsed(tool);
    }
  };

  const updateMetronomeBpm = (newBpm) => {
    setMetronomeBpm(Math.max(40, Math.min(240, newBpm)));
  };

  const toggleMetronome = () => {
    setIsMetronomeOn(!isMetronomeOn);
    if (!isMetronomeOn) {
      addToolUsed('metronome');
    }
  };

  const updateTuner = (note, cents) => {
    setTunerNote(note);
    setTunerCents(cents);
    addToolUsed('tuner');
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      addToolUsed('recorder');
    }
  };

  const value = {
    // Session State
    isSessionActive,
    isPaused, // Make sure this is exported
    sessionTime,
    sessionXp,
    sessionData,
    
    // Session Actions
    startSession,
    pauseSession,
    resumeSession,
    resetSession,
    endSession,
    updateSessionTime,
    updateSessionXp,
    addToolUsed,
    updateSessionNotes,
    
    // Practice Tools State
    activeTool,
    metronomeBpm,
    isMetronomeOn,
    tunerNote,
    tunerCents,
    isRecording,
    sessionNotes,
    
    // Practice Tools Actions
    toggleTool,
    updateMetronomeBpm,
    toggleMetronome,
    updateTuner,
    toggleRecording,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};