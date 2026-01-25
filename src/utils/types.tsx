import { JSX } from "react/jsx-runtime";

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

//token  DTO
export type JWTUserPayload = {
    id: string;
    email: string;
};

export type JWTPayload = {
    id: number;
    email: string | null;
}

//User  DTO
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
    charityName?: string
}

export type UserDashbord = {
    id: number;
    email: string;
    name: string;
    phone: string;
    createdAt: string;
    charityName: string;
    role: string;
}

//Subscription DTO
type DomainType = 'SUBDOMAIN' | 'CUSTOM_DOMAIN';
type PaymentMethod = 'ONLINE' | 'BANK';
type State = 'DRAFT' | 'PROGRES' | 'DONE' | 'CANCEL';

export type CreateSubscriptionDTO = {
    fullName: string;
    email: string;
    phone: string;
    charityRegisterNo: string;
    licenseFile: string;
    domainType: DomainType;
    domainName?: string;
    paymentMethod: PaymentMethod;
    cardNumber?: string;
    cardHolderName?: string;
    cardExpiryDate?: string;
    cardCVV?: string;
    bankReceipt?: string;
    status?: State
};

export type SubscriptionDTO = CreateSubscriptionDTO & {
    id: number;
    userId: number;
    createdAt: string;
    updatedAt: string;
};

//redux DTO
export type UserState = {
    userInfo: UserDashbord | any;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
}

export type subscriptionState = {
    subscriptionInfo: SubscriptionDTO | any;
    loading: boolean;
    error: string | null;
}

export type PackageFeturesDto = {
    map(arg0: (feature: PackageFeturesDto) => JSX.Element): import("react").ReactNode;
    id: number,
    text: string
    packageId: number
}

export type PackageDTO = {
    id: number
    image: string
    name: string
    type: string
    description: string
    features: PackageFeturesDto
    createdAt: string
    updatedAt: string
}

export type ServiceTypeDto = {
    map(arg0: (content: ServiceTypeDto) => JSX.Element): import("react").ReactNode;
    id: number,
    name: string
    serviceId: number
}

export type ServiceDTO = {
    id: number
    image: string
    name: string
    description: string
    contents: ServiceTypeDto
    createdAt: string
    updatedAt: string
}