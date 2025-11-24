/*
 * components/Chat.js
 *
 * Second screen for chat-demo: Chat.
 *
 * (c) 2025 Dmitri Korotkov
 */

// --- React and other Third-party libraries ---
import React, { useEffect, useState, useCallback } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';

// Expected route params:
//  - name: string used to set the screen title
//  - color: hex string used as the background color for this screen
// The component ensures sensible defaults if params are missing.
const Chat = ({ route, navigation }) => {
    const { name, color } = route?.params || { name: 'Chat', color: '#FFFFFF' };
    const [messages, setMessages] = useState([]);   // State to hold chat messages

    // Set the screen title to the passed name when the component mounts
    useEffect(() => {
        navigation.setOptions({ title: name });
    }, [name]);

    // Initialize chat
    useEffect(() => {
        setMessages([
            {
                _id: 1,
                text: "Hello developer",
                createdAt: new Date(),
                user: {
                    _id: 2,
                    name: "React Native",
                    avatar: "https://placeimg.com/140/140/any",
                },
            },
            {
                _id: 2,
                text: 'This is a system message',
                createdAt: new Date(),
                system: true,
            },
        ]);
    }, []);
      
    // Handle sending new messages. useCallback keeps the handler stable between renders and avoids 
    // creating a new function each render which can trigger unnecessary updates in child components.
    const onSend = useCallback((newMessages = []) => {
        setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));
    }, []);

    // Render the chat interface
    return (
        <View style={[styles.containerOuter, { backgroundColor: color }]}>
            <GiftedChat
                messages={messages}
                onSend={onSend}
                user={user}
            />
            {/* Adjust for keyboard on Android */}
            { Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null }
        </View>
    );
};

const styles = StyleSheet.create({
    containerOuter: { flex: 1 },
    container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    text: { fontSize: 16, color: '#000' },
});

export default Chat;