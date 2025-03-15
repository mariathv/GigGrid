export type PackageType = 'basic' | 'standard' | 'premium';

export interface PackageData {
    type: string;
    title: string;
    description: string;
    price: number;
    deliveryTime: number;
    numberOfRevisions: number;
    featuresIncluded: string[];
}

export interface GigData {
    _id: string;
    title: string;
    description: string;
    category: string;
    tags: string[];
    basic: PackageData;
    standard: PackageData;
    premium: PackageData;
    orders: number;
    rating: number;
    isActive: boolean;
    createdAt: Date;
}
