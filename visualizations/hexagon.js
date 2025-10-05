// Hexagon Grid Visualization
import { Colors } from '../utils/colors.js';

export class HexagonVisualization {
    constructor(canvasManager) {
        this.canvas = canvasManager.getCanvas('hexCanvas');
    }

    draw(audioLevel = 0, frequencyData = null) {
        this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const hexSize = 6;
        const hexWidth = hexSize * 2;
        const hexHeight = hexSize * Math.sqrt(3);
        
        // Calculate proper grid dimensions to cover entire canvas
        const cols = Math.ceil(this.canvas.width / (hexSize * 1.5)) + 1;
        const rows = Math.ceil(this.canvas.height / hexHeight) + 1;
        
        // Create a clean hexagon grid with proper spacing
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = col * hexSize * 1.5 + (row % 2) * hexSize * 0.75;
                const y = row * hexHeight;
                
                // Calculate distance from center for radial effect
                const centerX = this.canvas.width / 2;
                const centerY = this.canvas.height / 2;
                const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
                const normalizedDistance = distance / maxDistance;
                
                // Create intensity based on audio and position (balanced sensitivity)
                const intensity = audioLevel * (1 - normalizedDistance * 0.5) * 0.6;
                
                if (intensity > 0.15) {
                    // Draw hexagon with clean edges
                    this.canvas.ctx.beginPath();
                    for (let i = 0; i < 6; i++) {
                        const angle = (Math.PI / 3) * i;
                        const hx = x + hexSize * Math.cos(angle);
                        const hy = y + hexSize * Math.sin(angle);
                        if (i === 0) this.canvas.ctx.moveTo(hx, hy);
                        else this.canvas.ctx.lineTo(hx, hy);
                    }
                    this.canvas.ctx.closePath();
                    
                    // Blue shades from light to dark based on position and intensity
                    const blueShade = 200 + (col / cols) * 80; // Light blue to dark blue
                    const lightness = 70 - (normalizedDistance * 40) + (intensity * 20);
                    
                    // Fill with blue shade
                    this.canvas.ctx.fillStyle = `hsl(210, 60%, ${lightness}%)`;
                    this.canvas.ctx.fill();
                    
                    // Add subtle border
                    this.canvas.ctx.strokeStyle = `hsl(210, 40%, ${lightness - 20}%)`;
                    this.canvas.ctx.lineWidth = 1;
                    this.canvas.ctx.stroke();
                }
            }
        }
        
        // Draw title
        this.canvas.ctx.fillStyle = '#ffffff';
        this.canvas.ctx.font = '14px monospace';
        this.canvas.ctx.textAlign = 'center';
        this.canvas.ctx.fillText('HEXAGON GRID', this.canvas.width / 2, 20);
    }

    drawStatic() {
        this.draw(0, null);
    }
}
