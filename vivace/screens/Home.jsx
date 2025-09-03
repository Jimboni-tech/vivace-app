import React, { useState, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, SafeAreaView, StatusBar, RefreshControl } from 'react-native';
import theme, { BASE_COLORS, DEFAULT_THEME, FONTS, SIZES } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '../context/SessionContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const getUserToken = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    return token;
  } catch (e) {
    console.error("Failed to retrieve the token.", e);
    return null;
  }
};

const HomeScreen = ({ navigation }) => {
  const [userName, setUserName] = useState('Musician');
  const [userStats, setUserStats] = useState({
    streak: 0,
    longestStreak: 0,
    streakAtRisk: false,
    practicedToday: false
  });
  const [userXP, setUserXP] = useState({
    level: 1,
    totalXP: 0,
    currentXP: 0,
    requiredXP: 100,
    percentage: 0,
    nextLevelXP: 100
  });
  const [recentSessions, setRecentSessions] = useState([]);
  const [sessionPage, setSessionPage] = useState(1);
  const [sessionLoadingMore, setSessionLoadingMore] = useState(false);
  const SESSIONS_PER_PAGE = 10;
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add these new state variables for caching and debouncing
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const fetchTimeoutRef = useRef(null);
  const isFetchingRef = useRef(false);
  
  // Minimum time between fetches (in milliseconds)
  const MIN_FETCH_INTERVAL = 5000; // 5 seconds

  const { isSessionActive, startSession } = useSession();

  // Helper function to safely format a date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Date error';
    }
  };

  // Safe helper function for rendering
  const safe = (v) => {
    if (v === null || v === undefined) return '';
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return String(v);
    if (typeof v === 'object') return v.name ?? v.title ?? JSON.stringify(v);
    return String(v);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUserData(true); // Force refresh when user explicitly pulls to refresh
    setRefreshing(false);
  }, []);

  const handleStartSession = () => {
    if (!isSessionActive) {
      Alert.alert(
        "Start Practice Session",
        "Would you like to start a new practice session?",
        [
          {
            text: "No",
            style: "cancel"
          },
          {
            text: "Yes",
            onPress: () => {
              startSession();
              navigation.navigate('Practice', { screen: 'PracticeSession' });
            }
          }
        ]
      );
    }
  };

  const fetchWithTimeout = (url, options, timeout = 30000) => {
    console.log('Fetching from:', url);
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        console.error(`Request to ${url} timed out after ${timeout}ms`);
        reject(new Error('timeout'));
      }, timeout);
      fetch(url, options)
        .then((response) => {
          clearTimeout(timer);
          resolve(response);
        })
        .catch((err) => {
          clearTimeout(timer);
          reject(err);
        });
    });
  };

  const fetchUserData = async (forceRefresh = false) => {
    // Prevent multiple simultaneous fetches
    if (isFetchingRef.current && !forceRefresh) {
      console.log('Fetch already in progress, skipping...');
      return;
    }
    
    // Check if enough time has passed since last fetch
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTime;
    
    if (!forceRefresh && timeSinceLastFetch < MIN_FETCH_INTERVAL) {
      console.log(`Skipping fetch - only ${timeSinceLastFetch}ms since last fetch (minimum: ${MIN_FETCH_INTERVAL}ms)`);
      return;
    }
    
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);
    setLastFetchTime(now);
    
    const token = await getUserToken();

    if (!token) {
      setError("Authentication failed. Please log in again.");
      setLoading(false);
      isFetchingRef.current = false;
      return;
    }

    console.log('Fetching user data...');
    try {
      // Fetch user profile and stats
      const profileResponse = await fetchWithTimeout(`${API_BASE_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!profileResponse.ok) {
        const errorText = await profileResponse.text();
        console.error("API Error Response:", errorText);
        if (profileResponse.status === 401) {
          setError("Session expired. Please log in again.");
        } else {
          setError(`Server error: ${profileResponse.status}`);
        }
        return;
      }

      const profileData = await profileResponse.json();
      console.log('Profile data received:', JSON.stringify(profileData.user?.stats, null, 2));

      if (profileData.user) {
        const user = profileData.user;
        const displayName = user.profile?.displayName || user.username || 'Musician';
        setUserName(displayName);
        
        // Set basic streak info from profile data
        setUserStats({
          streak: user.stats.currentStreak,
          longestStreak: user.stats.longestStreak,
          streakAtRisk: false,
          practicedToday: false
        });
        
        console.log('Updated user stats from profile:', user.stats.currentStreak, user.stats.longestStreak);
      }
      
      // Fetch detailed streak information
      try {
        console.log('Fetching detailed streak information...');
        const streakResponse = await fetchWithTimeout(`${API_BASE_URL}/users/streak`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (streakResponse.ok) {
          const streakData = await streakResponse.json();
          console.log('Streak data received:', JSON.stringify(streakData, null, 2));
          
          if (streakData.streak) {
            setUserStats(prevStats => {
              const newStats = {
                ...prevStats,
                streak: streakData.streak.currentStreak,
                longestStreak: streakData.streak.longestStreak,
                streakAtRisk: streakData.streak.streakAtRisk || false,
                nextMilestone: streakData.streak.nextMilestone,
                daysUntilMilestone: streakData.streak.daysUntilMilestone,
                practicedToday: streakData.streak.practicedToday || false
              };
              console.log('Updated user stats from streak endpoint:', newStats);
              return newStats;
            });
          }
        } else {
          console.error('Streak fetch failed with status:', streakResponse.status);
        }
      } catch (err) {
        console.error("Failed to fetch streak data:", err);
        // We'll continue even if streak fetch fails, as we already have basic streak info
      }

      // Fetch XP and level information
      try {
        console.log('Fetching XP information...');
        const xpResponse = await fetchWithTimeout(`${API_BASE_URL}/users/xp`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (xpResponse.ok) {
          const xpData = await xpResponse.json();
          console.log('XP data received:', JSON.stringify(xpData, null, 2));
          
          if (xpData.xp) {
            setUserXP({
              level: xpData.xp.level,
              totalXP: xpData.xp.totalXP,
              currentXP: xpData.xp.currentXP,
              requiredXP: xpData.xp.requiredXP,
              percentage: xpData.xp.percentage,
              nextLevelXP: xpData.xp.nextLevelXP
            });
            console.log('Updated user XP data:', xpData.xp);
          }
        } else {
          console.error('XP fetch failed with status:', xpResponse.status);
        }
      } catch (err) {
        console.error("Failed to fetch XP data:", err);
        // Continue even if XP fetch fails
      }

      // Fetch recent practice sessions (paginated)
      const sessionsResponse = await fetchWithTimeout(`${API_BASE_URL}/practice?limit=${SESSIONS_PER_PAGE}&page=1`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!sessionsResponse.ok) {
        const errorText = await sessionsResponse.text();
        console.error("Sessions API Error Response:", errorText);
        setError("Failed to load recent sessions.");
        return;
      }
      const sessionsData = await sessionsResponse.json();
      if (sessionsData.sessions) {
        setRecentSessions(sessionsData.sessions);
        setSessionPage(1);
      } else {
        setRecentSessions([]);
      }

    } catch (err) {
      console.error("Failed to fetch data:", err);
      if (err.message === 'timeout') {
        setError(`Network request timed out. Please check your connection and API server at ${API_BASE_URL}`);
        Alert.alert(
          "Connection Timeout",
          `Could not connect to server at ${API_BASE_URL}. Make sure your backend server is running and accessible.`,
          [{ text: "OK" }]
        );
      } else {
        setError(`Could not load data: ${err.message}. Please check your network connection.`);
      }
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  // Debounced version of fetchUserData
  const debouncedFetchUserData = useCallback((forceRefresh = false) => {
    // Clear any existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    
    // Set a new timeout
    fetchTimeoutRef.current = setTimeout(() => {
      fetchUserData(forceRefresh);
    }, 300); // 300ms debounce
  }, []);

  // Use useFocusEffect to refresh data when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('Home screen focused - scheduling data refresh');
      
      // Use debounced fetch instead of immediate fetch
      debouncedFetchUserData(false);
      
      return () => {
        // Cleanup: clear any pending timeouts
        if (fetchTimeoutRef.current) {
          clearTimeout(fetchTimeoutRef.current);
        }
      };
    }, [debouncedFetchUserData])
  );

  const loadMoreSessions = async () => {
    if (sessionLoadingMore) return;
    setSessionLoadingMore(true);
    const token = await getUserToken();
    try {
      const nextPage = sessionPage + 1;
      const sessionsResponse = await fetchWithTimeout(`${API_BASE_URL}/practice?limit=${SESSIONS_PER_PAGE}&page=${nextPage}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        if (sessionsData.sessions && sessionsData.sessions.length > 0) {
          setRecentSessions(prev => [...prev, ...sessionsData.sessions]);
          setSessionPage(nextPage);
        }
      }
    } catch (err) {
      // Optionally handle error
    } finally {
      setSessionLoadingMore(false);
    }
  };

  const renderSessionItem = ({ item }) => (
    <View style={styles.sessionItem}>
      <View style={styles.sessionIconWrap}>
        <Ionicons name="musical-notes" size={18} color={BASE_COLORS.blue.primary} />
      </View>
      <View style={styles.sessionContent}>
        <Text style={styles.sessionDate} numberOfLines={1}>
          {formatDate(item.startTime || item.date || item.createdAt || item.updatedAt)}
        </Text>
        <Text style={styles.sessionDuration}>
          {item.duration ? Math.floor(item.duration / 60) : 0} min
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={BASE_COLORS.blue.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Ionicons name="alert-circle" size={50} color={BASE_COLORS.red.primary} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={BASE_COLORS.white} />
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.header}>Welcome back, {safe(userName)}!</Text>
        <Text style={styles.subtitle}>Ready to practice today?</Text>

        {/* Practice Button */}
        <TouchableOpacity 
          style={styles.startButton} 
          onPress={handleStartSession}
          accessibilityRole="button"
          accessibilityLabel="Start Practice Session"
          accessibilityHint="Tap to begin a new practice session"
        >
          <Ionicons name="play-circle" size={32} color={BASE_COLORS.white} />
          <Text style={styles.startButtonText}>Start Practice Session</Text>
        </TouchableOpacity>
        
        {/* Recent Sessions */}
        <View style={styles.sectionTitle}>
          <Ionicons name="time" size={22} color={BASE_COLORS.blue.primary} />
          <Text style={styles.sectionTitleText}>Recent Sessions</Text>
        </View>
        <View style={styles.detailCard}>
          {recentSessions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="musical-notes-outline" size={40} color={BASE_COLORS.gray[300]} />
              <Text style={styles.emptyStateText}>No recent sessions found</Text>
              <Text style={styles.emptyStateSubtext}>Start a practice session to see it here!</Text>
            </View>
          ) : (
            <>
              {recentSessions.slice(0, 5).map((session, idx) => (
                <React.Fragment key={session._id || idx}>
                  {renderSessionItem({ item: session })}
                </React.Fragment>
              ))}
              {recentSessions.length > 5 && (
                <TouchableOpacity
                  style={styles.loadMoreButton}
                  onPress={loadMoreSessions}
                  disabled={sessionLoadingMore}
                  accessibilityRole="button"
                  accessibilityLabel="Load more sessions"
                >
                  <Text style={styles.loadMoreText}>
                    {sessionLoadingMore ? 'Loading...' : `View All (${recentSessions.length})`}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {/* Spacer for bottom padding */}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BASE_COLORS.gray[50],
  },
  container: {
    flex: 1,
    backgroundColor: BASE_COLORS.gray[50],
    padding: SIZES.spacing.lg,
  },
  header: {
    fontSize: FONTS.h1.fontSize,
    fontWeight: FONTS.h1.fontWeight,
    color: BASE_COLORS.blue.primary,
    marginBottom: SIZES.spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONTS.body1.fontSize,
    fontWeight: FONTS.body1.fontWeight,
    color: BASE_COLORS.gray[400],
    textAlign: 'center',
    marginBottom: SIZES.spacing.xl,
  },
  startButton: {
    backgroundColor: DEFAULT_THEME.button.primaryBackground,
    marginBottom: SIZES.spacing.xl,
    paddingVertical: 20,
    borderRadius: SIZES.radius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: BASE_COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  startButtonText: {
    fontSize: FONTS.button.fontSize,
    fontWeight: FONTS.button.fontWeight,
    color: DEFAULT_THEME.button.primaryText,
    marginLeft: 10,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
    marginTop: SIZES.spacing.lg,
  },
  sectionTitleText: {
    fontSize: FONTS.h3.fontSize,
    fontWeight: FONTS.h3.fontWeight,
    color: BASE_COLORS.gray[500],
    marginLeft: SIZES.spacing.xs,
  },
  detailCard: {
    backgroundColor: BASE_COLORS.white,
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.md,
    elevation: 2,
    shadowColor: BASE_COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BASE_COLORS.gray[100],
  },
  sessionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BASE_COLORS.blue.light,
    marginRight: SIZES.spacing.sm,
  },
  sessionContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionDate: {
    fontSize: FONTS.body2.fontSize,
    fontWeight: FONTS.body2.fontWeight,
    color: BASE_COLORS.gray[700],
    flex: 1,
  },
  sessionDuration: {
    fontSize: FONTS.body2.fontSize,
    fontWeight: FONTS.body2.fontWeight,
    color: BASE_COLORS.gray[400],
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SIZES.spacing.xl,
  },
  emptyStateText: {
    fontSize: FONTS.h4.fontSize,
    fontWeight: FONTS.h4.fontWeight,
    color: BASE_COLORS.gray[400],
    marginTop: SIZES.spacing.sm,
  },
  emptyStateSubtext: {
    fontSize: FONTS.body2.fontSize,
    fontWeight: FONTS.body2.fontWeight,
    color: BASE_COLORS.gray[300],
    marginTop: SIZES.spacing.xs,
    textAlign: 'center',
  },
  loadMoreButton: {
    backgroundColor: BASE_COLORS.blue.light,
    borderRadius: SIZES.radius.md,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignSelf: 'center',
    marginTop: SIZES.spacing.md,
  },
  loadMoreText: {
    fontSize: FONTS.body2.fontSize,
    fontWeight: FONTS.body2.fontWeight,
    color: BASE_COLORS.blue.primary,
  },
  loadingText: {
    fontSize: FONTS.body1.fontSize,
    fontWeight: FONTS.body1.fontWeight,
    color: BASE_COLORS.gray[400],
    marginTop: SIZES.spacing.sm,
  },
  errorText: {
    color: BASE_COLORS.red.primary,
    fontSize: FONTS.h3.fontSize,
    fontWeight: FONTS.h3.fontWeight,
    textAlign: 'center',
    marginTop: SIZES.spacing.md,
  },
});

export default HomeScreen;
