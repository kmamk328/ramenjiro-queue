import React from 'react';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ListScreen from '../screens/ListScreen';
import QueueInputScreen from '../screens/QueueInputScreen';
import QueueScreen from '../screens/QueueScreen';
import DashboardScreen from '../screens/DashboardScreen';
import MenuScreen from '../screens/MenuScreen';
import FAQScreen from '../screens/FAQScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AppInfoScreen from '../screens/AppInfoScreen';
import NoticeScreen from '../screens/NoticeScreen';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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

function MenuStackNavigator() {
  return (
      <Stack.Navigator initialRouteName="Menu">
        <Stack.Screen name="Menu" component={MenuScreen} />
        <Stack.Screen name="FAQ" component={FAQScreen} />
        <Stack.Screen name="Notice" component={NoticeScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="AppInfo" component={AppInfoScreen} />
      </Stack.Navigator>
  );
}


export default function BottomTabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="List"
        component={InquireStackNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Icon name="clipboard-list-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
          name="メニュー"
          // component={LoginScreen}
          component={MenuStackNavigator}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Icon name="account-circle-outline" color={color} size={size} />
            ),
          }}
        />
      {/* <Tab.Screen name="Input Queue" component={QueueInputScreen} /> */}
      {/* <Tab.Screen name="Dashboard" component={DashboardScreen} /> */}
    </Tab.Navigator>
  );
}
