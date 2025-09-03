import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  SafeAreaView, 
  StatusBar, 
  TouchableOpacity, 
  Modal, 
  FlatList, 
  RefreshControl, 
  TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sessionApi, userApi, API_BASE_URL as RESOLVED_API_BASE } from '../utils/apiClient';
// import { BASE_COLORS, FONTS, SIZES } from '../constants/theme'; // Commented out

// Hardcoded values for temporary debugging
const TEMP_BASE_COLORS = {
  blue: { primary: '#3D9CFF', light: '#7BB9FF' },
  red: { primary: '#FF6347' },
  yellow: { primary: '#FFD700' },
  white: '#FFFFFF',
  black: '#000000',
  gray: { 50: '#F8F9FA', 200: '#E9ECEF', 300: '#DEE2E6', 400: '#CED4DA', 500: '#ADB5BD', 600: '#6C757D', 700: '#495057' },
};

const TEMP_FONTS = {
  h1: { fontSize: 28, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 20, fontWeight: 'bold' },
  h4: { fontSize: 18, fontWeight: 'bold' },
  body1: { fontSize: 16 },
  body2: { fontSize: 14 },
  caption: { fontSize: 12 },
};

const TEMP_SIZES = {
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  radius: { sm: 4, md: 8, lg: 12, xl: 16, round: 999 },
};


