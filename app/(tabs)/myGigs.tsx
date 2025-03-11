"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import GigCard from "@/components/GigCard"
import { StatusBar } from "expo-status-bar"
import "@/global.css"

// Type definitions
interface Gig {
    id: string;
    title: string;
    category: string;
    price: string;
    rating: number;
    orders: number;
    image: string;
    isActive: boolean;
    createdAt: string;
}

// Mock data for the UI
const myGigs: Gig[] = [
    {
        id: "1",
        title: "Professional Mobile App Development",
        category: "Programming & Tech",
        price: "From $150",
        rating: 4.8,
        orders: 24,
        image: "/placeholder.svg",
        isActive: true,
        createdAt: "2023-10-15",
    },
    {
        id: "2",
        title: "Modern UI/UX Design for Web & Mobile",
        category: "Graphics & Design",
        price: "From $120",
        rating: 4.9,
        orders: 18,
        image: "/placeholder.svg",
        isActive: true,
        createdAt: "2023-11-20",
    },

]

type FilterOption = "all" | "active" | "inactive";
type SortOption = "newest" | "oldest" | "highest_rated" | "most_orders";

export default function MyGigsScreen() {
    const [searchQuery, setSearchQuery] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [filter, setFilter] = useState<FilterOption>("all")
    const [sortBy, setSortBy] = useState<SortOption>("newest")
    const [showFilterModal, setShowFilterModal] = useState(false)
    const [filteredGigs, setFilteredGigs] = useState<Gig[]>(myGigs)
    const router = useRouter()

    useEffect(() => {
        setIsLoading(true)

        setTimeout(() => {
            let result = [...myGigs]

            // Apply status filter
            if (filter === "active") {
                result = result.filter(gig => gig.isActive)
            } else if (filter === "inactive") {
                result = result.filter(gig => !gig.isActive)
            }

            // Apply search
            if (searchQuery) {
                const query = searchQuery.toLowerCase()
                result = result.filter(
                    gig =>
                        gig.title.toLowerCase().includes(query) ||
                        gig.category.toLowerCase().includes(query)
                )
            }

            // Apply sorting
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

            setFilteredGigs(result)
            setIsLoading(false)
        }, 500)
    }, [searchQuery, filter, sortBy])

    const handleDeleteGig = (id: string) => {
        setFilteredGigs(filteredGigs.filter(gig => gig.id !== id))
    }

    const handleToggleStatus = (id: string) => {
        setFilteredGigs(filteredGigs.map(gig =>
            gig.id === id ? { ...gig, isActive: !gig.isActive } : gig
        ))
    }

    return (
        <ThemedView className="flex-1">
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
                        onPress={() => router.push('/addGig')}
                    >
                        <Ionicons name="add" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Stats Bar */}
                <View className="flex-row justify-between mx-5 mb-6">
                    <View className="bg-[#111] p-3 rounded-lg flex-1 mr-2 items-center">
                        <ThemedText className="text-lg font-bold">{filteredGigs.length}</ThemedText>
                        <ThemedText className="text-xs text-gray-400">Total Gigs</ThemedText>
                    </View>
                    <View className="bg-[#111] p-3 rounded-lg flex-1 mx-2 items-center">
                        <ThemedText className="text-lg font-bold">{filteredGigs.filter(g => g.isActive).length}</ThemedText>
                        <ThemedText className="text-xs text-gray-400">Active</ThemedText>
                    </View>
                    <View className="bg-[#111] p-3 rounded-lg flex-1 ml-2 items-center">
                        <ThemedText className="text-lg font-bold">{filteredGigs.filter(g => !g.isActive).length}</ThemedText>
                        <ThemedText className="text-xs text-gray-400">Inactive</ThemedText>
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

                    {/* Filter Options */}
                    {showFilterModal && (
                        <View className="bg-[#111] rounded-lg p-4 mb-4">
                            <View className="mb-4">
                                <ThemedText className="text-sm font-semibold mb-2">Status</ThemedText>
                                <View className="flex-row">
                                    <TouchableOpacity
                                        className={`py-1 px-3 rounded-full mr-2 ${filter === 'all' ? 'bg-[#4B7172]' : 'bg-[#222]'}`}
                                        onPress={() => setFilter('all')}
                                    >
                                        <ThemedText className={`text-sm ${filter === 'all' ? 'text-white' : 'text-gray-400'}`}>All</ThemedText>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        className={`py-1 px-3 rounded-full mr-2 ${filter === 'active' ? 'bg-[#4B7172]' : 'bg-[#222]'}`}
                                        onPress={() => setFilter('active')}
                                    >
                                        <ThemedText className={`text-sm ${filter === 'active' ? 'text-white' : 'text-gray-400'}`}>Active</ThemedText>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        className={`py-1 px-3 rounded-full ${filter === 'inactive' ? 'bg-[#4B7172]' : 'bg-[#222]'}`}
                                        onPress={() => setFilter('inactive')}
                                    >
                                        <ThemedText className={`text-sm ${filter === 'inactive' ? 'text-white' : 'text-gray-400'}`}>Inactive</ThemedText>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View>
                                <ThemedText className="text-sm font-semibold mb-2">Sort By</ThemedText>
                                <View className="flex-row flex-wrap">
                                    <TouchableOpacity
                                        className={`py-1 px-3 rounded-full mr-2 mb-2 ${sortBy === 'newest' ? 'bg-[#4B7172]' : 'bg-[#222]'}`}
                                        onPress={() => setSortBy('newest')}
                                    >
                                        <ThemedText className={`text-sm ${sortBy === 'newest' ? 'text-white' : 'text-gray-400'}`}>Newest</ThemedText>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        className={`py-1 px-3 rounded-full mr-2 mb-2 ${sortBy === 'oldest' ? 'bg-[#4B7172]' : 'bg-[#222]'}`}
                                        onPress={() => setSortBy('oldest')}
                                    >
                                        <ThemedText className={`text-sm ${sortBy === 'oldest' ? 'text-white' : 'text-gray-400'}`}>Oldest</ThemedText>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        className={`py-1 px-3 rounded-full mr-2 mb-2 ${sortBy === 'highest_rated' ? 'bg-[#4B7172]' : 'bg-[#222]'}`}
                                        onPress={() => setSortBy('highest_rated')}
                                    >
                                        <ThemedText className={`text-sm ${sortBy === 'highest_rated' ? 'text-white' : 'text-gray-400'}`}>Highest Rated</ThemedText>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        className={`py-1 px-3 rounded-full mr-2 mb-2 ${sortBy === 'most_orders' ? 'bg-[#4B7172]' : 'bg-[#222]'}`}
                                        onPress={() => setSortBy('most_orders')}
                                    >
                                        <ThemedText className={`text-sm ${sortBy === 'most_orders' ? 'text-white' : 'text-gray-400'}`}>Most Orders</ThemedText>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}
                </View>

                {/* Gigs List */}
                <View className="px-5">
                    {isLoading ? (
                        <View className="items-center justify-center py-10">
                            <ActivityIndicator size="large" color="#4B7172" />
                            <ThemedText className="mt-2 text-gray-400">Loading your gigs...</ThemedText>
                        </View>
                    ) : filteredGigs.length > 0 ? (
                        filteredGigs.map(gig => (
                            <View key={gig.id} className="bg-[#111] rounded-lg mb-4 overflow-hidden">
                                <View className="flex-row">
                                    <View className="w-[100] h-[100] relative">
                                        <View
                                            className={`absolute top-2 left-2 w-2.5 h-2.5 rounded-full z-10 ${gig.isActive ? 'bg-green-500' : 'bg-red-500'}`}
                                        />
                                        <Image
                                            source={{ uri: gig.image }}
                                            className="w-full h-full"
                                            style={{ resizeMode: 'cover' }}
                                        />
                                    </View>
                                    <View className="flex-1 p-3 justify-between">
                                        <View>
                                            <ThemedText className="text-base font-bold mb-1" numberOfLines={1}>{gig.title}</ThemedText>
                                            <ThemedText className="text-xs text-gray-400 mb-2">{gig.category}</ThemedText>
                                            <View className="flex-row mb-2">
                                                <View className="flex-row items-center mr-4">
                                                    <Ionicons name="star" size={14} color="#FFD700" />
                                                    <ThemedText className="text-xs text-gray-400 ml-1">{gig.rating}</ThemedText>
                                                </View>
                                                <View className="flex-row items-center">
                                                    <Ionicons name="cart-outline" size={14} color="#777" />
                                                    <ThemedText className="text-xs text-gray-400 ml-1">{gig.orders} orders</ThemedText>
                                                </View>
                                            </View>
                                        </View>
                                        <ThemedText className="text-base font-bold text-[#4B7172]">{gig.price}</ThemedText>
                                    </View>
                                </View>

                                {/* Action Buttons */}
                                <View className="flex-row border-t border-[#222] p-2">
                                    <TouchableOpacity
                                        className="flex-1 flex-row justify-center items-center py-2"
                                        onPress={() => router.push({
                                            pathname: "/(modals)/editGig",
                                            params: { id: gig.id }
                                        })}
                                    >
                                        <Ionicons name="create-outline" size={16} color="#4B7172" />
                                        <ThemedText className="text-sm text-[#4B7172] ml-1">Edit</ThemedText>
                                    </TouchableOpacity>

                                    <View className="w-px bg-[#222] mx-2" />

                                    <TouchableOpacity
                                        className="flex-1 flex-row justify-center items-center py-2"
                                        onPress={() => handleToggleStatus(gig.id)}
                                    >
                                        <Ionicons
                                            name={gig.isActive ? "eye-off-outline" : "eye-outline"}
                                            size={16}
                                            color={gig.isActive ? "#FF9500" : "#4B7172"}
                                        />
                                        <ThemedText
                                            className={`text-sm ml-1 ${gig.isActive ? 'text-[#FF9500]' : 'text-[#4B7172]'}`}
                                        >
                                            {gig.isActive ? "Deactivate" : "Activate"}
                                        </ThemedText>
                                    </TouchableOpacity>

                                    <View className="w-px bg-[#222] mx-2" />

                                    <TouchableOpacity
                                        className="flex-1 flex-row justify-center items-center py-2"
                                        onPress={() => handleDeleteGig(gig.id)}
                                    >
                                        <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                                        <ThemedText className="text-sm text-[#FF3B30] ml-1">Delete</ThemedText>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View className="items-center justify-center py-10">
                            <Ionicons name="search" size={50} color="#333" />
                            <ThemedText className="mt-4 text-lg font-semibold">No gigs found</ThemedText>
                            <ThemedText className="mt-2 text-gray-400 text-center">
                                We couldn't find any gigs matching your search criteria.
                            </ThemedText>
                            <TouchableOpacity
                                className="mt-6 bg-[#4B7172] py-3 px-6 rounded-lg"
                                onPress={() => {
                                    setSearchQuery('')
                                    setFilter('all')
                                    setSortBy('newest')
                                    setShowFilterModal(false)
                                }}
                            >
                                <ThemedText className="text-white font-semibold">Clear Filters</ThemedText>
                            </TouchableOpacity>
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
                onPress={() => router.push('/addGig')}
            >
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>
        </ThemedView>
    )
}