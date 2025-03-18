"use client"

import { useState, useEffect, useCallback } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router"
import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import "@/global.css"
import { advancedGigData, PackageData } from "@/types/gigs"
import { getGig, getGigReviews } from "@/api/gigs"
import { getUser } from "@/api/user"
import { Review } from "@/types/review"
import { UserData } from "@/types/user"

// Define types
type PackageType = 'basic' | 'standard' | 'premium'

// interface PackageData {
//     title: string;
//     description: string;
//     price: number;
//     deliveryTime: number;
//     numberOfRevisions: number;
//     featuresIncluded: string[];
//     type: PackageType;
// }




export default function GigDetailsScreen() {
    const router = useRouter()
    const params = useLocalSearchParams()
    const { id } = useLocalSearchParams()
    const gigId = Array.isArray(id) ? id[0] : id
    const [gig, setGig] = useState<advancedGigData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [selectedPackage, setSelectedPackage] = useState<PackageType>("basic")
    const [gigReviews, setGigReviews] = useState<Review[]>([]);
    const [showAllReviews, setShowAllReviews] = useState(false)
    const [freelancer, setFreelancer] = useState<UserData | null>(null);


    useFocusEffect(
        useCallback(() => {
            const fetchAllData = async () => {
                try {
                    setIsLoading(true);

                    const gigResponse = await getGig(gigId);
                    if (gigResponse?.status === "success") {
                        const gigData = gigResponse.data.thisGig;
                        setGig(gigData);

                        const freelancerId = gigData.userID;

                        const freelancerResponse = await getUser(freelancerId);
                        if (freelancerResponse?.status === "success") {
                            setFreelancer(freelancerResponse.data.user);
                        }

                        const reviewResponse = await getGigReviews(gigId);
                        if (reviewResponse?.status === "success") {
                            setGigReviews(reviewResponse.data.reviews);
                        }
                    }
                } catch (error) {
                    console.error("Error in fetching data:", error);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchAllData();

            return () => { };
        }, [gigId])
    );



    const handleOrder = () => {
        if (!gig) return

        router.push({
            pathname: "/order-confirmation",
            params: {
                gigId: gig._id,
                freelancerId: freelancer?._id,
                package: selectedPackage,
                price: gig[selectedPackage].price.toString(),
                freelancerName: freelancer?.name
            }
        })
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    }

    if (isLoading) {
        return (
            <ThemedView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4B7172" />
                <ThemedText style={styles.loadingText}>Loading gig details...</ThemedText>
            </ThemedView>
        )
    }

    if (!gig) {
        return (
            <ThemedView style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={50} color="#F44336" />
                <ThemedText style={styles.errorTitle}>Gig Not Found</ThemedText>
                <ThemedText style={styles.errorText}>
                    The gig you're looking for doesn't exist or has been removed.
                </ThemedText>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.push('/browse')}
                >
                    <ThemedText style={styles.backButtonText}>Browse Gigs</ThemedText>
                </TouchableOpacity>
            </ThemedView>
        )
    }

    return (
        <ThemedView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButtonIcon}>
                        <Ionicons name="arrow-back" size={24} color="#4B7172" />
                    </TouchableOpacity>
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.actionButton}>
                            <Ionicons name="share-social-outline" size={24} color="#4B7172" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Gig Image */}
                <View style={styles.gigImageContainer}>
                    <View style={styles.gigImage} className="bg-gray-700" />
                </View>

                {/* Gig Title and Stats */}
                <View style={styles.gigInfoContainer}>
                    <ThemedText style={styles.gigTitle}>{gig.title}</ThemedText>
                    <View style={styles.gigStats}>
                        <View style={styles.statItem}>
                            <Ionicons name="star" size={16} color="#FFD700" />
                            <ThemedText style={styles.statText}>{gig.rating} ({gigReviews.length} reviews)</ThemedText>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="cart-outline" size={16} color="#777" />
                            <ThemedText style={styles.statText}>{gig.orders} orders</ThemedText>
                        </View>
                    </View>
                </View>

                {/* Freelancer Info */}
                <View
                    style={styles.freelancerContainer}
                // onPress={() => router.push({
                //     pathname: "/freelancer-profile",
                //     params: { id: gig.freelancerId }
                // })}
                >
                    <View style={styles.freelancerAvatar}>
                        <ThemedText style={styles.avatarText}>
                            {freelancer?.name.split(' ').map(n => n[0]).join('')}
                        </ThemedText>
                    </View>
                    <View style={styles.freelancerInfo}>
                        <ThemedText style={styles.freelancerName}>{freelancer?.name}</ThemedText>

                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#777" />
                </View>

                {/* Description */}
                <View style={styles.sectionContainer}>
                    <ThemedText style={styles.sectionTitle}>Description</ThemedText>
                    <ThemedText style={styles.descriptionText}>{gig.description}</ThemedText>
                </View>

                {/* Packages */}
                <View style={styles.sectionContainer}>
                    <ThemedText style={styles.sectionTitle}>Packages</ThemedText>
                    <View style={styles.packageTabs}>
                        <TouchableOpacity
                            style={[styles.packageTab, selectedPackage === 'basic' && styles.selectedPackageTab]}
                            onPress={() => setSelectedPackage('basic')}
                        >
                            <ThemedText style={[styles.packageTabText, selectedPackage === 'basic' && styles.selectedPackageTabText]}>
                                Basic
                            </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.packageTab, selectedPackage === 'standard' && styles.selectedPackageTab]}
                            onPress={() => setSelectedPackage('standard')}
                        >
                            <ThemedText style={[styles.packageTabText, selectedPackage === 'standard' && styles.selectedPackageTabText]}>
                                Standard
                            </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.packageTab, selectedPackage === 'premium' && styles.selectedPackageTab]}
                            onPress={() => setSelectedPackage('premium')}
                        >
                            <ThemedText style={[styles.packageTabText, selectedPackage === 'premium' && styles.selectedPackageTabText]}>
                                Premium
                            </ThemedText>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.packageDetails}>
                        <ThemedText style={styles.packageTitle}>{gig[selectedPackage].title}</ThemedText>
                        <ThemedText style={styles.packageDescription}>{gig[selectedPackage].description}</ThemedText>
                        <ThemedText style={styles.packagePrice}>${gig[selectedPackage].price}</ThemedText>

                        <View style={styles.packageMeta}>
                            <View style={styles.metaItem}>
                                <Ionicons name="time-outline" size={16} color="#777" />
                                <ThemedText style={styles.metaText}>{gig[selectedPackage].deliveryTime} days delivery</ThemedText>
                            </View>
                            <View style={styles.metaItem}>
                                <Ionicons name="refresh-outline" size={16} color="#777" />
                                <ThemedText style={styles.metaText}>{gig[selectedPackage].numberOfRevisions} revisions</ThemedText>
                            </View>
                        </View>

                        <ThemedText style={styles.featuresTitle}>Features</ThemedText>
                        {gig[selectedPackage].featuresIncluded.map((feature, index) => (
                            <View key={index} style={styles.featureItem}>
                                <Ionicons name="checkmark" size={16} color="#4CAF50" />
                                <ThemedText style={styles.featureText}>{feature}</ThemedText>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Reviews */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <ThemedText style={styles.sectionTitle}>Reviews</ThemedText>
                        <TouchableOpacity onPress={() => setShowAllReviews(!showAllReviews)}>
                            <ThemedText style={styles.seeAllText}>
                                {showAllReviews ? 'Show Less' : 'See All'}
                            </ThemedText>
                        </TouchableOpacity>
                    </View>

                    {gigReviews.length > 0 ? (
                        <>
                            {(showAllReviews ? gigReviews : gigReviews.slice(0, 2)).map(review => (
                                <View key={review._id} style={styles.reviewCard}>
                                    <View style={styles.reviewHeader}>
                                        {/* <ThemedText style={styles.reviewerName}>{review.clientName}</ThemedText> */}
                                        <View style={styles.reviewRating}>
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <Ionicons
                                                    key={star}
                                                    name={star <= review.rating ? "star" : star - 0.5 <= review.rating ? "star-half" : "star-outline"}
                                                    size={14}
                                                    color="#FFD700"
                                                />
                                            ))}
                                        </View>
                                    </View>
                                    {/* <ThemedText style={styles.reviewDate}>{formatDate(review.date)}</ThemedText> */}
                                    <ThemedText style={styles.reviewComment}>{review.comment}</ThemedText>
                                </View>
                            ))}
                        </>
                    ) : (
                        <View style={styles.noReviewsContainer}>
                            <ThemedText style={styles.noReviewsText}>No reviews yet</ThemedText>
                        </View>
                    )}
                </View>

                {/* Bottom padding for scrolling */}
                <View style={{ height: 80 }} />
            </ScrollView>

            {/* Order Button (Fixed at bottom) */}
            <View style={styles.orderButtonContainer}>
                <View style={styles.orderPriceContainer}>
                    <ThemedText style={styles.orderPriceLabel}>Total</ThemedText>
                    <ThemedText style={styles.orderPrice}>${gig[selectedPackage].price}</ThemedText>
                </View>
                <TouchableOpacity style={styles.orderButton} onPress={handleOrder}>
                    <ThemedText style={styles.orderButtonText}>Continue</ThemedText>
                </TouchableOpacity>
            </View>
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 15
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 10,
        color: "#777",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginTop: 15,
        marginBottom: 5,
    },
    errorText: {
        fontSize: 16,
        color: "#777",
        textAlign: "center",
        marginBottom: 20,
    },
    backButton: {
        backgroundColor: "#4B7172",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    backButtonText: {
        color: "#fff",
        fontWeight: "bold",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 15,
    },
    backButtonIcon: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    headerActions: {
        flexDirection: "row",
    },
    actionButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 10,
    },
    gigImageContainer: {
        height: 200,
        width: "100%",
    },
    gigImage: {
        width: "100%",
        height: "100%",
    },
    gigInfoContainer: {
        padding: 20,
    },
    gigTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    gigStats: {
        flexDirection: "row",
        alignItems: "center",
    },
    statItem: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 15,
    },
    statText: {
        fontSize: 14,
        color: "#777",
        marginLeft: 5,
    },
    freelancerContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#111",
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 15,
        borderRadius: 10,
    },
    freelancerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(75, 113, 114, 0.2)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    avatarText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#4B7172",
    },
    freelancerInfo: {
        flex: 1,
    },
    freelancerName: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 2,
    },
    freelancerRating: {
        flexDirection: "row",
        alignItems: "center",
    },
    ratingText: {
        fontSize: 14,
        color: "#777",
        marginLeft: 4,
    },
    sectionContainer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: "#222",
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
    },
    descriptionText: {
        fontSize: 16,
        lineHeight: 24,
        color: "#CFD5D5",
    },
    packageTabs: {
        flexDirection: "row",
        backgroundColor: "#111",
        borderRadius: 10,
        marginBottom: 15,
    },
    packageTab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: "center",
    },
    selectedPackageTab: {
        borderBottomWidth: 2,
        borderBottomColor: "#4B7172",
    },
    packageTabText: {
        fontSize: 14,
        color: "#777",
    },
    selectedPackageTabText: {
        color: "#4B7172",
        fontWeight: "bold",
    },
    packageDetails: {
        backgroundColor: "#111",
        borderRadius: 10,
        padding: 15,
    },
    packageTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
    },
    packageDescription: {
        fontSize: 14,
        color: "#777",
        marginBottom: 10,
    },
    packagePrice: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#4B7172",
        marginBottom: 15,
    },
    packageMeta: {
        flexDirection: "row",
        marginBottom: 15,
    },
    metaItem: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 15,
    },
    metaText: {
        fontSize: 14,
        color: "#777",
        marginLeft: 5,
    },
    featuresTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
    },
    featureItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    featureText: {
        fontSize: 14,
        color: "#CFD5D5",
        marginLeft: 8,
    },
    seeAllText: {
        fontSize: 14,
        color: "#4B7172",
        fontWeight: "500",
    },
    reviewCard: {
        backgroundColor: "#111",
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
    },
    reviewHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 5,
    },
    reviewerName: {
        fontSize: 16,
        fontWeight: "bold",
    },
    reviewRating: {
        flexDirection: "row",
    },
    reviewDate: {
        fontSize: 12,
        color: "#777",
        marginBottom: 8,
    },
    reviewComment: {
        fontSize: 14,
        lineHeight: 20,
        color: "#CFD5D5",
    },
    noReviewsContainer: {
        backgroundColor: "#111",
        borderRadius: 10,
        padding: 15,
        alignItems: "center",
    },
    noReviewsText: {
        fontSize: 14,
        color: "#777",
    },
    orderButtonContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        backgroundColor: "#111",
        borderTopWidth: 1,
        borderTopColor: "#222",
        padding: 15,
    },
    orderPriceContainer: {
        flex: 1,
    },
    orderPriceLabel: {
        fontSize: 12,
        color: "#777",
    },
    orderPrice: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#4B7172",
    },
    orderButton: {
        backgroundColor: "#4B7172",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    orderButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    }
})
