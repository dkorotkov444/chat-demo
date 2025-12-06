/*
 * components/CustomActions.js
 *
 * Custom actions component for chat-demo. Allows users to send images or their location.
 *
 * (c) 2025 Dmitri Korotkov
 */

// --- React and other Third-party libraries ---
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useActionSheet } from '@expo/react-native-action-sheet';
// Firebase storage for uploading images
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const CustomActions = ({ userID, onSend, storage, wrapperStyle, iconTextStyle }) => {
    const { showActionSheetWithOptions } = useActionSheet();    // Hook to show action sheet

    // Function to pick an image from the library and upload it
    const pickImage = async () => {
        // Request permission to access media library
        let permissions = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissions?.granted) {
            Alert.alert('Permission denied', 'Media library access is required to pick images.');
            return;
        }
        let result = await ImagePicker.launchImageLibraryAsync();    // Launch image library to pick an image
        if (!result.canceled) {
            const imageUrl = await uploadImage(result.assets[0].uri);    // Upload selected image to Firebase
            if (imageUrl) {
                const tempId = `temp-img-${Date.now()}`;
                onSend([{ 
                    _id: tempId, 
                    image: imageUrl, 
                    user: { _id: userID } 
                }]);
            }
        }
    };

    // Function to take a photo using the camera and upload it
    const takePhoto = async () => {
        // Request permission to access the camera
        let permissions = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissions?.granted) {
            Alert.alert('Permission denied', 'Camera access is required to take photos.');
            return;
        }
        let result = await ImagePicker.launchCameraAsync();    // Launch camera to take a photo
        if (!result.canceled) {
            const imageUrl = await uploadImage(result.assets[0].uri);    // Upload photo to Firebase
            if (imageUrl) {
                const tempId = `temp-photo-${Date.now()}`;
                onSend([{ 
                    _id: tempId, 
                    image: imageUrl, 
                    user: { _id: userID } 
                }]);
            }
        }
    };

    // Function to get the current location and send it
    const getLocation = async () => {
        try {
            // Request permission to access location
            let permissions = await Location.requestForegroundPermissionsAsync();
            if (!permissions?.granted) {
                Alert.alert('Permission denied', 'Location access is required to share your location.');
                return;
            }
            const location = await Location.getCurrentPositionAsync({});
            if (location) {
                onSend([{
                    _id: `temp-${Date.now()}-loc`,
                    text: 'My location',
                    location: {
                        longitude: location.coords.longitude,
                        latitude: location.coords.latitude,
                    },
                    user: { _id: userID }
                }]);
            } else {
                Alert.alert('Error', 'Failed to fetch location. Please try again.');
            }
        } catch (error) {
            Alert.alert('Location Error', 'Could not retrieve your location. Please try again.');
            console.error('Location error:', error);
        }
    };

    // Function to generate Firebase storage reference path
    const generateReference = (uri) => {
        const imageName = uri.split('/').pop();    // Extract filename from URI
        return `images/${userID}-${Date.now()}-${imageName}`;
    };

    // Function to upload an image to Firebase Storage and return its URL
    const uploadImage = async (uri) => {
        try {
            const response = await fetch(uri);      // Fetch the image from the local URI
            const blob = await response.blob();     // Convert image to blob
            const imageRef = ref(storage, generateReference(uri));  // Create storage reference
            await uploadBytes(imageRef, blob);      // Upload blob to Firebase Storage
            const downloadURL = await getDownloadURL(imageRef);     // Get downloadable URL
            return downloadURL;
        } catch (error) {
            Alert.alert('Upload Error', 'Failed to upload image. Please try again.');
            console.error('Upload error:', error);
            return null;
        }
    };

    // Function to handle action selection
    const onActionPress = () => {
        const options = ['Choose From Library', 'Take Photo', 'Send Location', 'Cancel'];
        const cancelButtonIndex = options.length - 1;   // Index of the Cancel button - last item
        showActionSheetWithOptions(
            {
                options,
                cancelButtonIndex,
            },
            async (buttonIndex) => {
                switch (buttonIndex) {
                    case 0:             // Choose From Library
                        pickImage();
                        return;
                    case 1:             // Take Photo
                        takePhoto();
                        return;
                    case 2:             // Send Location
                        getLocation();
                        return;
                    default:            // Cancel
                        return;
                }
            }
        );
    };

    return (
        <TouchableOpacity style={styles.container} 
            onPress={onActionPress} 
            accessibilityLabel='More options' 
            accessibilityHint='Choose to send an image or your location' 
            accessibilityRole='button'>
            <View style={[styles.wrapper, wrapperStyle]}>
                <Text style={[styles.iconText, iconTextStyle]}>+</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 26,
        height: 26,
        marginLeft: 10,
        marginBottom: 10,
    },
    wrapper: {
        borderRadius: 13,
        borderColor: '#b2b2b2',
        borderWidth: 2,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconText: {
        color: '#b2b2b2',
        fontWeight: 'bold',
        fontSize: 15,
        backgroundColor: 'transparent',
        textAlign: 'center',
    },
});

export default CustomActions;