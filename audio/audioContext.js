// Audio Context Management
export class AudioContextManager {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.dataArray = null;
        this.isActive = false;
    }

    async initialize() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            
            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);
            
            return true;
        } catch (error) {
            console.error('Audio context initialization failed:', error);
            return false;
        }
    }

    async startMicrophone() {
        try {
            // Ensure audio context is running
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.microphone = this.audioContext.createMediaStreamSource(stream);
            this.microphone.connect(this.analyser);
            this.isActive = true;
            console.log('Microphone started successfully');
            return true;
        } catch (error) {
            console.error('Microphone access failed:', error);
            return false;
        }
    }

    stop() {
        if (this.audioContext) {
            this.audioContext.close();
        }
        this.isActive = false;
    }

    getAudioLevel() {
        if (!this.analyser || !this.dataArray) return 0;
        
        this.analyser.getByteFrequencyData(this.dataArray);
        
        let sum = 0;
        let count = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
            if (this.dataArray[i] > 0) {
                sum += this.dataArray[i];
                count++;
            }
        }
        
        return count > 0 ? (sum / count) / 255 : 0;
    }

    getFrequencyData() {
        if (!this.analyser || !this.dataArray) return null;
        this.analyser.getByteFrequencyData(this.dataArray);
        return this.dataArray;
    }
}
