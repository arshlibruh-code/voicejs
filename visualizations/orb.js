// Audio Reactive Orb Visualization
import { Colors } from '../utils/colors.js';

export class OrbVisualization {
    constructor(canvasManager) {
        this.canvas = canvasManager.getCanvas('canvas');
        this.centerX = 0;
        this.centerY = 0;
        this.baseRadius = 60;
        this.currentRadius = this.baseRadius;
        this.hue = 180;
    }

    initialize() {
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
    }

    draw(audioLevel = 0) {
        this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Recalculate center position
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        
        // Calculate orb properties based on audio
        const radiusMultiplier = 1 + (audioLevel * 2);
        this.currentRadius = this.baseRadius * radiusMultiplier;
        
        // Change color based on audio level
        this.hue = (this.hue + audioLevel * 10) % 360;
        const saturation = 70 + (audioLevel * 30);
        const lightness = 50 + (audioLevel * 30);
        
        // Create gradient for the orb
        const gradient = this.canvas.ctx.createRadialGradient(
            this.centerX - this.currentRadius * 0.3,
            this.centerY - this.currentRadius * 0.3,
            0,
            this.centerX,
            this.centerY,
            this.currentRadius
        );
        
        gradient.addColorStop(0, `hsla(${this.hue}, ${saturation}%, ${lightness + 20}%, 0.9)`);
        gradient.addColorStop(0.7, `hsla(${this.hue}, ${saturation}%, ${lightness}%, 0.7)`);
        gradient.addColorStop(1, `hsla(${this.hue}, ${saturation}%, ${lightness - 20}%, 0.3)`);
        
        // Draw the main orb
        this.canvas.ctx.beginPath();
        this.canvas.ctx.arc(this.centerX, this.centerY, this.currentRadius, 0, Math.PI * 2);
        this.canvas.ctx.fillStyle = gradient;
        this.canvas.ctx.fill();
        
        // Add a glow effect
        this.canvas.ctx.shadowColor = `hsl(${this.hue}, ${saturation}%, ${lightness}%)`;
        this.canvas.ctx.shadowBlur = 20 + (audioLevel * 30);
        this.canvas.ctx.beginPath();
        this.canvas.ctx.arc(this.centerX, this.centerY, this.currentRadius, 0, Math.PI * 2);
        this.canvas.ctx.fill();
        this.canvas.ctx.shadowBlur = 0;
        
        // Add highlight
        const highlightGradient = this.canvas.ctx.createRadialGradient(
            this.centerX - this.currentRadius * 0.4,
            this.centerY - this.currentRadius * 0.4,
            0,
            this.centerX - this.currentRadius * 0.4,
            this.centerY - this.currentRadius * 0.4,
            this.currentRadius * 0.6
        );
        
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        this.canvas.ctx.beginPath();
        this.canvas.ctx.arc(
            this.centerX - this.currentRadius * 0.2,
            this.centerY - this.currentRadius * 0.2,
            this.currentRadius * 0.3,
            0,
            Math.PI * 2
        );
        this.canvas.ctx.fillStyle = highlightGradient;
        this.canvas.ctx.fill();
        
        // Draw title
        this.canvas.ctx.fillStyle = '#ffffff';
        this.canvas.ctx.font = '14px monospace';
        this.canvas.ctx.textAlign = 'center';
        this.canvas.ctx.fillText('AUDIO REACTIVE ORB', this.canvas.width / 2, 20);
    }

    drawStatic() {
        this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Recalculate center position
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        
        // Draw a grey, static orb when stopped
        const gradient = this.canvas.ctx.createRadialGradient(
            this.centerX - this.baseRadius * 0.3,
            this.centerY - this.baseRadius * 0.3,
            0,
            this.centerX,
            this.centerY,
            this.baseRadius
        );
        
        gradient.addColorStop(0, 'rgba(100, 100, 100, 0.6)');
        gradient.addColorStop(0.7, 'rgba(80, 80, 80, 0.4)');
        gradient.addColorStop(1, 'rgba(60, 60, 60, 0.2)');
        
        // Draw the main orb
        this.canvas.ctx.beginPath();
        this.canvas.ctx.arc(this.centerX, this.centerY, this.baseRadius, 0, Math.PI * 2);
        this.canvas.ctx.fillStyle = gradient;
        this.canvas.ctx.fill();
        
        // Add a subtle glow effect
        this.canvas.ctx.shadowColor = 'rgba(100, 100, 100, 0.3)';
        this.canvas.ctx.shadowBlur = 10;
        this.canvas.ctx.beginPath();
        this.canvas.ctx.arc(this.centerX, this.centerY, this.baseRadius, 0, Math.PI * 2);
        this.canvas.ctx.fill();
        this.canvas.ctx.shadowBlur = 0;
        
        // Add a subtle highlight
        const highlightGradient = this.canvas.ctx.createRadialGradient(
            this.centerX - this.baseRadius * 0.4,
            this.centerY - this.baseRadius * 0.4,
            0,
            this.centerX - this.baseRadius * 0.4,
            this.centerY - this.baseRadius * 0.4,
            this.baseRadius * 0.6
        );
        
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        this.canvas.ctx.beginPath();
        this.canvas.ctx.arc(
            this.centerX - this.baseRadius * 0.2,
            this.centerY - this.baseRadius * 0.2,
            this.baseRadius * 0.3,
            0,
            Math.PI * 2
        );
        this.canvas.ctx.fillStyle = highlightGradient;
        this.canvas.ctx.fill();
        
        // Draw title
        this.canvas.ctx.fillStyle = '#ffffff';
        this.canvas.ctx.font = '14px monospace';
        this.canvas.ctx.textAlign = 'center';
        this.canvas.ctx.fillText('AUDIO REACTIVE ORB', this.canvas.width / 2, 20);
    }
}
