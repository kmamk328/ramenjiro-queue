import React, { useState, useEffect, useLayoutEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { collection, query, orderBy, limit, startAfter, onSnapshot, doc, getDocs, setDoc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from '../../App';


import QueueInputModal from '../components/QueueInputModal';

export default function QueueScreen({ route, navigation }) {
  const { storeId, storeName } = route.params; // storeName を受け取る
  const [queueData, setQueueData] = useState([]); // 全データを保持
  const [lastVisible, setLastVisible] = useState(null); // 最後のドキュメントを保存
  const [isLoading, setIsLoading] = useState(false); // ローディング状態を管理
  const [isModalVisible, setIsModalVisible] = useState(false); // モーダルの表示状態
  const userId = useContext(AuthContext); // 現在のユーザーIDを取得


  const PAGE_SIZE = 5; // 1ページに取得するデータ件数

  // 初期データ取得
  const fetchInitialData = async () => {
    const q = query(
      collection(db, `stores/${storeId}/queueInformation`),
      orderBy('updateDate', 'desc'),
      limit(PAGE_SIZE + 1)
    );

    try {
      const unsubscribe = onSnapshot(
        q,
        async (snapshot) => {
          if (!snapshot.empty) {
            const data = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            const favoriteIds = await fetchFavorites();
            setQueueData(mergeFavorites(data, favoriteIds));
            setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
          }
        },
        (error) => {
          console.error('Firestore データの取得に失敗しました:', error);
        }
      );
      return unsubscribe; // 必ず関数を返す
    } catch (error) {
      console.error('データ取得中にエラーが発生しました:', error);
      return () => {}; // クリーンアップ用の空関数を返す
    }
  };

  // 追加データの取得
  const fetchMoreData = async () => {
    if (isLoading || !lastVisible) return;

    setIsLoading(true);

    const q = query(
      collection(db, `stores/${storeId}/queueInformation`),
      orderBy('updateDate', 'desc'),
      startAfter(lastVisible),
      limit(PAGE_SIZE)
    );

    try {
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const favoriteIds = await fetchFavorites();
        setQueueData((prevData) => [...prevData, ...mergeFavorites(data, favoriteIds)]);
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      }
    } catch (error) {
      console.error('追加データの取得に失敗しました:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = fetchInitialData();
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
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

  const handleFavorite = async (id) => {
    const favoritesDocRef = doc(db, `users/${userId}/favorites`, id);
    const queueDocRef = doc(db, `stores/${storeId}/queueInformation`, id);

    try {
      const item = queueData.find((data) => data.id === id);
      const isCurrentlyFavorite = item?.isFavorite;
      const currentFavoriteCount = item?.favoriteCount || 0;

      if (isCurrentlyFavorite) {
        // お気に入り解除
        await deleteDoc(favoritesDocRef);
        await updateDoc(queueDocRef, { favoriteCount: Math.max(currentFavoriteCount - 1, 0) });
      } else {
        // お気に入り追加
        await setDoc(favoritesDocRef, { createdAt: serverTimestamp() });
        await updateDoc(queueDocRef, { favoriteCount: currentFavoriteCount + 1 });
      }

      // Firestore から最新データを取得して更新
      const updatedSnapshot = await getDocs(
        query(collection(db, `stores/${storeId}/queueInformation`), orderBy('updateDate', 'desc'))
      );
      const updatedData = updatedSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const favoriteIds = await fetchFavorites();
      setQueueData(mergeFavorites(updatedData, favoriteIds));
    } catch (error) {
      console.error('お気に入り状態の更新に失敗しました:', error);
    }
  };
  // お気に入りデータを取得する
  const fetchFavorites = async () => {
    const favoritesCollectionRef = collection(db, `users/${userId}/favorites`);
    const snapshot = await getDocs(favoritesCollectionRef);
    return snapshot.docs.map((doc) => doc.id); // お気に入りの ID リストを返す
  };

  const mergeFavorites = (data, favoriteIds) => {
    return data.map((item) => ({
      ...item,
      isFavorite: favoriteIds.includes(item.id),
    }));
  };

  // データを取得した後に `queueData` にお気に入り情報を追加
  useEffect(() => {
    const loadFavorites = async () => {
      const favoriteIds = await fetchFavorites();
      setQueueData((prevQueueData) => mergeFavorites(prevQueueData, favoriteIds));
    };

    loadFavorites();
  }, [queueData]);



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
            <Text>データがありません</Text>
          </View>
        )}
      />

      {/* スクロール可能なコンポーネント: 2番目以降のデータを表示 */}
      <ScrollComponent
        data={queueData.slice(1)}
        onLoadMore={fetchMoreData}
        isLoading={isLoading}
        formatDate={formatDate}
        handleFavorite={handleFavorite}
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
function ScrollComponent({ data, onLoadMore, isLoading, formatDate, handleFavorite }) {
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
            {/* 左側: 人待ちの数 */}
            <View style={{ flex: 1 }}>
              <Text style={styles.queueCountBody}>
                {item.queueCount !== undefined ? item.queueCount : '0'} 人待ち
              </Text>
              <Text style={styles.updateDateBody}>
                {item.updateDate ? formatDate(item.updateDate) : 'データなし'}
              </Text>
            </View>

            {/* 右側: 星アイコンとお気に入り数 */}
            <View style={styles.favoriteContainer}>
              <TouchableOpacity onPress={() => handleFavorite(item.id)}>
                <FontAwesome
                  name="star"
                  size={20}
                  color={item.isFavorite ? 'gold' : 'gray'}
                />
              </TouchableOpacity>
              <Text style={styles.favoriteCount}>
                {item.favoriteCount || 0}
              </Text>
            </View>
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
  favoriteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteButton: {
    marginRight: 8,
  },
  favoriteCount: {
    fontSize: 16,
    color: '#333',
  },
});
