// Pixel Grid Visualization
import { Colors } from '../utils/colors.js';

export class PixelVisualization {
    constructor(canvasManager) {
        this.canvas = canvasManager.getCanvas('pixelCanvas');
    }

    draw(audioLevel = 0, frequencyData = null) {
        this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const pixelWidth = 4;
        const pixelHeight = 8;
        const gap = 2;
        const cols = Math.floor(this.canvas.width / (pixelWidth + gap));
        const rows = Math.floor(this.canvas.height / (pixelHeight + gap));
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = col * (pixelWidth + gap);
                const y = row * (pixelHeight + gap);
                
                // Calculate distance from center for radial effect
                const centerX = this.canvas.width / 2;
                const centerY = this.canvas.height / 2;
                const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
                const normalizedDistance = distance / maxDistance;
                
                // Create intensity based on audio and position (balanced sensitivity)
                const intensity = audioLevel * (1 - normalizedDistance * 0.5) * 0.6;
                
                if (intensity > 0.15) {
                    const lightness = 70 - (normalizedDistance * 40) + (intensity * 20);
                    
                    // Draw pixel with green stroke
                    this.canvas.ctx.strokeStyle = `hsl(120, 70%, ${lightness}%)`;
                    this.canvas.ctx.lineWidth = 1;
                    this.canvas.ctx.strokeRect(x, y, pixelWidth, pixelHeight);
                }
            }
        }
        
        // Draw title
        this.canvas.ctx.fillStyle = '#ffffff';
        this.canvas.ctx.font = '14px monospace';
        this.canvas.ctx.textAlign = 'center';
        this.canvas.ctx.fillText('PIXEL GRID', this.canvas.width / 2, 20);
    }

    drawStatic() {
        this.draw(0, null);
    }
}
