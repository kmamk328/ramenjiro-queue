import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { MaterialIcons } from '@expo/vector-icons';

export default function QueueScreen({ route, navigation }) {
  const { storeId } = route.params;
  const [queueData, setQueueData] = useState([]);

  useEffect(() => {

    const q = query(
      collection(db, `stores/${storeId}/queueInformation`),
      orderBy('updateDate', 'desc')
    );

    console.log('Debug: Query created ->', q);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
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

  // フォーマット関数
  const formatDate = (timestamp) => {
    if (!timestamp) return 'データなし';
    const date = new Date(timestamp.seconds * 1000); // Firestore タイムスタンプを Date に変換
    const options = {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Intl.DateTimeFormat('ja-JP', options).format(date);
  };

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
          <View style={styles.card}>
            <View style={styles.queueInfo}>
              <Text style={styles.queueCount}>
                {item.queueCount !== undefined ? item.queueCount : '0'}
              </Text>
              <Text style={styles.queueText}>人位待ち</Text>
            </View>
            <View style={styles.updateDateInfo}>
              <Text style={styles.updateDateText}>最新更新時間</Text>
              <Text style={styles.updateDate}>
                {item.updateDate !== undefined ? formatDate(item.updateDate) : 'データなし'}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyList}>
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

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    margin: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  queueInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  queueCount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  queueText: {
    fontSize: 18,
    marginLeft: 8,
    color: '#333',
  },
  waitTimeInfo: {
    alignItems: 'flex-end',
  },
  waitTimeText: {
    fontSize: 16,
    color: '#666',
  },
  waitTime: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  emptyList: {
    padding: 20,
    alignItems: 'center',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007AFF',
    borderRadius: 50,
    padding: 15,
  },
});
