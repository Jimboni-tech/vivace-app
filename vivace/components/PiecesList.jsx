import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PiecesList = ({ pieces, onPressItem, onDeleteItem }) => {
  // Function to get the appropriate icon based on piece type
  const getTypeIcon = (type) => {
    if (type === 'song') return 'musical-notes-outline';
    if (type === 'exercise') return 'barbell-outline';
    switch (type) {
      case 'scales':
        return 'musical-notes-outline';
      case 'arpeggios':
        return 'musical-notes-outline';
      case 'etudes':
        return 'musical-note-outline';
      case 'technique':
        return 'fitness-outline';
      case 'other':
        return 'ellipsis-horizontal-outline';
      default:
        return 'document-text-outline';
    }
  };

  // Function to format the type label for display
  const getTypeLabel = (type) => {
    if (type === 'song') return 'Song';
    if (type === 'exercise') return 'Exercise';
    switch (type) {
      case 'scales':
        return 'Scales';
      case 'arpeggios':
        return 'Arpeggios';
      case 'etudes':
        return 'Etudes';
      case 'technique':
        return 'Technique';
      case 'other':
        return 'Other';
      default:
        return type ? type.charAt(0).toUpperCase() + type.slice(1) : '';
    }
  };

  // Format time spent for display
  const formatTimeSpent = (seconds) => {
    if (!seconds) return '—';
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  // Render each piece/exercise item
  const renderItem = ({ item, index }) => (
    <TouchableOpacity 
      style={styles.pieceItem}
      onPress={() => onPressItem && onPressItem(item, index)}
    >
      <View style={styles.pieceIconContainer}>
        <Ionicons name={getTypeIcon(item.type)} size={20} color="white" />
      </View>
      
      <View style={styles.pieceContent}>
        <Text style={styles.pieceTitle}>{item.title}</Text>
        
        {item.composer && (
          <Text style={styles.composerText}>by {item.composer}</Text>
        )}
        
        <View style={styles.pieceDetails}>
          <View style={styles.tagContainer}>
            <Text style={styles.tagText}>{getTypeLabel(item.type)}</Text>
          </View>
          {/* Removed time spent display */}
        </View>
      </View>
      
      <View style={styles.actionsContainer}>
        {onDeleteItem && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => {
              Alert.alert(
                "Delete Item",
                `Are you sure you want to remove "${item.title}"?`,
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Delete", onPress: () => onDeleteItem(item, index), style: "destructive" }
                ]
              );
            }}
          >
            <Ionicons name="trash-outline" size={20} color="#E53E3E" />
          </TouchableOpacity>
        )}
        <Ionicons name="chevron-forward" size={20} color="#A0AEC0" />
      </View>
    </TouchableOpacity>
  );

  // If there are no pieces, show an empty state
  if (!pieces || pieces.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="musical-note" size={48} color="#E2E8F0" />
        <Text style={styles.emptyText}>No pieces or exercises added yet</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={pieces}
      renderItem={renderItem}
      keyExtractor={(item, index) => `piece-${item._id || index}`}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 20,
  },
  pieceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pieceIconContainer: {
    backgroundColor: '#3D9CFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pieceContent: {
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    padding: 8,
    marginRight: 5,
  },
  pieceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A5568',
    marginBottom: 2,
    fontFamily: 'Nunito-Bold',
  },
  composerText: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 4,
    fontFamily: 'Nunito-Regular',
    fontStyle: 'italic',
  },
  pieceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagContainer: {
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#3182CE',
    fontFamily: 'Nunito-Regular',
  },
  timeText: {
    fontSize: 12,
    color: '#718096',
    fontFamily: 'Nunito-Regular',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyText: {
    fontSize: 16,
    color: '#A0AEC0',
    marginTop: 10,
    fontFamily: 'Nunito-Regular',
    textAlign: 'center',
  },
});

export default PiecesList;
