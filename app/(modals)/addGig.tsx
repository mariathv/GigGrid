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
    Pressable,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Colors } from "@/constants/Colors";
import { ThemedText } from "@/components/ThemedText";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { addGig } from "@/api/gigs";
import { GigData } from "@/types/gigs";



type Category = {
    id: number;
    name: string;
};

type PackageType = "basic" | "standard" | "premium";

type PackageData = {
    type: PackageType;
    title: string;
    description: string;
    price: number;
    deliveryTime: number;
    revisions: number;
    features: string[];
};




type AddGigProps = {
    onClose: () => void;
    onSubmit: (gig: GigData) => void;
};

const CATEGORIES: Category[] = [
    { id: 1, name: "Graphic Design" },
    { id: 2, name: "Writing" },
    { id: 3, name: "Web Development" },
    { id: 4, name: "Mobile Development" },
    { id: 5, name: "Digital Marketing" },
    { id: 6, name: "Video Editing" },
];

const DEFAULT_PACKAGE: PackageData = {
    type: "basic",
    title: "",
    description: "",
    price: 0,
    deliveryTime: 1,
    revisions: 1,
    features: [],
};

const AddGig: React.FC<AddGigProps> = ({ onClose, onSubmit }) => {
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [category, setCategory] = useState<number | null>(null);
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState<string>("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [activePackage, setActivePackage] = useState<PackageType>("basic");


    // Initialize all three package types
    const [packages, setPackages] = useState<Record<PackageType, PackageData>>({
        basic: { ...DEFAULT_PACKAGE, type: "basic", title: "Basic Package" },
        standard: { ...DEFAULT_PACKAGE, type: "standard", title: "Standard Package" },
        premium: { ...DEFAULT_PACKAGE, type: "premium", title: "Premium Package" },
    });

    // New feature input state
    const [newFeature, setNewFeature] = useState<string>("");

    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Title validation (5-70 characters)
        if (!title) {
            newErrors.title = "Title is required";
        } else if (title.length < 5) {
            newErrors.title = "Title too short - minimum 5 characters required";
        } else if (title.length > 70) {
            newErrors.title = "Title too long - maximum 70 characters allowed";
        }

        if (!description || description.length < 50) {
            newErrors.description = "Description must be at least 50 characters";
        }

        if (!category) {
            newErrors.category = "Please select a category";
        }

        // Validate at least the basic package
        const basicPackage = packages.basic;
        if (!basicPackage.title) {
            newErrors.packageTitle = "Basic package title is required";
        }

        if (!basicPackage.description || basicPackage.description.length < 20) {
            newErrors.packageDescription = "Basic package description must be at least 20 characters";
        }

        // Price validation
        if (isNaN(basicPackage.price) || typeof basicPackage.price !== 'number') {
            newErrors.packagePrice = "Price must be numeric";
        } else if (basicPackage.price < 5) {
            newErrors.packagePrice = "Price must be at least $5";
        } else if (basicPackage.price > 10000) {
            newErrors.packagePrice = "Price cannot exceed $10,000";
        }

        // Delivery time validation (1-90 days)
        if (!Number.isInteger(basicPackage.deliveryTime)) {
            newErrors.packageDeliveryTime = "Delivery time must be a whole number";
        } else if (basicPackage.deliveryTime < 1) {
            newErrors.packageDeliveryTime = "Delivery time must be at least 1 day";
        } else if (basicPackage.deliveryTime > 90) {
            newErrors.packageDeliveryTime = "Delivery time cannot exceed 90 days";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (validateForm()) {
            const packagesArray = {
                basic: packages.basic,
                standard: packages.standard,
                premium: packages.premium
            };


            const mapPackage = (pkg: any) => ({
                ...pkg,
                numberOfRevisions: pkg.revisions
            });

            const categoryMap: Record<number, string> = {
                1: "Graphic Design",
                2: "Writing",
                3: "Web Development",
                4: "Mobile Development",
                5: "Digital Marketing",
                6: "Video Editing"
            };

            const categoryName = category ? categoryMap[category] : "None";




            const gigData = {
                title,
                description,
                category: categoryName,
                tags,
                basic: mapPackage(packages.basic),
                standard: mapPackage(packages.standard),
                premium: mapPackage(packages.premium)
            } as GigData;


            try {
                const response = await addGig(gigData);
                console.log("Gig added successfully:", response.data);
                Alert.alert("Success", "Your gig has been posted successfully!");
                resetForm();

                router.push("/myGigs")

            } catch (error: any) {
                console.error("Error adding gig:", error);
                Alert.alert("Error", error?.response?.data?.message || "Something went wrong!");
            }
        }
    };

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setCategory(null);
        setTags([]);
        setNewTag("");
        setPackages({
            basic: { ...DEFAULT_PACKAGE, type: "basic", title: "Basic Package" },
            standard: { ...DEFAULT_PACKAGE, type: "standard", title: "Standard Package" },
            premium: { ...DEFAULT_PACKAGE, type: "premium", title: "Premium Package" },
        });
        setErrors({});
    };

    const updatePackageField = (field: keyof PackageData, value: any) => {
        setPackages(prev => ({
            ...prev,
            [activePackage]: {
                ...prev[activePackage],
                [field]: value
            }
        }));
    };

    const addFeature = () => {
        if (newFeature.trim()) {
            setPackages(prev => ({
                ...prev,
                [activePackage]: {
                    ...prev[activePackage],
                    features: [...prev[activePackage].features, newFeature.trim()]
                }
            }));
            setNewFeature("");
        }
    };

    const removeFeature = (index: number) => {
        setPackages(prev => ({
            ...prev,
            [activePackage]: {
                ...prev[activePackage],
                features: prev[activePackage].features.filter((_, i) => i !== index)
            }
        }));
    };

    const addTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag("");
        }
    };

    const removeTag = (index: number) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    const handlePriceChange = (text: string, packageType: PackageType) => {
        const numericValue = text.replace(/[^0-9.]/g, '');
        const price = parseFloat(numericValue) || 0;
        
        // Update the package with the new price
        updatePackageField('price', price);
    };

    const handleDeliveryTimeChange = (text: string, packageType: PackageType) => {
        // Remove any non-numeric characters
        const numericValue = text.replace(/[^0-9]/g, '');
        // Convert to integer
        const days = parseInt(numericValue) || 0;
        
        // Update the package with the new delivery time
        updatePackageField('deliveryTime', days);
    };

    const styles = createStyles(theme.colors.text, theme.colors.background);

    const renderPackageTabs = () => (
        <View style={styles.packageTabs}>
            {(['basic', 'standard', 'premium'] as PackageType[]).map((type) => (
                <TouchableOpacity
                    key={type}
                    style={[
                        styles.packageTab,
                        activePackage === type && styles.activePackageTab
                    ]}
                    onPress={() => setActivePackage(type)}
                >
                    <Text
                        style={[
                            styles.packageTabText,
                            activePackage === type && styles.activePackageTabText
                        ]}
                    >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderPackageForm = () => {
        const currentPackage = packages[activePackage];

        return (

            <View style={styles.packageForm}>
                <View style={styles.formGroup}>
                    <Text style={styles.packageLabel}>Package Title</Text>
                    <TextInput
                        style={[styles.input, errors.packageTitle && styles.inputError]}
                        placeholder="e.g., Basic Logo Design"
                        placeholderTextColor="#666"
                        value={currentPackage.title}
                        onChangeText={(text) => updatePackageField('title', text)}
                    />
                    {activePackage === 'basic' && errors.packageTitle &&
                        <Text style={styles.errorText}>{errors.packageTitle}</Text>
                    }
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.packageLabel}>Package Description</Text>
                    <TextInput
                        style={[styles.textArea, errors.packageDescription && styles.inputError]}
                        placeholder="Describe what's included in this package"
                        placeholderTextColor="#666"
                        value={currentPackage.description}
                        onChangeText={(text) => updatePackageField('description', text)}
                        multiline
                        numberOfLines={4}
                    />
                    {activePackage === 'basic' && errors.packageDescription &&
                        <Text style={styles.errorText}>{errors.packageDescription}</Text>
                    }
                    <Text style={styles.helperText}>
                        {currentPackage.description.length}/500 (minimum 20 characters)
                    </Text>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.packageLabel}>Price ($)</Text>
                    <TextInput
                        style={[styles.input, errors.packagePrice && styles.inputError]}
                        placeholder="Enter price for this package"
                        placeholderTextColor="#666"
                        value={currentPackage.price > 0 ? currentPackage.price.toString() : ""}
                        onChangeText={(text) => handlePriceChange(text, activePackage)}
                        keyboardType="numeric"
                    />
                    {activePackage === 'basic' && errors.packagePrice &&
                        <Text style={styles.errorText}>{errors.packagePrice}</Text>
                    }
                    <Text style={styles.helperText}>Price must be between $5 and $10,000</Text>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.packageLabel}>Delivery Time (days)</Text>
                    <TextInput
                        style={[styles.input, errors.packageDeliveryTime && styles.inputError]}
                        placeholder="How many days to deliver?"
                        placeholderTextColor="#666"
                        value={currentPackage.deliveryTime > 0 ? currentPackage.deliveryTime.toString() : ""}
                        onChangeText={(text) => handleDeliveryTimeChange(text, activePackage)}
                        keyboardType="numeric"
                    />
                    {activePackage === 'basic' && errors.packageDeliveryTime &&
                        <Text style={styles.errorText}>{errors.packageDeliveryTime}</Text>
                    }
                    <Text style={styles.helperText}>Delivery time must be between 1-90 days</Text>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.packageLabel}>Number of Revisions</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="How many revisions?"
                        placeholderTextColor="#666"
                        value={currentPackage.revisions > 0 ? currentPackage.revisions.toString() : ""}
                        onChangeText={(text) => updatePackageField('revisions', parseInt(text) || 0)}
                        keyboardType="numeric"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.packageLabel}>Features Included</Text>
                    <View style={styles.featureInputContainer}>
                        <TextInput
                            style={styles.featureInput}
                            placeholder="Add a feature"
                            placeholderTextColor="#666"
                            value={newFeature}
                            onChangeText={setNewFeature}
                        />
                        <TouchableOpacity style={styles.addFeatureButton} onPress={addFeature}>
                            <Text style={styles.addFeatureButtonText}>Add</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.featuresList}>
                        {currentPackage.features.map((feature, index) => (
                            <View key={index} style={styles.featureItem}>
                                <Text style={styles.featureText}>• {feature}</Text>
                                <TouchableOpacity onPress={() => removeFeature(index)}>
                                    <Ionicons name="close-circle" size={20} color="#ff3b30" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
            <View style={{ flex: 1, backgroundColor: Colors.dark.background }}>
                <StatusBar style="light" />

                {/* Header */}
                <View className="flex-row justify-between items-center px-5 pt-12 pb-4" style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.headerButton}
                    >
                        <Ionicons name="arrow-back" size={24} color="#4B7172" />
                    </TouchableOpacity>
                    <ThemedText style={styles.headerTitle}>Add New Gig</ThemedText>
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={handleSubmit}
                    >
                        <Ionicons name="checkmark" size={24} color="#4B7172" />
                    </TouchableOpacity>
                </View>

                <ThemeProvider value={theme}>
                    <ScrollView style={styles.formContainer}>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Basic Information</Text>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Gig Title</Text>
                                <TextInput
                                    style={[styles.input, errors.title && styles.inputError]}
                                    placeholder="Enter a catchy title for your service"
                                    placeholderTextColor="#666"
                                    value={title}
                                    onChangeText={setTitle}
                                    maxLength={70}
                                />
                                {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
                                <Text style={styles.helperText}>{title.length}/70 (minimum 5 characters)</Text>
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
                                <Text style={styles.label}>Tags</Text>
                                <View style={styles.featureInputContainer}>
                                    <TextInput
                                        style={styles.featureInput}
                                        placeholder="Add a tag (e.g., logo, design)"
                                        placeholderTextColor="#666"
                                        value={newTag}
                                        onChangeText={setNewTag}
                                    />
                                    <TouchableOpacity style={styles.addFeatureButton} onPress={addTag}>
                                        <Text style={styles.addFeatureButtonText}>Add</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.tagsList}>
                                    {tags.map((tag, index) => (
                                        <View key={index} style={styles.tagItem}>
                                            <Text style={styles.tagText}>{tag}</Text>
                                            <TouchableOpacity onPress={() => removeTag(index)}>
                                                <Ionicons name="close-circle" size={16} color="#ff3b30" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Packages</Text>
                            <Text style={styles.sectionDescription}>
                                Create up to 3 packages with different prices and features
                            </Text>

                            {renderPackageTabs()}
                            {renderPackageForm()}
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
            marginTop: 15,
        },
        formContainer: {
            padding: 16,
            paddingTop: 8, // Reduced top padding since we have a header now
        },
        section: {
            marginBottom: 24,
            backgroundColor: "#111",
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: "#333",
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: "700",
            color: "#fff",
            marginBottom: 8,
        },
        sectionDescription: {
            fontSize: 14,
            color: "#999",
            marginBottom: 16,
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
        packageLabel: {
            fontSize: 15,
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
            color: "#fff",
        },
        pickerContainer: {
            borderWidth: 1,
            borderColor: "#333",
            borderRadius: 8,
            backgroundColor: "#111",
            paddingHorizontal: 12,
        },
        picker: {
            width: "100%",
            color: "#fff",
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
        header: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 15,
            backgroundColor: "#111",
        },
        headerTitle: {
            fontSize: 20,
            fontWeight: "bold",
            color: "#fff",
        },
        headerButton: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "rgba(75, 113, 114, 0.1)",
            justifyContent: "center",
            alignItems: "center",
        },
        packageTabs: {
            flexDirection: "row",
            marginBottom: 16,
            borderRadius: 8,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: "#333",
        },
        packageTab: {
            flex: 1,
            padding: 12,
            alignItems: "center",
            backgroundColor: "#222",
        },
        activePackageTab: {
            backgroundColor: "#4B7172",
        },
        packageTabText: {
            color: "#ccc",
            fontWeight: "600",
        },
        activePackageTabText: {
            color: "#fff",
        },
        packageForm: {
            padding: 16,
            backgroundColor: "#1a1a1a",
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#333",
        },
        featureInputContainer: {
            flexDirection: "row",
            marginBottom: 8,
        },
        featureInput: {
            flex: 1,
            backgroundColor: "#111",
            borderRadius: 8,
            padding: 12,
            fontSize: 16,
            color: "#fff",
            borderWidth: 1,
            borderColor: "#333",
            marginRight: 8,
        },
        addFeatureButton: {
            backgroundColor: "#4B7172",
            borderRadius: 8,
            padding: 12,
            justifyContent: "center",
            alignItems: "center",
            width: 70,
        },
        addFeatureButtonText: {
            color: "#fff",
            fontWeight: "600",
        },
        featuresList: {
            marginTop: 8,
        },
        featureItem: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: 8,
            borderBottomWidth: 1,
            borderBottomColor: "#333",
        },
        featureText: {
            color: "#ccc",
            flex: 1,
        },
        tagsList: {
            flexDirection: "row",
            flexWrap: "wrap",
            marginTop: 8,
        },
        tagItem: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#333",
            borderRadius: 16,
            paddingHorizontal: 12,
            paddingVertical: 6,
            marginRight: 8,
            marginBottom: 8,
        },
        tagText: {
            color: "#fff",
            marginRight: 4,
        },
    });

export default AddGig;