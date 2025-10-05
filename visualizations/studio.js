// Audio Studio Visualization
import { Colors } from '../utils/colors.js';

export class StudioVisualization {
    constructor(canvasManager) {
        this.canvas = canvasManager.getCanvas('studioCanvas');
    }

    draw(audioLevel = 0, frequencyData = null) {
        this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!frequencyData) return;
        
        const numBars = 8;
        const barWidth = this.canvas.width / numBars;
        const maxHeight = this.canvas.height - 40;
        
        for (let i = 0; i < numBars; i++) {
            const x = i * barWidth;
            const startFreq = Math.floor((i / numBars) * frequencyData.length);
            const endFreq = Math.floor(((i + 1) / numBars) * frequencyData.length);
            
            let barIntensity = 0;
            for (let j = startFreq; j < endFreq; j++) {
                barIntensity += frequencyData[j];
            }
            barIntensity = (barIntensity / (endFreq - startFreq)) / 255;
            
            const barHeight = 20 + barIntensity * maxHeight;
            const y = this.canvas.height - barHeight;
            
            // Green bars
            this.canvas.ctx.fillStyle = `hsl(120, 70%, ${50 + barIntensity * 30}%)`;
            this.canvas.ctx.fillRect(x, y, barWidth - 2, barHeight);
            
            // Add border
            this.canvas.ctx.strokeStyle = `hsl(0, 0%, ${20 + barIntensity * 20}%)`;
            this.canvas.ctx.lineWidth = 1;
            this.canvas.ctx.strokeRect(x, y, barWidth - 2, barHeight);
        }
        
        // Add frequency labels
        this.canvas.ctx.fillStyle = Colors.WHITE;
        this.canvas.ctx.font = '10px Arial';
        this.canvas.ctx.textAlign = 'center';
        
        const frequencies = ['20Hz', '100Hz', '500Hz', '1kHz', '2kHz', '4kHz', '8kHz', '16kHz'];
        for (let i = 0; i < numBars; i++) {
            const x = (i + 0.5) * barWidth;
            this.canvas.ctx.fillText(frequencies[i], x, this.canvas.height - 5);
        }
        
        // Draw title
        this.canvas.ctx.fillStyle = '#ffffff';
        this.canvas.ctx.font = '14px monospace';
        this.canvas.ctx.textAlign = 'center';
        this.canvas.ctx.fillText('AUDIO STUDIO', this.canvas.width / 2, 20);
    }

    drawStatic() {
        this.draw(0, null);
    }
}
