// Professional Dynamic Range Meter - Loudness and Dynamics Analysis
import { Colors } from '../utils/colors.js';

export class DynamicRangeVisualization {
    constructor(canvasManager) {
        this.canvas = canvasManager.getCanvas('dynamicRangeCanvas');
        this.width = 0;
        this.height = 0;
        this.loudnessHistory = [];
        this.maxHistory = 300;
        this.currentLoudness = 0;
        this.peakLoudness = 0;
        this.dynamicRange = 0;
        this.lufsData = [];
        this.peakData = [];
        this.smoothingFactor = 0.8;
        this.peakHoldTime = 1000;
        this.lastPeakUpdate = 0;
        this.loudnessWindow = 100; // 100ms window
    }

    initialize() {
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.lufsData = Array(this.maxHistory).fill(0);
        this.peakData = Array(this.maxHistory).fill(0);
    }

    draw(audioLevel = 0, frequencyData = null) {
        if (!frequencyData) return;

        this.width = this.canvas.width;
        this.height = this.canvas.height;

        // Clear canvas
        this.canvas.ctx.fillStyle = '#000000';
        this.canvas.ctx.fillRect(0, 0, this.width, this.height);

        // Process dynamic range
        this.processDynamicRange(frequencyData);
        
        // Update history
        this.updateLoudnessHistory();
        
        // Update peak data
        this.updatePeakData();
        
        // Draw grid
        this.drawGrid();
        
        // Draw loudness curve
        this.drawLoudnessCurve();
        
        // Draw peak hold
        this.drawPeakHold();
        
        // Draw dynamic range indicator
        this.drawDynamicRangeIndicator();
        
        // Draw labels
        this.drawLabels();
    }

    processDynamicRange(frequencyData) {
        // Calculate RMS loudness
        let sum = 0;
        for (let i = 0; i < frequencyData.length; i++) {
            const sample = frequencyData[i] / 255;
            sum += sample * sample;
        }
        
        const rms = Math.sqrt(sum / frequencyData.length);
        
        // Convert to LUFS (Loudness Units relative to Full Scale)
        // Simplified LUFS calculation
        const lufs = 20 * Math.log10(rms + 0.001);
        
        // Apply smoothing
        this.currentLoudness = this.currentLoudness * this.smoothingFactor + lufs * (1 - this.smoothingFactor);
        
        // Calculate dynamic range
        if (this.loudnessHistory.length > 0) {
            const maxLoudness = Math.max(...this.loudnessHistory);
            const minLoudness = Math.min(...this.loudnessHistory);
            this.dynamicRange = maxLoudness - minLoudness;
        }
    }

    updateLoudnessHistory() {
        this.lufsData.push(this.currentLoudness);
        if (this.lufsData.length > this.maxHistory) {
            this.lufsData.shift();
        }
    }

