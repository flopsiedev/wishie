type DeviceInfo = {
    browser: string;
    os: string;
    deviceType: string;
    userAgent: string;
};

export function getDeviceInfo(userAgent: string): DeviceInfo {
    const ua = userAgent.toLowerCase();
    
    const browsers = {
        firefox: 'Firefox',
        chrome: 'Chrome',
        safari: 'Safari',
        edge: 'Edge'
    };

    const systems = {
        windows: 'Windows',
        'mac os': 'macOS',
        linux: 'Linux',
        android: 'Android',
        iphone: 'iOS',
        ipad: 'iOS'
    };

    const browser = Object.entries(browsers).find(([key]) => ua.includes(key))?.[1] ?? 'Unknown';
    const os = Object.entries(systems).find(([key]) => ua.includes(key))?.[1] ?? 'Unknown';
    const deviceType = ua.includes('mobile') ? 'Mobile' : ua.includes('tablet') ? 'Tablet' : 'Desktop';

    return { browser, os, deviceType, userAgent };
} 