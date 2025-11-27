/*
 * App.js
 *
 * Root application file for the chat-demo project
 *
 * (c) 2025 Dmitri Korotkov
 */

// --- React and other Third-party libraries ---
import React from 'react';
import { StyleSheet } from 'react-native';
// Import react Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// --- Local application imports ---
import Start from './components/Start';
import Chat from './components/Chat';
// ErrorBoundary removed; app runs without dev-only boundary

// Create stack navigator
const Stack = createNativeStackNavigator();

// Root app component
const App = () => {
    return (
        <NavigationContainer>
            {/* Stack navigator: handles screen stack and basic navigation flow.
                - `initialRouteName` selects which screen is shown first on launch.
                - Screens are declared below; additional options (header, gestures) can be provided per-screen as needed. */}
            <Stack.Navigator initialRouteName='Start'>
                {/* Entry screen where user picks name and background */}
                <Stack.Screen name='Start' component={Start} />
                {/* Chat screen; expects params (name, color) from Start.
                    Set the header title from route params to avoid calling
                    `navigation.setOptions` inside the screen component. */}
                <Stack.Screen
                name='Chat'
                component={Chat}
                options={({ route }) => ({ title: route?.params?.name ?? 'Chat' })}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

// Component styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default App;
