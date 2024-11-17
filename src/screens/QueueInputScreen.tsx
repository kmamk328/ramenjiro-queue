import React from 'react';
import { View } from 'react-native';
import QueueInput from '../components/QueueInput';

export default function QueueInputScreen({ route }) {
  const { storeId } = route.params;

  return (
    <View>
      <QueueInput storeId={storeId} />
    </View>
  );
}