const StatsScreen = () => {
  // All primitive values only in initial state - make sure no objects in the render
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalDuration: 0,
    averageDuration: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalSongs: 0,
    totalExercises: 0,
    totalXP: 0,
    level: 1,
    weekly: { days: [], totalMinutes: 0, dailyAverage: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [xp, setXp] = useState({ level: 1, totalXP: 0, currentXP: 0, requiredXP: 0, percentage: 0, nextLevelXP: 0 });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('songs');
  const [practicedSongs, setPracticedSongs] = useState([]);
  const [practicedExercises, setPracticedExercises] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [sortKey, setSortKey] = useState('lastPracticedDesc');

  const API_BASE_URL = RESOLVED_API_BASE;

  const getUserToken = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken') || await AsyncStorage.getItem('token');
      return token;
    } catch (e) {
      return null;
    }
  };

  // Build filtered & sorted data for modal list (must be defined before any early returns)
  const listData = useMemo(() => {
    const items = (modalType === 'songs' ? practicedSongs : practicedExercises) || [];
    const q = searchText.trim().toLowerCase();
    const filtered = q
      ? items.filter(i => {
          const t = (i.title || '').toLowerCase();
          const c = (i.composer || '').toLowerCase();
          return t.includes(q) || c.includes(q);
        })
      : items.slice();
    const safeDate = (d) => (d ? new Date(d).getTime() : 0);
    filtered.sort((a, b) => {
      switch (sortKey) {
        case 'alphaAsc':
          return (a.title || '').localeCompare(b.title || '');
        case 'alphaDesc':
          return (b.title || '').localeCompare(a.title || '');
        case 'countDesc':
          return (b.count || 0) - (a.count || 0);
        case 'countAsc':
          return (a.count || 0) - (b.count || 0);
        case 'firstPracticedAsc': // earliest first
          return safeDate(a.firstPracticedAt) - safeDate(b.firstPracticedAt);
        case 'firstPracticedDesc': // latest added first
          return safeDate(b.firstPracticedAt) - safeDate(a.firstPracticedAt);
        case 'lastPracticedAsc':
          return safeDate(a.lastPracticedAt) - safeDate(b.lastPracticedAt);
        case 'lastPracticedDesc':
        default:
          return safeDate(b.lastPracticedAt) - safeDate(a.lastPracticedAt);
      }
    });
    return filtered;
  }, [modalType, practicedSongs, practicedExercises, searchText, sortKey]);

  // Safely convert values for rendering inside <Text>
  const safe = (v) => {
    if (v === null || v === undefined) return '';
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return String(v);
    // If it's an object, try common fields, otherwise JSON stringify as fallback
    if (typeof v === 'object') return v.name ?? v.title ?? JSON.stringify(v);
    return String(v);
  };

  const fetchAll = useCallback(async () => {
    try {
      console.log('Stats.fetchAll: using API base', API_BASE_URL);
      const localToken = await getUserToken();
      if (!localToken) {
        setError('Not authenticated. Please log in to view stats.');
        setLoading(false);
        return;
      }
      const res = await sessionApi.getStats();
      // Normalize response to safe primitives for rendering
      const safeWeekly = (res?.weekly && Array.isArray(res.weekly.days))
        ? { days: res.weekly.days.map(d => ({ date: d.date, minutes: Number(d.minutes) || 0 })), totalMinutes: Number(res.weekly.totalMinutes) || 0, dailyAverage: Number(res.weekly.dailyAverage) || 0 }
        : { days: [], totalMinutes: 0, dailyAverage: 0 };
      setStats(prev => ({
        ...prev,
        ...(res || {}),
        weekly: safeWeekly,
      }));
      // Practiced lists
      try {
        const [songsRes, exRes] = await Promise.all([
          userApi.getPracticedSongs(),
          userApi.getPracticedExercises()
        ]);
        setPracticedSongs(songsRes?.songs || []);
        setPracticedExercises(exRes?.exercises || []);
      } catch {}
      // XP progress
      const token = await getUserToken();
      if (token && API_BASE_URL) {
        const resp = await fetch(`${API_BASE_URL}/users/xp`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resp.ok) {
          const data = await resp.json();
          if (data?.xp) {
            setXp({
              level: data.xp.level,
              totalXP: data.xp.totalXP,
              currentXP: data.xp.currentXP,
              requiredXP: data.xp.requiredXP,
              percentage: data.xp.percentage,
              nextLevelXP: data.xp.nextLevelXP,
            });
          }
        }
      }
    } catch (err) {
      const msg = err?.message || String(err) || 'Failed to load stats';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  // Derived weekly chart calculations
  const weekly = stats.weekly || { days: [] };
  const chartMetrics = useMemo(() => {
  const days = weekly.days || [];
  const maxMinutes = days.length ? Math.max(...days.map(d => d.minutes || 0)) : 0;
  const chartHeight = 120; // px for the tallest bar (much taller)
  return { days, maxMinutes, chartHeight };
  }, [stats.weekly]);

  // No animations: render static bars computed from data

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useFocusEffect(
    useCallback(() => {
      fetchAll();
    }, [fetchAll])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  }, [fetchAll]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={TEMP_BASE_COLORS.blue.primary} />
        </View>
      </SafeAreaView>
    );
  }
  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Ionicons name="alert-circle" size={50} color={TEMP_BASE_COLORS.red.primary} />
          <Text style={styles.error}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (!stats) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Ionicons name="stats-chart" size={50} color={TEMP_BASE_COLORS.gray[400]} />
          <Text style={styles.error}>No stats available</Text>
        </View>
      </SafeAreaView>
    );
  }

  const openList = async (type) => {
    setModalType(type);
    try {
      if (type === 'songs') {
        const res = await userApi.getPracticedSongs();
        setPracticedSongs(res?.songs || []);
      } else {
        const res = await userApi.getPracticedExercises();
        setPracticedExercises(res?.exercises || []);
      }
    } catch {}
    setModalVisible(true);
  };

  const renderPracticedItem = ({ item }) => (
    <View style={styles.cardItem}>
      <View style={styles.cardHeaderRow}>
        <View style={styles.listIconWrap}>
          <Ionicons
            name={modalType === 'songs' ? 'musical-notes' : 'barbell'}
            size={18}
            color={TEMP_BASE_COLORS.blue.primary}
          />
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.listTitle} numberOfLines={1}>
            {String(safe(item.title))}
          </Text>
          {modalType === 'songs' && !!item.composer && (
            <Text style={styles.listSubtitle} numberOfLines={1}>{String(safe(item.composer))}</Text>
          )}
        </View>
        <View style={styles.badge}>
          <Ionicons name="repeat" size={14} color={TEMP_BASE_COLORS.blue.primary} />
          <Text style={styles.badgeText}>{String(safe(item.count))}</Text>
        </View>
      </View>
      <View style={styles.metaRow}>
        <Ionicons name="time" size={14} color={TEMP_BASE_COLORS.gray[400]} />
        <Text style={styles.listMeta}>Last practiced {item.lastPracticedAt ? new Date(item.lastPracticedAt).toLocaleDateString() : ''}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={TEMP_BASE_COLORS.white} />
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.header}>Practice Stats</Text>

        {/* Level & XP Section (like Home) */}
        <View style={styles.levelCard}>
          <View style={styles.levelHeaderRow}>
            <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeText}>Lv {safe(xp.level ?? stats.level)}</Text>
            </View>
            <View style={styles.totalXpRow}>
              <Ionicons name="medal" size={20} color={TEMP_BASE_COLORS.white} />
                <Text style={styles.totalXpText}>{safe((xp.totalXP ?? stats.totalXP) ?? 0)} XP</Text>
            </View>
          </View>
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${xp.percentage || 0}%` }]} />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabelLeft}>{safe(xp.currentXP ?? 0)} XP</Text>
              <Text style={styles.progressLabelRight}>{safe(xp.nextLevelXP ?? 0)} XP</Text>
            </View>
          </View>
        </View>
        
        {/* Streak Section */}
        <View style={styles.sectionTitle}>
          <Ionicons name="flame" size={22} color={TEMP_BASE_COLORS.blue.primary} />
          <Text style={styles.sectionTitleText}>Streaks</Text>
        </View>
        <View style={styles.cardContainer}>
          <View style={styles.statCard}>
            <View style={[styles.iconBubble, { backgroundColor: TEMP_BASE_COLORS.red.primary }]}>
              <Ionicons name="flame" size={22} color={TEMP_BASE_COLORS.white} />
            </View>
            <Text style={styles.statValue}>{safe(stats.currentStreak)}</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.iconBubble, { backgroundColor: TEMP_BASE_COLORS.yellow.primary }]}>
              <Ionicons name="trophy" size={22} color={TEMP_BASE_COLORS.white} />
            </View>
            <Text style={styles.statValue}>{safe(stats.longestStreak)}</Text>
            <Text style={styles.statLabel}>Longest Streak</Text>
          </View>
        </View>
        
        {/* Practice Overview: sessions, time, average */}
        <View style={styles.sectionTitle}>
          <Ionicons name="stats-chart" size={22} color={TEMP_BASE_COLORS.blue.primary} />
          <Text style={styles.sectionTitleText}>Practice Overview</Text>
        </View>
        <View style={styles.detailCard}>
          <View style={styles.detailTriRow}>
            <View style={styles.detailItemTri}>
              <Ionicons name="calendar" size={20} color={TEMP_BASE_COLORS.blue.primary} />
              <Text style={styles.detailValue}>{safe(stats.totalSessions)}</Text>
              <Text style={styles.detailLabel}>Sessions</Text>
            </View>
            <View style={styles.detailItemTri}>
              <Ionicons name="time" size={20} color={TEMP_BASE_COLORS.blue.primary} />
              <Text style={styles.detailValue}>{safe(Math.floor((stats.totalDuration || 0) / 60))}</Text>
              <Text style={styles.detailLabel}>Minutes</Text>
            </View>
            <View style={styles.detailItemTri}>
              <Ionicons name="hourglass" size={20} color={TEMP_BASE_COLORS.blue.primary} />
              <Text style={styles.detailValue}>{safe(Math.floor((stats.averageDuration || 0) / 60))}</Text>
              <Text style={styles.detailLabel}>Avg Min</Text>
            </View>
          </View>
        </View>

        {/* Weekly Overview: bar chart, total minutes, daily average */}
        <View style={styles.sectionTitle}>
          <Ionicons name="calendar" size={22} color={TEMP_BASE_COLORS.blue.primary} />
          <Text style={styles.sectionTitleText}>This Week</Text>
        </View>
      <View style={styles.detailCard}>
        {/* Dynamic grid lines */}
        <View style={[styles.chartGrid, { height: chartMetrics.chartHeight }] }>
            {/* Removed grid line at top of bar chart */}
        </View>

        <View style={[styles.weekChartRow, { height: chartMetrics.chartHeight + 20 }]}> {/* less extra space for labels */}
          { chartMetrics.days.map((d, idx) => {
            const minutes = d.minutes || 0;
            const isToday = idx === (chartMetrics.days.length - 1);
            // If maxMinutes is 0, all bars are minimum height
            const barHeight = chartMetrics.maxMinutes > 0
              ? Math.max(6, Math.round((minutes / chartMetrics.maxMinutes) * chartMetrics.chartHeight))
              : 6;
            return (
              <View key={d.date} style={styles.weekBarWrap}>
                <Text style={styles.barValueText}>{safe(minutes)}</Text>
                <View style={[styles.weekBar, { height: barHeight, backgroundColor: isToday ? TEMP_BASE_COLORS.blue.primary : TEMP_BASE_COLORS.blue.light }]} />
                <Text style={styles.weekBarLabel} numberOfLines={1}>{new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' })}</Text>
              </View>
            );
          }) }
        </View>
        <View style={styles.weekSummaryRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.averageLabel}>Total minutes (7d)</Text>
            <Text style={styles.averageValue}>{safe(stats.weekly?.totalMinutes ?? 0)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.averageLabel}>Daily avg</Text>
            <Text style={styles.averageValue}>{safe(stats.weekly?.dailyAverage ?? 0)} min</Text>
          </View>
        </View>
        </View>

        {/* Songs and Exercises */}
        <View style={styles.sectionTitle}>
          <Ionicons name="musical-notes" size={22} color={TEMP_BASE_COLORS.blue.primary} />
          <Text style={styles.sectionTitleText}>Practice Items</Text>
        </View>
        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <TouchableOpacity style={styles.detailItem} onPress={() => openList('songs')}>
              <Ionicons name="musical-notes" size={20} color={TEMP_BASE_COLORS.blue.primary} />
              <Text style={styles.detailValue}>{safe(stats.totalSongs ?? 0)}</Text>
              <Text style={styles.detailLabel}>Songs</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.detailItem} onPress={() => openList('exercises')}>
              <Ionicons name="barbell" size={20} color={TEMP_BASE_COLORS.blue.primary} />
              <Text style={styles.detailValue}>{safe(stats.totalExercises ?? 0)}</Text>
              <Text style={styles.detailLabel}>Exercises</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Modal list */}
        <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{modalType === 'songs' ? 'Practiced Songs' : 'Practiced Exercises'}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color={TEMP_BASE_COLORS.gray[500]} />
                </TouchableOpacity>
              </View>
              {/* Search and sort controls */}
              <View style={styles.controlsRow}>
                <View style={styles.searchWrap}>
                  <Ionicons name="search" size={18} color={TEMP_BASE_COLORS.gray[400]} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder={`Search ${modalType === 'songs' ? 'title or composer' : 'title'}`}
                    placeholderTextColor={TEMP_BASE_COLORS.gray[300]}
                    value={searchText}
                    onChangeText={setSearchText}
                    autoCorrect={false}
                    autoCapitalize="none"
                  />
                </View>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow} contentContainerStyle={{ paddingVertical: 4 }}>
                {[
                  { key: 'lastPracticedDesc', label: 'Recent' },
                  { key: 'firstPracticedAsc', label: 'Earliest' },
                  { key: 'alphaAsc', label: 'A→Z' },
                  { key: 'alphaDesc', label: 'Z→A' },
                  { key: 'countDesc', label: 'Most practiced' },
                  { key: 'countAsc', label: 'Least practiced' },
                ].map(opt => (
                  <TouchableOpacity
                    key={opt.key}
                    onPress={() => setSortKey(opt.key)}
                    style={[styles.chip, sortKey === opt.key && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, sortKey === opt.key && styles.chipTextActive]}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <FlatList
                data={listData}
                keyExtractor={(item, index) => `${modalType}-${item.title}-${item.composer || ''}-${index}`}
                renderItem={renderPracticedItem}
                ListEmptyComponent={() => (
                  <View style={{ padding: 16, alignItems: 'center' }}>
                    <Text style={styles.listSubtitle}>No {modalType} recorded yet.</Text>
                  </View>
                )}
                contentContainerStyle={{ paddingBottom: 8 }}
              />
            </View>
          </View>
        </Modal>
        
        {/* Spacer for bottom padding */}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: TEMP_BASE_COLORS.gray[50],
  },
  container: {
    flex: 1,
    backgroundColor: TEMP_BASE_COLORS.gray[50],
    padding: TEMP_SIZES.spacing.lg,
  },
  header: {
    fontSize: TEMP_FONTS.h1.fontSize,
    fontWeight: TEMP_FONTS.h1.fontWeight,
    color: TEMP_BASE_COLORS.blue.primary,
    marginBottom: TEMP_SIZES.spacing.lg,
    textAlign: 'center',
  },
  levelCard: {
    backgroundColor: TEMP_BASE_COLORS.blue.primary,
    borderRadius: TEMP_SIZES.radius.lg,
    padding: TEMP_SIZES.spacing.lg,
    marginBottom: TEMP_SIZES.spacing.xl,
    elevation: 4,
    shadowColor: TEMP_BASE_COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  levelHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: TEMP_SIZES.spacing.md,
  },
  levelBadge: {
    backgroundColor: TEMP_BASE_COLORS.white,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: TEMP_SIZES.radius.md,
  },
  levelBadgeText: {
    fontSize: TEMP_FONTS.h4.fontSize,
    fontWeight: TEMP_FONTS.h4.fontWeight,
    color: TEMP_BASE_COLORS.blue.primary,
  },
  totalXpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  totalXpText: {
    fontSize: TEMP_FONTS.h4.fontSize,
    fontWeight: TEMP_FONTS.h4.fontWeight,
    color: TEMP_BASE_COLORS.white,
    marginLeft: 6,
  },
  progressContainer: {},
  progressTrack: {
    height: 10,
    backgroundColor: TEMP_BASE_COLORS.blue.light,
    borderRadius: TEMP_SIZES.radius.round,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: TEMP_BASE_COLORS.white,
    borderRadius: TEMP_SIZES.radius.round,
  },
  progressLabels: {
    marginTop: TEMP_SIZES.spacing.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabelLeft: {
    fontSize: TEMP_FONTS.caption.fontSize,
    fontWeight: TEMP_FONTS.caption.fontWeight,
    color: TEMP_BASE_COLORS.white,
    opacity: 0.9,
  },
  progressLabelRight: {
    fontSize: TEMP_FONTS.caption.fontSize,
    fontWeight: TEMP_FONTS.caption.fontWeight,
    color: TEMP_BASE_COLORS.white,
    opacity: 0.9,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: TEMP_SIZES.spacing.md,
    marginTop: TEMP_SIZES.spacing.lg,
  },
  sectionTitleText: {
    fontSize: TEMP_FONTS.h3.fontSize,
    fontWeight: TEMP_FONTS.h3.fontWeight,
    color: TEMP_BASE_COLORS.gray[500],
    marginLeft: TEMP_SIZES.spacing.xs,
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: TEMP_BASE_COLORS.white,
    borderRadius: TEMP_SIZES.radius.md,
    padding: TEMP_SIZES.spacing.md,
    alignItems: 'center',
    width: '48%',
    elevation: 2,
    shadowColor: TEMP_BASE_COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: TEMP_SIZES.spacing.sm,
  },
  detailCard: {
    backgroundColor: TEMP_BASE_COLORS.white,
    borderRadius: TEMP_SIZES.radius.md,
    padding: TEMP_SIZES.spacing.md,
  paddingHorizontal: TEMP_SIZES.spacing.md,
  paddingTop: TEMP_SIZES.spacing.sm,
  paddingBottom: TEMP_SIZES.spacing.sm,
    elevation: 2,
    shadowColor: TEMP_BASE_COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  detailTriRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: TEMP_SIZES.spacing.sm,
  },
  detailItemTri: {
    alignItems: 'center',
    width: '30%',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: TEMP_SIZES.spacing.sm,
  },
  detailItem: {
    alignItems: 'center',
    width: '45%',
  },
  detailValue: {
    fontSize: TEMP_FONTS.h3.fontSize,
    fontWeight: TEMP_FONTS.h3.fontWeight,
    color: TEMP_BASE_COLORS.gray[600],
    marginTop: TEMP_SIZES.spacing.xs,
  },
  detailLabel: {
    fontSize: TEMP_FONTS.body2.fontSize,
    fontWeight: TEMP_FONTS.body2.fontWeight,
    color: TEMP_BASE_COLORS.gray[400],
  },
  averageCard: {
    backgroundColor: TEMP_BASE_COLORS.white,
    borderRadius: TEMP_SIZES.radius.md,
    padding: TEMP_SIZES.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: TEMP_BASE_COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  averageTextContainer: {
    marginLeft: TEMP_SIZES.spacing.md,
  },
  averageLabel: {
    fontSize: TEMP_FONTS.body2.fontSize,
    fontWeight: TEMP_FONTS.body2.fontWeight,
    color: TEMP_BASE_COLORS.gray[400],
  },
  averageValue: {
    fontSize: TEMP_FONTS.h4.fontSize,
    fontWeight: TEMP_FONTS.h4.fontWeight,
    color: TEMP_BASE_COLORS.gray[600],
  },
  statLabel: {
    fontSize: TEMP_FONTS.caption.fontSize,
    fontWeight: TEMP_FONTS.caption.fontWeight,
    color: TEMP_BASE_COLORS.gray[400],
  },
  statValue: {
    fontSize: TEMP_FONTS.h2.fontSize,
    fontWeight: TEMP_FONTS.h2.fontWeight,
    color: TEMP_BASE_COLORS.gray[600],
    marginVertical: TEMP_SIZES.spacing.xs,
  },
  error: {
    color: TEMP_BASE_COLORS.red.primary,
    fontSize: TEMP_FONTS.h3.fontSize,
    fontWeight: TEMP_FONTS.h3.fontWeight,
    textAlign: 'center',
    marginTop: TEMP_SIZES.spacing.xl * 2,
  },
  // Modal & list styles (floating cards)
  modalBackdrop: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.4)',
  justifyContent: 'center',
  alignItems: 'center',
  },
  modalCard: {
  backgroundColor: TEMP_BASE_COLORS.gray[50],
  borderRadius: TEMP_SIZES.radius.xl,
  paddingBottom: TEMP_SIZES.spacing.lg,
  maxHeight: '70%',
  width: '90%',
  paddingHorizontal: TEMP_SIZES.spacing.lg,
  paddingTop: TEMP_SIZES.spacing.lg,
  elevation: 6,
  shadowColor: TEMP_BASE_COLORS.black,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: TEMP_SIZES.spacing.md,
  },
  modalTitle: {
    fontSize: TEMP_FONTS.h2.fontSize,
    fontWeight: TEMP_FONTS.h2.fontWeight,
    color: TEMP_BASE_COLORS.gray[600],
  },
  cardItem: {
    backgroundColor: TEMP_BASE_COLORS.white,
    borderRadius: TEMP_SIZES.radius.lg,
    padding: TEMP_SIZES.spacing.md,
    marginBottom: TEMP_SIZES.spacing.md,
    elevation: 2,
    shadowColor: TEMP_BASE_COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: TEMP_BASE_COLORS.blue.light,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TEMP_BASE_COLORS.blue.light,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: TEMP_SIZES.radius.round,
  },
  badgeText: {
    fontSize: TEMP_FONTS.caption.fontSize,
    fontWeight: TEMP_FONTS.caption.fontWeight,
    color: TEMP_BASE_COLORS.blue.primary,
    marginLeft: 4,
  },
  listTitle: {
    fontSize: TEMP_FONTS.h4.fontSize,
    fontWeight: TEMP_FONTS.h4.fontWeight,
    color: TEMP_BASE_COLORS.gray[700],
  },
  listSubtitle: {
    fontSize: TEMP_FONTS.caption.fontSize,
    fontWeight: TEMP_FONTS.caption.fontWeight,
    color: TEMP_BASE_COLORS.gray[400],
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  listMeta: {
    fontSize: TEMP_FONTS.caption.fontSize,
    fontWeight: TEMP_FONTS.caption.fontWeight,
    color: TEMP_BASE_COLORS.gray[400],
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: TEMP_SIZES.spacing.sm,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TEMP_BASE_COLORS.white,
    borderRadius: TEMP_SIZES.radius.round,
    paddingHorizontal: 10,
    height: 40,
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: TEMP_BASE_COLORS.gray[200],
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: TEMP_FONTS.body2.fontSize,
    fontWeight: TEMP_FONTS.body2.fontWeight,
    color: TEMP_BASE_COLORS.gray[700],
  },
  chipsRow: {
    marginBottom: TEMP_SIZES.spacing.sm,
  },
  chip: {
    backgroundColor: TEMP_BASE_COLORS.white,
    borderRadius: TEMP_SIZES.radius.round,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: TEMP_BASE_COLORS.gray[200],
  },
  chipActive: {
    backgroundColor: TEMP_BASE_COLORS.blue.light,
    borderColor: TEMP_BASE_COLORS.blue.primary,
  },
  chipText: {
    fontSize: TEMP_FONTS.caption.fontSize,
    fontWeight: TEMP_FONTS.caption.fontWeight,
    color: TEMP_BASE_COLORS.gray[500],
  },
  chipTextActive: {
    color: TEMP_BASE_COLORS.blue.primary,
    fontSize: TEMP_FONTS.caption.fontSize,
    fontWeight: '700',
  },
  weekChartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingVertical: TEMP_SIZES.spacing.sm,
    marginBottom: TEMP_SIZES.spacing.sm,
    height: 120,
  },
  chartGrid: {
    position: 'relative',
    height: 0,
    marginBottom: 4,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: TEMP_BASE_COLORS.gray[200],
    opacity: 0.7,
  },
  weekBarWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 4,
  },
  barValueText: {
    fontSize: TEMP_FONTS.caption.fontSize,
    fontWeight: TEMP_FONTS.caption.fontWeight,
    color: TEMP_BASE_COLORS.gray[600],
    marginBottom: 4,
  },
  weekBar: {
    width: 32,
    borderRadius: TEMP_SIZES.radius.sm,
  },
  weekBarLabel: {
    fontSize: TEMP_FONTS.caption.fontSize,
    fontWeight: TEMP_FONTS.caption.fontWeight,
    color: TEMP_BASE_COLORS.gray[400],
    marginTop: TEMP_SIZES.spacing.xs,
    textAlign: 'center',
  },
  weekSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: TEMP_SIZES.spacing.sm,
  },
});


export default StatsScreen;