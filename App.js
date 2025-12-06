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
// Provides network status monitoring
import { useNetInfo }from '@react-native-community/netinfo';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

// Firebase SDK for initializing the app and obtaining Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore, disableNetwork, enableNetwork } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Import environment variables
import {
    FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID,
} from '@env';

// --- Local application imports ---
import Start from './components/Start';
import Chat from './components/Chat';

// Create stack navigator
const Stack = createNativeStackNavigator();
// Firebase configuration and initialization are moved to module scope so the
// app is initialized once when the module is loaded. For security, provide
// your real keys in a local `.env` (copy `.env.example` to `.env`).
const firebaseConfig = {
    apiKey: FIREBASE_API_KEY,
    authDomain: FIREBASE_AUTH_DOMAIN,
    projectId: FIREBASE_PROJECT_ID,
    storageBucket: FIREBASE_STORAGE_BUCKET,
    messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
    appId: FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);  // Initialize Firebase app
const db = getFirestore(app);       // Firestore database instance
const storage = getStorage(app);    // Firebase storage instance

// Root app component
const App = () => {
    const [netBanner, setNetBanner] = useState(null); // string or null
    const connectionStatus = useNetInfo();  // Hook to monitor network connection status
    // Track previous connection state to detect real changes
    const prevConnected = useRef(undefined);
    const bannerTimerRef = useRef(null);

    // React only to actual connection state changes
    useEffect(() => {
        const isConnected = connectionStatus.isConnected;
        if (isConnected === undefined || isConnected === null) return; // wait for first real value

        // First resolved value: sync Firestore, no banner
        if (prevConnected.current === undefined) {
            prevConnected.current = isConnected;
            if (isConnected) {
                enableNetwork(db).catch(err => console.log('enableNetwork error', err));
            } else {
                disableNetwork(db).catch(err => console.log('disableNetwork error', err));
            }
            return;
        }

        if (prevConnected.current === isConnected) return; // no change

        prevConnected.current = isConnected;
        if (!isConnected) {
            setNetBanner('Connection lost');
            disableNetwork(db).catch(err => console.log('disableNetwork error', err));
        } else {
            setNetBanner('Connection restored');
            enableNetwork(db).catch(err => console.log('enableNetwork error', err));
        }

        if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
        bannerTimerRef.current = setTimeout(() => setNetBanner(null), 10000);
    }, [connectionStatus.isConnected, db]);

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
            <ActionSheetProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName='Start'>
                        <Stack.Screen name='Start' component={Start} />
                        <Stack.Screen
                            name='Chat'
                            options={({ route }) => ({ title: route?.params?.name || 'Me' })}
                        >
                            {props => <Chat isConnected={connectionStatus.isConnected} db={db} storage={storage} {...props} />}
                        </Stack.Screen>
                    </Stack.Navigator>
                </NavigationContainer>
            </ActionSheetProvider>
        </View>
    );
};

const styles = StyleSheet.create({
    appContainer: { flex: 1 },
    banner: { backgroundColor: '#222', padding: 8, alignItems: 'center' },
    bannerText: { color: '#fff', fontWeight: '600' },
});

export default App;