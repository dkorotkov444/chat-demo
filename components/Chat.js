/*
 * components/Chat.js
 *
 * Second screen for chat-demo: Chat.
 *
 * (c) 2025 Dmitri Korotkov
 */

// --- React and other Third-party libraries ---
import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { GiftedChat, Bubble, SystemMessage } from 'react-native-gifted-chat';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// Expected route params:
//  - name: string used to set the screen title
//  - color: hex string used as the background color for this screen
// The component ensures sensible defaults if params are missing.
const Chat = ({ route, navigation }) => {
    const { name, color } = route?.params || { name: 'Chat', color: '#FFFFFF' };
    // Memoize user so a stable reference is passed to GiftedChat and avoid unnecessary re-renders.
    const user = useMemo(() => ({ _id: 1, name: name || 'Me' }), [name]);

    // Keep component lightweight; removed dev instrumentation.

    // Move text input props to a top-level memo to avoid recreating the object each render.
    const textInputProps = useMemo(() => ({
        accessibilityLabel: 'Message input',
        accessibilityHint: 'Type your message here',
        accessibilityRole: 'text',
    }), []);

    const [messages, setMessages] = useState([             // State to hold chat messages
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

    const insets = useSafeAreaInsets();

    // Title is handled by navigator options (see `App.js`). Avoid setting
    // navigation options inside this component to reduce re-render risk.
      
    // Handle sending new messages. useCallback keeps the handler stable between renders and avoids 
    // creating a new function each render which can trigger unnecessary updates in child components.
    const onSend = useCallback((newMessages = []) => {
        setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));
    }, [setMessages]);

    // Simple dark-background check: treat the two darkest COLOR_OPTIONS as 'dark'.
    // This avoids complex luminance math and matches the Start.js palette.
    const isVeryDarkBg = (c) => {
        if (!c) return false;
        const s = c.toString().trim().toLowerCase();
        return s === '#090c08' || s === '#474056';
    };

    // Render custom bubble styles while preserving any incoming styles from GiftedChat
    const renderBubble = (props) => {
        const dark = isVeryDarkBg(color);
        const incomingWrapper = props.wrapperStyle || {};
        // Force outgoing (right) bubble background (avoid inherited blue):
        const rightBg = dark ? '#e5eeaa' : '#FFFFFF';
        // Make incoming (left) bubble slightly lighter when the screen background is dark
        const leftBg = dark ? '#3a3a3a' : '#FFF';
        const rightText = dark ? '#000' : (props.textStyle?.right?.color || '#000');
        const leftText = dark ? '#fff' : (props.textStyle?.left?.color || '#000');

        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    right: { ...(incomingWrapper.right || {}), backgroundColor: rightBg },
                    left: { ...(incomingWrapper.left || {}), backgroundColor: leftBg },
                }}
                textStyle={{
                    right: { color: rightText },
                    left: { color: leftText },
                }}
                // Ensure time text is readable: prefer black time text on light and dark contexts
                timeTextStyle={{
                    right: { color: dark ? '#000' : '#000' },
                    left: { color: dark ? '#fff' : (props.timeTextStyle?.left?.color || '#000') },
                }}
            />
        );
    };

    // Render system messages with higher contrast and centered alignment
    const renderSystemMessage = (props) => {
        const dark = isVeryDarkBg(color);
        return (
            <SystemMessage
                {...props}
                containerStyle={{ alignItems: 'center' }}
                textStyle={{ color: dark ? '#ffffff' : '#222222', fontWeight: '600', textAlign: 'center' }}
            />
        );
    };
   
    // Render the chat interface
    return (
        <SafeAreaView
            style={[styles.containerOuter, { backgroundColor: color }]}
            accessibilityLabel='Chat screen'
            accessibilityHint='Displays messages and composer to send messages'
        >
            <KeyboardAvoidingView
                style={styles.flexGrow}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={insets.bottom}
            >
                <GiftedChat
                    messages={messages}
                    renderBubble={renderBubble}
                    renderSystemMessage={renderSystemMessage}
                    onSend={onSend}
                    user={user}
                    textInputProps={textInputProps}
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    containerOuter: { flex: 1 },
    flexGrow: { flex: 1 },
});

export default Chat;