export interface UserPfp {
    filename: string;
    fileId: string;
}

export interface UserData {
    _id: string;
    email: string;
    name: string;
    userType: "Client" | "Freelancer";
    pfp?: UserPfp; // optional in case some users don't have a profile picture
    __v: number;
}
