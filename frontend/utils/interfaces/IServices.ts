export interface IServiceFeature {
    id: string;
    text: string;
}

export interface IServices {
    id: string;
    icon: string;
    name: string;
    description: string;
    examples: string;
    price_from: number;
    price_currency: string;
    deadline: string;
    features: IServiceFeature[];
}