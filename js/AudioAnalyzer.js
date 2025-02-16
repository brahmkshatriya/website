export class AudioAnalyzer {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 1024;
        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);
        this.isPlaying = false;
        this.audioSource = null;
        this.duration = 0;
        this.currentTime = 0;
        this.audioBuffer = null;  // Add this line to store the buffer
        this.loop = true;  // Add this line

        // Define frequency ranges for kick and snare
        this.kickRange = [20, 160];    // 20-160Hz for kick drum
        this.snareRange = [400, 2500]; // 400-2500Hz for snare
    }

    async loadAudio(file) {
        try {
            // Stop current audio if playing
            if (this.audioSource) {
                this.audioSource.stop();
                this.audioSource.disconnect();
            }

            const audioBuffer = await file.arrayBuffer();
            const decodedData = await this.audioContext.decodeAudioData(audioBuffer);
            this.audioBuffer = decodedData;  // Store the buffer
            
            this.audioSource = this.audioContext.createBufferSource();
            this.audioSource.buffer = this.audioBuffer;
            this.audioSource.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
            this.audioSource.loop = this.loop;  // Use the stored loop state
            this.audioSource.start(0);
            this.isPlaying = true;
            this.duration = decodedData.duration;
            this.pauseTime = 0; // Reset pause time for new audio

            // Set up time tracking
            this.startTime = this.audioContext.currentTime;
            this.updateCurrentTime();
        } catch (error) {
            console.error('Error loading audio:', error);
        }
    }

    setLoop(shouldLoop) {
        this.loop = shouldLoop;
        if (this.audioSource) {
            this.audioSource.loop = shouldLoop;
            
            // If we're at the end of a track, restart it when enabling loop
            if (shouldLoop && this.currentTime >= this.duration) {
                this.seek(0);
            }
            // If we're disabling loop and at the end, stop playback
            else if (!shouldLoop && this.currentTime >= this.duration) {
                this.isPlaying = false;
                if (this.onPlaybackEnded) {
                    this.onPlaybackEnded();
                }
            }
        }
    }

    updateCurrentTime() {
        if (this.isPlaying) {
            const newTime = this.audioContext.currentTime - this.startTime;
            if (!this.loop && newTime >= this.duration) {
                // Stop playback when we reach the end and looping is disabled
                this.isPlaying = false;
                if (this.onPlaybackEnded) {
                    this.onPlaybackEnded();
                }
                return;
            }
            this.currentTime = newTime % this.duration;
            requestAnimationFrame(() => this.updateCurrentTime());
        }
    }

    seek(time) {
        if (!this.audioBuffer || !this.isPlaying) return;
        
        // Stop current playback
        this.audioSource.stop();
        this.audioSource.disconnect();
        
        // Create new source with stored buffer
        this.audioSource = this.audioContext.createBufferSource();
        this.audioSource.buffer = this.audioBuffer;  // Use stored buffer
        this.audioSource.connect(this.analyser);
        this.audioSource.loop = this.loop;  // Add this line
        
        // Start from new position
        this.audioSource.start(0, time);
        this.startTime = this.audioContext.currentTime - time;
    }

    getBassLevel() {
        if (!this.isPlaying) return 0;
        
        this.analyser.getByteFrequencyData(this.dataArray);
        // Get average of first 8 frequency bins (bass frequencies)
        const bass = this.dataArray.slice(0, 8).reduce((a, b) => a + b, 0) / 8;
        return bass / 255; // Normalize to 0-1
    }

    getKickLevel() {
        if (!this.isPlaying) return 0;
        
        this.analyser.getByteFrequencyData(this.dataArray);
        
        // Convert frequency ranges to bin indices
        const kickStartBin = Math.floor(this.kickRange[0] * this.analyser.fftSize / this.audioContext.sampleRate);
        const kickEndBin = Math.floor(this.kickRange[1] * this.analyser.fftSize / this.audioContext.sampleRate);
        
        // Get average of kick frequency bins
        let kickSum = 0;
        for (let i = kickStartBin; i <= kickEndBin; i++) {
            kickSum += this.dataArray[i];
        }
        return kickSum / (kickEndBin - kickStartBin + 1) / 255;
    }

    getSnareLevel() {
        if (!this.isPlaying) return 0;
        
        this.analyser.getByteFrequencyData(this.dataArray);
        
        // Convert frequency ranges to bin indices
        const snareStartBin = Math.floor(this.snareRange[0] * this.analyser.fftSize / this.audioContext.sampleRate);
        const snareEndBin = Math.floor(this.snareRange[1] * this.analyser.fftSize / this.audioContext.sampleRate);
        
        // Get average of snare frequency bins
        let snareSum = 0;
        for (let i = snareStartBin; i <= snareEndBin; i++) {
            snareSum += this.dataArray[i];
        }
        return snareSum / (snareEndBin - snareStartBin + 1) / 255;
    }

    pause() {
        if (this.audioSource && this.isPlaying) {
            this.audioSource.stop();
            this.isPlaying = false;
            this.pauseTime = (this.audioContext.currentTime - this.startTime) % this.duration;
        }
    }

    play() {
        if (this.audioBuffer && !this.isPlaying) {
            this.audioSource = this.audioContext.createBufferSource();
            this.audioSource.buffer = this.audioBuffer;
            this.audioSource.connect(this.analyser);
            this.audioSource.loop = this.loop;
            
            this.audioSource.start(0, this.pauseTime || 0);
            this.startTime = this.audioContext.currentTime - (this.pauseTime || 0);
            this.isPlaying = true;
            this.updateCurrentTime();
        }
    }
}
