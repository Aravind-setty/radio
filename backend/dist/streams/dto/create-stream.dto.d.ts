declare enum StreamType {
    EXTERNAL = "EXTERNAL",
    BROWSER = "BROWSER"
}
export declare class CreateStreamDto {
    title: string;
    genre?: string;
    description?: string;
    type?: StreamType;
}
export {};
