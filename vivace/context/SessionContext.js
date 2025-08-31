import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  const startSession = async () => {
    setIsSessionActive(true);
    setIsPaused(false);
    setSessionTime(0);
    setSessionXp(0);
    setActiveTool(null);
    setSessionNotes('');
    const startTime = new Date();
    
    setSessionData(prev => ({
      ...prev,
      startTime: startTime,
      toolsUsed: [],
      notes: '',
    }));
    
    // Create a session in the backend and store the ID
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL;
      const token = await AsyncStorage.getItem('userToken') || await AsyncStorage.getItem('token');
      
      if (token) {
        const response = await fetch(`${API_URL}/practice`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: 'Practice Session',
            startTime: startTime,
            notes: ''
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          // Store the session ID for later updates
          if (data._id) {
            await AsyncStorage.setItem('activeSessionId', data._id);
            console.log('Session created with ID:', data._id);
          }
        }
      }
    } catch (error) {
      console.error('Error creating new session:', error);
    }
  };

  const pauseSession = () => {
    setIsPaused(true);
  };

  const resumeSession = () => {
    setIsPaused(false);
  };

  const endSession = async () => {
    setIsSessionActive(false);
    setIsPaused(false);
    setActiveTool(null);
    const endTime = new Date();
    
    // Update session data with end time and duration
    setSessionData(prev => ({
      ...prev,
      endTime: endTime,
      notes: sessionNotes,
      duration: sessionTime
    }));
    
    return {
      finalXp: sessionXp + 20,
      sessionData: {
        ...sessionData,
        endTime,
        notes: sessionNotes,
        duration: sessionTime
      }
    };
  };

  // New function to end session and save to backend
  const endSessionAndSave = async (updatedSessionData) => {
    // Get the active session ID if it exists
    let sessionId;
    try {
      sessionId = await AsyncStorage.getItem('activeSessionId');
    } catch (error) {
      console.error('Error getting active session ID:', error);
    }
    
    const sessionToSave = {
      title: updatedSessionData.title || 'Practice Session',
      notes: updatedSessionData.notes || sessionNotes,
      recordings: updatedSessionData.recordings || [],
      duration: sessionTime, // duration in seconds, from timer
      date: new Date(),
      endTime: updatedSessionData.endTime || new Date(),
      startTime: updatedSessionData.startTime || sessionData.startTime || null
    };
    
    const API_URL = process.env.EXPO_PUBLIC_API_URL;
    try {
      let token = await AsyncStorage.getItem('userToken');
      if (!token) {
        token = await AsyncStorage.getItem('token');
      }
      
      let url = `${API_URL}/practice`;
      let method = 'POST';
      
      // If we have a session ID, update the existing session instead of creating a new one
      if (sessionId) {
        url = `${API_URL}/practice/${sessionId}`;
        method = 'PUT';
      }
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(sessionToSave)
      });
      
      if (response.ok) {
        console.log('Practice session saved successfully!');
        // Clear the active session ID
        await AsyncStorage.removeItem('activeSessionId');
        
        // Reset session state
        setSessionTime(0);
        setSessionXp(0);
        setSessionNotes('');
        setSessionData({
          startTime: null,
          endTime: null,
          toolsUsed: [],
          notes: '',
        });
        
        return await response.json();
      } else {
        console.error('Failed to save session:', await response.text());
        throw new Error('Failed to save session');
      }
    } catch (e) {
      console.error('Failed to save session:', e);
      throw e;
    }
  };

  const resetSession = async () => {
    setIsSessionActive(false);
    setIsPaused(false);
    setSessionTime(0);
    setSessionXp(0);
    setActiveTool(null);
    setSessionNotes('');
    setSessionData({
      startTime: null,
      endTime: null,
      toolsUsed: [],
      notes: '',
    });
    
    try {
      // Clean up by removing the active session ID
      await AsyncStorage.removeItem('activeSessionId');
    } catch (error) {
      console.error('Error removing active session ID:', error);
    }
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

  const updateSessionNotes = async (notes) => {
    setSessionNotes(notes);
    
    // Store the session ID if we're in an active session
    if (isSessionActive && sessionData.startTime) {
      try {
        // Check if we have a stored session ID
        const activeSessionId = await AsyncStorage.getItem('activeSessionId');
        
        if (activeSessionId) {
          const API_URL = process.env.EXPO_PUBLIC_API_URL;
          const token = await AsyncStorage.getItem('userToken') || await AsyncStorage.getItem('token');
          
          if (token) {
            // Make a background API call to update notes in real-time
            fetch(`${API_URL}/practice/${activeSessionId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ notes })
            }).catch(err => {
              console.error('Failed to update notes in real-time:', err);
            });
          }
        }
      } catch (error) {
        console.error('Error updating session notes:', error);
      }
    }
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
    endSessionAndSave,
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