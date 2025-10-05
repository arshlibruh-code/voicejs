// Professional Spectral Centroid Tracker - Brightness and Timbre Analysis
import { Colors } from '../utils/colors.js';

export class SpectralCentroidVisualization {
    constructor(canvasManager) {
        this.canvas = canvasManager.getCanvas('spectralCentroidCanvas');
        this.width = 0;
        this.height = 0;
        this.centroidHistory = [];
        this.maxHistory = 300;
        this.centroid = 0;
        this.brightness = 0;
        this.timbre = 0;
        this.centroidData = [];
        this.peakData = [];
        this.smoothingFactor = 0.8;
        this.peakHoldTime = 1000;
        this.lastPeakUpdate = 0;
    }

    initialize() {
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.centroidData = Array(this.maxHistory).fill(0);
        this.peakData = Array(this.maxHistory).fill(0);
    }

    draw(audioLevel = 0, frequencyData = null) {
        if (!frequencyData) return;

        this.width = this.canvas.width;
        this.height = this.canvas.height;

        // Clear canvas
        this.canvas.ctx.fillStyle = '#000000';
        this.canvas.ctx.fillRect(0, 0, this.width, this.height);

        // Process spectral centroid
        this.processSpectralCentroid(frequencyData);
        
        // Update history
        this.updateCentroidHistory();
        
        // Update peak data
        this.updatePeakData();
        
        // Draw grid
        this.drawGrid();
        
        // Draw centroid curve
        this.drawCentroidCurve();
        
        // Draw peak hold
        this.drawPeakHold();
        
        // Draw brightness indicator
        this.drawBrightnessIndicator();
        
        // Draw labels
        this.drawLabels();
    }

    processSpectralCentroid(frequencyData) {
        // Calculate spectral centroid
        let weightedSum = 0;
        let magnitudeSum = 0;
        
        for (let i = 0; i < frequencyData.length; i++) {
            const magnitude = frequencyData[i] / 255;
            const frequency = (i / frequencyData.length) * 22050; // Assume 44.1kHz sample rate
            
            weightedSum += frequency * magnitude;
            magnitudeSum += magnitude;
        }
        
        if (magnitudeSum > 0) {
            this.centroid = weightedSum / magnitudeSum;
        } else {
            this.centroid = 0;
        }
        
        // Calculate brightness (normalized centroid)
        this.brightness = Math.min(this.centroid / 11025, 1); // Normalize to 0-1
        
        // Calculate timbre (spectral rolloff)
        let rolloffSum = 0;
        for (let i = 0; i < frequencyData.length; i++) {
            const magnitude = frequencyData[i] / 255;
            rolloffSum += magnitude;
        }
        
        let cumulativeSum = 0;
        let rolloffIndex = 0;
        const rolloffThreshold = rolloffSum * 0.85; // 85% of total energy
        
        for (let i = 0; i < frequencyData.length; i++) {
            cumulativeSum += frequencyData[i] / 255;
            if (cumulativeSum >= rolloffThreshold) {
                rolloffIndex = i;
                break;
            }
        }
        
        this.timbre = (rolloffIndex / frequencyData.length) * 22050;
    }

    updateCentroidHistory() {
        this.centroidData.push(this.centroid);
        if (this.centroidData.length > this.maxHistory) {
            this.centroidData.shift();
        }
    }

    updatePeakData() {
        const now = Date.now();
        if (now - this.lastPeakUpdate > 16) {
            if (this.centroid > this.peakData[this.peakData.length - 1]) {
                this.peakData.push(this.centroid);
            } else {
                this.peakData.push(this.peakData[this.peakData.length - 1] * 0.95);
            }
            
            if (this.peakData.length > this.maxHistory) {
                this.peakData.shift();
            }
            this.lastPeakUpdate = now;
        }
    }

    drawGrid() {
        this.canvas.ctx.strokeStyle = '#333333';
        this.canvas.ctx.lineWidth = 0.5;
        
        // Horizontal grid lines (frequency scale)
        for (let freq = 0; freq <= 22050; freq += 2205) {
            const y = this.height - (freq / 22050) * this.height;
            this.canvas.ctx.beginPath();
            this.canvas.ctx.moveTo(0, y);
            this.canvas.ctx.lineTo(this.width, y);
            this.canvas.ctx.stroke();
        }
        
        // Vertical grid lines (time)
        for (let i = 0; i <= 10; i++) {
            const x = (i / 10) * this.width;
            this.canvas.ctx.beginPath();
            this.canvas.ctx.moveTo(x, 0);
            this.canvas.ctx.lineTo(x, this.height);
            this.canvas.ctx.stroke();
        }
    }

