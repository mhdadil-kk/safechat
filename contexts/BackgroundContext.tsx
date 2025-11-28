import React, { createContext, useContext, useState, useEffect } from 'react';

export type BackgroundType = 'gradient' | 'image';

export interface BackgroundOption {
    id: string;
    type: BackgroundType;
    value: string; // CSS value (e.g., "linear-gradient(...)" or "url(...)")
    label: string;
    thumbnail?: string;
}

export const BACKGROUND_PRESETS: BackgroundOption[] = [
    {
        id: 'default',
        type: 'gradient',
        value: 'linear-gradient(to bottom right, #000000, #1a1a2e)',
        label: 'Default Dark',
        thumbnail: 'linear-gradient(to bottom right, #000000, #1a1a2e)'
    },
    {
        id: 'purple-haze',
        type: 'gradient',
        value: 'linear-gradient(to bottom right, #2d1b4e, #000000)',
        label: 'Purple Haze',
        thumbnail: 'linear-gradient(to bottom right, #2d1b4e, #000000)'
    },
    {
        id: 'midnight-blue',
        type: 'gradient',
        value: 'linear-gradient(to bottom right, #0f172a, #1e3a8a)',
        label: 'Midnight Blue',
        thumbnail: 'linear-gradient(to bottom right, #0f172a, #1e3a8a)'
    },
    {
        id: 'forest',
        type: 'image',
        value: 'url("https://images.unsplash.com/photo-1448375240586-dfd8d395ea6c?q=80&w=2070&auto=format&fit=crop")',
        label: 'Forest',
        thumbnail: 'https://images.unsplash.com/photo-1448375240586-dfd8d395ea6c?q=80&w=200&auto=format&fit=crop'
    },
    {
        id: 'city-lights',
        type: 'image',
        value: 'url("https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=2064&auto=format&fit=crop")',
        label: 'City Lights',
        thumbnail: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=200&auto=format&fit=crop'
    },
    {
        id: 'lofi-room',
        type: 'image',
        value: 'url("https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop")',
        label: 'Lo-Fi Room',
        thumbnail: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=200&auto=format&fit=crop'
    }
];

interface BackgroundContextType {
    currentBackground: BackgroundOption;
    setBackground: (bg: BackgroundOption) => void;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

export const BackgroundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentBackground, setCurrentBackground] = useState<BackgroundOption>(() => {
        const saved = localStorage.getItem('viso_background');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Validate if the saved background still exists in presets or is valid
                return BACKGROUND_PRESETS.find(p => p.id === parsed.id) || parsed;
            } catch (e) {
                return BACKGROUND_PRESETS[0];
            }
        }
        return BACKGROUND_PRESETS[0];
    });

    useEffect(() => {
        localStorage.setItem('viso_background', JSON.stringify(currentBackground));

        // Apply background to body or a global wrapper
        // We'll use a CSS variable to make it easy to use anywhere
        document.documentElement.style.setProperty('--app-background', currentBackground.value);

        // Also set background-size/position for images
        if (currentBackground.type === 'image') {
            document.documentElement.style.setProperty('--app-bg-size', 'cover');
            document.documentElement.style.setProperty('--app-bg-position', 'center');
            document.documentElement.style.setProperty('--app-bg-repeat', 'no-repeat');
        } else {
            document.documentElement.style.setProperty('--app-bg-size', 'auto');
            document.documentElement.style.setProperty('--app-bg-position', 'initial');
            document.documentElement.style.setProperty('--app-bg-repeat', 'initial');
        }

    }, [currentBackground]);

    return (
        <BackgroundContext.Provider value={{ currentBackground, setBackground: setCurrentBackground }}>
            {children}
        </BackgroundContext.Provider>
    );
};

export const useBackground = () => {
    const context = useContext(BackgroundContext);
    if (context === undefined) {
        throw new Error('useBackground must be used within a BackgroundProvider');
    }
    return context;
};
