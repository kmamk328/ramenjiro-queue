import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome, MaterialIcons } from 'react-native-vector-icons';
import useFavorites from '../hooks/useFavorites';

export default function QueueItem({ store, onPress }) {

  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  const toggleFavorite = () => {
    if (isFavorite(store.id)) {
      removeFavorite(store.id);
    } else {
      addFavorite(store);
    }
  };

  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      {/* 店舗画像 */}
      <Image source={{ uri: store.imageUrl }} style={styles.image} />

      {/* 店舗情報 */}
      <View style={styles.infoContainer}>
        {/* 店舗名 */}
        <Text style={styles.storeName}>{store.storeName}</Text>

        {/* 評価 */}
        {/* <View style={styles.ratingRow}>
          <FontAwesome name="star" size={14} color="#FFD700" />
          <Text style={styles.ratingText}>{store.rating}</Text>
        </View> */}

        {/* 住所 */}
        <View style={styles.ratingRow}>
          <Text style={styles.ratingText}>{store.address}</Text>
        </View>


        {/* 距離、閲覧数、追加情報 */}
        <View style={styles.detailsRow}>
          {/* <MaterialIcons name="location-on" size={14} color="gray" />
          <Text style={styles.detailText}>{store.distance}</Text>
          <MaterialIcons name="visibility" size={14} color="gray" />
          <Text style={styles.detailText}>{store.views}</Text> */}
          <Text style={styles.closedDaysText}>定休日: {store.closedDays}</Text>
        </View>
      </View>

      {/* お気に入りアイコン */}
      <TouchableOpacity style={styles.favoriteIcon} onPress={toggleFavorite}>
        <FontAwesome
          name={isFavorite(store.id) ? 'heart' : 'heart-o'}
          size={20}
          color={isFavorite(store.id) ? 'red' : 'gray'}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 10,
  },
  storeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  detailText: {
    fontSize: 12,
    color: 'gray',
    marginRight: 10,
    marginLeft: 2,
  },
  closedDaysText: {
    fontSize: 12,
    color: 'red',
    marginLeft: 10,
  },
  favoriteIcon: {
    marginLeft: 'auto',
  },
});
