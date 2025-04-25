import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import React, {useState} from 'react';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {useMutation} from '@tanstack/react-query';
import {loginWithGoogle, loginWithPhone} from '../service/requests/auth';
import {resetAndNavigate} from '../utils/NavigationUtils';

// Enhanced Google Sign-in configuration
GoogleSignin.configure({
  webClientId:
    '255789325338-uh7ulqrohfhco77278gvr40654dsvm4v.apps.googleusercontent.com',
  // For iOS, use your actual iOS client ID from Google Cloud Console
  // If you don't have one yet, you may need to create one
  iosClientId:
    Platform.OS === 'ios'
      ? '255789325338-uh7ulqrohfhco77278gvr40654dsvm4v.apps.googleusercontent.com'
      : undefined,
  scopes: ['profile', 'email'],
  offlineAccess: true,
  forceCodeForRefreshToken: true,
});

const LoginScreen = () => {
  const [phone, setPhone] = useState('');

  const googleLoginMutation = useMutation({
    mutationFn: loginWithGoogle,
    onSuccess: () => {
      resetAndNavigate('HomeScreen');
    },
    onError: error => {
      console.error('Google Login Failed', error);
    },
  });

  const phoneLoginMutation = useMutation({
    mutationFn: loginWithPhone,
    onSuccess: () => {
      resetAndNavigate('HomeScreen');
    },
    onError: error => {
      console.error('Phone Login Failed', error);
      Alert.alert(
        'Login Failed',
        'Could not login with the provided phone number. Please try again.',
      );
    },
  });

  const handlePhoneLogin = () => {
    if (!phone || phone.length < 10) {
      Alert.alert(
        'Invalid Phone Number',
        'Please enter a valid 10-digit phone number',
      );
      return;
    }

    // If the phone number is valid (10 digits), proceed with authentication
    phoneLoginMutation.mutate(phone);
  };

  const handleGoogleSignin = async () => {
    try {
      // Check if Play Services are available (for Android)
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});

      // Force sign out before sign in to clear any previous sessions
      await GoogleSignin.signOut();

      console.log('Initiating Google Sign-in...');
      const response = await GoogleSignin.signIn();
      console.log('Google Sign-in response:', response);

      // Check if the sign-in was cancelled or unsuccessful
      if (!response) {
        console.log('Google Sign-in was cancelled or returned no data');
        return; // Exit early without error
      }

      // If we got here, sign-in was successful, now get the ID token
      try {
        // Get the current user and tokens
        const currentUser = await GoogleSignin.getCurrentUser();
        if (!currentUser || !currentUser.idToken) {
          console.error('No user or ID token available after Google Sign-in');
          Alert.alert('Login Failed', 'Sign-in process was incomplete. Please try again.');
          return;
        }

        console.log('User info received, logging in to backend...');
        // Use the idToken to authenticate with your backend
        googleLoginMutation.mutate(currentUser.idToken);
      } catch (tokenError) {
        console.error('Failed to get user data:', tokenError);
        Alert.alert('Login Failed', 'Authentication process was incomplete. Please try again.');
      }
      
    } catch (error: any) {
      // Type assertion for error
      if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
        console.error('Google Sign-in was cancelled by the user');
        // User cancelled the sign-in, this is not an error that needs to be shown to the user
      } else if (error?.code === statusCodes.IN_PROGRESS) {
        console.error('Google Sign-in already in progress');
        Alert.alert('Sign-in in Progress', 'A sign-in operation is already in progress');
      } else if (error?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.error('Google Play services are not available');
        Alert.alert('Google Play Services Unavailable', 'Please make sure Google Play Services are installed and updated');
      } else {
        console.error('Google Sign-in error:', error?.code, error?.message);
        Alert.alert('Login Error', 'There was a problem with Google Sign-in. Please try again later.');
      }
    }
  };

  return (
    <View>
      <Image
        source={require('../assets/images/cover.jpeg')}
        className="w-full h-64 bg-cover"
      />
      <View className="p-4">
        <Text className="font-okra font-semibold text-xl text-center">
          Create Account or Sign in
        </Text>

        <View className="my-4 mt-12 border-1 gap-2 border border-black px-2 flex-row items-center">
          <Text className="font-okra w-[10%] font-bold text-base">+91</Text>

          <TextInput
            value={phone}
            onChangeText={setPhone}
            maxLength={10}
            keyboardType="number-pad"
            placeholder="Enter 10 digit phone number"
            className="font-okra h-11 w-[90%]"
          />
        </View>

        <TouchableOpacity
          onPress={handlePhoneLogin}
          className="bg-tertiary justify-center items-center p-3">
          <Text className="text-white font-extrabold font-okra">
            {phoneLoginMutation.isPending ? 'Logging In...' : "Let's Go"}
          </Text>
        </TouchableOpacity>

        <Text className="text-center my-8 text-sm font-okra text-gray">
          ------- OR -------
        </Text>

        <View className="flex items-center justify-center flex-row gap-4">
          <TouchableOpacity
            onPress={handleGoogleSignin}
            className="border border-1 border-gray-300 p-2">
            <Image
              source={require('../assets/images/google.png')}
              className="w-5 h-5 contain-size"
            />
          </TouchableOpacity>
          <TouchableOpacity className="border border-1 border-gray-300 p-2">
            <Image
              source={require('../assets/images/apple.png')}
              className="w-5 h-5 contain-size"
            />
          </TouchableOpacity>
        </View>

        <Text className="font-okra text-sm text-gray-500 font-medium text-center mt-10 w-72 self-center ">
          By Signing up you agree to our Terms and Conditions and Privacy
          Policy.
        </Text>
      </View>
    </View>
  );
};
export default LoginScreen;
