// Waveform Visualization
import { Colors } from '../utils/colors.js';

export class WaveformVisualization {
    constructor(canvasManager) {
        this.canvas = canvasManager.getCanvas('waveformCanvas');
    }

    draw(audioLevel = 0, frequencyData = null) {
        this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!frequencyData) {
            // Draw static waveform when no audio
            this.canvas.ctx.strokeStyle = Colors.GRAY;
            this.canvas.ctx.lineWidth = 2;
            this.canvas.ctx.beginPath();
            this.canvas.ctx.moveTo(0, this.canvas.height / 2);
            this.canvas.ctx.lineTo(this.canvas.width, this.canvas.height / 2);
            this.canvas.ctx.stroke();
            
            // Draw title
            this.canvas.ctx.fillStyle = '#ffffff';
            this.canvas.ctx.font = '14px monospace';
            this.canvas.ctx.textAlign = 'center';
            this.canvas.ctx.fillText('WAVEFORM', this.canvas.width / 2, 20);
            return;
        }
        
        // Draw waveform with radial gradient
        const barWidth = this.canvas.width / frequencyData.length;
        const centerY = this.canvas.height / 2;
        const centerX = this.canvas.width / 2;
        
        for (let i = 0; i < frequencyData.length; i++) {
            const barHeight = (frequencyData[i] / 255) * this.canvas.height * 0.8;
            const x = i * barWidth;
            
            // Create radial gradient from center to edges
            const gradient = this.canvas.ctx.createRadialGradient(
                centerX, centerY, 0,
                centerX, centerY, this.canvas.width / 2
            );
            gradient.addColorStop(0, Colors.GREEN_LIGHT);
            gradient.addColorStop(1, Colors.GREEN_DARK);
            
            this.canvas.ctx.fillStyle = gradient;
            this.canvas.ctx.fillRect(x, centerY - barHeight/2, barWidth - 1, barHeight);
        }
        
        // Draw title
        this.canvas.ctx.fillStyle = '#ffffff';
        this.canvas.ctx.font = '14px monospace';
        this.canvas.ctx.textAlign = 'center';
        this.canvas.ctx.fillText('WAVEFORM', this.canvas.width / 2, 20);
    }

    drawStatic() {
        this.draw(0, null);
    }
}
