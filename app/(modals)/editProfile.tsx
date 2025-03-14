"use client"

import { useState } from "react"
import { View, TouchableOpacity, TextInput, Image, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { useAuth } from "@/components/AuthContext"

import * as ImagePicker from "expo-image-picker"
import * as FileSystem from "expo-file-system"
import mime from "mime"
import { axiosRequest } from "@/hooks/api/api-axiosreq"
import { getUserPFP } from "@/hooks/getUserPfp"
import { apiRequest } from "@/hooks/api/api-gg"

export default function EditProfileScreen() {
    const { user } = useAuth()
    const [name, setName] = useState(user?.name)
    const [image, setImage] = useState<string | null>(getUserPFP(user?.id, true))
    //const [image, setImage] = useState<string | null>(getUserPFP(user?.id))
    const [isLoading, setIsLoading] = useState(false)
    const [isImageChanged, setimgChanged] = useState(false);




    const handleGoBack = () => {
        router.back()
    }

    const handleSave = async () => {
        try {
            setIsLoading(true)

            if (isImageChanged && image) {
                const userId = user?.id
                const uri = image
                const fileInfo = await FileSystem.getInfoAsync(uri)

                if (!fileInfo.exists) {
                    console.log("File does not exist")
                    setIsLoading(false)
                    return
                }

                const newImageName = uri.split("/").pop()
                const mimeType = mime.getType(uri)

                const formData = new FormData()
                formData.append("file", {
                    uri,
                    name: newImageName,
                    type: mimeType,
                } as any)

                const response = await axiosRequest(`user/${userId}/pfp-upload`, formData, "POST")

                console.log("Upload success", response)


                setImage(getUserPFP(user?.id, true))
            }

            // if (name && name !== user?.name) {
            //     const success = await updateUser({ name })
            //     if (success) {
            //         console.log("Name updated successfully")
            //     } else {
            //         console.warn("Failed to update name")
            //     }
            // }

            setTimeout(() => {
                setIsLoading(false)
                router.back()
            }, 800)
        } catch (err) {
            console.error("Upload failed", err)
            setIsLoading(false)
        }
    }

    const handleImagePick = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()

        if (!permissionResult.granted) {
            alert("Permission is required to access media.")
            return
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        })

        if (!result.canceled) {
            const selected = result.assets[0]
            setImage(selected?.uri)
            setimgChanged(true)
        }
    }

    return (
        <ThemedView className="flex-1 p-5 mt-10">
            <View className="flex-row items-center justify-between mb-6">
                <TouchableOpacity onPress={handleGoBack} className="p-2" disabled={isLoading}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <ThemedText className="text-xl font-bold">Edit Profile</ThemedText>
                <TouchableOpacity onPress={handleSave} className="p-2" disabled={isLoading}>
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#4B7172" />
                    ) : (
                        <ThemedText className="text-[#4B7172] font-bold">Save</ThemedText>
                    )}
                </TouchableOpacity>
            </View>

            <View className="items-center mb-8">
                <TouchableOpacity onPress={handleImagePick} className="relative" disabled={isLoading}>
                    {image ? (
                        <Image source={{ uri: image }} className="w-32 h-32 rounded-full" />
                    ) : (
                        <View className="w-32 h-32 rounded-full bg-gray-700 items-center justify-center">
                            <Ionicons name="person" size={64} color="#4B7172" />
                        </View>
                    )}
                    <View className="absolute bottom-0 right-0 bg-[#4B7172] p-2 rounded-full">
                        <Ionicons name="camera" size={20} color="#fff" />
                    </View>
                </TouchableOpacity>
                <ThemedText className="mt-4 text-sm text-gray-400">Tap to change profile picture</ThemedText>
            </View>

            <View className="bg-gray-800 rounded-lg p-4 mb-4">
                <ThemedText className="text-sm text-gray-400 mb-2 font-bold">Name</ThemedText>
                <TextInput
                    value={name}
                    onChangeText={setName}
                    className="text-white text-lg px-3 py-2 mt-1 border border-gray-600 rounded-md focus:border-[#4B7172] bg-gray-700/30"
                    placeholderTextColor="#666"
                    editable={!isLoading}
                />
            </View>

            <View className="bg-gray-800 rounded-lg p-4">
                <ThemedText className="text-sm text-gray-400 mb-2 font-bold">Email</ThemedText>
                <View className="flex-row items-center justify-between">
                    <ThemedText className="text-lg text-gray-300">{user?.email}</ThemedText>
                    <View className="bg-gray-700/50 rounded-full px-2 py-1 flex-row items-center">
                        <Ionicons name="lock-closed" size={12} color="#999" />
                        <ThemedText className="text-xs text-gray-400 ml-1">Locked</ThemedText>
                    </View>
                </View>
                <View className="mt-3 flex-row items-center border-l-2 border-[#4B7172] pl-2">
                    <Ionicons name="information-circle-outline" size={14} color="#999" />
                    <ThemedText className="text-xs text-gray-400 ml-1">
                        Email address cannot be modified for security reasons
                    </ThemedText>
                </View>
            </View>

            {isLoading && (
                <View className="absolute inset-0 bg-black/30 items-center justify-center">
                    <View className="bg-gray-800 p-4 rounded-lg items-center">
                        <ActivityIndicator size="large" color="#4B7172" />
                        <ThemedText className="mt-2 text-white">Saving changes...</ThemedText>
                    </View>
                </View>
            )}
        </ThemedView>
    )
}

