import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert } from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export default function QueueInput() {
  const [queueCount, setQueueCount] = useState('');

  const handleSubmit = async () => {
    try {
      await addDoc(collection(db, 'queue_data'), {
        count: Number(queueCount),
        timestamp: new Date(),
        storeId: 'your_store_id' // 店舗IDは実際に選択できるようにする予定
      });
      setQueueCount('');
      Alert.alert('Queue data submitted successfully!');
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };

  return (
    <View>
      <Text>Enter Queue Count:</Text>
      <TextInput
        value={queueCount}
        onChangeText={setQueueCount}
        keyboardType="numeric"
      />
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
}
