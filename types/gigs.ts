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
export interface advancedGigData {
    _id: string;
    title: string;
    description: string;
    category: string;
    tags: string[];
    basic: PackageData;
    standard: PackageData;
    premium: PackageData;
    images: string[];
    orders: number;
    rating: number;
    isActive: boolean;
    userID: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
    __v?: number; // optional field, only useful for MongoDB versioning
}