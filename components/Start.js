/*
 * components/Start.js
 *
 * First screen for chat-demo. Start screen where users enter their name and select a background color.
 *
 * (c) 2025 Dmitri Korotkov
 */

// --- React and other Third-party libraries ---
import React , {useState} from 'react';
import { ImageBackground, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View, TouchableOpacity } from 'react-native';

// --- Local application imports ---
// Local assets and configuration
import backgroundImage from '../assets/background-image.png';   // Background image asset

// Color options used for the background selection. Kept as a top-level
// constant to make the choices easy to reuse or change.
const COLOR_OPTIONS = ['#090C08', '#474056', '#8A95A5', '#B9C6AE'];

// Start: basic placeholder component
const Start = ({ navigation }) => {
    const [name, setName] = useState('');   // State to hold the user's name input
    const [color, setColor] = useState('black');  // State to hold the selected color

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={'padding'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
            <ImageBackground 
                source={backgroundImage} 
                resizeMode='cover' 
                style={styles.image}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Schwoba Chat</Text>
                </View>
                
                {/*
                    Panel: positioned near the bottom of the screen. It is split into three equal `panelSection` areas: name input,
                    color selection, and start button. Keeping the layout explicit here makes the visual structure easier to maintain.
                */}
                <View style={styles.panel}>
                    <View style={styles.panelSection}>
                        <TextInput
                            style={styles.textInput}
                            placeholder='👤  Your name'
                            placeholderTextColor={'rgba(117,112,131,0.5)'}
                            value={name}
                            onChangeText={setName}
                            accessibilityLabel='Name input'
                            accessibilityHint='Enter your display name for the chat'
                            accessibilityRole='text'
                        />
                    </View>

                    <View style={styles.panelSection}>
                        <Text style={styles.label}>Choose background color</Text>
                        <View style={styles.colorRow}>
                            {COLOR_OPTIONS.map(code => (
                                <TouchableOpacity
                                    key={code}
                                    style={styles.colorItem}
                                    onPress={() => setColor(code)}
                                    accessibilityRole="radio"
                                    accessibilityState={{ selected: color === code }}
                                    accessibilityLabel={`Background color ${code}`}
                                    accessibilityHint={`Select ${code} as the chat background color`}
                                >
                                    <View style={[styles.colorCircle, { backgroundColor: code, borderColor: color === code ? '#000' : 'transparent' }]} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.panelSection}>
                        <TouchableOpacity
                            style={styles.startButton}
                            onPress={() => navigation.navigate('Chat', { name: name, color: color })}
                            accessibilityRole='button'
                            accessibilityLabel='Start chatting'
                            accessibilityHint='Open chat screen with selected name and background color'
                        >
                            <Text style={styles.startButtonText}>Start chatting</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ImageBackground>
        </KeyboardAvoidingView>
	);

};

// Styles for the Start component
const styles = StyleSheet.create({
	container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    image: {
        flex: 1,
        width: '100%',
        justifyContent: 'space-between',
    },
    header: {
        height: '20%',
        width: '100%',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 8,
    },
    text: { fontSize: 16 },
    title: {
        fontSize: 45,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 12,
    },
    textInput: {
        width: '88%',
        padding: 15,
        borderWidth: 1,
        borderColor: '#D3D3D8',
        marginTop: 15,
        marginBottom: 15,
        fontSize: 16,
        fontWeight: '300',
        color: '#000',
    },
    panel: {
        alignSelf: 'center',
        width: '88%',
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    panelSection: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: '300',
        color: '#757083',
        marginBottom: 8,
    },
    colorRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '60%',
        marginBottom: 16,
    },
    colorItem: {
        padding: 6,
    },
    colorCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    startButton: {
        marginTop: 8,
        backgroundColor: '#757083',
        paddingVertical: 12,
        width: '88%',
        alignItems: 'center',
        borderRadius: 6,
    },
    startButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default Start;