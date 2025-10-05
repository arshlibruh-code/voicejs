// Audio Analysis Utilities
export class AudioAnalyzer {
    constructor(audioContextManager) {
        this.audioContext = audioContextManager;
    }

    getFrequencyBand(startFreq, endFreq) {
        if (!this.audioContext.dataArray) return 0;
        
        const sampleRate = this.audioContext.audioContext.sampleRate;
        const fftSize = this.audioContext.analyser.fftSize;
        const binSize = sampleRate / fftSize;
        
        const startBin = Math.floor(startFreq / binSize);
        const endBin = Math.floor(endFreq / binSize);
        
        let sum = 0;
        let count = 0;
        for (let i = startBin; i <= endBin && i < this.audioContext.dataArray.length; i++) {
            sum += this.audioContext.dataArray[i];
            count++;
        }
        
        return count > 0 ? (sum / count) / 255 : 0;
    }

    getBassLevel() {
        return this.getFrequencyBand(20, 250);
    }

    getMidLevel() {
        return this.getFrequencyBand(250, 2000);
    }

    getTrebleLevel() {
        return this.getFrequencyBand(2000, 8000);
    }

    detectBeat(history = []) {
        const bassLevel = this.getBassLevel();
        if (history.length < 10) return false;
        
        const avgLevel = history.reduce((sum, level) => sum + level, 0) / history.length;
        const threshold = 1.3;
        
        return bassLevel > avgLevel * threshold;
    }
}
