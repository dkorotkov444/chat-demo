/*
 * components/Chat.js
 *
 * Second screen for chat-demo: Chat.
 *
 * (c) 2025 Dmitri Korotkov
 */

// --- React and other Third-party libraries ---
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { GiftedChat, Bubble, SystemMessage } from 'react-native-gifted-chat';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
// Firestore helpers for reading and writing collections
import { addDoc, collection, orderBy, onSnapshot, query } from "firebase/firestore";

// Local initial messages to show on first load. These are kept in-memory only
// and are not written to Firestore. Use current timestamps so they appear
// natural while the database is empty; they will be removed when remote
// messages arrive.
const INITIAL_MESSAGES = [
    {
        _id: 'init-1',
        text: 'You have entered the Schwoba Chat',
        createdAt: new Date(),
        system: true,
    },
    {
        _id: 'init-2',
        text: 'Hello developer',
        createdAt: new Date(),
        user: {
            _id: 'init-user-1',
            name: 'React Native',
            avatar: 'https://placeimg.com/140/140/any',
        },
    },
];
// Initial messages will be removed automatically once remote messages arrive.

// Expected route params:
//  - name: string used to set the screen title
//  - color: hex string used as the background color for this screen
// The component ensures sensible defaults if params are missing.
const Chat = ({ db, route, navigation }) => {
    const { userID, name, color } = route?.params || { name: 'Chat', color: '#FFFFFF' };
    // Memoize user so a stable reference is passed to GiftedChat and avoid unnecessary re-renders.
    const user = useMemo(() => ({ _id: userID, name: name || 'Me' }), [userID, name]);

    // Move text input props to a top-level memo to avoid recreating the object each render.
    const textInputProps = useMemo(() => ({
        accessibilityLabel: 'Message input',
        accessibilityHint: 'Type your message here',
        accessibilityRole: 'text',
    }), []);

    const [messages, setMessages] = useState([]);   // State to hold chat messages

    useEffect(() => {
        // show initial in-memory messages once on mount
        setMessages(INITIAL_MESSAGES);
      }, []);

    useEffect(() => {
        const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
        const unsubMessages = onSnapshot(q, (docs) => {
            // Snapshot received; update messages from Firestore.
            const newMessages = [];
            docs.forEach(doc => {
                const data = doc.data();
                    // doc data processed for display
                // Firestore stores timestamps as a special object with `toDate()`.
                // GiftedChat expects a plain JS `Date` instance on `createdAt`.
                const createdAt = data?.createdAt && typeof data.createdAt.toDate === 'function'
                    ? data.createdAt.toDate()
                    : (data?.createdAt instanceof Date ? data.createdAt : new Date());

                newMessages.push({ _id: doc.id, ...data, createdAt });
            });
                // If we have at least one remote message, drop the initial
                // in-memory messages so only remote messages are shown.
                const source = newMessages.length > 0 ? newMessages : [...INITIAL_MESSAGES, ...newMessages];
                const merged = source.sort((a, b) => {
                    const ta = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
                    const tb = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
                    return tb - ta;
                });
                setMessages(merged);
        });

        return () => { if (unsubMessages) unsubMessages(); };
    }, [db]);
    
    const insets = useSafeAreaInsets();

    // Title is handled by navigator options (see `App.js`). Avoid setting
    // navigation options inside this component to reduce re-render risk.
      
    // Handle sending new messages. useCallback keeps the handler stable between renders and avoids 
    // creating a new function each render which can trigger unnecessary updates in child components.
    const onSend = useCallback(async (newMessages = []) => {
        // Persist the first message to Firestore and handle errors.
        // We don't update local state here because the onSnapshot listener
        // will pick up and reflect new messages in the UI.
        try {
            const [message] = newMessages;
            if (!message) return;
            const docRef = await addDoc(collection(db, 'messages'), message);
        } catch (err) {
            console.error('Failed to send message:', err);
        }
    }, [db]);

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