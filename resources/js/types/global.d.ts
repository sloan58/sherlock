declare global {
    const route: (name: string, params?: any, absolute?: boolean, config?: any) => string;
}
