"use client"

import { useState, useEffect } from "react"
import {
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Image
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter, useLocalSearchParams, Stack } from "expo-router"
import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { Picker } from "@react-native-picker/picker"
import { StatusBar } from "expo-status-bar"
import "@/global.css"

// Type definitions
type PackageType = "basic" | "standard" | "premium";

interface PackageData {
    type: PackageType;
    title: string;
    description: string;
    price: number;
    deliveryTime: number;
    revisions: number;
    features: string[];
}

interface GigData {
    id: string;
    title: string;
    description: string;
    packages: Record<PackageType, PackageData>;
    categoryId: number;
    isActive: boolean;
    image: string;
    tags: string[];
}

// Sample categories - replace with your actual categories
const CATEGORIES = [
    { id: 1, name: "Graphic Design" },
    { id: 2, name: "Writing" },
    { id: 3, name: "Web Development" },
    { id: 4, name: "Mobile Development" },
    { id: 5, name: "Digital Marketing" },
    { id: 6, name: "Video Editing" },
];

// Mock data for a single gig - in a real app, you would fetch this from an API
const mockGigData: Record<string, GigData> = {
    "1": {
        id: "1",
        title: "Professional Mobile App Development",
        description: "I will create a professional, responsive mobile application for your business using React Native. The app will be optimized for both iOS and Android platforms and include all the features you need to engage your customers.",
        categoryId: 4,
        isActive: true,
        image: "/placeholder.svg",
        tags: ["mobile", "react native", "app development", "ios", "android"],
        packages: {
            basic: {
                type: "basic",
                title: "Basic App",
                description: "Simple app with up to 3 screens and basic functionality",
                price: 150,
                deliveryTime: 7,
                revisions: 2,
                features: ["3 screens", "Basic UI", "Simple functionality", "Source code included"]
            },
            standard: {
                type: "standard",
                title: "Standard App",
                description: "Full-featured app with up to 6 screens and advanced functionality",
                price: 300,
                deliveryTime: 14,
                revisions: 3,
                features: ["6 screens", "Custom UI/UX", "API integration", "User authentication", "Source code included"]
            },
            premium: {
                type: "premium",
                title: "Premium App",
                description: "Enterprise-level app with unlimited screens and premium features",
                price: 500,
                deliveryTime: 21,
                revisions: 5,
                features: ["Unlimited screens", "Premium UI/UX", "Complex API integration", "Push notifications", "Analytics", "6 months support", "Source code included"]
            }
        }
    },
    "2": {
        id: "2",
        title: "Modern UI/UX Design for Web & Mobile",
        description: "I will create modern, clean, and user-friendly UI/UX designs for your web or mobile application. My designs focus on usability while maintaining aesthetic appeal.",
        categoryId: 1,
        isActive: true,
        image: "/placeholder.svg",
        tags: ["ui", "ux", "design", "web", "mobile"],
        packages: {
            basic: {
                type: "basic",
                title: "Basic Design",
                description: "Design for up to 3 screens/pages",
                price: 120,
                deliveryTime: 3,
                revisions: 2,
                features: ["3 screens/pages", "Source files", "Commercial use"]
            },
            standard: {
                type: "standard",
                title: "Standard Design",
                description: "Design for up to 6 screens/pages with interactive prototypes",
                price: 240,
                deliveryTime: 5,
                revisions: 3,
                features: ["6 screens/pages", "Interactive prototype", "Source files", "Commercial use"]
            },
            premium: {
                type: "premium",
                title: "Premium Design",
                description: "Complete design system with unlimited screens",
                price: 400,
                deliveryTime: 7,
                revisions: 5,
                features: ["Unlimited screens", "Complete design system", "Interactive prototype", "Source files", "Commercial use", "Design documentation"]
            }
        }
    }
};

// Default package template
const DEFAULT_PACKAGE: PackageData = {
    type: "basic",
    title: "",
    description: "",
    price: 0,
    deliveryTime: 1,
    revisions: 1,
    features: [],
};

