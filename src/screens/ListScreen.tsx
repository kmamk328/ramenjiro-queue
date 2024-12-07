import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity  } from 'react-native';
import QueueItem from '../components/QueueItem';
import storeData from '../utils/storeData';
import { collection, onSnapshot, query, limit, startAfter, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

import useFavorites from '../hooks/useFavorites';
import { FontAwesome } from '@expo/vector-icons';

import SearchModal from '../components/SearchModal';
import SearchTypeModal from '../components/SearchTypeModal';


// import AdBanner from '../components/AdBanner';

export default function ListScreen({ navigation }) {
  const [isSearchTypeModalVisible, setIsSearchTypeModalVisible] = useState(false);
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isFavoritesView, setIsFavoritesView] = useState(false);
  const [stores, setStores] = useState([]);
  const { favorites } = useFavorites();
  const [lastVisible, setLastVisible] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'stores'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStores(data);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
    });
    return () => unsubscribe();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
        headerStyle: {
            backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#000',
        headerTitle: '🍜店舗情報🍜',
        headerTitleAlign: 'center',
        // headerRight: () => (
        //   <TouchableOpacity onPress={() => setIsSearchTypeModalVisible(true)}>
        //     <FontAwesome
        //     name="search"
        //     size={24}
        //     color="gray"
        //     style={{ marginRight: 15 }}
        //   />
        //   </TouchableOpacity>
        // ),
    });
}, [navigation]);

const handleSearchTypeSelect = (type) => {
  if (type === 'text') {
    setIsSearchModalVisible(true);
  } else if (type === 'favorites') {
    setIsFavoritesView(true);
  }
};

const handleSearch = (text) => {
  setSearchText(text);
  setIsFavoritesView(false); // 検索時はお気に入り表示をリセット
};

const displayedStores = isFavoritesView
  ? favorites
  : stores.filter((store) =>
      store.storeName.includes(searchText) // 店舗名で検索
    );

  const loadMore = async () => {
    if (lastVisible) {
      const nextQuery = query(collection(db, 'stores'), startAfter(lastVisible), limit(10));
      const snapshot = await getDocs(nextQuery);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStores([...stores, ...data]);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={storeData}
        // data={displayedStores}
        renderItem={({ item }) => (
          <QueueItem
            store={item}
            onPress={() => navigation.navigate('QueueScreen', { storeId: item.id, storeName: item.storeName })}
          />
        )}
        keyExtractor={(item) => item.id}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={() => (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text>店舗情報なし</Text>
          </View>
        )}
      />
      <SearchTypeModal
        isVisible={isSearchTypeModalVisible}
        onClose={() => setIsSearchTypeModalVisible(false)}
        onSelect={handleSearchTypeSelect}
      />
      <SearchModal
        isVisible={isSearchModalVisible}
        onClose={() => setIsSearchModalVisible(false)}
        onSearch={handleSearch}
      />
      {/* <AdBanner /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#ffffe0',
  },
  emptyList: {
    padding: 20,
    alignItems: 'center',
  },
});
