import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, increment } from 'firebase/firestore';

export default function ProfileScreen() {
  const [nickname, setNickname] = useState('');
  const [points, setPoints] = useState(0);
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error('ユーザーが認証されていません');
        }

        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        // console.log('userDoc:',userDoc);

        if (userDoc.exists()) {
          const data = userDoc.data();
          setNickname(data.nickname || '');
          setPoints(data.points || 0);
        } else {
          // 初回登録
          await setDoc(userDocRef, { nickname: '', points: 0, createdAt: new Date() });
        }
      } catch (error) {
        console.error('ユーザーデータの取得に失敗しました:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleSaveNickname = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('ユーザーが認証されていません');
      }

      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { nickname }, { merge: true });

      Alert.alert('成功', 'ニックネームが保存されました');
    } catch (error) {
      console.error('ニックネームの保存に失敗しました:', error);
      Alert.alert('エラー', 'ニックネームの保存に失敗しました');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>プロフィール</Text>
      <TextInput
        style={styles.input}
        placeholder="ニックネームを入力"
        value={nickname}
        onChangeText={setNickname}
      />
      <TouchableOpacity style={styles.button} onPress={handleSaveNickname}>
        <Text style={styles.buttonText}>保存</Text>
      </TouchableOpacity>
      <Text style={styles.pointsLabel}>ポイント</Text>
      <Text style={styles.points}>{points} pt</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  pointsLabel: {
    fontSize: 18,
    marginBottom: 10,
  },
  points: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
  },
});
