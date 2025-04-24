import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import React from 'react';
import {UserCircleIcon} from 'react-native-heroicons/solid';
import {logout} from '../service/requests/auth';
import Bookings from '../components/home/Bookings';
import Search from '../components/home/Search';

const HomeScreen = () => {
  // Get status bar height for Android to create consistent padding
  const statusBarHeight =
    Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <SafeAreaView
        className="flex-1 bg-white"
        style={{paddingTop: Platform.OS === 'android' ? statusBarHeight : 0}}>
        <View className="flex-row justify-between items-center mx-4 my-2">
          <Text className="font-okra font-bold text-3xl">Bus Tickets</Text>
          <View className="p-1">
            <UserCircleIcon color="red" size={38} onPress={logout} />
          </View>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: Platform.OS === 'ios' ? 40 : 20,
          }}>
          <Search />
          <Bookings />
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default HomeScreen;
