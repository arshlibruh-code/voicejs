// Professional Real-time FFT Analyzer
import { Colors } from '../utils/colors.js';

export class FFTAnalyzerVisualization {
    constructor(canvasManager) {
        this.canvas = canvasManager.getCanvas('fftAnalyzerCanvas');
        this.width = 0;
        this.height = 0;
        this.peakData = [];
        this.holdTime = 1000; // Peak hold time in ms
        this.lastPeakUpdate = 0;
        this.smoothingFactor = 0.8;
        this.smoothedData = [];
        this.frequencyLabels = [
            { freq: 20, label: '20Hz' },
            { freq: 50, label: '50Hz' },
            { freq: 100, label: '100Hz' },
            { freq: 200, label: '200Hz' },
            { freq: 500, label: '500Hz' },
            { freq: 1000, label: '1kHz' },
            { freq: 2000, label: '2kHz' },
            { freq: 5000, label: '5kHz' },
            { freq: 10000, label: '10kHz' },
            { freq: 20000, label: '20kHz' }
        ];
    }

    initialize() {
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.smoothedData = Array(128).fill(0);
        this.peakData = Array(128).fill(0);
    }

    draw(audioLevel = 0, frequencyData = null) {
        if (!frequencyData) return;

        this.width = this.canvas.width;
        this.height = this.canvas.height;

        // Clear canvas with dark background
        this.canvas.ctx.fillStyle = '#0a0a0a';
        this.canvas.ctx.fillRect(0, 0, this.width, this.height);

        // Process frequency data with logarithmic scaling
        const processedData = this.processFrequencyData(frequencyData);
        
        // Update smoothed data
        this.updateSmoothedData(processedData);
        
        // Update peak data
        this.updatePeakData(processedData);

        // Draw grid
        this.drawGrid();
        
        // Draw frequency labels
        this.drawFrequencyLabels();
        
        // Draw spectrum
        this.drawSpectrum();
        
        // Draw peaks
        this.drawPeaks();
        
        // Draw dB scale
        this.drawDbScale();
    }

    processFrequencyData(frequencyData) {
        const binSize = Math.floor(frequencyData.length / 128);
        const processed = [];
        
        for (let i = 0; i < 128; i++) {
            let sum = 0;
            const start = i * binSize;
            const end = Math.min(start + binSize, frequencyData.length);
            
            for (let j = start; j < end; j++) {
                sum += frequencyData[j];
            }
            
            // Convert to dB scale
            const avg = sum / (end - start);
            const db = 20 * Math.log10(avg / 255 + 0.001); // Add small value to avoid log(0)
            processed.push(Math.max(db, -80)); // Clamp to -80dB minimum
        }
        
        return processed;
    }

    updateSmoothedData(newData) {
        for (let i = 0; i < newData.length; i++) {
            this.smoothedData[i] = this.smoothedData[i] * this.smoothingFactor + 
                                 newData[i] * (1 - this.smoothingFactor);
        }
    }

    updatePeakData(newData) {
        const now = Date.now();
        if (now - this.lastPeakUpdate > 16) { // Update peaks at ~60fps
            for (let i = 0; i < newData.length; i++) {
                if (newData[i] > this.peakData[i]) {
                    this.peakData[i] = newData[i];
                } else {
                    // Decay peaks over time
                    this.peakData[i] *= 0.95;
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
        
        // Vertical grid lines (frequency)
        for (let i = 0; i < this.frequencyLabels.length; i++) {
            const x = (i / (this.frequencyLabels.length - 1)) * this.width;
            this.canvas.ctx.beginPath();
            this.canvas.ctx.moveTo(x, 0);
            this.canvas.ctx.lineTo(x, this.height);
            this.canvas.ctx.stroke();
        }
    }

    drawFrequencyLabels() {
        this.canvas.ctx.fillStyle = '#888888';
        this.canvas.ctx.font = '10px monospace';
        this.canvas.ctx.textAlign = 'center';
        
        for (let i = 0; i < this.frequencyLabels.length; i++) {
            const x = (i / (this.frequencyLabels.length - 1)) * this.width;
            this.canvas.ctx.fillText(this.frequencyLabels[i].label, x, this.height - 5);
        }
    }

    drawDbScale() {
        this.canvas.ctx.fillStyle = '#888888';
        this.canvas.ctx.font = '10px monospace';
        this.canvas.ctx.textAlign = 'right';
        
        for (let db = -80; db <= 0; db += 20) {
            const y = this.height - ((db + 80) / 80) * this.height;
            this.canvas.ctx.fillText(`${db}dB`, 5, y + 3);
        }
    }

    drawSpectrum() {
        // Draw main spectrum line
        this.canvas.ctx.strokeStyle = '#00ff88';
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
        
        // Draw filled area under spectrum
        this.canvas.ctx.lineTo(this.width, this.height);
        this.canvas.ctx.lineTo(0, this.height);
        this.canvas.ctx.closePath();
        
        const gradient = this.canvas.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, 'rgba(0, 255, 136, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 255, 136, 0.05)');
        this.canvas.ctx.fillStyle = gradient;
        this.canvas.ctx.fill();
    }

    drawPeaks() {
        // Draw peak hold lines
        this.canvas.ctx.strokeStyle = '#ff4444';
        this.canvas.ctx.lineWidth = 1;
        this.canvas.ctx.setLineDash([2, 2]);
        
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

    drawStatic() {
        this.canvas.ctx.fillStyle = '#0a0a0a';
        this.canvas.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw static grid
        this.drawGrid();
        this.drawFrequencyLabels();
        this.drawDbScale();
        
        // Add title
        this.canvas.ctx.fillStyle = '#ffffff';
        this.canvas.ctx.font = '14px monospace';
        this.canvas.ctx.textAlign = 'center';
        this.canvas.ctx.fillText('FFT ANALYZER', this.canvas.width / 2, 20);
    }
}
