// Fourier Series Visualization
import { Colors } from '../utils/colors.js';

export class FourierVisualization {
    constructor(canvasManager) {
        this.canvas = canvasManager.getCanvas('fourierCanvas');
        this.time = 0;
    }

    draw(audioLevel = 0, frequencyData = null) {
        this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const maxWidth = this.canvas.width - 40;
        const maxHeight = this.canvas.height - 40;
        
        // Audio controls wave building speed
        this.time += 0.02 + (audioLevel * 0.05);
        
        // Build wave from sine components across full width
        this.canvas.ctx.beginPath();
        
        for (let x = 20; x < this.canvas.width - 20; x += 2) {
            let yOffset = 0;
            
            // Add multiple sine waves (Fourier series)
            for (let harmonic = 1; harmonic <= 5; harmonic++) {
                const amplitude = (audioLevel * (maxHeight / 4)) / harmonic;
                const frequency = harmonic * 0.02;
                yOffset += amplitude * Math.sin(frequency * x + this.time);
            }
            
            const y = centerY + yOffset;
            
            if (x === 20) {
                this.canvas.ctx.moveTo(x, y);
            } else {
                this.canvas.ctx.lineTo(x, y);
            }
        }
        
        this.canvas.ctx.strokeStyle = Colors.BLUE;
        this.canvas.ctx.lineWidth = 2;
        this.canvas.ctx.stroke();
        
        // Draw title
        this.canvas.ctx.fillStyle = '#ffffff';
        this.canvas.ctx.font = '14px monospace';
        this.canvas.ctx.textAlign = 'center';
        this.canvas.ctx.fillText('FOURIER SERIES', this.canvas.width / 2, 20);
    }

    drawStatic() {
        this.draw(0, null);
    }
}
