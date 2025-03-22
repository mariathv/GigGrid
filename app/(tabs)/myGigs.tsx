"use client"

import { useState, useEffect, useCallback } from "react"
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useFocusEffect, useRouter } from "expo-router"
import { ThemedView } from "@/components/ThemedView"
import { ThemedText } from "@/components/ThemedText"
import { StatusBar } from "expo-status-bar"
import "@/global.css"
import { deleteGig, getMyGigs, updateGig } from "@/api/gigs"
import type { GigData, PackageType, PackageData } from "@/types/gigs"

type FilterOption = "all" | "active" | "inactive"
type SortOption = "newest" | "oldest" | "highest_rated" | "most_orders"



export default function MyGigsScreen() {
    const [searchQuery, setSearchQuery] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [filter, setFilter] = useState<FilterOption>("all")
    const [sortBy, setSortBy] = useState<SortOption>("newest")
    const [showFilterModal, setShowFilterModal] = useState(false)
    const [filteredGigs, setFilteredGigs] = useState<GigData[]>([])
    const [Gigs, setGigs] = useState<GigData[]>([])
    const router = useRouter()

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [gigToDelete, setGigToDelete] = useState(null);

    const promptDeleteGig = (id: any) => {
        setGigToDelete(id);
        setShowDeleteModal(true);
    }

    const confirmDelete = async () => {
        if (gigToDelete) {
            await deleteGig(gigToDelete);
            setFilteredGigs(filteredGigs.filter((gig) => gig._id !== gigToDelete));
            setShowDeleteModal(false);
            setGigToDelete(null);
        }
    }

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setGigToDelete(null);
    }



    const [initialLoading, setInitialLoading] = useState(true)

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const fetchGigs = async () => {
                try {
                    console.log("fetch init gigs");
                    const response = await getMyGigs();

                    if (!response || !response.data) {
                        console.error("Invalid response structure:", response);
                        if (isActive) {
                            setFilteredGigs([]);
                            setGigs([]);
                        }
                        return;
                    }

                    const gigsArray = Array.isArray(response.data.myGigs) ? response.data.myGigs : [];

                    if (isActive) {
                        setFilteredGigs(gigsArray);
                        setGigs(gigsArray);
                    }
                } catch (error) {
                    console.error("Failed to fetch gigs", error);
                    if (isActive) {
                        setFilteredGigs([]);
                        setGigs([]);
                    }
                } finally {
                    if (isActive) {
                        setInitialLoading(false);
                    }
                }
            };

            fetchGigs();

            return () => {
                isActive = false;
            };
        }, [])
    );

    useEffect(() => {
        // Don't run filtering if there are no gigs to filter
        if (Gigs.length === 0) {
            setIsLoading(false)
            return
        }

        setIsLoading(true)

        setTimeout(() => {
            let result = [...Gigs]

            // Log before filtering

            if (filter === "active") {
                result = result.filter((gig) => gig.isActive)
            } else if (filter === "inactive") {
                result = result.filter((gig) => !gig.isActive)
            }

            if (searchQuery) {
                const query = searchQuery.toLowerCase()
                result = result.filter(
                    (gig) => gig.title.toLowerCase().includes(query) || gig.category.toLowerCase().includes(query),
                )
            }

            switch (sortBy) {
                case "newest":
                    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    break
                case "oldest":
                    result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                    break
                case "highest_rated":
                    result.sort((a, b) => b.rating - a.rating)
                    break
                case "most_orders":
                    result.sort((a, b) => b.orders - a.orders)
                    break
            }

            // Log after filtering
            console.log(`Filtered to ${result.length} gigs`)
            setFilteredGigs(result)
            setIsLoading(false)
        }, 500)
    }, [searchQuery, filter, sortBy])

    const handleDeleteGig = async (id: string) => {
        promptDeleteGig(id);
    }

    const mapPackage = (pkg: PackageData) => ({
        title: pkg.title,
        description: pkg.description,
        price: pkg.price,
        deliveryTime: pkg.deliveryTime,
        numberOfRevisions: pkg.numberOfRevisions,
        featuresIncluded: pkg.featuresIncluded,
        type: pkg.type,
    })

    const handleToggleStatus = async (id: string) => {
        const targetGig = filteredGigs.find((gig) => gig._id === id);
        if (!targetGig) return;


        const newGigData: GigData = {
            _id: targetGig._id,
            title: targetGig.title,
            description: targetGig.description,
            category: targetGig.category,
            isActive: !targetGig.isActive,
            tags: targetGig.tags,
            basic: mapPackage(targetGig.basic),
            standard: mapPackage(targetGig.standard),
            premium: mapPackage(targetGig.premium),
            orders: targetGig.orders,
            rating: targetGig.rating,
            createdAt: targetGig.createdAt,
            averageRating: targetGig.averageRating,
            totalOrders: targetGig.totalOrders
        };



        await updateGig(newGigData);
        setFilteredGigs(
            filteredGigs.map((gig) =>
                gig._id === id ? { ...gig, isActive: !gig.isActive } : gig
            )
        );
    };

    return (
        <ThemedView className="flex-1">
            {showDeleteModal && (
                <View className="absolute inset-0 bg-black/70 justify-center items-center z-50">
                    <View className="bg-[#222] w-4/5 rounded-xl p-5">
                        <ThemedText className="text-xl font-bold text-center mb-4">Delete Gig</ThemedText>
                        <ThemedText className="text-gray-300 text-center mb-6">
                            Are you sure you want to delete this gig? This action cannot be undone.
                        </ThemedText>
                        <View className="flex-row justify-between">
                            <TouchableOpacity
                                onPress={cancelDelete}
                                className="bg-[#333] py-3 px-5 rounded-lg flex-1 mr-2"
                            >
                                <ThemedText className="text-white text-center font-semibold">Cancel</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={confirmDelete}
                                className="bg-red-600 py-3 px-5 rounded-lg flex-1 ml-2"
                            >
                                <ThemedText className="text-white text-center font-semibold">Delete</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
            <StatusBar style="light" />
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="flex-row justify-between items-center px-5 pt-12 pb-4">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 justify-center items-center">
                        <Ionicons name="arrow-back" size={24} color="#4B7172" />
                    </TouchableOpacity>
                    <ThemedText className="text-xl font-bold">My Gigs</ThemedText>
                    <TouchableOpacity
                        className="w-10 h-10 justify-center items-center bg-[#4B7172] rounded-full"
                        onPress={() => router.push("/addGig")}
                    >
                        <Ionicons name="add" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Stats Bar */}
                <View className="flex-row justify-between mx-5 mb-6">
                    <View className="bg-[#111] p-3 rounded-lg flex-1 mr-2 items-center">
                        <Text className="text-lg font-bold text-white">{Gigs.length}</Text>
                        <Text className="text-xs text-gray-400">Total Gigs</Text>
                    </View>
                    <View className="bg-[#111] p-3 rounded-lg flex-1 mx-2 items-center">
                        <Text className="text-lg font-bold  text-white">{Gigs.filter((g) => g.isActive).length}</Text>
                        <Text className="text-xs text-gray-400">Active</Text>
                    </View>
                    <View className="bg-[#111] p-3 rounded-lg flex-1 ml-2 items-center">
                        <Text className="text-lg font-bold  text-white">{Gigs.filter((g) => !g.isActive).length}</Text>
                        <Text className="text-xs text-gray-400">Inactive</Text>
                    </View>
                </View>

                {/* Search and Filter */}
                <View className="mx-5 mb-6">
                    <View className="flex-row items-center bg-[#111] rounded-lg px-4 py-2 mb-4">
                        <Ionicons name="search-outline" size={20} color="#777" />
                        <TextInput
                            className="flex-1 ml-2 text-[#CFD5D5] text-base"
                            placeholder="Search your gigs..."
                            placeholderTextColor="#777"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        <TouchableOpacity onPress={() => setShowFilterModal(!showFilterModal)}>
                            <Ionicons name="options-outline" size={20} color="#4B7172" />
                        </TouchableOpacity>
                    </View>

                    {showFilterModal && (
                        <View className="bg-[#111] rounded-lg p-4 mb-4">
                            <View className="mb-4">
                                <Text className="text-sm font-semibold mb-2 text-[#CFD5D5]">Status</Text>
                                <View className="flex-row">
                                    <TouchableOpacity
                                        className={`py-1 px-3 rounded-full mr-2 ${filter === "all" ? "bg-[#4B7172]" : "bg-[#222]"}`}
                                        onPress={() => setFilter("all")}
                                    >
                                        <Text className={`text-sm ${filter === "all" ? "text-white" : "text-gray-400"}`}>All</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        className={`py-1 px-3 rounded-full mr-2 ${filter === "active" ? "bg-[#4B7172]" : "bg-[#222]"}`}
                                        onPress={() => setFilter("active")}
                                    >
                                        <Text className={`text-sm ${filter === "active" ? "text-white" : "text-gray-400"}`}>Active</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        className={`py-1 px-3 rounded-full ${filter === "inactive" ? "bg-[#4B7172]" : "bg-[#222]"}`}
                                        onPress={() => setFilter("inactive")}
                                    >
                                        <Text className={`text-sm ${filter === "inactive" ? "text-white" : "text-gray-400"}`}>
                                            Inactive
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View>
                                <Text className="text-sm font-semibold mb-2">Sort By</Text>
                                <View className="flex-row flex-wrap">
                                    <TouchableOpacity
                                        className={`py-1 px-3 rounded-full mr-2 mb-2 ${sortBy === "newest" ? "bg-[#4B7172]" : "bg-[#222]"}`}
                                        onPress={() => setSortBy("newest")}
                                    >
                                        <Text className={`text-sm ${sortBy === "newest" ? "text-white" : "text-gray-400"}`}>Newest</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        className={`py-1 px-3 rounded-full mr-2 mb-2 ${sortBy === "oldest" ? "bg-[#4B7172]" : "bg-[#222]"}`}
                                        onPress={() => setSortBy("oldest")}
                                    >
                                        <Text className={`text-sm ${sortBy === "oldest" ? "text-white" : "text-gray-400"}`}>Oldest</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        className={`py-1 px-3 rounded-full mr-2 mb-2 ${sortBy === "highest_rated" ? "bg-[#4B7172]" : "bg-[#222]"}`}
                                        onPress={() => setSortBy("highest_rated")}
                                    >
                                        <Text className={`text-sm ${sortBy === "highest_rated" ? "text-white" : "text-gray-400"}`}>
                                            Highest Rated
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        className={`py-1 px-3 rounded-full mr-2 mb-2 ${sortBy === "most_orders" ? "bg-[#4B7172]" : "bg-[#222]"}`}
                                        onPress={() => setSortBy("most_orders")}
                                    >
                                        <Text className={`text-sm ${sortBy === "most_orders" ? "text-white" : "text-gray-400"}`}>
                                            Most Orders
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}
                </View>

                {/* Gigs List */}
                <View className="px-5">
                    {isLoading || initialLoading ? (
                        <View className="items-center justify-center py-10">
                            <ActivityIndicator size="large" color="#4B7172" />
                            <Text className="mt-2 text-gray-400">Loading your gigs...</Text>
                        </View>
                    ) : filteredGigs.length > 0 ? (
                        filteredGigs.map((gig) => (
                            <View key={gig._id} className="bg-[#111] rounded-lg mb-4 overflow-hidden">
                                <View className="flex-row">
                                    <View className="w-[20] h-[100] relative">
                                        <View
                                            className={`absolute top-2 left-2 w-2.5 h-2.5 rounded-full z-10 ${gig.isActive ? "bg-green-500" : "bg-red-500"}`}
                                        />
                                        {/* change w to 100 if doing so 
                                        <Image
                                            source={{ uri: gig.image }}
                                            className="w-full h-full"
                                            style={{ resizeMode: 'cover' }}
                                        /> */}
                                    </View>
                                    <View className="flex-1 p-3 justify-between">
                                        <View>
                                            <Text className="text-base text-white font-bold mb-1">{gig.title}</Text>
                                            <Text className="text-xs text-gray-400 mb-2">{gig.category}</Text>
                                            <View className="flex-row mb-2">
                                                <View className="flex-row items-center mr-4">
                                                    <Ionicons name="star" size={14} color="#FFD700" />
                                                    <Text className="text-xs text-gray-400 ml-1">{gig.averageRating}</Text>
                                                </View>
                                                <View className="flex-row items-center">
                                                    <Ionicons name="cart-outline" size={14} color="#777" />
                                                    <Text className="text-xs text-gray-400 ml-1">{gig.orders} orders</Text>
                                                </View>
                                            </View>
                                        </View>
                                        <Text className="text-base font-bold text-[#85B8AF]">From ${gig.basic.price}</Text>
                                    </View>
                                </View>

                                {/* Action Buttons */}
                                <View className="flex-row border-t border-[#222] p-2">
                                    <TouchableOpacity
                                        className="flex-1 flex-row justify-center items-center py-2"
                                        onPress={() =>
                                            router.push({
                                                pathname: "/(modals)/editGig",
                                                params: { id: gig._id },
                                            })
                                        }
                                    >
                                        <Ionicons name="create-outline" size={16} color="#4B7172" />
                                        <Text className="text-sm text-[#4B7172] ml-1">Edit</Text>
                                    </TouchableOpacity>

                                    <View className="w-px bg-[#222] mx-2" />

                                    <TouchableOpacity
                                        className="flex-1 flex-row justify-center items-center py-2"
                                        onPress={() => handleToggleStatus(gig._id)}
                                    >
                                        <Ionicons
                                            name={gig.isActive ? "eye-off-outline" : "eye-outline"}
                                            size={16}
                                            color={gig.isActive ? "#FF9500" : "#4B7172"}
                                        />
                                        <Text className={`text-sm ml-1 ${gig.isActive ? "text-[#FF9500]" : "text-[#4B7172]"}`}>
                                            {gig.isActive ? "Deactivate" : "Activate"}
                                        </Text>
                                    </TouchableOpacity>

                                    <View className="w-px bg-[#222] mx-2" />

                                    <TouchableOpacity
                                        className="flex-1 flex-row justify-center items-center py-2"
                                        onPress={() => handleDeleteGig(gig._id)}
                                    >
                                        <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                                        <Text className="text-sm text-[#FF3B30] ml-1">Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View className="items-center justify-center py-10">
                            <Ionicons name="search" size={50} color="#333" />
                            <Text className="mt-4 text-lg font-semibold text-white">No gigs found</Text>
                            <Text className="mt-2 text-gray-400 text-center">
                                {Gigs.length === 0
                                    ? "You haven't created any gigs yet. Create your first gig to get started!"
                                    : "We couldn't find any gigs matching your search criteria."}
                            </Text>
                            {Gigs.length > 0 && (
                                <TouchableOpacity
                                    className="mt-6 bg-[#4B7172] py-3 px-6 rounded-lg"
                                    onPress={() => {
                                        setSearchQuery("")
                                        setFilter("all")
                                        setSortBy("newest")
                                        setShowFilterModal(false)
                                    }}
                                >
                                    <Text className="text-white font-semibold">Clear Filters</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>

                {/* Create New Gig Button (Fixed at bottom) */}
                <View className="h-20" />
            </ScrollView>

            {/* Floating Action Button */}
            <TouchableOpacity
                className="absolute bottom-6 right-6 w-14 h-14 bg-[#4B7172] rounded-full justify-center items-center shadow-lg"
                style={{ elevation: 5 }}
                onPress={() => router.push("/addGig")}
            >
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>
        </ThemedView>
    )
}

