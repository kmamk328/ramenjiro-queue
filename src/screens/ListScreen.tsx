import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, FlatList, Text } from 'react-native';
import QueueItem from '../components/QueueItem';
import storeData from '../utils/storeData';
import { collection, onSnapshot, query, limit, startAfter, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export default function ListScreen({ navigation }) {
  const [stores, setStores] = useState([]);
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
        headerTitle: '店舗情報',
        headerTitleAlign: 'center',
        // headerRight: () => (
        //     <TouchableOpacity onPress={onRefresh}>
        //         <MaterialCommunityIcons name="reload" size={24} color="#000" />
        //     </TouchableOpacity>
        // ),
    });
}, [navigation]);

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
    <View>
      <FlatList
        data={storeData}
        renderItem={({ item }) => (
          <QueueItem
            store={item}
            onPress={() => navigation.navigate('QueueScreen', { storeId: item.id })}
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
    </View>
  );
}
