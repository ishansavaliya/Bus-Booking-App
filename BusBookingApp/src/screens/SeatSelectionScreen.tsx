import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import React, {useState, useEffect, useMemo} from 'react';
import {useRoute} from '@react-navigation/native';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {bookTicket, fetchBusDetails} from '../service/requests/bus';
import {goBack, resetAndNavigate} from '../utils/NavigationUtils';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ArrowLeftIcon, StarIcon} from 'react-native-heroicons/solid';
import {ScrollView} from 'react-native-gesture-handler';
import TicketModal from '../components/ui/TicketModel';
import PaymentButton from '../components/ui/PaymentButton';
import Seat from '../components/ui/Seat';

const SeatSelectionScreen = () => {
  const [ticketVisible, setTicketVisible] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const route = useRoute();
  const queryClient = useQueryClient();
  const {
    busId,
    from,
    to,
    date: dateString,
  } = route.params as {
    busId: string;
    from?: string;
    to?: string;
    date?: string;
  };

  // Convert the date string to a Date object if available
  const journeyDate = useMemo(() => {
    if (dateString) {
      try {
        const date = new Date(dateString);
        return !isNaN(date.getTime()) ? date : new Date();
      } catch (e) {
        return new Date();
      }
    }
    return new Date();
  }, [dateString]);

  // Add timeout to prevent indefinite loading
  const [forceLoadComplete, setForceLoadComplete] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setForceLoadComplete(true);
    }, 200); // Force exit loading state after 2 seconds max
    return () => clearTimeout(timer);
  }, []);

  const {
    data: busInfo,
    isLoading: queryLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['busDetails', busId],
    queryFn: () => fetchBusDetails(busId),
    retry: 1,
  });

  // Consider both React Query loading state and our timeout
  const isLoading = queryLoading && !forceLoadComplete;

  const bookTicketMutation = useMutation({
    mutationFn: (ticketData: {
      busId: string;
      date: string;
      seatNumbers: number[];
    }) => bookTicket(ticketData),
    onSuccess: data => {
      console.log('Ticket booked successfully:', data);
      // Refetch bus details to get updated seat status
      refetch();
      // Clear selected seats as they are now booked
      setSelectedSeats([]);
      // Show the ticket modal
      setTicketVisible(true);
      // Invalidate the query to ensure fresh data
      queryClient.invalidateQueries({queryKey: ['busDetails', busId]});
    },
    onError: error => {
      console.error('Error booking ticket:', error);
      Alert.alert('Failed to book ticket. Please try again.');
    },
  });

  const handleSeatSelection = (seat_id: number) => {
    setSelectedSeats(prev =>
      prev.includes(seat_id)
        ? prev.filter(id => id !== seat_id)
        : [...prev, seat_id],
    );
  };

  const handleOnPay = () => {
    if (selectedSeats.length === 0) {
      Alert.alert('Please select at least one seat.');
      return;
    }

    if (!busInfo || !busInfo.departureTime) {
      Alert.alert('Error', 'Bus information is not available');
      return;
    }

    bookTicketMutation.mutate({
      busId,
      date: new Date(busInfo.departureTime).toISOString(),
      seatNumbers: selectedSeats,
    });
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="teal" />
        <Text className="text-gray-500 mt-2">Loading bus details...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-500">Failed to load bus details.</Text>
        <TouchableOpacity onPress={() => goBack()}>
          <Text className="text-blue-500">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView />

      <View className="bg-white p-4 flex-row items-center border-b-[1px] border-teal-400">
        <TouchableOpacity onPress={() => goBack()}>
          <ArrowLeftIcon size={24} color="#000" />
        </TouchableOpacity>

        <View className="ml-4">
          <Text className="text-lg font-bold">Seat Selection</Text>
          <Text className="text-sm text-gray-500">
            {from || busInfo?.from || 'Origin'} ➙{' '}
            {to || busInfo?.to || 'Destination'}
          </Text>
          <Text className="text-sm text-gray-500">
            {busInfo?.departureTime &&
            !isNaN(new Date(busInfo.departureTime).getTime())
              ? new Date(busInfo.departureTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : journeyDate.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
            {journeyDate && !isNaN(journeyDate.getTime())
              ? journeyDate.toLocaleDateString()
              : 'Date not available'}
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 200}}
        className="pb-20 bg-teal-100 p-4">
        <Seat
          selectedSeats={selectedSeats}
          seats={busInfo?.seats}
          onSeatSelect={handleSeatSelection}
        />
        <View className="bg-white rounded-lg p-4 drop-shadow-sm">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-lg font-semibold">
              {busInfo?.company || 'Bus Company'}
            </Text>
            <View className="flex-row items-center">
              <StarIcon size={18} color="gold" />
              <Text className="ml-1 text-gray-600 text-sm">
                {busInfo?.rating || '4.5'} ({busInfo?.totalReviews || '120'})
              </Text>
            </View>
          </View>
          <Text className="text-sm text-gray-600 mb-1">
            {busInfo?.busType || 'AC Sleeper'}
          </Text>

          <View className="flex-row justify-between mt-2">
            <View className="items-center">
              <Text className="text-lg font-bold">
                {busInfo?.departureTime
                  ? new Date(busInfo.departureTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '10:00 AM'}
              </Text>
              <Text className="text-sm text-gray-500">Departure</Text>
            </View>
            <Text className="text-sm text-gray-500">
              {busInfo?.duration || '8h 30m'}
            </Text>
            <View className="items-center">
              <Text className="text-lg font-bold">
                {busInfo?.arrivalTime
                  ? new Date(busInfo.arrivalTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '6:30 PM'}
              </Text>
              <Text className="text-sm text-gray-500">Arrival</Text>
            </View>
          </View>

          <Text className="mt-3 text-green-600 text-sm">
            {busInfo?.seats
              ? busInfo.seats.flat().filter((seat: any) => !seat.booked).length
              : '30'}{' '}
            Seats Available
          </Text>

          <View className="flex-row items-center mt-2">
            {busInfo?.originalPrice && (
              <Text className="text-gray-400 line-through text-lg">
                ₹{busInfo.originalPrice}
              </Text>
            )}
            <Text className="text-xl font-bold text-black ml-2">
              ₹{busInfo?.price || 0}
            </Text>
            <Text className="text-sm text-gray-500 ml-1">(per person)</Text>
          </View>

          <View className="flex-row gap-2 mt-3">
            {busInfo?.badges &&
              Array.isArray(busInfo.badges) &&
              busInfo.badges.map((badge: string, index: number) => (
                <View
                  key={index}
                  className="bg-yellow-200 px-2 py-1 rounded-full">
                  <Text className="text-xs text-yellow-800 font-semibold">
                    {badge}
                  </Text>
                </View>
              ))}
          </View>
        </View>
      </ScrollView>

      <PaymentButton
        seat={selectedSeats.length}
        price={busInfo?.price || 0}
        onPay={handleOnPay}
      />

      {ticketVisible && (
        <TicketModal
          bookingInfo={{
            from: busInfo?.from || 'Origin',
            to: busInfo?.to || 'Destination',
            departureTime: busInfo?.departureTime
              ? new Date(busInfo.departureTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '10:00 AM',
            arrivalTime: busInfo?.arrivalTime
              ? new Date(busInfo.arrivalTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '6:30 PM',
            date: busInfo?.departureTime
              ? new Date(busInfo.departureTime).toDateString()
              : new Date().toDateString(),
            company: busInfo?.company || 'Bus Company',
            busType: busInfo?.busType || 'AC Sleeper',
            seats: bookTicketMutation.data?.seatNumbers || selectedSeats,
            ticketNumber: bookTicketMutation.data?._id || 'TU3511709689',
            pnr: bookTicketMutation.data?.pnr || 'PNR123456789',
            fare: `${(busInfo?.price || 0) * selectedSeats.length}`,
          }}
          onClose={() => {
            resetAndNavigate('HomeScreen');
            setTicketVisible(false);
          }}
          visible={ticketVisible}
        />
      )}
    </View>
  );
};

export default SeatSelectionScreen;
