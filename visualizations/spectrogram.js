// Professional Waterfall Spectrogram - Advanced frequency analysis
import { Colors } from '../utils/colors.js';

export class SpectrogramVisualization {
    constructor(canvasManager) {
        this.canvas = canvasManager.getCanvas('spectrogramCanvas');
        this.width = 0;
        this.height = 0;
        this.spectrogramData = [];
        this.maxHistory = 300; // More history for better waterfall
        this.frequencyBins = 128; // Higher resolution
        this.colorMap = this.createProfessionalColorMap();
        this.timeScale = 0;
        this.frequencyScale = 0;
        this.minFreq = 20; // 20Hz
        this.maxFreq = 20000; // 20kHz
    }

    initialize() {
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Initialize spectrogram data array
        this.spectrogramData = Array(this.maxHistory).fill(null).map(() => 
            Array(this.frequencyBins).fill(0)
        );
    }

    createProfessionalColorMap() {
        // Professional color map: Black -> Blue -> Green -> Yellow -> Red -> White
        const colors = [];
        for (let i = 0; i < 256; i++) {
            const intensity = i / 255;
            let r, g, b;
            
            if (intensity < 0.2) {
                // Black to blue
                const t = intensity / 0.2;
                r = 0;
                g = 0;
                b = Math.floor(255 * t);
            } else if (intensity < 0.4) {
                // Blue to cyan
                const t = (intensity - 0.2) / 0.2;
                r = 0;
                g = Math.floor(255 * t);
                b = 255;
            } else if (intensity < 0.6) {
                // Cyan to green
                const t = (intensity - 0.4) / 0.2;
                r = 0;
                g = 255;
                b = Math.floor(255 * (1 - t));
            } else if (intensity < 0.8) {
                // Green to yellow
                const t = (intensity - 0.6) / 0.2;
                r = Math.floor(255 * t);
                g = 255;
                b = 0;
            } else {
                // Yellow to red to white
                const t = (intensity - 0.8) / 0.2;
                r = 255;
                g = Math.floor(255 * (1 - t));
                b = 0;
            }
            
            colors.push(`rgb(${r}, ${g}, ${b})`);
        }
        return colors;
    }

    draw(audioLevel = 0, frequencyData = null) {
        if (!frequencyData) return;

        this.width = this.canvas.width;
        this.height = this.canvas.height;

        // Process frequency data into bins
        const binSize = Math.floor(frequencyData.length / this.frequencyBins);
        const newSpectrum = [];
        
        for (let i = 0; i < this.frequencyBins; i++) {
            let sum = 0;
            const start = i * binSize;
            const end = Math.min(start + binSize, frequencyData.length);
            
            for (let j = start; j < end; j++) {
                sum += frequencyData[j];
            }
            
            newSpectrum.push(sum / (end - start));
        }

        // Add new spectrum to the beginning of our data
        this.spectrogramData.unshift(newSpectrum);
        
        // Keep only the last maxHistory entries
        if (this.spectrogramData.length > this.maxHistory) {
            this.spectrogramData.pop();
        }

        // Clear canvas
        this.canvas.ctx.clearRect(0, 0, this.width, this.height);

        // Draw the spectrogram
        this.drawSpectrogram();
    }

    drawSpectrogram() {
        const timeHeight = this.height / this.spectrogramData.length;
        const freqWidth = this.width / this.frequencyBins;

        for (let timeIndex = 0; timeIndex < this.spectrogramData.length; timeIndex++) {
            const spectrum = this.spectrogramData[timeIndex];
            if (!spectrum) continue;

            for (let freqIndex = 0; freqIndex < spectrum.length; freqIndex++) {
                const intensity = spectrum[freqIndex] / 255;
                const colorIndex = Math.floor(intensity * 255);
                const color = this.colorMap[Math.min(colorIndex, 255)];

                this.canvas.ctx.fillStyle = color;
                this.canvas.ctx.fillRect(
                    freqIndex * freqWidth,
                    timeIndex * timeHeight,
                    freqWidth,
                    timeHeight
                );
            }
        }

        // Add frequency labels on the left
        this.drawFrequencyLabels();
    }

    drawFrequencyLabels() {
        this.canvas.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.canvas.ctx.font = '10px Arial';
        this.canvas.ctx.textAlign = 'right';
        
        const frequencies = ['20kHz', '15kHz', '10kHz', '5kHz', '1kHz', '500Hz', '100Hz', '20Hz'];
        const labelSpacing = this.height / (frequencies.length - 1);
        
        frequencies.forEach((freq, index) => {
            const y = index * labelSpacing;
            this.canvas.ctx.fillText(freq, this.width - 5, y + 3);
        });
    }

    drawStatic() {
        this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw a subtle grid pattern
        this.canvas.ctx.fillStyle = 'rgba(50, 50, 50, 0.3)';
        this.canvas.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Add title
        this.canvas.ctx.fillStyle = '#ffffff';
        this.canvas.ctx.font = '14px monospace';
        this.canvas.ctx.textAlign = 'center';
        this.canvas.ctx.fillText('SPECTROGRAM', this.canvas.width / 2, 20);
    }
}
