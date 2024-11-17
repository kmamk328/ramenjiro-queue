import React from 'react';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ListScreen from '../screens/ListScreen';
import QueueInputScreen from '../screens/QueueInputScreen';
import QueueScreen from '../screens/QueueScreen';
import DashboardScreen from '../screens/DashboardScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function InquireStackNavigator() {
  return (
    <Stack.Navigator initialRouteName="Inquire">
      <Stack.Screen name="List Screen" component={ListScreen} />
      <Stack.Screen name="QueueInputScreen" component={QueueInputScreen} />
      <Stack.Screen name="QueueScreen" component={QueueScreen} />

    </Stack.Navigator>
  );
}

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="List"
        component={InquireStackNavigator}
        options={{ headerShown: false }}
      />
      {/* <Tab.Screen name="Input Queue" component={QueueInputScreen} /> */}
      {/* <Tab.Screen name="Dashboard" component={DashboardScreen} /> */}
    </Tab.Navigator>
  );
}
