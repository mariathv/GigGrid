"use client"

import { useState, useEffect } from "react"
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter, useLocalSearchParams } from "expo-router"
import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { useFocusEffect } from "@react-navigation/native"
import { useCallback } from "react"
import { GigData } from "@/types/gigs"


import "@/global.css"
import { getAllGigs } from "@/api/gigs"




type FilterOption = "all" | "highest_rated" | "most_recent" | "lowest_price" | "highest_price"


const categories = [
    "All Categories",
    "Graphic Design",
    "Writing",
    "Web Development",
    "Mobile Development",
    "Digital Marketing",
    "Video Editing",
]

export default function BrowseScreen() {
    const router = useRouter()
    const params = useLocalSearchParams()

    const [searchQuery, setSearchQuery] = useState((params.search as string) || "")
    const [selectedCategory, setSelectedCategory] = useState((params.category as string) || "All Categories")
    const [filter, setFilter] = useState<FilterOption>("all")
    const [showFilterModal, setShowFilterModal] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [gigs, setGigs] = useState<GigData[]>([])
    const [filteredGigs, setFilteredGigs] = useState<GigData[]>([])


    useFocusEffect(
        useCallback(() => {

            const fetchAllGigs = async () => {
                try {
                    const response = await getAllGigs()
                    console.log(response)

                    if (response?.status === "success") {
                        setGigs(response.data.allGigs)
                        setFilteredGigs(response.data.allGigs)
                    }
                } catch (error) {
                    console.error("Error fetching featured gigs:", error)
                } finally {
                }
            }


            setIsLoading(true)
            setSearchQuery((params.search as string) || "")
            setSelectedCategory((params.category as string) || "All Categories")
            setFilter("all")

            fetchAllGigs();

            return () => {
            }
        }, [])
    )

    useEffect(() => {
        if (gigs.length === 0) return

        setIsLoading(true)

        setTimeout(() => {
            let result = [...gigs]

            if (searchQuery) {
                const query = searchQuery.toLowerCase()
                result = result.filter(
                    (gig) =>
                        gig.title.toLowerCase().includes(query) ||
                        gig.description.toLowerCase().includes(query) ||
                        gig.tags.some((tag) => tag.toLowerCase().includes(query)),
                )
            }
            else if (selectedCategory !== "All Categories") {
                result = result.filter((gig) => gig.category === selectedCategory)
            }

            switch (filter) {
                case "highest_rated":
                    result.sort((a, b) => b.rating - a.rating)
                    break
                case "most_recent":
                    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    break
                case "lowest_price":
                    result.sort((a, b) => a.basic.price - b.basic.price)
                    break
                case "highest_price":
                    result.sort((a, b) => b.basic.price - a.basic.price)
                    break
            }

            setFilteredGigs(result)
            setIsLoading(false)
        }, 500)
    }, [searchQuery, selectedCategory, filter, gigs])

    const handleSearch = () => {
        if (searchQuery) {
            setSelectedCategory("All Categories")
        }
    }

    return (
        <ThemedView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#4B7172" />
                    </TouchableOpacity>
                    <ThemedText style={styles.headerTitle}>Browse Gigs</ThemedText>
                    <View style={styles.placeholder} />
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#777" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search for services..."
                        placeholderTextColor="#777"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                    />
                    <TouchableOpacity onPress={() => setShowFilterModal(!showFilterModal)}>
                        <Ionicons name="options-outline" size={20} color="#4B7172" />
                    </TouchableOpacity>
                </View>

                {/* Category Selector */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoriesScroll}
                    contentContainerStyle={styles.categoriesContainer}
                >
                    {categories.map((category, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.categoryPill, selectedCategory === category && styles.selectedCategoryPill]}
                            onPress={() => {
                                setSelectedCategory(category)
                                // Clear search when selecting a category
                                setSearchQuery("")
                            }}
                        >
                            <ThemedText style={[styles.categoryText, selectedCategory === category && styles.selectedCategoryText]}>
                                {category}
                            </ThemedText>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Filter Modal */}
                {showFilterModal && (
                    <View style={styles.filterModal}>
                        <ThemedText style={styles.filterTitle}>Sort By</ThemedText>
                        <View style={styles.filterOptions}>
                            <TouchableOpacity
                                style={[styles.filterOption, filter === "all" && styles.selectedFilterOption]}
                                onPress={() => setFilter("all")}
                            >
                                <ThemedText style={styles.filterText}>Recommended</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.filterOption, filter === "highest_rated" && styles.selectedFilterOption]}
                                onPress={() => setFilter("highest_rated")}
                            >
                                <ThemedText style={styles.filterText}>Highest Rated</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.filterOption, filter === "most_recent" && styles.selectedFilterOption]}
                                onPress={() => setFilter("most_recent")}
                            >
                                <ThemedText style={styles.filterText}>Most Recent</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.filterOption, filter === "lowest_price" && styles.selectedFilterOption]}
                                onPress={() => setFilter("lowest_price")}
                            >
                                <ThemedText style={styles.filterText}>Lowest Price</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.filterOption, filter === "highest_price" && styles.selectedFilterOption]}
                                onPress={() => setFilter("highest_price")}
                            >
                                <ThemedText style={styles.filterText}>Highest Price</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Results */}
                <View style={styles.resultsContainer}>
                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#4B7172" />
                            <ThemedText style={styles.loadingText}>Loading gigs...</ThemedText>
                        </View>
                    ) : filteredGigs.length > 0 ? (
                        filteredGigs.map((gig) => (
                            <TouchableOpacity
                                key={gig._id}
                                style={styles.gigCard}
                                onPress={() =>
                                    router.push({
                                        pathname: "/gig-details",
                                        params: { id: gig._id },
                                    })
                                }
                            >
                                <View style={styles.gigContent}>
                                    <View>
                                        <ThemedText style={styles.gigTitle}>{gig.title}</ThemedText>
                                        <ThemedText style={styles.gigCategory}>{gig.category}</ThemedText>
                                        <View style={styles.gigMeta}>
                                            <View style={styles.metaItem}>
                                                <Ionicons name="star" size={14} color="#FFD700" />
                                                <ThemedText style={styles.metaText}>{gig.averageRating}</ThemedText>
                                            </View>
                                            <View style={styles.metaItem}>
                                                <Ionicons name="cart-outline" size={14} color="#777" />
                                                <ThemedText style={styles.metaText}>{gig.totalOrders} orders</ThemedText>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={styles.gigFooter}>
                                        <ThemedText style={styles.deliveryTime}>
                                            <Ionicons name="time-outline" size={14} color="#777" /> {gig.basic.deliveryTime} days
                                        </ThemedText>
                                        <ThemedText style={styles.gigPrice}>${gig.basic.price}</ThemedText>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.emptyStateContainer}>
                            <Ionicons name="search" size={50} color="#333" />
                            <ThemedText style={styles.emptyStateTitle}>No gigs found</ThemedText>
                            <ThemedText style={styles.emptyStateText}>Try adjusting your search or filters</ThemedText>
                            <TouchableOpacity
                                style={styles.clearButton}
                                onPress={() => {
                                    setSearchQuery("")
                                    setSelectedCategory("All Categories")
                                    setFilter("all")
                                }}
                            >
                                <ThemedText style={styles.clearButtonText}>Clear Filters</ThemedText>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <View style={{ height: 20 }} />
            </ScrollView>
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 15,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
    },
    placeholder: {
        width: 40,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#111",
        borderRadius: 10,
        marginHorizontal: 20,
        marginBottom: 15,
        paddingHorizontal: 15,
        paddingVertical: 5,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: "#CFD5D5",
    },
    categoriesScroll: {
        marginBottom: 15,
    },
    categoriesContainer: {
        paddingHorizontal: 20,
    },
    categoryPill: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: "#111",
        marginRight: 10,
    },
    selectedCategoryPill: {
        backgroundColor: "#4B7172",
    },
    categoryText: {
        fontSize: 12,
        color: "#CFD5D5",
    },
    selectedCategoryText: {
        color: "#fff",
        fontWeight: "bold",
    },
    filterModal: {
        backgroundColor: "#111",
        borderRadius: 10,
        marginHorizontal: 20,
        marginBottom: 15,
        padding: 15,
    },
    filterTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
    },
    filterOptions: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    filterOption: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: "#222",
        marginRight: 8,
        marginBottom: 8,
    },
    selectedFilterOption: {
        backgroundColor: "#4B7172",
    },
    filterText: {
        fontSize: 12,
    },
    resultsContainer: {
        paddingHorizontal: 20,
    },
    loadingContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 30,
    },
    loadingText: {
        marginTop: 10,
        color: "#777",
    },
    gigCard: {
        backgroundColor: "#111",
        borderRadius: 10,
        marginBottom: 15,
        overflow: "hidden",
    },
    gigImageContainer: {
        height: 150,
        width: "100%",
    },
    gigImage: {
        width: "100%",
        height: "100%",
    },
    gigContent: {
        padding: 15,
    },
    gigTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 4,
    },
    gigCategory: {
        fontSize: 12,
        color: "#777",
        marginBottom: 8,
    },
    gigMeta: {
        flexDirection: "row",
        marginBottom: 12,
    },
    metaItem: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 15,
    },
    metaText: {
        fontSize: 12,
        color: "#777",
        marginLeft: 4,
    },
    gigFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: "#222",
        paddingTop: 12,
    },
    deliveryTime: {
        fontSize: 12,
        color: "#777",
    },
    gigPrice: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#4B7172",
    },
    emptyStateContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 30,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 15,
    },
    emptyStateText: {
        fontSize: 14,
        color: "#777",
        textAlign: "center",
        marginTop: 5,
        marginBottom: 20,
    },
    clearButton: {
        backgroundColor: "#4B7172",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    clearButtonText: {
        color: "#fff",
        fontWeight: "bold",
    },
})

