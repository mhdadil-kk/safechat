/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SIGNALING_SERVER_URL: string;
    readonly VITE_STUN_SERVER: string;
    readonly GEMINI_API_KEY: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
