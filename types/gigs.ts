export type PackageType = 'basic' | 'standard' | 'premium';

export interface PackageData {
    title: string;
    description: string;
    price: number;
    deliveryTime: number;
    numberOfRevisions: number;
    featuresIncluded: string[];
}

export interface GigData {
    title: string;
    description: string;
    category: string;
    tags: string[];
    basic: PackageData;
    standard: PackageData;
    premium: PackageData;
}