    updatePeakData() {
        const now = Date.now();
        if (now - this.lastPeakUpdate > 16) {
            if (this.currentLoudness > this.peakData[this.peakData.length - 1]) {
                this.peakData.push(this.currentLoudness);
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
        
        // Horizontal grid lines (LUFS scale)
        for (let lufs = -60; lufs <= 0; lufs += 10) {
            const y = this.height - ((lufs + 60) / 60) * this.height;
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

    drawLoudnessCurve() {
        // Draw main loudness curve
        this.canvas.ctx.strokeStyle = '#00ff00';
        this.canvas.ctx.lineWidth = 2;
        this.canvas.ctx.beginPath();
        
        for (let i = 0; i < this.lufsData.length; i++) {
            const x = (i / (this.lufsData.length - 1)) * this.width;
            const lufs = this.lufsData[i];
            const y = this.height - ((lufs + 60) / 60) * this.height;
            
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
            const lufs = this.peakData[i];
            const y = this.height - ((lufs + 60) / 60) * this.height;
            
            if (i === 0) {
                this.canvas.ctx.moveTo(x, y);
            } else {
                this.canvas.ctx.lineTo(x, y);
            }
        }
        this.canvas.ctx.stroke();
        this.canvas.ctx.setLineDash([]);
    }

    drawDynamicRangeIndicator() {
        const indicatorWidth = 150;
        const indicatorHeight = 30;
        const indicatorX = this.width - indicatorWidth - 10;
        const indicatorY = 10;
        
        // Background
        this.canvas.ctx.fillStyle = '#222222';
        this.canvas.ctx.fillRect(indicatorX, indicatorY, indicatorWidth, indicatorHeight);
        
        // Dynamic range bar
        const rangeRatio = Math.min(this.dynamicRange / 60, 1); // Normalize to 60dB max
        const rangeWidth = rangeRatio * indicatorWidth;
        
        let rangeColor;
        if (this.dynamicRange > 40) {
            rangeColor = '#00ff00'; // Good dynamic range
        } else if (this.dynamicRange > 20) {
            rangeColor = '#ffff00'; // Moderate dynamic range
        } else {
            rangeColor = '#ff0000'; // Poor dynamic range
        }
        
        this.canvas.ctx.fillStyle = rangeColor;
        this.canvas.ctx.fillRect(indicatorX, indicatorY, rangeWidth, indicatorHeight);
        
        // Dynamic range value
        this.canvas.ctx.fillStyle = '#ffffff';
        this.canvas.ctx.font = '10px monospace';
        this.canvas.ctx.textAlign = 'center';
        this.canvas.ctx.fillText(`${this.dynamicRange.toFixed(1)} dB`, 
                                 indicatorX + indicatorWidth / 2, indicatorY + indicatorHeight + 15);
    }

    drawLabels() {
        this.canvas.ctx.fillStyle = '#ffffff';
        this.canvas.ctx.font = '14px monospace';
        this.canvas.ctx.textAlign = 'center';
        this.canvas.ctx.fillText('DYNAMIC RANGE METER', this.width / 2, 20);
        
        // Current loudness value
        this.canvas.ctx.fillStyle = '#00ff00';
        this.canvas.ctx.font = '12px monospace';
        this.canvas.ctx.fillText(`${this.currentLoudness.toFixed(1)} LUFS`, this.width / 2, 40);
        
        // LUFS scale labels
        this.canvas.ctx.fillStyle = '#888888';
        this.canvas.ctx.font = '10px monospace';
        this.canvas.ctx.textAlign = 'right';
        
        for (let lufs = -60; lufs <= 0; lufs += 20) {
            const y = this.height - ((lufs + 60) / 60) * this.height;
            this.canvas.ctx.fillText(`${lufs}`, 5, y + 3);
        }
        
        // Dynamic range value
        this.canvas.ctx.fillStyle = '#0088ff';
        this.canvas.ctx.font = '10px monospace';
        this.canvas.ctx.textAlign = 'left';
        this.canvas.ctx.fillText(`Range: ${this.dynamicRange.toFixed(1)} dB`, 10, this.height - 30);
        
        // Quality indicator
        let quality;
        if (this.dynamicRange > 40) {
            quality = 'Excellent';
        } else if (this.dynamicRange > 20) {
            quality = 'Good';
        } else if (this.dynamicRange > 10) {
            quality = 'Fair';
        } else {
            quality = 'Poor';
        }
        
        this.canvas.ctx.fillStyle = '#ffff00';
        this.canvas.ctx.fillText(`Quality: ${quality}`, 10, this.height - 15);
    }

    drawStatic() {
        this.canvas.ctx.fillStyle = '#000000';
        this.canvas.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawGrid();
        this.drawLabels();
        
        // Draw a flat line at -60 LUFS
        this.canvas.ctx.strokeStyle = '#333333';
        this.canvas.ctx.lineWidth = 2;
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(0, this.canvas.height);
        this.canvas.ctx.lineTo(this.canvas.width, this.canvas.height);
        this.canvas.ctx.stroke();
    }
}
