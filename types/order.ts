export type Order = {
    _id?: string;
    clientID: string;
    freelancerID: string;
    gigID?: string; // Optional now, since you’re returning full gig object instead
    selectedPackageType?: "basic" | "standard" | "premium";
    status?: "pending" | "completed" | "cancelled";
    createdAt?: string | Date;
    deliveryTime?: string | Date;
    gig?: {
        title: string;
        description: string;
        category: string;
        tags: string[];
        images: string[];
        rating: number;
        minPrice: number;
        selectedPackage: {
            type: "basic" | "standard" | "premium";
            description: string;
            price: number;
            deliveryTime: number;
            numberOfRevisions: number;
            featuresIncluded: string[];
        };
    };
};

export type OrderStatus = 'pending' | 'completed' | 'cancelled';
