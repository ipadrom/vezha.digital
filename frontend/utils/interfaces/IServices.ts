export interface IServiceExampleList {
    id: string;
    title: string;
    description: string;
    price_from: number;
    price_currency: string;
    deadline?:string;
    features?:IServiceFeature[];
    examples?: string;
}

export interface IServiceFeature {
    id: string;
    text: string;
}

export interface IServiceItems{
    id: string;
    title: string;
    description: string;
}

export interface IServices {
    id?: string;
    icon?: string;
    name?: string;
    description?: string;
    examples?: string;
    price_from?: number;
    price_currency?: string;
    deadline?: string;
    about?: string;
    features?: IServiceFeature[];
    items?: IServiceItems[];
    example_list?: IServiceExampleList[];
}