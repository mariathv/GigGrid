"use client";

import { useState } from "react";
import { useColorScheme } from '@/hooks/useColorScheme';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Colors } from "@/constants/Colors";

type Category = {
    id: number;
    name: string;
};

type GigData = {
    title: string;
    description: string;
    price: number;
    categoryId: number;
    deliveryTime: number;
    createdAt: Date;
};

type AddGigProps = {
    onClose: () => void;
    onSubmit: (gig: GigData) => void;
};

// Sample categories - replace with your actual categories
const CATEGORIES: Category[] = [
    { id: 1, name: "Graphic Design" },
    { id: 2, name: "Writing" },
    { id: 3, name: "Web Development" },
    { id: 4, name: "Mobile Development" },
    { id: 5, name: "Digital Marketing" },
    { id: 6, name: "Video Editing" },
];

const AddGig: React.FC<AddGigProps> = ({ onClose, onSubmit }) => {
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [price, setPrice] = useState<string>("");
    const [category, setCategory] = useState<number | null>(null);
    const [deliveryTime, setDeliveryTime] = useState<string>("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!title || title.length < 10) {
            newErrors.title = "Title must be at least 10 characters";
        }

        if (!description || description.length < 50) {
            newErrors.description = "Description must be at least 50 characters";
        }

        if (!price || isNaN(Number(price)) || Number(price) <= 0) {
            newErrors.price = "Price must be a positive number";
        }

        if (!category) {
            newErrors.category = "Please select a category";
        }

        if (!deliveryTime || isNaN(Number(deliveryTime)) || Number(deliveryTime) <= 0) {
            newErrors.deliveryTime = "Delivery time must be a positive number of days";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            const gigData: GigData = {
                title,
                description,
                price: parseFloat(price),
                categoryId: category!,
                deliveryTime: parseInt(deliveryTime, 10),
                createdAt: new Date(),
            };

            onSubmit(gigData);
            Alert.alert("Success", "Your gig has been posted successfully!");
            resetForm();
        } else {
        }
    };

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setPrice("");
        setCategory(null);
        setDeliveryTime("");
        setErrors({});
    };

    // Define dynamic styles based on the theme colors
    const styles = createStyles(theme.colors.text, theme.colors.background);
    console.log(Colors);


    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
            <View style={{ flex: 1, backgroundColor: Colors.dark.background }}>
                <ThemeProvider value={theme}>
                    <ScrollView style={styles.formContainer}>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Title</Text>
                            <TextInput
                                style={[styles.input, errors.title && styles.inputError]}
                                placeholder="Enter a catchy title for your service"
                                placeholderTextColor="#666"
                                value={title}
                                onChangeText={setTitle}
                                maxLength={100}
                            />
                            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
                            <Text style={styles.helperText}>{title.length}/100 (minimum 10 characters)</Text>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={[styles.textArea, errors.description && styles.inputError]}
                                placeholder="Describe your service in detail"
                                placeholderTextColor="#666"
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={6}
                                maxLength={1000}
                            />
                            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
                            <Text style={styles.helperText}>{description.length}/1000 (minimum 50 characters)</Text>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Price ($)</Text>
                            <TextInput
                                style={[styles.input, errors.price && styles.inputError]}
                                placeholder="Enter your price"
                                placeholderTextColor="#666"
                                value={price}
                                onChangeText={setPrice}
                                keyboardType="numeric"
                            />
                            {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Category</Text>
                            <View style={[styles.pickerContainer, errors.category && styles.inputError]}>
                                <Picker
                                    selectedValue={category}
                                    onValueChange={(itemValue) => setCategory(itemValue)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Select a category" value={null} color="#999" />

                                    {CATEGORIES.map((cat) => (
                                        <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
                                    ))}
                                </Picker>
                            </View>
                            {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Delivery Time (days)</Text>
                            <TextInput
                                style={[styles.input, errors.deliveryTime && styles.inputError]}
                                placeholder="How many days to deliver?"
                                placeholderTextColor="#666"
                                value={deliveryTime}
                                onChangeText={setDeliveryTime}
                                keyboardType="numeric"
                            />
                            {errors.deliveryTime && <Text style={styles.errorText}>{errors.deliveryTime}</Text>}
                        </View>

                        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                            <Text style={styles.submitButtonText}>Post Gig</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </ThemeProvider>
            </View>
        </KeyboardAvoidingView>
    );
};

const createStyles = (textColor: string, backgroundColor: string) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: backgroundColor,
        },
        header: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: textColor,
        },
        headerTitle: {
            fontSize: 20,
            fontWeight: "bold",
            color: textColor,
        },
        closeButton: {
            padding: 5,
        },
        formContainer: {
            padding: 16,
        },
        formGroup: {
            marginBottom: 20,
        },
        label: {
            fontSize: 16,
            fontWeight: "600",
            marginBottom: 8,
            color: "#ccc",
        },
        input: {

            backgroundColor: "#111",
            borderRadius: 8,
            padding: 16,
            fontSize: 16,
            color: "#fff",
            borderWidth: 1,
            borderColor: "#333",
        },
        textArea: {
            borderWidth: 1,
            borderColor: "#333",
            borderRadius: 8,
            padding: 12,
            fontSize: 16,
            backgroundColor: "#111",
            textAlignVertical: "top",
            minHeight: 120,
        },
        pickerContainer: {
            borderWidth: 1,
            borderColor: "#333",
            borderRadius: 8,
            backgroundColor: "#111",
            paddingHorizontal: 12, // Add padding for spacing
        },
        picker: {
            height: 50,
            width: "100%", // Ensures it fills the container
        },
        inputError: {
            borderColor: "#ff3b30",
        },
        errorText: {
            color: "#ff3b30",
            fontSize: 14,
            marginTop: 5,
        },
        helperText: {
            color: "#CFD5D5",
            fontSize: 12,
            marginTop: 5,
        },
        submitButton: {
            backgroundColor: "#4B7172",
            borderRadius: 8,
            padding: 16,
            alignItems: "center",
            marginTop: 10,
            marginBottom: 30,
        },
        submitButtonText: {
            color: "#CFD5D5",
            fontSize: 16,
            fontWeight: "600",
        },
    });


export default AddGig



/*

add dynamic theme switching
USE HOOK
*/