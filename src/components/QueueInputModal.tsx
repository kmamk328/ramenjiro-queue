import React, { useState, useContext } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard,
    Platform,
    Alert
} from 'react-native';
import { collection, addDoc, query, where, orderBy, limit, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { AuthContext } from '../../App';

export default function QueueInputModal({ isVisible, onClose, storeName, storeId }) {
    const [queueCount, setQueueCount] = useState('');
    const userId = useContext(AuthContext);

    const handleUpdate = async () => {
        if (!queueCount) {
            Alert.alert('人数を入力してください');
            return;
        }

        try {
          // Firestore コレクション参照
            const queueCollectionRef = collection(db, `stores/${storeId}/queueInformation`);

            // 現在のユーザーが最後に更新したデータを取得
            const q = query(
                queueCollectionRef,
                where('updateUser', '==', userId), // 現在のユーザーのデータに限定
                orderBy('updateDate', 'desc'),    // 最新の更新順に並べ替え
                limit(1)                          // 最新の1件のみ取得
            );

            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const lastUpdate = querySnapshot.docs[0].data().updateDate;
                const now = new Date();
                const lastUpdateDate = lastUpdate.toDate();
                const diffInMinutes = (now - lastUpdateDate) / (1000 * 60); // 分単位で計算
                console.log('lastUpdateDate : ',lastUpdateDate);
                if (diffInMinutes < 5) {
                    Alert.alert('同じ店舗では5分に1回しか更新できません');
                    return;
                }
            }

          // 更新可能な場合、新しいデータを追加
            const newDocRef = await addDoc(queueCollectionRef, {
                queueCount: parseInt(queueCount, 10),
                updateDate: serverTimestamp(),
                updateUser: userId || 'unknown',
            });

            console.log('新しいデータが登録されました:', newDocRef.id);
            onClose();
        } catch (error) {
            console.error('Firestore データの登録に失敗しました:', error);
        }
    };

    return (
        <Modal visible={isVisible} animationType="slide" transparent={true}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.overlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalContainer}
                >
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.title}>{storeName}</Text>
                    <Text style={styles.prompt}>何人くらい待っていますか？</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={queueCount}
                        onChangeText={setQueueCount}
                        placeholder="人数を入力"
                        maxLength={3}
                    />
                    <TouchableOpacity style={styles.button} onPress={handleUpdate}>
                        <Text style={styles.buttonText}>更新</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>キャンセル</Text>
                    </TouchableOpacity>
                    </ScrollView>
                </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
            </Modal>
    );
}

    const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
    },
    modalContainer: {
        margin: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 5,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    prompt: {
        fontSize: 18,
        marginBottom: 10,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    closeButton: {
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#007AFF',
        fontSize: 16,
    },
    });