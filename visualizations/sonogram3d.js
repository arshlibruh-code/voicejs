// Professional 3D Sonogram - 3D Frequency-Time Visualization
import { Colors } from '../utils/colors.js';

export class Sonogram3DVisualization {
    constructor(canvasManager) {
        this.canvas = canvasManager.getCanvas('sonogram3dCanvas');
        this.width = 0;
        this.height = 0;
        this.sonogramData = [];
        this.maxHistory = 150;
        this.frequencyBins = 64;
        this.perspective = 0.5;
        this.rotation = 0;
        this.elevation = 0.3;
        this.colorMap = this.create3DColorMap();
    }

    initialize() {
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.sonogramData = Array(this.maxHistory).fill(null).map(() => 
            Array(this.frequencyBins).fill(0)
        );
    }

    create3DColorMap() {
        const colors = [];
        for (let i = 0; i < 256; i++) {
            const intensity = i / 255;
            let r, g, b;
            
            if (intensity < 0.25) {
                // Black to blue
                const t = intensity / 0.25;
                r = 0;
                g = 0;
                b = Math.floor(255 * t);
            } else if (intensity < 0.5) {
                // Blue to cyan
                const t = (intensity - 0.25) / 0.25;
                r = 0;
                g = Math.floor(255 * t);
                b = 255;
            } else if (intensity < 0.75) {
                // Cyan to green
                const t = (intensity - 0.5) / 0.25;
                r = 0;
                g = 255;
                b = Math.floor(255 * (1 - t));
            } else {
                // Green to yellow to red
                const t = (intensity - 0.75) / 0.25;
                r = Math.floor(255 * t);
                g = 255;
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

        // Clear canvas
        this.canvas.ctx.fillStyle = '#000000';
        this.canvas.ctx.fillRect(0, 0, this.width, this.height);

        // Process frequency data
        this.processFrequencyData(frequencyData);
        
        // Update rotation
        this.rotation += 0.01;
        
        // Draw 3D sonogram
        this.draw3DSonogram();
        
        // Draw labels
        this.drawLabels();
    }

    processFrequencyData(frequencyData) {
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

        // Add new spectrum to the beginning
        this.sonogramData.unshift(newSpectrum);
        
        // Keep only the last maxHistory entries
        if (this.sonogramData.length > this.maxHistory) {
            this.sonogramData.pop();
        }
    }

    draw3DSonogram() {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const maxRadius = Math.min(this.width, this.height) / 2 - 20;
        
        // Draw 3D surface
        for (let timeIndex = 0; timeIndex < this.sonogramData.length - 1; timeIndex++) {
            const spectrum = this.sonogramData[timeIndex];
            const nextSpectrum = this.sonogramData[timeIndex + 1];
            
            if (!spectrum || !nextSpectrum) continue;
            
            for (let freqIndex = 0; freqIndex < spectrum.length - 1; freqIndex++) {
                // Calculate 3D coordinates
                const time1 = (timeIndex / this.sonogramData.length) * Math.PI * 2;
                const time2 = ((timeIndex + 1) / this.sonogramData.length) * Math.PI * 2;
                const freq1 = (freqIndex / spectrum.length) * Math.PI;
                const freq2 = ((freqIndex + 1) / spectrum.length) * Math.PI;
                
                // Get amplitude values
                const amp1 = spectrum[freqIndex] / 255;
                const amp2 = spectrum[freqIndex + 1] / 255;
                const amp3 = nextSpectrum[freqIndex] / 255;
                const amp4 = nextSpectrum[freqIndex + 1] / 255;
                
                // Calculate 3D positions
                const points = [
                    this.project3D(time1, freq1, amp1, centerX, centerY, maxRadius),
                    this.project3D(time1, freq2, amp2, centerX, centerY, maxRadius),
                    this.project3D(time2, freq1, amp3, centerX, centerY, maxRadius),
                    this.project3D(time2, freq2, amp4, centerX, centerY, maxRadius)
                ];
                
                // Draw quad
                this.drawQuad(points, amp1);
            }
        }
    }

    project3D(time, freq, amplitude, centerX, centerY, maxRadius) {
        // Convert to 3D coordinates
        const x = Math.cos(time + this.rotation) * (1 + amplitude * 0.5);
        const y = Math.sin(time + this.rotation) * (1 + amplitude * 0.5);
        const z = Math.sin(freq) * (1 + amplitude * 0.5);
        
        // Apply perspective projection
        const perspective = 1 / (1 + z * this.perspective);
        const screenX = centerX + x * maxRadius * perspective;
        const screenY = centerY + y * maxRadius * perspective;
        
        return { x: screenX, y: screenY, z: z, amplitude: amplitude };
    }

    drawQuad(points, amplitude) {
        // Calculate average amplitude for color
        const avgAmplitude = points.reduce((sum, p) => sum + p.amplitude, 0) / points.length;
        const colorIndex = Math.floor(avgAmplitude * 255);
        const color = this.colorMap[Math.min(colorIndex, 255)];
        
        // Draw quad
        this.canvas.ctx.fillStyle = color;
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(points[0].x, points[0].y);
        this.canvas.ctx.lineTo(points[1].x, points[1].y);
        this.canvas.ctx.lineTo(points[3].x, points[3].y);
        this.canvas.ctx.lineTo(points[2].x, points[2].y);
        this.canvas.ctx.closePath();
        this.canvas.ctx.fill();
        
        // Draw wireframe
        this.canvas.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.canvas.ctx.lineWidth = 0.5;
        this.canvas.ctx.stroke();
    }

    drawLabels() {
        this.canvas.ctx.fillStyle = '#ffffff';
        this.canvas.ctx.font = '14px monospace';
        this.canvas.ctx.textAlign = 'center';
        this.canvas.ctx.fillText('3D SONOGRAM', this.width / 2, 20);
        
        // Frequency labels
        this.canvas.ctx.fillStyle = '#888888';
        this.canvas.ctx.font = '10px monospace';
        this.canvas.ctx.textAlign = 'left';
        
        const frequencies = ['20Hz', '1kHz', '10kHz', '20kHz'];
        const labelY = this.height - 10;
        
        frequencies.forEach((freq, index) => {
            const x = 20 + (index / (frequencies.length - 1)) * (this.width - 40);
            this.canvas.ctx.fillText(freq, x, labelY);
        });
        
        // Time labels
        this.canvas.ctx.textAlign = 'center';
        this.canvas.ctx.fillText('Time →', this.width / 2, this.height - 5);
        
        // Amplitude indicator
        this.canvas.ctx.fillStyle = '#00ff00';
        this.canvas.ctx.font = '10px monospace';
        this.canvas.ctx.textAlign = 'right';
        this.canvas.ctx.fillText('Amplitude ↑', this.width - 10, 30);
    }

    drawStatic() {
        this.canvas.ctx.fillStyle = '#000000';
        this.canvas.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw a simple 3D grid
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(this.canvas.width, this.canvas.height) / 2 - 20;
        
        this.canvas.ctx.strokeStyle = '#333333';
        this.canvas.ctx.lineWidth = 1;
        
        // Draw circular grid
        for (let i = 1; i <= 3; i++) {
            const r = (radius / 3) * i;
            this.canvas.ctx.beginPath();
            this.canvas.ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
            this.canvas.ctx.stroke();
        }
        
        this.drawLabels();
    }
}
