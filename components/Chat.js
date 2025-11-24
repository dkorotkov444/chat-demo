/*
 * components/Chat.js
 *
 * Second screen for chat-demo: Chat.
 *
 * (c) 2025 Dmitri Korotkov
 */

// --- React and other Third-party libraries ---
import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

// Chat: basic placeholder component
//
// Expected route params:
//  - name: string used to set the screen title
//  - color: hex string used as the background color for this screen
// The component ensures sensible defaults if params are missing.
const Chat = ({ route, navigation }) => {
    const { name, color } = route?.params || { name: 'Chat', color: '#FFFFFF' };

    // Set the screen title to the passed name when the component mounts
    useEffect(() => {
        navigation.setOptions({ title: name });
    }, [name]);

    return (
        <View style={[styles.containerOuter, { backgroundColor: color }]}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.text}>Screen 2 - placeholder</Text>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    containerOuter: { flex: 1 },
    container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    text: { fontSize: 16, color: '#000' },
});

export default Chat;