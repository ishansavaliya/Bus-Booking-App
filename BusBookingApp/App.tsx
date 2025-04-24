import './global.css';

import React from 'react';
import Navigation from './src/navigation/Navigation';
import {QueryClientProvider} from '@tanstack/react-query';
import {queryClient} from './src/service/queryClient';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

const App = () => {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <QueryClientProvider client={queryClient}>
        <Navigation />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
};

export default App;
