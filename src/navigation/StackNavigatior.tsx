import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ListScreen from '../screens/ListScreen';
import QueueScreen from '../screens/QueueScreen';
import QueueInputScreen from '../screens/QueueInputScreen';

const Stack = createStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="List" component={ListScreen} />
      <Stack.Screen name="QueueScreen" component={QueueScreen} />
      <Stack.Screen name="QueueInputScreen" component={QueueInputScreen} />
    </Stack.Navigator>
  );
}
