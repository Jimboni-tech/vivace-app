import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userStats, setUserStats] = useState({
    level: 5,
    xp: 750,
    xpToNext: 1000,
    streak: 7,
    totalHours: 24.5,
    weeklyHours: 8.2
  });

  // Mock data for friends and feed
  const friends = [
    { id: 1, name: 'Sarah', level: 8, streak: 12, avatar: '🎻' },
    { id: 2, name: 'Mike', level: 6, streak: 5, avatar: '🎸' },
    { id: 3, name: 'Emma', level: 10, streak: 25, avatar: '🎹' },
    { id: 4, name: 'Alex', level: 4, streak: 3, avatar: '🥁' },
  ];

  const feedPosts = [
    {
      id: 1,
      user: 'Sarah',
      avatar: '🎻',
      action: 'completed a 45-minute practice session',
      xp: 150,
      time: '2 hours ago',
      likes: 3,
      comments: 1
    },
    {
      id: 2,
      user: 'Mike',
      avatar: '🎸',
      action: 'reached a 5-day streak!',
      xp: 50,
      time: '4 hours ago',
      likes: 5,
      comments: 2
    },
    {
      id: 3,
      user: 'Emma',
      avatar: '🎹',
      action: 'unlocked Virtuoso Purple theme',
      xp: 200,
      time: '1 day ago',
      likes: 8,
      comments: 3
    }
  ];

  const leaderboardData = [
    { rank: 1, name: 'Emma', xp: 2850, avatar: '🎹' },
    { rank: 2, name: 'Sarah', xp: 2400, avatar: '🎻' },
    { rank: 3, name: 'Mike', xp: 2100, avatar: '🎸' },
    { rank: 4, name: 'Alex', xp: 1800, avatar: '🥁' },
    { rank: 5, name: 'You', xp: 1750, avatar: '🎵' },
  ];

  const startSession = () => {
    navigation.navigate('StartSessionTab');
  };

  const getXpPercentage = () => {
    return (userStats.xp / userStats.xpToNext) * 100;
  };

  const renderFriendItem = ({ item }) => (
    <View style={styles.friendItem}>
      <Text style={styles.friendAvatar}>{item.avatar}</Text>
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.name}</Text>
        <Text style={styles.friendStats}>Level {item.level} • {item.streak} day streak</Text>
      </View>
      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="add-circle" size={24} color="#3D9CFF" />
      </TouchableOpacity>
    </View>
  );

  const renderFeedItem = ({ item }) => (
    <View style={styles.feedItem}>
      <View style={styles.feedHeader}>
        <Text style={styles.feedAvatar}>{item.avatar}</Text>
        <View style={styles.feedUserInfo}>
          <Text style={styles.feedUserName}>{item.user}</Text>
          <Text style={styles.feedTime}>{item.time}</Text>
        </View>
        <Text style={styles.feedXp}>+{item.xp} XP</Text>
      </View>
      <Text style={styles.feedAction}>{item.action}</Text>
      <View style={styles.feedActions}>
        <TouchableOpacity style={styles.feedActionButton}>
          <Ionicons name="heart-outline" size={20} color="#A1A1A1" />
          <Text style={styles.feedActionText}>{item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.feedActionButton}>
          <Ionicons name="chatbubble-outline" size={20} color="#A1A1A1" />
          <Text style={styles.feedActionText}>{item.comments}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderLeaderboardItem = ({ item, index }) => (
    <View style={[styles.leaderboardItem, item.name === 'You' && styles.leaderboardItemYou]}>
      <View style={styles.rankContainer}>
        <Text style={[styles.rank, index < 3 && styles.rankTop]}>#{item.rank}</Text>
        <Text style={styles.leaderboardAvatar}>{item.avatar}</Text>
      </View>
      <Text style={[styles.leaderboardName, item.name === 'You' && styles.leaderboardNameYou]}>
        {item.name}
      </Text>
      <Text style={styles.leaderboardXp}>{item.xp} XP</Text>
    </View>
  );

  const renderOverview = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back, Musician!</Text>
        <Text style={styles.subtitle}>Ready to practice today?</Text>
      </View>

      {/* XP and Level Section */}
      <View style={styles.xpSection}>
        <View style={styles.levelInfo}>
          <Text style={styles.levelText}>Level {userStats.level}</Text>
          <Text style={styles.xpText}>{userStats.xp} / {userStats.xpToNext} XP</Text>
        </View>
        <View style={styles.xpBar}>
          <View style={[styles.xpProgress, { width: `${getXpPercentage()}%` }]} />
        </View>
      </View>

      {/* Streak Section */}
      <View style={styles.streakSection}>
        <Ionicons name="flame" size={24} color="#FF6B35" />
        <Text style={styles.streakText}>{userStats.streak} Day Streak!</Text>
        <Text style={styles.streakSubtext}>Keep it going!</Text>
      </View>

      {/* Quick Start Session */}
      <TouchableOpacity style={styles.startButton} onPress={startSession}>
        <Ionicons name="play-circle" size={32} color="#FFFFFF" />
        <Text style={styles.startButtonText}>Start Practice Session</Text>
      </TouchableOpacity>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{userStats.totalHours}h</Text>
          <Text style={styles.statLabel}>Total Practice</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{userStats.weeklyHours}h</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityItem}>
          <Ionicons name="musical-notes" size={20} color="#3D9CFF" />
          <Text style={styles.activityText}>Yesterday: 45min practice session</Text>
        </View>
        <View style={styles.activityItem}>
          <Ionicons name="trophy" size={20} color="#FFD700" />
          <Text style={styles.activityText}>Earned 150 XP</Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderFriends = () => (
    <View style={styles.tabContent}>
      <View style={styles.tabHeader}>
        <Text style={styles.tabTitle}>Friends</Text>
        <Text style={styles.tabSubtitle}>Connect with fellow musicians</Text>
      </View>
      <FlatList
        data={friends}
        renderItem={renderFriendItem}
        keyExtractor={item => item.id.toString()}
        style={styles.list}
      />
    </View>
  );

  const renderFeed = () => (
    <View style={styles.tabContent}>
      <View style={styles.tabHeader}>
        <Text style={styles.tabTitle}>Activity Feed</Text>
        <Text style={styles.tabSubtitle}>See what your friends are up to</Text>
      </View>
      <FlatList
        data={feedPosts}
        renderItem={renderFeedItem}
        keyExtractor={item => item.id.toString()}
        style={styles.list}
      />
    </View>
  );

  const renderLeaderboard = () => (
    <View style={styles.tabContent}>
      <View style={styles.tabHeader}>
        <Text style={styles.tabTitle}>Weekly Leaderboard</Text>
        <Text style={styles.tabSubtitle}>Compete with friends</Text>
      </View>
      <FlatList
        data={leaderboardData}
        renderItem={renderLeaderboardItem}
        keyExtractor={(item, index) => index.toString()}
        style={styles.list}
      />
    </View>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'friends':
        return renderFriends();
      case 'feed':
        return renderFeed();
      case 'leaderboard':
        return renderLeaderboard();
      default:
        return renderOverview();
    }
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        {['overview', 'friends', 'feed', 'leaderboard'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {renderActiveTab()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3D9CFF',
  },
  tabText: {
    color: '#A1A1A1',
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3D9CFF',
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
  },
  tabHeader: {
    padding: 20,
    paddingTop: 20,
    backgroundColor: '#1E1E1E',
  },
  tabTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EAEAEA',
    marginBottom: 5,
  },
  tabSubtitle: {
    fontSize: 16,
    color: '#A1A1A1',
  },
  header: {
    padding: 20,
    paddingTop: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#EAEAEA',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#A1A1A1',
  },
  xpSection: {
    backgroundColor: '#1E1E1E',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
  },
  levelInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  levelText: {
    fontSize: 18,
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
  streakText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EAEAEA',
    marginTop: 10,
  },
  streakSubtext: {
    fontSize: 14,
    color: '#A1A1A1',
    marginTop: 5,
  },
  startButton: {
    backgroundColor: '#3D9CFF',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    margin: 20,
    marginTop: 0,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 12,
    marginRight: 10,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3D9CFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#A1A1A1',
    marginTop: 5,
  },
  recentSection: {
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
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  activityText: {
    fontSize: 14,
    color: '#A1A1A1',
    marginLeft: 10,
  },
  list: {
    flex: 1,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1E1E1E',
    margin: 10,
    marginTop: 5,
    borderRadius: 12,
  },
  friendAvatar: {
    fontSize: 32,
    marginRight: 15,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EAEAEA',
    marginBottom: 5,
  },
  friendStats: {
    fontSize: 14,
    color: '#A1A1A1',
  },
  addButton: {
    padding: 5,
  },
  feedItem: {
    backgroundColor: '#1E1E1E',
    margin: 10,
    marginTop: 5,
    borderRadius: 12,
    padding: 20,
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  feedAvatar: {
    fontSize: 24,
    marginRight: 10,
  },
  feedUserInfo: {
    flex: 1,
  },
  feedUserName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EAEAEA',
  },
  feedTime: {
    fontSize: 12,
    color: '#A1A1A1',
  },
  feedXp: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  feedAction: {
    fontSize: 16,
    color: '#EAEAEA',
    marginBottom: 15,
  },
  feedActions: {
    flexDirection: 'row',
    gap: 20,
  },
  feedActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedActionText: {
    color: '#A1A1A1',
    marginLeft: 5,
    fontSize: 14,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1E1E1E',
    margin: 10,
    marginTop: 5,
    borderRadius: 12,
  },
  leaderboardItemYou: {
    backgroundColor: '#2A2A2A',
    borderWidth: 2,
    borderColor: '#3D9CFF',
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  rank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#A1A1A1',
    marginRight: 10,
  },
  rankTop: {
    color: '#FFD700',
  },
  leaderboardAvatar: {
    fontSize: 24,
  },
  leaderboardName: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EAEAEA',
  },
  leaderboardNameYou: {
    color: '#3D9CFF',
  },
  leaderboardXp: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
  },
});

export default HomeScreen;