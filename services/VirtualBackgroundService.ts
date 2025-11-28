import { SelfieSegmentation } from '@mediapipe/selfie_segmentation';

export type VirtualBackgroundType = 'none' | 'blur' | 'image';

export class VirtualBackgroundService {
    private selfieSegmentation: SelfieSegmentation | null = null;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private activeStream: MediaStream | null = null;
    private processedStream: MediaStream | null = null;
    private animationFrameId: number | null = null;
    private videoElement: HTMLVideoElement;

    private currentType: VirtualBackgroundType = 'none';
    private currentImage: HTMLImageElement | null = null;

    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d')!;
        this.videoElement = document.createElement('video');
        this.videoElement.autoplay = true;
        this.videoElement.playsInline = true;
    }

    async initialize() {
        if (this.selfieSegmentation) return;

        this.selfieSegmentation = new SelfieSegmentation({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
            }
        });

        this.selfieSegmentation.setOptions({
            modelSelection: 0, // 0: general (faster), 1: landscape (slower but more accurate)
        });

        this.selfieSegmentation.onResults(this.onResults.bind(this));
    }

    async start(stream: MediaStream) {
        await this.initialize();

        this.activeStream = stream;
        this.videoElement.srcObject = stream;
        await this.videoElement.play();

        // Cap resolution for performance
        const MAX_WIDTH = 640;
        const ratio = this.videoElement.videoWidth / this.videoElement.videoHeight;

        if (this.videoElement.videoWidth > MAX_WIDTH) {
            this.canvas.width = MAX_WIDTH;
            this.canvas.height = MAX_WIDTH / ratio;
        } else {
            this.canvas.width = this.videoElement.videoWidth;
            this.canvas.height = this.videoElement.videoHeight;
        }

        this.processedStream = this.canvas.captureStream(30);

        this.processFrame();
        return this.processedStream;
    }

    stop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        if (this.activeStream) {
            this.activeStream = null;
        }
        this.videoElement.srcObject = null;
        this.currentType = 'none';
    }

    setBackground(type: VirtualBackgroundType, imageUrl?: string) {
        this.currentType = type;
        if (type === 'image' && imageUrl) {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.src = imageUrl;
            img.onload = () => {
                this.currentImage = img;
            };
        } else {
            this.currentImage = null;
        }
    }

    private async processFrame() {
        if (!this.activeStream || !this.selfieSegmentation) return;

        if (this.currentType === 'none') {
            // Just draw the video directly
            this.ctx.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            // Send to MediaPipe
            await this.selfieSegmentation.send({ image: this.videoElement });
        }

        this.animationFrameId = requestAnimationFrame(this.processFrame.bind(this));
    }

    private onResults(results: any) {
        this.ctx.save();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw segmentation mask
        this.ctx.drawImage(results.segmentationMask, 0, 0, this.canvas.width, this.canvas.height);

        // Source composite operation
        this.ctx.globalCompositeOperation = 'source-in';
        this.ctx.drawImage(results.image, 0, 0, this.canvas.width, this.canvas.height);

        // Destination composite operation (Background)
        this.ctx.globalCompositeOperation = 'destination-over';

        if (this.currentType === 'blur') {
            this.ctx.filter = 'blur(8px)';
            this.ctx.drawImage(results.image, 0, 0, this.canvas.width, this.canvas.height);
            this.ctx.filter = 'none';
        } else if (this.currentType === 'image' && this.currentImage) {
            // Maintain aspect ratio of background image
            const scale = Math.max(
                this.canvas.width / this.currentImage.width,
                this.canvas.height / this.currentImage.height
            );
            const x = (this.canvas.width - this.currentImage.width * scale) / 2;
            const y = (this.canvas.height - this.currentImage.height * scale) / 2;

            this.ctx.drawImage(
                this.currentImage,
                x, y,
                this.currentImage.width * scale,
                this.currentImage.height * scale
            );
        } else {
            this.ctx.drawImage(results.image, 0, 0, this.canvas.width, this.canvas.height);
        }

        this.ctx.restore();
    }
}

export const virtualBackgroundService = new VirtualBackgroundService();
