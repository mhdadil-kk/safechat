type Listener = (...args: any[]) => void;

export class EventEmitter {
    private listeners: Map<string, Listener[]> = new Map();

    on(event: string, callback: Listener) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)?.push(callback);
    }

    off(event: string, callback: Listener) {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            this.listeners.set(event, eventListeners.filter(l => l !== callback));
        }
    }

    emit(event: string, ...args: any[]) {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.forEach(cb => cb(...args));
        }
    }

    removeAllListeners() {
        this.listeners.clear();
    }
}
