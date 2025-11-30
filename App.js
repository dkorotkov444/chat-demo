/*
 * App.js
 *
 * Root application file for the chat-demo project
 *
 * (c) 2025 Dmitri Korotkov
 */

// --- React and other Third-party libraries ---
import React from 'react';
// Import react Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// Firebase SDK for initializing the app and obtaining Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// --- Local application imports ---
import Start from './components/Start';
import Chat from './components/Chat';
// ErrorBoundary removed; app runs without dev-only boundary

// Create stack navigator
const Stack = createNativeStackNavigator();
// Firebase configuration and initialization are moved to module scope so the
// app is initialized once when the module is loaded. In production consider
// keeping keys in environment variables or secure config rather than in source.
const firebaseConfig = {
    apiKey: 'AIzaSyCJcZlfWWPYLrFh5YtmdR6qFhy7P_NLT1E',
    authDomain: 'chat-demo-852d3.firebaseapp.com',
    projectId: 'chat-demo-852d3',
    storageBucket: 'chat-demo-852d3.firebasestorage.app',
    messagingSenderId: '370273885356',
    appId: '1:370273885356:web:704388dc90af1c34539309'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Root app component
const App = () => {
    // Return the navigation container with stack navigator. `db` is provided
    // to the `Chat` screen via a render-prop so child screens can use it.
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName='Start'>
                <Stack.Screen name='Start' component={Start} />
                <Stack.Screen
                    name='Chat'
                    options={({ route }) => ({ title: route?.params?.name ?? 'Chat' })}
                >
                    {props => <Chat db={db} {...props} />}
                </Stack.Screen>
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default App;
