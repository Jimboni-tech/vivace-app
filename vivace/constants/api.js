import Constants from 'expo-constants';

export const BACKEND_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
