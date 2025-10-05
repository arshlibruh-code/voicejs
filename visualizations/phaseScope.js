// Professional Phase Scope for Stereo Analysis
import { Colors } from '../utils/colors.js';

export class PhaseScopeVisualization {
    constructor(canvasManager) {
        this.canvas = canvasManager.getCanvas('phaseScopeCanvas');
        this.width = 0;
        this.height = 0;
        this.centerX = 0;
        this.centerY = 0;
        this.radius = 0;
        this.points = [];
        this.maxPoints = 1000;
        this.fadeTime = 2000; // 2 seconds fade
        this.pointSize = 2;
    }

    initialize() {
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.radius = Math.min(this.width, this.height) / 2 - 20;
        this.points = [];
    }

    draw(audioLevel = 0, frequencyData = null) {
        if (!frequencyData) return;

        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.radius = Math.min(this.width, this.height) / 2 - 20;

        // Clear canvas with dark background
        this.canvas.ctx.fillStyle = '#000000';
        this.canvas.ctx.fillRect(0, 0, this.width, this.height);

        // Add new points based on audio data
        this.addPoints(frequencyData);
        
        // Update existing points
        this.updatePoints();
        
        // Draw grid
        this.drawGrid();
        
        // Draw points
        this.drawPoints();
        
        // Draw labels
        this.drawLabels();
    }

    addPoints(frequencyData) {
        // Create stereo-like data from frequency analysis
        const leftChannel = [];
        const rightChannel = [];
        
        // Split frequency data into left and right channels
        const midPoint = Math.floor(frequencyData.length / 2);
        
        for (let i = 0; i < midPoint; i++) {
            leftChannel.push(frequencyData[i] / 255);
            rightChannel.push(frequencyData[i + midPoint] / 255);
        }
        
        // Add multiple points for smooth visualization
        for (let i = 0; i < 10; i++) {
            const index = Math.floor(Math.random() * leftChannel.length);
            const left = leftChannel[index] * 2 - 1; // Convert to -1 to 1 range
            const right = rightChannel[index] * 2 - 1;
            
            this.points.push({
                x: left * this.radius,
                y: right * this.radius,
                age: 0,
                intensity: Math.random() * 0.8 + 0.2,
                color: this.getColorFromPosition(left, right)
            });
        }
        
        // Limit number of points
        if (this.points.length > this.maxPoints) {
            this.points = this.points.slice(-this.maxPoints);
        }
    }

    updatePoints() {
        const now = Date.now();
        this.points = this.points.filter(point => {
            point.age += 16; // Assume 60fps
            return point.age < this.fadeTime;
        });
    }

    getColorFromPosition(x, y) {
        // Color based on position in the phase scope
        const angle = Math.atan2(y, x);
        const distance = Math.sqrt(x * x + y * y);
        
        // Convert angle to hue (0-360)
        let hue = (angle + Math.PI) * 180 / Math.PI;
        
        // Adjust saturation based on distance from center
        const saturation = Math.min(distance * 2, 100);
        
        // Brightness based on intensity
        const lightness = 50 + (distance * 25);
        
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }

    drawGrid() {
        this.canvas.ctx.strokeStyle = '#333333';
        this.canvas.ctx.lineWidth = 0.5;
        
        // Draw circular grid
        for (let i = 1; i <= 4; i++) {
            const radius = (this.radius / 4) * i;
            this.canvas.ctx.beginPath();
            this.canvas.ctx.arc(this.centerX, this.centerY, radius, 0, Math.PI * 2);
            this.canvas.ctx.stroke();
        }
        
        // Draw crosshairs
        this.canvas.ctx.strokeStyle = '#666666';
        this.canvas.ctx.lineWidth = 1;
        
        // Horizontal line
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(this.centerX - this.radius, this.centerY);
        this.canvas.ctx.lineTo(this.centerX + this.radius, this.centerY);
        this.canvas.ctx.stroke();
        
        // Vertical line
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(this.centerX, this.centerY - this.radius);
        this.canvas.ctx.lineTo(this.centerX, this.centerY + this.radius);
        this.canvas.ctx.stroke();
        
        // Diagonal lines
        this.canvas.ctx.strokeStyle = '#444444';
        this.canvas.ctx.lineWidth = 0.5;
        
        // 45 degree lines
        const diagonal = this.radius * 0.707; // cos(45°) = sin(45°) = 0.707
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(this.centerX - diagonal, this.centerY - diagonal);
        this.canvas.ctx.lineTo(this.centerX + diagonal, this.centerY + diagonal);
        this.canvas.ctx.stroke();
        
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(this.centerX + diagonal, this.centerY - diagonal);
        this.canvas.ctx.lineTo(this.centerX - diagonal, this.centerY + diagonal);
        this.canvas.ctx.stroke();
    }

    drawPoints() {
        for (const point of this.points) {
            const alpha = 1 - (point.age / this.fadeTime);
            const size = this.pointSize * alpha * point.intensity;
            
            this.canvas.ctx.fillStyle = point.color;
            this.canvas.ctx.globalAlpha = alpha;
            
            this.canvas.ctx.beginPath();
            this.canvas.ctx.arc(
                this.centerX + point.x,
                this.centerY + point.y,
                size,
                0,
                Math.PI * 2
            );
            this.canvas.ctx.fill();
        }
        
        this.canvas.ctx.globalAlpha = 1;
    }

    drawLabels() {
        this.canvas.ctx.fillStyle = '#888888';
        this.canvas.ctx.font = '10px monospace';
        this.canvas.ctx.textAlign = 'center';
        
        // Channel labels
        this.canvas.ctx.fillText('L', this.centerX - this.radius - 15, this.centerY + 3);
        this.canvas.ctx.fillText('R', this.centerX + this.radius + 15, this.centerY + 3);
        this.canvas.ctx.fillText('L', this.centerX - 3, this.centerY - this.radius - 5);
        this.canvas.ctx.fillText('R', this.centerX - 3, this.centerY + this.radius + 15);
        
        // Title
        this.canvas.ctx.fillStyle = '#ffffff';
        this.canvas.ctx.font = '12px monospace';
        this.canvas.ctx.fillText('PHASE SCOPE', this.centerX, 15);
        
        // Center label
        this.canvas.ctx.fillStyle = '#666666';
        this.canvas.ctx.font = '8px monospace';
        this.canvas.ctx.fillText('MONO', this.centerX, this.centerY + 3);
    }

    drawStatic() {
        this.canvas.ctx.fillStyle = '#000000';
        this.canvas.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw static grid
        this.drawGrid();
        this.drawLabels();
        
        // Draw a single point in the center
        this.canvas.ctx.fillStyle = '#333333';
        this.canvas.ctx.beginPath();
        this.canvas.ctx.arc(this.centerX, this.centerY, 2, 0, Math.PI * 2);
        this.canvas.ctx.fill();
    }
}
