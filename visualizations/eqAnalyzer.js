// Professional Real-time EQ Analyzer
import { Colors } from '../utils/colors.js';

export class EQAnalyzerVisualization {
    constructor(canvasManager) {
        this.canvas = canvasManager.getCanvas('eqAnalyzerCanvas');
        this.width = 0;
        this.height = 0;
        this.eqBands = 31; // 31-band EQ
        this.frequencyBands = [];
        this.peakData = [];
        this.smoothedData = [];
        this.smoothingFactor = 0.8;
        this.peakHoldTime = 1000;
        this.lastPeakUpdate = 0;
        this.frequencyLabels = [
            { freq: 20, label: '20Hz' },
            { freq: 31.5, label: '31.5' },
            { freq: 63, label: '63' },
            { freq: 125, label: '125' },
            { freq: 250, label: '250' },
            { freq: 500, label: '500' },
            { freq: 1000, label: '1k' },
            { freq: 2000, label: '2k' },
            { freq: 4000, label: '4k' },
            { freq: 8000, label: '8k' },
            { freq: 16000, label: '16k' },
            { freq: 20000, label: '20k' }
        ];
    }

    initialize() {
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.frequencyBands = Array(this.eqBands).fill(0);
        this.peakData = Array(this.eqBands).fill(0);
        this.smoothedData = Array(this.eqBands).fill(0);
    }

    draw(audioLevel = 0, frequencyData = null) {
        if (!frequencyData) return;

        this.width = this.canvas.width;
        this.height = this.canvas.height;

        // Clear canvas
        this.canvas.ctx.fillStyle = '#000000';
        this.canvas.ctx.fillRect(0, 0, this.width, this.height);

        // Process EQ data
        this.processEQData(frequencyData);
        
        // Update smoothed data
        this.updateSmoothedData();
        
        // Update peak data
        this.updatePeakData();
        
        // Draw grid
        this.drawGrid();
        
        // Draw EQ curve
        this.drawEQCurve();
        
        // Draw peak hold
        this.drawPeakHold();
        
        // Draw labels
        this.drawLabels();
    }

    processEQData(frequencyData) {
        // Create 31-band EQ analysis
        const sampleRate = 44100;
        const nyquist = sampleRate / 2;
        
        // Calculate frequency bands (ISO 31-band EQ)
        const bandFrequencies = [
            20, 25, 31.5, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000,
            1250, 1600, 2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000, 12500, 16000, 20000
        ];
        
        for (let i = 0; i < this.eqBands; i++) {
            const targetFreq = bandFrequencies[i];
            const binIndex = Math.floor((targetFreq / nyquist) * frequencyData.length);
            const clampedIndex = Math.min(binIndex, frequencyData.length - 1);
            
            // Convert to dB
            const rawValue = frequencyData[clampedIndex] / 255;
            const dbValue = 20 * Math.log10(rawValue + 0.001);
            this.frequencyBands[i] = Math.max(dbValue, -80);
        }
    }

    updateSmoothedData() {
        for (let i = 0; i < this.frequencyBands.length; i++) {
            this.smoothedData[i] = this.smoothedData[i] * this.smoothingFactor + 
                                 this.frequencyBands[i] * (1 - this.smoothingFactor);
        }
    }

    updatePeakData() {
        const now = Date.now();
        if (now - this.lastPeakUpdate > 16) {
            for (let i = 0; i < this.frequencyBands.length; i++) {
                if (this.frequencyBands[i] > this.peakData[i]) {
                    this.peakData[i] = this.frequencyBands[i];
                } else {
                    this.peakData[i] *= 0.95; // Decay peaks
                }
            }
            this.lastPeakUpdate = now;
        }
    }

    drawGrid() {
        this.canvas.ctx.strokeStyle = '#333333';
        this.canvas.ctx.lineWidth = 0.5;
        
        // Horizontal grid lines (dB scale)
        for (let db = -80; db <= 0; db += 10) {
            const y = this.height - ((db + 80) / 80) * this.height;
            this.canvas.ctx.beginPath();
            this.canvas.ctx.moveTo(0, y);
            this.canvas.ctx.lineTo(this.width, y);
            this.canvas.ctx.stroke();
        }
        
        // Vertical grid lines (frequency bands)
        for (let i = 0; i < this.eqBands; i++) {
            const x = (i / (this.eqBands - 1)) * this.width;
            this.canvas.ctx.beginPath();
            this.canvas.ctx.moveTo(x, 0);
            this.canvas.ctx.lineTo(x, this.height);
            this.canvas.ctx.stroke();
        }
    }

    drawEQCurve() {
        // Draw main EQ curve
        this.canvas.ctx.strokeStyle = '#00ff00';
        this.canvas.ctx.lineWidth = 2;
        this.canvas.ctx.beginPath();
        
        for (let i = 0; i < this.smoothedData.length; i++) {
            const x = (i / (this.smoothedData.length - 1)) * this.width;
            const db = this.smoothedData[i];
            const y = this.height - ((db + 80) / 80) * this.height;
            
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
            const db = this.peakData[i];
            const y = this.height - ((db + 80) / 80) * this.height;
            
            if (i === 0) {
                this.canvas.ctx.moveTo(x, y);
            } else {
                this.canvas.ctx.lineTo(x, y);
            }
        }
        this.canvas.ctx.stroke();
        this.canvas.ctx.setLineDash([]);
    }

    drawLabels() {
        this.canvas.ctx.fillStyle = '#ffffff';
        this.canvas.ctx.font = '14px monospace';
        this.canvas.ctx.textAlign = 'center';
        this.canvas.ctx.fillText('31-BAND EQ ANALYZER', this.width / 2, 20);
        
        // Frequency labels
        this.canvas.ctx.fillStyle = '#888888';
        this.canvas.ctx.font = '8px monospace';
        this.canvas.ctx.textAlign = 'center';
        
        for (let i = 0; i < this.frequencyLabels.length; i++) {
            const label = this.frequencyLabels[i];
            const bandIndex = this.findBandIndex(label.freq);
            const x = (bandIndex / (this.eqBands - 1)) * this.width;
            this.canvas.ctx.fillText(label.label, x, this.height - 5);
        }
        
        // dB scale labels
        this.canvas.ctx.textAlign = 'right';
        for (let db = -80; db <= 0; db += 20) {
            const y = this.height - ((db + 80) / 80) * this.height;
            this.canvas.ctx.fillText(`${db}dB`, 5, y + 3);
        }
        
        // Current level indicator
        const maxLevel = Math.max(...this.smoothedData);
        this.canvas.ctx.fillStyle = '#00ff00';
        this.canvas.ctx.font = '10px monospace';
        this.canvas.ctx.textAlign = 'left';
        this.canvas.ctx.fillText(`Peak: ${maxLevel.toFixed(1)}dB`, 10, 30);
    }

    findBandIndex(frequency) {
        const bandFrequencies = [
            20, 25, 31.5, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000,
            1250, 1600, 2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000, 12500, 16000, 20000
        ];
        
        for (let i = 0; i < bandFrequencies.length; i++) {
            if (bandFrequencies[i] >= frequency) {
                return i;
            }
        }
        return bandFrequencies.length - 1;
    }

    drawStatic() {
        this.canvas.ctx.fillStyle = '#000000';
        this.canvas.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawGrid();
        this.drawLabels();
        
        // Draw a flat line at -80dB
        this.canvas.ctx.strokeStyle = '#333333';
        this.canvas.ctx.lineWidth = 2;
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(0, this.canvas.height);
        this.canvas.ctx.lineTo(this.canvas.width, this.canvas.height);
        this.canvas.ctx.stroke();
    }
}
