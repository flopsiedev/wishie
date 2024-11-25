interface Session {
    browser: string;
    os: string;
    deviceType: string;
    lastUsed: string | Date;
}

export interface PageData {
    authenticated: boolean;
    user?: { name: string };
    session: Session | null;
} 