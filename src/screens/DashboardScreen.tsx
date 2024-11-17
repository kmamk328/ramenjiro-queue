import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export default function DashboardScreen() {
  const [averageQueue, setAverageQueue] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const q = query(collection(db, 'queue_data'), where('storeId', '==', 'your_store_id'));
      const querySnapshot = await getDocs(q);
      const total = querySnapshot.docs.reduce((sum, doc) => sum + doc.data().count, 0);
      setAverageQueue(total / querySnapshot.docs.length);
    };
    fetchData();
  }, []);

  return (
    <View>
      <Text>Average Queue for Store ID your_store_id:</Text>
      <Text>{averageQueue}</Text>
    </View>
  );
}
