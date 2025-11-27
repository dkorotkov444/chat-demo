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
import { GiftedChat, Bubble } from 'react-native-gifted-chat';

// Expected route params:
//  - name: string used to set the screen title
//  - color: hex string used as the background color for this screen
// The component ensures sensible defaults if params are missing.
const Chat = ({ route, navigation }) => {
    const [messages, setMessages] = useState([]);   // State to hold chat messages
    const { name, color } = route?.params || { name: 'Chat', color: '#FFFFFF' };
    const user = { _id: 1, name: name || 'Me' };    // Setting current user info

    // Set the screen title to the passed name when the component mounts
    useEffect(() => {
        navigation.setOptions({ title: name });
    }, [name]);

    // Initialize chat with static messages
    useEffect(() => {
        setMessages([
            {
                _id: 1,
                text: 'You have entered the Schwoba Chat',
                createdAt: new Date(),
                system: true,
            },
            {
                _id: 2,
                text: 'Hello developer',
                createdAt: new Date(),
                user: {
                    _id: 2,
                    name: 'React Native',
                    avatar: 'https://placeimg.com/140/140/any',
                },
            },
        ]);
    }, []);
      
    // Handle sending new messages. useCallback keeps the handler stable between renders and avoids 
    // creating a new function each render which can trigger unnecessary updates in child components.
    const onSend = useCallback((newMessages = []) => {
        setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));
    }, []);

    // Render custom bubble styles
    const renderBubble = (props) => {
                        return <Bubble
                    {...props}
                    wrapperStyle={{
                        right: {
                            backgroundColor: '#000'
                        },
                        left: {
                            backgroundColor: '#FFF'
                        }
                    }}
                />;
      };
    
    // Render the chat interface
    return (
        <KeyboardAvoidingView
            style={[styles.containerOuter, { backgroundColor: color }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
            accessibilityRole='main'
            accessibilityLabel='Chat screen'
            accessibilityHint='Displays messages and composer to send messages'
        >
            <GiftedChat
                messages={messages}
                renderBubble={renderBubble}
                onSend={onSend}
                user={user}
                textInputProps={{
                    accessibilityLabel: 'Message input',
                    accessibilityHint: 'Type your message here',
                    accessibilityRole: 'textbox',
                }}
            />
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    containerOuter: { flex: 1 },
    //container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    //text: { fontSize: 16, color: '#000' },
});

export default Chat;