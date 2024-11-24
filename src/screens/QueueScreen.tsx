import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { collection, query, orderBy, limit, startAfter, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { MaterialIcons } from '@expo/vector-icons';


import QueueInputModal from '../components/QueueInputModal';

export default function QueueScreen({ route, navigation }) {
  const { storeId, storeName } = route.params; // storeName を受け取る
  const [queueData, setQueueData] = useState([]); // 全データを保持
  const [lastVisible, setLastVisible] = useState(null); // 最後のドキュメントを保存
  const [isLoading, setIsLoading] = useState(false); // ローディング状態を管理
  const [isModalVisible, setIsModalVisible] = useState(false); // モーダルの表示状態

  const PAGE_SIZE = 5; // 1ページに取得するデータ件数

  // 初期データ取得
  const fetchInitialData = () => {
    const q = query(
      collection(db, `stores/${storeId}/queueInformation`),
      orderBy('updateDate', 'desc'),
      limit(PAGE_SIZE + 1) // 最新1件 + スクロール分
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setQueueData(data);
          setLastVisible(snapshot.docs[snapshot.docs.length - 1]); // 最後のドキュメントを保存
        }
      },
      (error) => {
        console.error('Error fetching Firestore data:', error);
      }
    );

    return unsubscribe; // クリーンアップ用
  };

  // 追加データの取得
  const fetchMoreData = () => {
    if (isLoading || !lastVisible) return; // ローディング中または最後のデータがない場合は何もしない

    setIsLoading(true);

    const q = query(
      collection(db, `stores/${storeId}/queueInformation`),
      orderBy('updateDate', 'desc'),
      startAfter(lastVisible), // 前回の最後のドキュメントからスタート
      limit(PAGE_SIZE)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setQueueData((prevData) => [...prevData, ...data]); // 既存データに追加
          setLastVisible(snapshot.docs[snapshot.docs.length - 1]); // 最後のドキュメントを更新
        }
        setIsLoading(false); // ローディング終了
      },
      (error) => {
        console.error('Error fetching more Firestore data:', error);
        setIsLoading(false); // エラー時もローディング終了
      }
    );

    return unsubscribe; // クリーンアップ用
  };

  useEffect(() => {
    const unsubscribe = fetchInitialData();
    return () => unsubscribe();
  }, [storeId]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: '#FFFFFF',
      },
      headerTintColor: '#000',
      headerTitle: '👣行列情報👣',
      headerBackTitle: '店舗情報',
      headerTitleAlign: 'center',
    });
  }, [navigation]);

  // フォーマット関数
  const formatDate = (timestamp) => {
    if (!timestamp) return 'データなし';
    const date = new Date(timestamp.seconds * 1000);
    const options = { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return new Intl.DateTimeFormat('ja-JP', options).format(date);
  };

  return (
    <View style={styles.container}>
      {/* 店舗名を表示 */}
      <View style={styles.storeNameContainer}>
        <Text style={styles.storeName}>{storeName}</Text>
      </View>
      {/* 最新1件を表示する FlatList */}
      <FlatList
        data={queueData.slice(0, 1)} // 最新1件のみ表示
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.latestCard}>
            <Text style={styles.queueCountHead}>
              {item.queueCount !== undefined ? item.queueCount : '0'}
            </Text>
            <Text style={styles.queueText}>人位待ち</Text>
            <Text style={styles.updateDateHead}>
              {item.updateDate !== undefined ? formatDate(item.updateDate) : 'データなし'}
            </Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyList}>
            <Text>データがありません。</Text>
          </View>
        )}
      />

      {/* スクロール可能なコンポーネント: 2番目以降のデータを表示 */}
      <ScrollComponent
        data={queueData.slice(1)} // 2番目以降のデータを表示
        onLoadMore={fetchMoreData}
        isLoading={isLoading}
        formatDate={formatDate}
      />

      {/* モーダル呼び出しボタン */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setIsModalVisible(true)} // モーダルを表示
      >
        <MaterialIcons name="edit" size={24} color="white" />
      </TouchableOpacity>

      {/* モーダルコンポーネント */}
      <QueueInputModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        storeName={storeName}
        storeId={storeId}
      />
    </View>
  );
}

// スクロール可能なカスタムコンポーネント
function ScrollComponent({ data, onLoadMore, isLoading, formatDate }) {
  return (
    <View style={styles.containerScroll}>
    <Text>過去の入力値</Text>
    <ScrollView
      onScrollEndDrag={onLoadMore} // スクロールの終端で追加データを取得
      style={{ marginBottom: 10 }}
    >

      {data.map((item) => (
        <View key={item.id} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.queueCountBody}>
              {item.queueCount !== undefined ? item.queueCount : '0'} 人待ち
            </Text>
            <Text style={styles.updateDateBody}>
              {item.updateDate ? formatDate(item.updateDate) : 'データなし'}
            </Text>
          </View>
        </View>
      ))}
      {isLoading && (
        <View style={{ padding: 10, alignItems: 'center' }}>
          <Text>読み込み中...</Text>
        </View>
      )}
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#ffffe0',
    marginBottom: 1,
  },
  containerScroll: {
    flex: 2,
    // backgroundColor: '#ffffe0',
  },
  latestCard: {
    padding: 20,
    margin: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  card: {
    padding: 20,
    margin: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  storeNameContainer: {
    padding: 10,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  storeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  row: {
    flexDirection: 'row', // 横並びに設定
    alignItems: 'center', // 垂直方向の位置を揃える
    justifyContent: 'space-between', // 子要素間のスペースを均等に
    paddingVertical: 10, // 上下の余白
    paddingHorizontal: 15, // 左右の余白
    // borderBottomWidth: 1, // 下線を追加
    // borderColor: '#ddd', // 下線の色
  },
  queueCountHead: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  queueCountBody: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  queueText: {
    fontSize: 18,
    marginLeft: 8,
    color: '#333',
  },
  updateDateHead: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 5,
  },
  updateDateBody: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 5,
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
