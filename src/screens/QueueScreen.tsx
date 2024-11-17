import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { MaterialIcons } from '@expo/vector-icons';

export default function QueueScreen({ route, navigation }) {
  const { storeId } = route.params;
  const [queueData, setQueueData] = useState([]);

  useEffect(() => {
    console.log('Debug: Starting useEffect');
    console.log('Debug: storeId ->', storeId);

    const q = query(
      collection(db, `stores/${storeId}/queueInformation`),
      orderBy('updateDate', 'desc')
    );

    console.log('Debug: Query created ->', q);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log('Snapshot received:', snapshot.docs);
        if (!snapshot.empty) {
          const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          console.log('Debug: Fetched data ->', data); // Firestore から取得したデータ
          setQueueData(data);
        } else {
          console.log('Debug: No data found'); // データが存在しない場合
          setQueueData([]);
        }
      },
      (error) => {
        console.error('Error fetching Firestore data:', error); // Firestore クエリのエラーハンドリング
      }
    );

    return () => {
      console.log('Debug: Cleanup useEffect');
      unsubscribe();
    };
  }, [storeId]);

  useLayoutEffect(() => {
    console.log('Debug: Setting navigation options');
    navigation.setOptions({
      headerStyle: {
        backgroundColor: '#FFFFFF',
      },
      headerTintColor: '#000',
      headerTitle: '行列情報',
      headerTitleAlign: 'center',
    });
  }, [navigation]);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={queueData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 10, borderBottomWidth: 1, borderColor: '#ddd' }}>
            <Text>
              Queue Count: {item.queueCount !== undefined ? item.queueCount : 'データなし'}
            </Text>
            <Text>
              Updated At:{' '}
              {item.updateDate
                ? new Date(item.updateDate.seconds * 1000).toLocaleString()
                : 'データなし'}
            </Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text>データがありません。</Text>
          </View>
        )}
      />
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          backgroundColor: '#2196F3',
          borderRadius: 50,
          padding: 15,
        }}
        onPress={() => navigation.navigate('QueueInputScreen', { storeId })}
      >
        <MaterialIcons name="edit" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}