    drawCentroidCurve() {
        // Draw main centroid curve
        this.canvas.ctx.strokeStyle = '#00ff00';
        this.canvas.ctx.lineWidth = 2;
        this.canvas.ctx.beginPath();
        
        for (let i = 0; i < this.centroidData.length; i++) {
            const x = (i / (this.centroidData.length - 1)) * this.width;
            const centroid = this.centroidData[i];
            const y = this.height - (centroid / 22050) * this.height;
            
            if (i === 0) {
                this.canvas.ctx.moveTo(x, y);
            } else {
                this.canvas.ctx.lineTo(x, y);
            }
        }
        this.canvas.ctx.stroke();
        
        // Draw filled area
        this.canvas.ctx.lineTo(this.width, this.height);
        this.canvas.ctx.lineTo(0, this.height);
        this.canvas.ctx.closePath();
        
        const gradient = this.canvas.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, 'rgba(0, 255, 0, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 255, 0, 0.05)');
        this.canvas.ctx.fillStyle = gradient;
        this.canvas.ctx.fill();
    }

    drawPeakHold() {
        // Draw peak hold lines
        this.canvas.ctx.strokeStyle = '#ff4444';
        this.canvas.ctx.lineWidth = 1;
        this.canvas.ctx.setLineDash([3, 3]);
        
        this.canvas.ctx.beginPath();
        for (let i = 0; i < this.peakData.length; i++) {
            const x = (i / (this.peakData.length - 1)) * this.width;
            const centroid = this.peakData[i];
            const y = this.height - (centroid / 22050) * this.height;
            
            if (i === 0) {
                this.canvas.ctx.moveTo(x, y);
            } else {
                this.canvas.ctx.lineTo(x, y);
            }
        }
        this.canvas.ctx.stroke();
        this.canvas.ctx.setLineDash([]);
    }

    drawBrightnessIndicator() {
        const indicatorWidth = 100;
        const indicatorHeight = 20;
        const indicatorX = this.width - indicatorWidth - 10;
        const indicatorY = 10;
        
        // Background
        this.canvas.ctx.fillStyle = '#222222';
        this.canvas.ctx.fillRect(indicatorX, indicatorY, indicatorWidth, indicatorHeight);
        
        // Brightness bar
        const brightnessWidth = this.brightness * indicatorWidth;
        const brightnessColor = this.brightness > 0.5 ? '#ffff00' : '#00ff00';
        
        this.canvas.ctx.fillStyle = brightnessColor;
        this.canvas.ctx.fillRect(indicatorX, indicatorY, brightnessWidth, indicatorHeight);
        
        // Brightness value
        this.canvas.ctx.fillStyle = '#ffffff';
        this.canvas.ctx.font = '10px monospace';
        this.canvas.ctx.textAlign = 'center';
        this.canvas.ctx.fillText(`${(this.brightness * 100).toFixed(1)}%`, 
                                 indicatorX + indicatorWidth / 2, indicatorY + indicatorHeight + 15);
    }

    drawLabels() {
        this.canvas.ctx.fillStyle = '#ffffff';
        this.canvas.ctx.font = '14px monospace';
        this.canvas.ctx.textAlign = 'center';
        this.canvas.ctx.fillText('SPECTRAL CENTROID TRACKER', this.width / 2, 20);
        
        // Current centroid value
        this.canvas.ctx.fillStyle = '#00ff00';
        this.canvas.ctx.font = '12px monospace';
        this.canvas.ctx.fillText(`${this.centroid.toFixed(1)} Hz`, this.width / 2, 40);
        
        // Frequency scale labels
        this.canvas.ctx.fillStyle = '#888888';
        this.canvas.ctx.font = '10px monospace';
        this.canvas.ctx.textAlign = 'right';
        
        const frequencyLabels = [0, 2205, 4410, 6615, 8820, 11025, 13230, 15435, 17640, 19845, 22050];
        frequencyLabels.forEach(freq => {
            const y = this.height - (freq / 22050) * this.height;
            this.canvas.ctx.fillText(`${(freq / 1000).toFixed(1)}k`, 5, y + 3);
        });
        
        // Timbre value
        this.canvas.ctx.fillStyle = '#0088ff';
        this.canvas.ctx.font = '10px monospace';
        this.canvas.ctx.textAlign = 'left';
        this.canvas.ctx.fillText(`Timbre: ${this.timbre.toFixed(1)} Hz`, 10, this.height - 30);
        
        // Brightness value
        this.canvas.ctx.fillStyle = '#ffff00';
        this.canvas.ctx.fillText(`Brightness: ${(this.brightness * 100).toFixed(1)}%`, 10, this.height - 15);
    }

    drawStatic() {
        this.canvas.ctx.fillStyle = '#000000';
        this.canvas.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawGrid();
        this.drawLabels();
        
        // Draw a flat line at 0 Hz
        this.canvas.ctx.strokeStyle = '#333333';
        this.canvas.ctx.lineWidth = 2;
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(0, this.canvas.height);
        this.canvas.ctx.lineTo(this.canvas.width, this.canvas.height);
        this.canvas.ctx.stroke();
    }
}
