import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  Image,
  Platform,
  Dimensions,
} from 'react-native';
import React, {useState} from 'react';
import {navigate} from '../../utils/NavigationUtils';
import LinearGradient from 'react-native-linear-gradient';
import {
  CalendarDaysIcon,
  MagnifyingGlassIcon,
} from 'react-native-heroicons/solid';
import DatePickerModal from '../ui/DatePickerModel';
import LocationPickerModal from '../ui/LocationPickerModel';

const Search = () => {
  const [from, setFrom] = useState<string | null>(null);
  const [to, setTo] = useState<string | null>(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [locationType, setLocationType] = useState<'from' | 'to'>('from');
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  // Get screen width to calculate appropriate margins
  const screenWidth = Dimensions.get('window').width;

  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 2);

  const handleLocationSelect = (location: string, type: 'from' | 'to') => {
    if (type === 'from') {
      setFrom(location);
      if (location === to) {
        setTo(null);
      }
    } else {
      setTo(location);
    }
  };

  const handleSearchBuses = () => {
    if (!from || !to) {
      Alert.alert(
        'Missing Information',
        'Please select both departure and destination locations.',
      );
      return;
    }
    if (from === to) {
      Alert.alert(
        'Invalid Selection',
        'Departure and destination locations cannot be the same.',
      );
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      Alert.alert(
        'Invalid Date',
        'Please select a future date for your journey.',
      );
      return;
    }

    // Convert Date object to ISO string to make it serializable
    navigate('BusListScreen', {item: {from, to, date: date.toISOString()}});
  };

  return (
    <View className="rounded-b-3xl overflow-hidden">
      <LinearGradient
        colors={['#78B0E6', '#fff']}
        start={{x: 1, y: 1}}
        end={{x: 1, y: 0}}>
        <View
          style={{
            paddingHorizontal: Math.min(16, screenWidth * 0.04),
            paddingVertical: 16,
          }}>
          <View className="my-3 bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-300">
            <TouchableOpacity
              className="p-4 flex-row gap-4 items-center border-b-2 border-gray-300"
              onPress={() => {
                setLocationType('from');
                setShowLocationPicker(true);
              }}>
              <Image
                className="h-6 w-6"
                source={require('../../assets/images/bus.png')}
              />
              <Text className="w-[90%] text-lg font-okra text-gray-700">
                {from || 'From'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="p-4 flex-row gap-4 items-center border-b-2 border-gray-300"
              onPress={() => {
                setLocationType('to');
                setShowLocationPicker(true);
              }}>
              <Image
                className="h-6 w-6"
                source={require('../../assets/images/bus.png')}
              />
              <Text className="w-[90%] text-lg font-okra text-gray-700">
                {to || 'To'}
              </Text>
            </TouchableOpacity>

            <View className="flex-row items-center p-3 justify-between">
              <View className="flex-row items-center">
                <TouchableOpacity
                  className="p-2 mr-2 rounded-lg bg-secondary"
                  onPress={() => setDate(new Date())}>
                  <Text className="font-bold text-sm font-okra">Today</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="p-2 rounded-lg bg-secondary"
                  onPress={() => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    setDate(tomorrow);
                  }}>
                  <Text className="font-bold text-sm font-okra">Tomorrow</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                className="flex-row items-center"
                onPress={() => setShowDatePicker(true)}>
                <View className="mr-3">
                  <Text className="text-sm font-normal font-okra text-gray-500">
                    Date of Journey
                  </Text>

                  <Text className="text-md font-bold font-okra text-gray-900">
                    {date?.toDateString()}
                  </Text>
                </View>
                <CalendarDaysIcon color="#000" size={25} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSearchBuses}
            className="bg-tertiary p-3 rounded-xl my-2 flex-row items-center justify-center gap-2">
            <MagnifyingGlassIcon color={'#fff'} size={22} />
            <Text className="font-okra font-bold text-white text-lg">
              Search Buses
            </Text>
          </TouchableOpacity>

          <View
            style={{
              marginTop: 20,
              marginBottom: 10,
              width: '100%',
              alignSelf: 'center',
            }}>
            <Image
              source={require('../../assets/images/sidebus.jpg')}
              style={{
                height: 130,
                width: '100%',
                borderRadius: 12,
              }}
              resizeMode="cover"
            />
          </View>
        </View>
      </LinearGradient>

      {showDatePicker && (
        <DatePickerModal
          visible={showDatePicker}
          onClose={() => setShowDatePicker(false)}
          onConfirm={setDate}
          selectedDate={date}
        />
      )}

      {showLocationPicker && (
        <LocationPickerModal
          visible={showLocationPicker}
          onClose={() => setShowLocationPicker(false)}
          onSelect={handleLocationSelect}
          type={locationType}
          fromLocation={from || undefined}
        />
      )}
    </View>
  );
};

export default Search;
