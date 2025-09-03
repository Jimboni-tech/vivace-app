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
      startTime: updatedSessionData.startTime || sessionData.startTime || null,
      status: 'completed' // Explicitly set status to completed
    };
    
    const API_URL = process.env.EXPO_PUBLIC_API_URL;
    try {
      let token = await AsyncStorage.getItem('userToken');
      if (!token) {
        token = await AsyncStorage.getItem('token');
      }
      
      // If no token, we can't proceed
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      let sessionData;
      
      // If we have a session ID, we'll try to complete it directly first
      if (sessionId) {
        try {
          console.log('Attempting to complete session directly:', sessionId);
          
          const completeResponse = await fetch(`${API_URL}/practice/${sessionId}/complete`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              endTime: updatedSessionData.endTime || new Date(),
              duration: sessionTime,
              notes: sessionToSave.notes,
              title: sessionToSave.title
            })
          });
          
          if (completeResponse.ok) {
            sessionData = await completeResponse.json();
            console.log('Session completed successfully via complete endpoint!', sessionData);
            
            // No need to do the PUT update since we've successfully completed
            return sessionData; // Return the complete response with XP info
          } else {
            const errorText = await completeResponse.text();
            console.warn('Could not complete session directly, will try updating first:', errorText);
            
            // If completion fails, we'll fall back to the old approach
            // Update the session first, then try to complete it
            let url = `${API_URL}/practice/${sessionId}`;
            const updateResponse = await fetch(url, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify(sessionToSave)
            });
            
            if (!updateResponse.ok) {
              throw new Error(`Failed to update session: ${await updateResponse.text()}`);
            }
            
            sessionData = await updateResponse.json();
            console.log('Session updated successfully, now trying to complete');
            
            // Now try to complete it again
            const secondCompleteResponse = await fetch(`${API_URL}/practice/${sessionId}/complete`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                endTime: updatedSessionData.endTime || new Date(),
                duration: sessionTime
              })
            });
            
            if (secondCompleteResponse.ok) {
              const completeData = await secondCompleteResponse.json();
              console.log('Session completed successfully after update!', completeData);
              sessionData = completeData;
              return completeData; // Return with XP info
            } else {
              console.warn('Could not complete session after update:', await secondCompleteResponse.text());
              // We'll continue with the session data from the update
            }
          }
        } catch (completeError) {
          console.error('Error in completion process:', completeError);
          throw completeError;
        }
      } else {
        // Create a new session directly as completed
        console.log('Creating new completed session');
        const createResponse = await fetch(`${API_URL}/practice`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(sessionToSave)
        });
        
        if (!createResponse.ok) {
          throw new Error(`Failed to create session: ${await createResponse.text()}`);
        }
        
        sessionData = await createResponse.json();
        console.log('New session created successfully:', sessionData);
        
        // Now try to complete it
        if (sessionData._id) {
          try {
            const completeResponse = await fetch(`${API_URL}/practice/${sessionData._id}/complete`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                endTime: updatedSessionData.endTime || new Date(),
                duration: sessionTime
              })
            });
            
            if (completeResponse.ok) {
              const completeData = await completeResponse.json();
              console.log('New session completed successfully!', completeData);
              sessionData = completeData;
              return completeData; // Return with XP info
            } else {
              console.warn('Could not complete new session:', await completeResponse.text());
              // We'll continue with the session data from the creation
            }
          } catch (completeError) {
            console.warn('Error completing new session:', completeError);
            // Continue with the created session data
          }
        }
      }
      
      // Clean up session state
      console.log('Cleaning up session state');
      await AsyncStorage.removeItem('activeSessionId');
      
      setSessionTime(0);
      setSessionXp(0);
      setSessionNotes('');
      setSessionData({
        startTime: null,
        endTime: null,
        toolsUsed: [],
        notes: '',
      });
      
      return sessionData;
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
      // Get the active session ID and delete it from the database
      const sessionId = await AsyncStorage.getItem('activeSessionId');
      
      if (sessionId) {
        const API_URL = process.env.EXPO_PUBLIC_API_URL;
        const token = await AsyncStorage.getItem('userToken') || await AsyncStorage.getItem('token');
        
        if (token) {
          console.log('Deleting cancelled session:', sessionId);
          
          // Delete the session from the database
          const deleteResponse = await fetch(`${API_URL}/practice/${sessionId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (deleteResponse.ok) {
            console.log('Cancelled session deleted successfully');
          } else {
            console.error('Failed to delete cancelled session:', await deleteResponse.text());
          }
        }
      }
      
      // Clean up by removing the active session ID
      await AsyncStorage.removeItem('activeSessionId');
    } catch (error) {
      console.error('Error during session reset:', error);
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