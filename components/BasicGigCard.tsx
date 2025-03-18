import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from "@expo/vector-icons"
import { ThemedText } from "@/components/ThemedText"

interface GigCardProps {
    gig: {
        title: string;
        category: string;
        rating: number;
        orders: number;
        basic: {
            price: number;
        };
    };
}

const GigCard: React.FC<GigCardProps> = ({ gig }) => {
    return (
        <View style={styles.gigContent}>
            <View>
                <ThemedText style={styles.gigTitle}>{gig.title}</ThemedText>
                <ThemedText style={styles.gigCategory}>{gig.category}</ThemedText>
                <View style={styles.gigMeta}>
                    <View style={styles.metaItem}>
                        <Ionicons name="star" size={14} color="#FFD700" />
                        <ThemedText style={styles.metaText}>{gig.rating}</ThemedText>
                    </View>
                    <View style={styles.metaItem}>
                        <Ionicons name="cart-outline" size={14} color="#777" />
                        <ThemedText style={styles.metaText}>{gig.orders} orders</ThemedText>
                    </View>
                </View>
            </View>
            <ThemedText style={styles.gigPrice}>From ${gig.basic.price}</ThemedText>
        </View>
    );
};

export default GigCard;

const styles = StyleSheet.create({
    gigContent: {
        flex: 1,
        padding: 12,
        justifyContent: "space-between",
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
        marginBottom: 8,
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
    gigPrice: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#4B7172",
    },
});
