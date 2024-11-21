import React, { useState, useContext } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
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
            const queueCollectionRef = collection(db, `stores/${storeId}/queueInformation`);

            const newDocRef = await addDoc(queueCollectionRef, {
                queueCount: parseInt(queueCount, 10), // 入力された待ち人数
                updateDate: serverTimestamp(),      // サーバータイムスタンプ
                updateUser: userId || 'unknown',    // 匿名認証のユーザー ID
            });

            console.log('新しいデータが登録されました:', newDocRef.id);
            onClose(); // モーダルを閉じる
        } catch (error) {
            console.error('Firestore データの登録に失敗しました:', error);
        }
    };

    return (
        <Modal
        visible={isVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
        >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
            <Text style={styles.storeName}>{storeName}</Text>
            <Text style={styles.prompt}>何人くらい待っていますか？</Text>
            <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={queueCount}
                onChangeText={setQueueCount}
                placeholder="例: 3"
            />
            <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
                <Text style={styles.updateButtonText}>更新</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>閉じる</Text>
            </TouchableOpacity>
            </View>
        </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%',
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        alignItems: 'center',
    },
    storeName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    prompt: {
        fontSize: 16,
        marginBottom: 20,
    },
    input: {
        width: '100%',
        height: 40,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 20,
    },
    updateButton: {
        width: '100%',
        padding: 10,
        backgroundColor: '#007AFF',
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 10,
    },
    updateButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    closeButton: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#333',
        fontSize: 16,
    },
});
