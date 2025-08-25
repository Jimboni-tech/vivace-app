import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen({ onLogout }) {
  const [selectedTheme, setSelectedTheme] = useState('default');
  
  // Mock user data
  const userStats = {
    level: 5,
    xp: 750,
    xpToNext: 1000,
    totalHours: 24.5,
    averageDaily: 1.2,
    longestStreak: 12,
    currentStreak: 7,
    mostUsedTool: 'Metronome'
  };

  const recentActivity = [
    { id: 1, type: 'session', text: 'Completed 45-minute practice session', time: '2 hours ago', xp: 150 },
    { id: 2, type: 'streak', text: 'Maintained 7-day streak!', time: '1 day ago', xp: 50 },
    { id: 3, type: 'achievement', text: 'Unlocked "Tool Explorer" badge', time: '3 days ago', xp: 100 },
    { id: 4, type: 'session', text: 'Completed 30-minute practice session', time: '2 days ago', xp: 120 },
  ];

  const badges = [
    { id: 1, name: 'First Steps', icon: '🎯', unlocked: true, description: 'Complete your first practice session' },
    { id: 2, name: 'Streak Master', icon: '🔥', unlocked: true, description: 'Maintain a 7-day streak' },
    { id: 3, name: 'Tool Explorer', icon: '🔧', unlocked: true, description: 'Use all practice tools' },
    { id: 4, name: 'Virtuoso', icon: '👑', unlocked: false, description: 'Reach level 10' },
    { id: 5, name: 'Social Butterfly', icon: '🦋', unlocked: false, description: 'Add 10 friends' },
  ];

  const themes = [
    { id: 'default', name: 'Default', color: '#3D9CFF', unlocked: true },
    { id: 'purple', name: 'Virtuoso Purple', color: '#8B5CF6', unlocked: true },
    { id: 'gold', name: 'Jazz Gold', color: '#F59E0B', unlocked: true },
    { id: 'red', name: 'Rock Red', color: '#EF4444', unlocked: false },
    { id: 'teal', name: 'Lo-Fi Teal', color: '#14B8A6', unlocked: false },
    { id: 'green', name: 'Orchestral Green', color: '#10B981', unlocked: false },
  ];

  const getXpPercentage = () => {
    return (userStats.xp / userStats.xpToNext) * 100;
  };

  const renderActivityItem = ({ item }) => (
    <View style={styles.activityItem}>
      <View style={styles.activityIcon}>
        {item.type === 'session' && <Ionicons name="musical-notes" size={20} color="#3D9CFF" />}
        {item.type === 'streak' && <Ionicons name="flame" size={20} color="#FF6B35" />}
        {item.type === 'achievement' && <Ionicons name="trophy" size={20} color="#FFD700" />}
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityText}>{item.text}</Text>
        <Text style={styles.activityTime}>{item.time}</Text>
      </View>
      <Text style={styles.activityXp}>+{item.xp} XP</Text>
    </View>
  );

  const renderBadge = ({ item }) => (
    <View style={[styles.badgeItem, !item.unlocked && styles.badgeItemLocked]}>
      <Text style={[styles.badgeIcon, !item.unlocked && styles.badgeIconLocked]}>
        {item.unlocked ? item.icon : '🔒'}
      </Text>
      <View style={styles.badgeInfo}>
        <Text style={[styles.badgeName, !item.unlocked && styles.badgeNameLocked]}>
          {item.name}
        </Text>
        <Text style={[styles.badgeDescription, !item.unlocked && styles.badgeDescriptionLocked]}>
          {item.description}
        </Text>
      </View>
      {item.unlocked && (
        <Ionicons name="checkmark-circle" size={24} color="#10B981" />
      )}
    </View>
  );

  const renderTheme = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.themeItem,
        selectedTheme === item.id && styles.themeItemSelected,
        !item.unlocked && styles.themeItemLocked
      ]}
      onPress={() => item.unlocked && setSelectedTheme(item.id)}
      disabled={!item.unlocked}
    >
      <View style={[styles.themeColor, { backgroundColor: item.color }]} />
      <Text style={[styles.themeName, !item.unlocked && styles.themeNameLocked]}>
        {item.name}
      </Text>
      {!item.unlocked && (
        <Ionicons name="lock-closed" size={16} color="#A1A1A1" />
      )}
      {selectedTheme === item.id && item.unlocked && (
        <Ionicons name="checkmark" size={20} color="#3D9CFF" />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>🎵</Text>
          <Text style={styles.level}>Level {userStats.level}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>Musician</Text>
          <Text style={styles.userEmail}>musician@example.com</Text>
        </View>
      </View>

      {/* XP Progress */}
      <View style={styles.xpSection}>
        <View style={styles.xpHeader}>
          <Text style={styles.xpTitle}>Experience Points</Text>
          <Text style={styles.xpText}>{userStats.xp} / {userStats.xpToNext} XP</Text>
        </View>
        <View style={styles.xpBar}>
          <View style={[styles.xpProgress, { width: `${getXpPercentage()}%` }]} />
        </View>
      </View>

      {/* Streak Section - Prominently Displayed */}
      <View style={styles.streakSection}>
        <View style={styles.streakHeader}>
          <Ionicons name="flame" size={32} color="#FF6B35" />
          <Text style={styles.streakTitle}>Current Streak</Text>
        </View>
        <Text style={styles.streakNumber}>{userStats.currentStreak}</Text>
        <Text style={styles.streakLabel}>Days</Text>
        <View style={styles.streakStats}>
          <View style={styles.streakStat}>
            <Text style={styles.streakStatNumber}>{userStats.longestStreak}</Text>
            <Text style={styles.streakStatLabel}>Longest</Text>
          </View>
          <View style={styles.streakDivider} />
          <View style={styles.streakStat}>
            <Text style={styles.streakStatNumber}>{userStats.totalHours}</Text>
            <Text style={styles.streakStatLabel}>Total Hours</Text>
          </View>
        </View>
      </View>

      {/* Total Practice Hours */}
      <View style={styles.practiceSection}>
        <Text style={styles.sectionTitle}>Practice Statistics</Text>
        <View style={styles.practiceGrid}>
          <View style={styles.practiceCard}>
            <Text style={styles.practiceNumber}>{userStats.totalHours}h</Text>
            <Text style={styles.practiceLabel}>Total Practice</Text>
          </View>
          <View style={styles.practiceCard}>
            <Text style={styles.practiceNumber}>{userStats.averageDaily}h</Text>
            <Text style={styles.practiceLabel}>Daily Average</Text>
          </View>
          <View style={styles.practiceCard}>
            <Text style={styles.practiceNumber}>{userStats.mostUsedTool}</Text>
            <Text style={styles.practiceLabel}>Most Used Tool</Text>
          </View>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.activitySection}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <FlatList
          data={recentActivity}
          renderItem={renderActivityItem}
          keyExtractor={item => item.id.toString()}
          scrollEnabled={false}
        />
      </View>

      {/* Badges */}
      <View style={styles.badgesSection}>
        <Text style={styles.sectionTitle}>Badges</Text>
        <FlatList
          data={badges}
          renderItem={renderBadge}
          keyExtractor={item => item.id.toString()}
          scrollEnabled={false}
        />
      </View>

      {/* Themes */}
      <View style={styles.themesSection}>
        <Text style={styles.sectionTitle}>Themes</Text>
        <FlatList
          data={themes}
          renderItem={renderTheme}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.themesList}
        />
      </View>

      {/* Settings & Logout */}
      <View style={styles.settingsSection}>
        <TouchableOpacity style={styles.settingItem}>
          <Ionicons name="notifications-outline" size={24} color="#A1A1A1" />
          <Text style={styles.settingText}>Notifications</Text>
          <Ionicons name="chevron-forward" size={20} color="#A1A1A1" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Ionicons name="shield-outline" size={24} color="#A1A1A1" />
          <Text style={styles.settingText}>Privacy</Text>
          <Ionicons name="chevron-forward" size={20} color="#A1A1A1" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Ionicons name="help-circle-outline" size={24} color="#A1A1A1" />
          <Text style={styles.settingText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={20} color="#A1A1A1" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Ionicons name="log-out-outline" size={24} color="#FF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginRight: 20,
  },
  avatar: {
    fontSize: 48,
    marginBottom: 5,
  },
  level: {
    fontSize: 14,
    color: '#3D9CFF',
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EAEAEA',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#A1A1A1',
  },
  xpSection: {
    backgroundColor: '#1E1E1E',
    margin: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 12,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  xpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EAEAEA',
  },
  xpText: {
    fontSize: 14,
    color: '#A1A1A1',
  },
  xpBar: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpProgress: {
    height: '100%',
    backgroundColor: '#3D9CFF',
    borderRadius: 4,
  },
  streakSection: {
    backgroundColor: '#1E1E1E',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  streakTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EAEAEA',
    marginLeft: 10,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 5,
  },
  streakLabel: {
    fontSize: 16,
    color: '#A1A1A1',
    marginBottom: 20,
  },
  streakStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
  },
  streakStat: {
    alignItems: 'center',
  },
  streakStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EAEAEA',
    marginBottom: 5,
  },
  streakStatLabel: {
    fontSize: 12,
    color: '#A1A1A1',
  },
  streakDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#333',
  },
  practiceSection: {
    backgroundColor: '#1E1E1E',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EAEAEA',
    marginBottom: 15,
  },
  practiceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  practiceCard: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  practiceNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3D9CFF',
    marginBottom: 5,
  },
  practiceLabel: {
    fontSize: 12,
    color: '#A1A1A1',
    textAlign: 'center',
  },
  activitySection: {
    backgroundColor: '#1E1E1E',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    marginBottom: 10,
  },
  activityIcon: {
    marginRight: 15,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#EAEAEA',
    marginBottom: 5,
  },
  activityTime: {
    fontSize: 12,
    color: '#A1A1A1',
  },
  activityXp: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  badgesSection: {
    backgroundColor: '#1E1E1E',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    marginBottom: 10,
  },
  badgeItemLocked: {
    opacity: 0.6,
  },
  badgeIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  badgeIconLocked: {
    fontSize: 20,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EAEAEA',
    marginBottom: 5,
  },
  badgeNameLocked: {
    color: '#A1A1A1',
  },
  badgeDescription: {
    fontSize: 12,
    color: '#A1A1A1',
  },
  badgeDescriptionLocked: {
    color: '#666',
  },
  themesSection: {
    backgroundColor: '#1E1E1E',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
  },
  themesList: {
    paddingRight: 20,
  },
  themeItem: {
    alignItems: 'center',
    marginRight: 20,
    padding: 15,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    minWidth: 80,
  },
  themeItemSelected: {
    backgroundColor: '#3D9CFF',
  },
  themeItemLocked: {
    opacity: 0.6,
  },
  themeColor: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginBottom: 8,
  },
  themeName: {
    fontSize: 12,
    color: '#EAEAEA',
    textAlign: 'center',
    marginBottom: 5,
  },
  themeNameLocked: {
    color: '#A1A1A1',
  },
  settingsSection: {
    backgroundColor: '#1E1E1E',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    marginBottom: 40,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: '#EAEAEA',
    marginLeft: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    marginTop: 10,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF4444',
    marginLeft: 15,
    fontWeight: 'bold',
  },
});