export default function EditGigScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const gigId = Array.isArray(id) ? id[0] : id;

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [gig, setGig] = useState<GigData | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [isActive, setIsActive] = useState(true);
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState("");
    const [activePackage, setActivePackage] = useState<PackageType>("basic");
    const [packages, setPackages] = useState<Record<PackageType, PackageData>>({
        basic: { ...DEFAULT_PACKAGE, type: "basic" },
        standard: { ...DEFAULT_PACKAGE, type: "standard" },
        premium: { ...DEFAULT_PACKAGE, type: "premium" },
    });
    const [newFeature, setNewFeature] = useState("");

    // Fetch gig data
    useEffect(() => {
        if (!gigId) return;
        //just simulation for now
        setIsLoading(true);
        setTimeout(() => {
            console.log("fetchign", gigId);
            const fetchedGig = mockGigData[gigId];
            if (fetchedGig) {
                setGig(fetchedGig);

                setTitle(fetchedGig.title);
                setDescription(fetchedGig.description);
                setCategoryId(fetchedGig.categoryId);
                setIsActive(fetchedGig.isActive);
                setTags(fetchedGig.tags);
                setPackages(fetchedGig.packages);
            } else {
                Alert.alert("Error", "Gig not found");
                router.back();
            }
            setIsLoading(false);
        }, 1000);
    }, [gigId]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!title || title.length < 10) {
            newErrors.title = "Title must be at least 10 characters";
        }

        if (!description || description.length < 50) {
            newErrors.description = "Description must be at least 50 characters";
        }

        if (!categoryId) {
            newErrors.category = "Please select a category";
        }

        // Validate at least the basic package FOR NOW
        const basicPackage = packages.basic;
        if (!basicPackage.title) {
            newErrors.packageTitle = "Basic package title is required";
        }

        if (!basicPackage.description || basicPackage.description.length < 20) {
            newErrors.packageDescription = "Basic package description must be at least 20 characters";
        }

        if (basicPackage.price <= 0) {
            newErrors.packagePrice = "Basic package price must be greater than 0";
        }

        if (basicPackage.deliveryTime <= 0) {
            newErrors.packageDeliveryTime = "Basic package delivery time must be greater than 0";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (!validateForm()) {
            Alert.alert("Validation Error", "Please fix the errors in the form");
            return;
        }

        setIsSaving(true);

        const updatedGig: GigData = {
            id: gigId || "",
            title,
            description,
            categoryId: categoryId || 0,
            isActive,
            image: gig?.image || "/placeholder.svg",
            tags,
            packages,
        };

        setTimeout(() => {
            setIsSaving(false);
            Alert.alert(
                "Success",
                "Your gig has been updated successfully!",
                [{ text: "OK", onPress: () => router.back() }]
            );
        }, 1500);
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

    if (isLoading) {
        return (
            <ThemedView className="flex-1 justify-center items-center">
                <StatusBar style="light" />
                <ActivityIndicator size="large" color="#4B7172" />
                <ThemedText className="mt-4 text-base">Loading gig details...</ThemedText>
            </ThemedView>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1"
        >
            <ThemedView className="flex-1">
                <StatusBar style="light" />

                {/* Header */}
                <View className="flex-row justify-between items-center px-5 pt-12 pb-4 bg-[#111]">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 justify-center items-center rounded-full bg-black/20"
                    >
                        <Ionicons name="arrow-back" size={24} color="#4B7172" />
                    </TouchableOpacity>
                    <ThemedText className="text-xl font-bold">Edit Gig</ThemedText>
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={isSaving}
                        className="bg-[#4B7172] py-2 px-4 rounded-lg"
                    >
                        {isSaving ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <ThemedText className="text-white font-semibold">Save</ThemedText>
                        )}
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1 bg-black">
                    {/* Basic Information Section */}
                    <View className="bg-[#111] mx-4 my-4 p-4 rounded-lg">
                        <ThemedText className="text-lg font-bold mb-4">Basic Information</ThemedText>

                        <View className="mb-4">
                            <ThemedText className="text-sm font-semibold mb-2 text-gray-300">Gig Title</ThemedText>
                            <TextInput
                                className={`bg-[#222] text-white p-3 rounded-lg ${errors.title ? 'border border-red-500' : ''}`}
                                placeholder="Enter a catchy title for your service"
                                placeholderTextColor="#777"
                                value={title}
                                onChangeText={setTitle}
                                maxLength={100}
                            />
                            {errors.title && (
                                <ThemedText className="text-red-500 text-xs mt-1">{errors.title}</ThemedText>
                            )}
                            <ThemedText className="text-xs text-gray-400 mt-1">
                                {title.length}/100 (minimum 10 characters)
                            </ThemedText>
                        </View>

                        <View className="mb-4">
                            <ThemedText className="text-sm font-semibold mb-2 text-gray-300">Description</ThemedText>
                            <TextInput
                                className={`bg-[#222] text-white p-3 rounded-lg min-h-[120px] ${errors.description ? 'border border-red-500' : ''}`}
                                placeholder="Describe your service in detail"
                                placeholderTextColor="#777"
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={6}
                                textAlignVertical="top"
                            />
                            {errors.description && (
                                <ThemedText className="text-red-500 text-xs mt-1">{errors.description}</ThemedText>
                            )}
                            <ThemedText className="text-xs text-gray-400 mt-1">
                                {description.length}/1000 (minimum 50 characters)
                            </ThemedText>
                        </View>

                        <View className="mb-4">
                            <ThemedText className="text-sm font-semibold mb-2 text-gray-300">Category</ThemedText>
                            <View className={`bg-[#222] rounded-lg overflow-hidden ${errors.category ? 'border border-red-500' : ''}`}>
                                <Picker
                                    selectedValue={categoryId}
                                    onValueChange={(itemValue) => setCategoryId(itemValue)}
                                    dropdownIconColor="#4B7172"
                                    style={{ color: '#fff', backgroundColor: '#222' }}
                                >
                                    <Picker.Item label="Select a category" value={null} color="#777" />
                                    {CATEGORIES.map((cat) => (
                                        <Picker.Item key={cat.id} label={cat.name} value={cat.id} color="#fff" />
                                    ))}
                                </Picker>
                            </View>
                            {errors.category && (
                                <ThemedText className="text-red-500 text-xs mt-1">{errors.category}</ThemedText>
                            )}
                        </View>

                        <View className="mb-4">
                            <ThemedText className="text-sm font-semibold mb-2 text-gray-300">Status</ThemedText>
                            <View className="flex-row">
                                <TouchableOpacity
                                    className={`flex-row items-center mr-6 py-2 px-3 rounded-lg ${isActive ? 'bg-green-900/30' : 'bg-[#222]'}`}
                                    onPress={() => setIsActive(true)}
                                >
                                    <View className={`w-4 h-4 rounded-full mr-2 ${isActive ? 'bg-green-500' : 'bg-[#333]'}`} />
                                    <ThemedText className={isActive ? 'text-green-500' : 'text-gray-400'}>Active</ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className={`flex-row items-center py-2 px-3 rounded-lg ${!isActive ? 'bg-red-900/30' : 'bg-[#222]'}`}
                                    onPress={() => setIsActive(false)}
                                >
                                    <View className={`w-4 h-4 rounded-full mr-2 ${!isActive ? 'bg-red-500' : 'bg-[#333]'}`} />
                                    <ThemedText className={!isActive ? 'text-red-500' : 'text-gray-400'}>Inactive</ThemedText>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View className="mb-4">
                            <ThemedText className="text-sm font-semibold mb-2 text-gray-300">Tags</ThemedText>
                            <View className="flex-row items-center mb-2">
                                <TextInput
                                    className="bg-[#222] text-white p-3 rounded-lg flex-1 mr-2"
                                    placeholder="Add a tag (e.g., logo, design)"
                                    placeholderTextColor="#777"
                                    value={newTag}
                                    onChangeText={setNewTag}
                                />
                                <TouchableOpacity
                                    className="bg-[#4B7172] p-3 rounded-lg"
                                    onPress={addTag}
                                >
                                    <ThemedText className="text-white font-semibold">Add</ThemedText>
                                </TouchableOpacity>
                            </View>
                            <View className="flex-row flex-wrap">
                                {tags.map((tag, index) => (
                                    <View key={index} className="bg-[#333] flex-row items-center rounded-full px-3 py-1 mr-2 mb-2">
                                        <ThemedText className="text-white mr-2">{tag}</ThemedText>
                                        <TouchableOpacity onPress={() => removeTag(index)}>
                                            <Ionicons name="close-circle" size={16} color="#FF3B30" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* Packages Section */}
                    <View className="bg-[#111] mx-4 mb-4 p-4 rounded-lg">
                        <ThemedText className="text-lg font-bold mb-4">Packages</ThemedText>

                        {/* Package Tabs */}
                        <View className="flex-row bg-[#222] rounded-lg overflow-hidden mb-4">
                            {(['basic', 'standard', 'premium'] as PackageType[]).map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    className={`flex-1 py-3 items-center ${activePackage === type ? 'bg-[#4B7172]' : ''}`}
                                    onPress={() => setActivePackage(type)}
                                >
                                    <ThemedText className={`font-semibold ${activePackage === type ? 'text-white' : 'text-gray-400'}`}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </ThemedText>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Package Form */}
                        <View className="bg-[#222] p-4 rounded-lg">
                            <View className="mb-4">
                                <ThemedText className="text-sm font-semibold mb-2 text-gray-300">Package Title</ThemedText>
                                <TextInput
                                    className={`bg-[#333] text-white p-3 rounded-lg ${activePackage === 'basic' && errors.packageTitle ? 'border border-red-500' : ''}`}
                                    placeholder="e.g., Basic Logo Design"
                                    placeholderTextColor="#777"
                                    value={packages[activePackage].title}
                                    onChangeText={(text) => updatePackageField('title', text)}
                                />
                                {activePackage === 'basic' && errors.packageTitle && (
                                    <ThemedText className="text-red-500 text-xs mt-1">{errors.packageTitle}</ThemedText>
                                )}
                            </View>

                            <View className="mb-4">
                                <ThemedText className="text-sm font-semibold mb-2 text-gray-300">Package Description</ThemedText>
                                <TextInput
                                    className={`bg-[#333] text-white p-3 rounded-lg min-h-[80px] ${activePackage === 'basic' && errors.packageDescription ? 'border border-red-500' : ''}`}
                                    placeholder="Describe what's included in this package"
                                    placeholderTextColor="#777"
                                    value={packages[activePackage].description}
                                    onChangeText={(text) => updatePackageField('description', text)}
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                />
                                {activePackage === 'basic' && errors.packageDescription && (
                                    <ThemedText className="text-red-500 text-xs mt-1">{errors.packageDescription}</ThemedText>
                                )}
                            </View>

                            <View className="mb-4">
                                <ThemedText className="text-sm font-semibold mb-2 text-gray-300">Price ($)</ThemedText>
                                <TextInput
                                    className={`bg-[#333] text-white p-3 rounded-lg ${activePackage === 'basic' && errors.packagePrice ? 'border border-red-500' : ''}`}
                                    placeholder="Enter price for this package"
                                    placeholderTextColor="#777"
                                    value={packages[activePackage].price > 0 ? packages[activePackage].price.toString() : ""}
                                    onChangeText={(text) => updatePackageField('price', parseFloat(text) || 0)}
                                    keyboardType="numeric"
                                />
                                {activePackage === 'basic' && errors.packagePrice && (
                                    <ThemedText className="text-red-500 text-xs mt-1">{errors.packagePrice}</ThemedText>
                                )}
                            </View>

                            <View className="mb-4">
                                <ThemedText className="text-sm font-semibold mb-2 text-gray-300">Delivery Time (days)</ThemedText>
                                <TextInput
                                    className={`bg-[#333] text-white p-3 rounded-lg ${activePackage === 'basic' && errors.packageDeliveryTime ? 'border border-red-500' : ''}`}
                                    placeholder="How many days to deliver?"
                                    placeholderTextColor="#777"
                                    value={packages[activePackage].deliveryTime > 0 ? packages[activePackage].deliveryTime.toString() : ""}
                                    onChangeText={(text) => updatePackageField('deliveryTime', parseInt(text) || 0)}
                                    keyboardType="numeric"
                                />
                                {activePackage === 'basic' && errors.packageDeliveryTime && (
                                    <ThemedText className="text-red-500 text-xs mt-1">{errors.packageDeliveryTime}</ThemedText>
                                )}
                            </View>

                            <View className="mb-4">
                                <ThemedText className="text-sm font-semibold mb-2 text-gray-300">Number of Revisions</ThemedText>
                                <TextInput
                                    className="bg-[#333] text-white p-3 rounded-lg"
                                    placeholder="How many revisions?"
                                    placeholderTextColor="#777"
                                    value={packages[activePackage].revisions > 0 ? packages[activePackage].revisions.toString() : ""}
                                    onChangeText={(text) => updatePackageField('revisions', parseInt(text) || 0)}
                                    keyboardType="numeric"
                                />
                            </View>

                            <View>
                                <ThemedText className="text-sm font-semibold mb-2 text-gray-300">Features Included</ThemedText>
                                <View className="flex-row mb-2">
                                    <TextInput
                                        className="bg-[#333] text-white p-3 rounded-lg flex-1 mr-2"
                                        placeholder="Add a feature"
                                        placeholderTextColor="#777"
                                        value={newFeature}
                                        onChangeText={setNewFeature}
                                    />
                                    <TouchableOpacity
                                        className="bg-[#4B7172] p-3 rounded-lg"
                                        onPress={addFeature}
                                    >
                                        <ThemedText className="text-white font-semibold">Add</ThemedText>
                                    </TouchableOpacity>
                                </View>
                                <View>
                                    {packages[activePackage].features.map((feature, index) => (
                                        <View key={index} className="flex-row justify-between items-center py-2 border-b border-[#444]">
                                            <View className="flex-row items-center flex-1">
                                                <Ionicons name="checkmark-circle" size={18} color="#4B7172" />
                                                <ThemedText className="text-white ml-2 flex-1">{feature}</ThemedText>
                                            </View>
                                            <TouchableOpacity onPress={() => removeFeature(index)}>
                                                <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Preview Section */}
                    <View className="bg-[#111] mx-4 mb-8 p-4 rounded-lg">
                        <ThemedText className="text-lg font-bold mb-4">Preview</ThemedText>

                        <View className="bg-[#222] p-4 rounded-lg mb-4">
                            <ThemedText className="text-base font-bold mb-2">{title || "Your Gig Title"}</ThemedText>
                            <View className="flex-row mb-2">
                                <View className="bg-[#4B7172] px-2 py-1 rounded mr-2">
                                    <ThemedText className="text-white text-xs">
                                        {CATEGORIES.find(c => c.id === categoryId)?.name || "Category"}
                                    </ThemedText>
                                </View>
                                <View className={`px-2 py-1 rounded ${isActive ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
                                    <ThemedText className={`text-xs ${isActive ? 'text-green-500' : 'text-red-500'}`}>
                                        {isActive ? "Active" : "Inactive"}
                                    </ThemedText>
                                </View>
                            </View>
                            <ThemedText className="text-sm text-gray-400 mb-4" numberOfLines={3}>
                                {description || "Your gig description will appear here..."}
                            </ThemedText>

                            <View className="flex-row justify-between items-center">
                                <ThemedText className="text-[#4B7172] font-bold">
                                    From ${packages.basic.price || 0}
                                </ThemedText>
                                <View className="flex-row items-center">
                                    <Ionicons name="time-outline" size={16} color="#777" />
                                    <ThemedText className="text-gray-400 text-xs ml-1">
                                        {packages.basic.deliveryTime || 0} day{packages.basic.deliveryTime !== 1 ? 's' : ''}
                                    </ThemedText>
                                </View>
                            </View>
                        </View>

                        <TouchableOpacity
                            className="bg-[#4B7172] py-3 rounded-lg items-center"
                            onPress={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <ThemedText className="text-white font-bold">Save Changes</ThemedText>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </ThemedView>
        </KeyboardAvoidingView>
    );
}