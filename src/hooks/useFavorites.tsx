import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

export default function useFavorites() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  // お気に入りを読み込む
  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  };

  // お気に入りを追加
  const addFavorite = async (store) => {
    try {
      const updatedFavorites = [...favorites, store];
      setFavorites(updatedFavorites);
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    } catch (error) {
      console.error('Failed to add favorite:', error);
    }
  };

  // お気に入りを削除
  const removeFavorite = async (storeId) => {
    try {
      const updatedFavorites = favorites.filter((item) => item.id !== storeId);
      setFavorites(updatedFavorites);
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  // お気に入りかどうかを判定
  const isFavorite = (storeId) => {
    return favorites.some((item) => item.id === storeId);
  };

  return { favorites, addFavorite, removeFavorite, isFavorite };
}
