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
import { GiftedChat, Bubble, SystemMessage, InputToolbar } from 'react-native-gifted-chat';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView from 'react-native-maps';
// Firestore helpers for reading and writing collections
import { addDoc, collection, orderBy, onSnapshot, query, serverTimestamp } from 'firebase/firestore';
// Custom actions component for image and location sending
import CustomActions from './CustomActions';

// Local initial messages shown before remote messages arrive, then they disappear automatically.
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

// Expected route params:
//  - name: string used to set the screen title
//  - color: hex string used as the background color for this screen
const Chat = ({ db, storage, route, isConnected }) => {
    // Safely read route params; treat falsy values as missing and replace with fallbacks.
    const { userID, name, color } = route?.params ?? {};
    const bgColor = color || '#FFFFFF';
    // Memoize user so a stable reference is passed to GiftedChat and avoid unnecessary re-renders.
    // Use logical-OR so empty string or other falsy values are replaced by the fallback.
    const user = useMemo(() => ({ _id: userID || 'unknown', name: name || 'Me' }), [userID, name]);

    // Move text input props to a top-level memo to avoid recreating the object each render.
    const textInputProps = useMemo(() => ({
        accessibilityLabel: 'Message input',
        accessibilityHint: 'Type your message here',
        accessibilityRole: 'text',
    }), []);

    const [messages, setMessages] = useState([]);   // State to hold chat messages

    useEffect(() => {
        // Show initial in-memory messages once on mount.
        setMessages(INITIAL_MESSAGES);
    }, []);

    // Cache messages locally using AsyncStorage (serialize dates to ISO strings)
    // Keep only the most recent 200 messages to avoid unbounded growth.
    const cacheMessages = useCallback(async (messagesToCache) => {
        try {
            const capped = (messagesToCache || []).slice(0, 200);
            const toStore = capped.map(m => {
                const createdAt = m?.createdAt instanceof Date ? m.createdAt.toISOString() : (m?.createdAt || new Date().toISOString());
                return { ...m, createdAt };
            });
            await AsyncStorage.setItem('chat_messages', JSON.stringify(toStore));
        } catch (error) {
            console.log('cacheMessages error:', error?.message || error);
        }
    }, []);

    // Load cached messages from AsyncStorage (restore ISO -> Date)
    const loadCachedMessages = useCallback(async () => {
        try {
            const raw = await AsyncStorage.getItem('chat_messages');
            if (!raw) return;
            const parsed = JSON.parse(raw);
            const restored = (parsed || []).map(m => {
                const createdAt = m?.createdAt ? new Date(m.createdAt) : new Date();
                return { ...m, createdAt };
            });
            setMessages(restored);
        } catch (error) {
            console.log('loadCachedMessages error:', error?.message || error);
        }
    }, []);

    // Register Firestore real-time listener only when online. When offline, restore cache.
    useEffect(() => {
        if (!db) return;

        if (isConnected === true) {
            const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
            const unsub = onSnapshot(q, (snapshot) => {
                const newMessages = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    const createdAt = data?.createdAt && typeof data.createdAt.toDate === 'function'
                        ? data.createdAt.toDate()
                        : (data?.createdAt instanceof Date ? data.createdAt : new Date());
                    newMessages.push({ _id: doc.id, ...data, createdAt });
                });
                const source = newMessages.length > 0 ? newMessages : [...INITIAL_MESSAGES, ...newMessages];
                const merged = source.sort((a, b) => {
                    const ta = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
                    const tb = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
                    return tb - ta;
                });
                cacheMessages(merged);
                setMessages(merged);
            }, (err) => { console.log('onSnapshot error:', err); });

            return () => { unsub(); };
        } else {
            loadCachedMessages();
        }
    }, [db, isConnected, cacheMessages, loadCachedMessages]);

    const insets = useSafeAreaInsets();

    // Title is handled by navigator options (see `App.js`) to reduce re-render risk.
      
    // Handle sending new messages. useCallback keeps the handler stable between renders and avoids 
    // creating a new function each render which can trigger unnecessary updates in child components.
    const onSend = useCallback(async (newMessages) => {
        // Persist message to Firestore.
        try {
            // Handle both array format (from GiftedChat) and object format (from CustomActions)
            const [message] = newMessages;
            if (!message) return;
            await addDoc(collection(db, 'messages'), { ...message, createdAt: serverTimestamp() });
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
        const dark = isVeryDarkBg(bgColor);
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
        const dark = isVeryDarkBg(bgColor);
        return (
            <SystemMessage
                {...props}
                containerStyle={{ alignItems: 'center' }}
                textStyle={{ color: dark ? '#ffffff' : '#222222', fontWeight: '600', textAlign: 'center' }}
            />
        );
    };

    // Show the input toolbar only when online to prevent composing while offline
    const renderInputToolbar = useCallback((props) => {
        if (!!isConnected) return <InputToolbar {...props} />;
        return null;
    }, [isConnected]);
   
    // Render custom actions (e.g., image or location upload) if needed
    const renderCustomActions = (props) => {
        return <CustomActions {...props} userID={userID} storage={storage} onSend={onSend}/>;
    };

    // Render a custom view for messages with location data
    const renderCustomView = (props) => {
        const { currentMessage} = props;
        if (currentMessage.location) {
            return (
                <MapView
                    style={styles.mapView}
                    region={{
                    latitude: currentMessage.location.latitude,
                    longitude: currentMessage.location.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                    }}
                />
            );
        }
        return null;
    };

    // Render chat interface
    return (
        <SafeAreaView
            style={[styles.containerOuter, { backgroundColor: bgColor }]}
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
                    renderInputToolbar={renderInputToolbar}
                    onSend={onSend}
                    renderActions={renderCustomActions}
                    renderCustomView={renderCustomView}
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
    mapView: {
        width: 150,
        height: 100,
        borderRadius: 13,
        margin: 3,
    },
});

export default Chat;