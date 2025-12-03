/*
 * App.js
 *
 * Root application file for the chat-demo project
 *
 * (c) 2025 Dmitri Korotkov
 */

// --- React and other Third-party libraries ---
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
// Import react Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNetInfo }from '@react-native-community/netinfo';    // Provides network status monitoring
// Firebase SDK for initializing the app and obtaining Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore, disableNetwork, enableNetwork } from 'firebase/firestore';

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
    const [netBanner, setNetBanner] = useState(null); // string or null
    const connectionStatus = useNetInfo();  // Hook to monitor network connection status
    const prevConnected = useRef(undefined);
    const bannerTimerRef = useRef(null);
    // Alert user and disconnect Firestore database when connection is lost, reconnect when restored
    useEffect(() => {
        const isConnected = connectionStatus.isConnected;
        // On initial mount, set Firestore network state but suppress the banner
        if (prevConnected.current === undefined) {
            prevConnected.current = isConnected;
            if (isConnected === false) {
                disableNetwork(db).catch(err => console.log('disableNetwork error', err));
            } else {
                enableNetwork(db).catch(err => console.log('enableNetwork error', err));
            }
            return;
        }

        if (isConnected === false) {
            setNetBanner('Connection lost');
            disableNetwork(db).catch(err => console.log('disableNetwork error', err));
        } else {
            setNetBanner('Connection restored');
            enableNetwork(db).catch(err => console.log('enableNetwork error', err));
        }

        // Auto-hide the banner after 3 seconds. Reset any existing timer.
        if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
        bannerTimerRef.current = setTimeout(() => setNetBanner(null), 3000);
    }, [connectionStatus.isConnected]);

    // Clear banner timer on unmount
    useEffect(() => {
        return () => { if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current); };
    }, []);

    // Return the navigation container with stack navigator.
    // `db` is provided to the `Chat` screen via a render-prop so child screens can use it.
    return (
        <View style={styles.appContainer}>
            {netBanner ? (
                <View style={styles.banner} pointerEvents='none'>
                    <Text style={styles.bannerText}>{netBanner}</Text>
                </View>
            ) : null}
            <NavigationContainer>
                <Stack.Navigator initialRouteName='Start'>
                    <Stack.Screen name='Start' component={Start} />
                    <Stack.Screen
                        name='Chat'
                        options={({ route }) => ({ title: route?.params?.name || 'Me' })}
                    >
                        {props => <Chat isConnected={connectionStatus.isConnected} db={db} {...props} />}
                    </Stack.Screen>
                </Stack.Navigator>
            </NavigationContainer>
        </View>
    );
};

const styles = StyleSheet.create({
    appContainer: { flex: 1 },
    banner: { backgroundColor: '#222', padding: 8, alignItems: 'center' },
    bannerText: { color: '#fff', fontWeight: '600' },
});

export default App;