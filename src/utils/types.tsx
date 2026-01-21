export type Program = {
    id: number;
    image: string;
    titleKey: string;
}
export type System = {
    id: number;
    titleKey: string;
}
export type CutomerPartner = {
    id: number;
    image: string;
}

export type Programs = {
    id: number,
    img: string,
    nameKey: string,
    descKey: string
}
export type RegisterUserDTO = {
    email: string,
    password: string,
    confirmPassword: string,
    name: string,
    phone: string,
    charityName: string
}
export type LoginUserDTO = {
    email: string,
    password: string
}
export type UpdateUserDTO = {
    email?: string,
    password?: string,
    name?: string,
    phone?: string,
    charityname?: string
}

export type JWTUserPayload = {
    id: string;
    email: string;
};

export type JWTPayload = {
    id: number;
    email: string | null;
}


export type UserDashbord = {   
    id: number;
    email: string;
    name: string;
    createdAt: string;
    charityName: string;
}

export type UserState = {
    userInfo: UserDashbord | any;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
}