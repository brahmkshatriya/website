import { UIControl } from './UIControl.js';

export class AudioControl {
    constructor(controlsContainer, audioAnalyzer) {
        this.audioAnalyzer = audioAnalyzer;
        this.audioLoop = true;
        this.playPauseBtn = null;
        this.loopBtn = null; // Add this line to store loop button reference
        this.createAudioControls(controlsContainer);
        
        // Add callback for playback ended
        this.audioAnalyzer.onPlaybackEnded = () => {
            this.updatePlayPauseButton(false);
        };
    }

    createAudioControls(controlsContainer) {
        const audioContainer = document.createElement('div');
        audioContainer.className = 'audio-container';
        controlsContainer.appendChild(audioContainer);

        const controlsRow = document.createElement('div');
        controlsRow.className = 'audio-controls-row';
        audioContainer.appendChild(controlsRow);

        this.createPlayPauseButton(controlsRow);
        this.createSeekControl(controlsRow);
        this.createAudioLoopControl(controlsRow);
        this.createAudioFileInput(audioContainer);
    }

    createPlayPauseButton(audioContainer) {
        const playPauseBtn = document.createElement('button');
        playPauseBtn.className = 'play-pause-btn';
        playPauseBtn.innerHTML = '<span class="material-symbols-rounded">play_arrow</span>';
        audioContainer.appendChild(playPauseBtn);
        this.playPauseBtn = playPauseBtn; // Store the button reference

        playPauseBtn.addEventListener('click', () => {
            if (!this.audioAnalyzer.audioSource) return;
            
            if (this.audioAnalyzer.isPlaying) {
                this.audioAnalyzer.pause();
                this.updatePlayPauseButton(false);
            } else {
                this.audioAnalyzer.play();
                this.updatePlayPauseButton(true);
            }
        });
    }

    updatePlayPauseButton(isPlaying) {
        if (this.playPauseBtn) {
            this.playPauseBtn.innerHTML = `<span class="material-symbols-rounded">${isPlaying ? 'pause' : 'play_arrow'}</span>`;
        }
    }

    createAudioLoopControl(audioContainer) {
        const loopBtn = document.createElement('button');
        loopBtn.className = 'loop-btn';
        loopBtn.innerHTML = `<span class="material-symbols-rounded">${this.audioLoop ? 'repeat_on' : 'repeat'}</span>`;
        audioContainer.appendChild(loopBtn);
        this.loopBtn = loopBtn; // Store the button reference

        loopBtn.addEventListener('click', () => {
            this.audioLoop = !this.audioLoop;
            this.updateLoopButton();
            if (this.audioAnalyzer) {
                this.audioAnalyzer.setLoop(this.audioLoop);
            }
        });
    }

    updateLoopButton() {
        if (this.loopBtn) {
            this.loopBtn.innerHTML = `<span class="material-symbols-rounded">${this.audioLoop ? 'repeat_on' : 'repeat'}</span>`;
        }
    }

    createAudioFileInput(audioContainer) {
        const audioInput = document.createElement('input');
        audioInput.type = 'file';
        audioInput.accept = 'audio/*';
        audioInput.className = 'audio-input';
        audioContainer.appendChild(audioInput);

        audioInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                await this.audioAnalyzer.loadAudio(file);
                this.updatePlayPauseButton(this.audioAnalyzer.isPlaying);
                this.audioAnalyzer.setLoop(this.audioLoop); // Ensure loop state is set after loading
            }
        });
    }

    createSeekControl(audioContainer) {
        const seekContainer = document.createElement('div');
        seekContainer.className = 'seek-container';
        
        const seekbar = document.createElement('input');
        seekbar.type = 'range';
        seekbar.min = 0;
        seekbar.max = 100;
        seekbar.value = 0;
        seekbar.className = 'seekbar';
        
        const timeDisplay = document.createElement('span');
        timeDisplay.className = 'time-display';
        timeDisplay.textContent = '0:00 / 0:00';
        
        seekContainer.appendChild(seekbar);
        seekContainer.appendChild(timeDisplay);
        audioContainer.appendChild(seekContainer);

        seekbar.addEventListener('input', () => {
            const time = (seekbar.value / 100) * this.audioAnalyzer.duration;
            this.audioAnalyzer.seek(time);
        });

        this.startSeekbarUpdate(seekbar, timeDisplay);
    }

    startSeekbarUpdate(seekbar, timeDisplay) {
        const updateSeekbar = () => {
            if (this.audioAnalyzer.isPlaying) {
                const currentTime = this.audioAnalyzer.currentTime;
                const duration = this.audioAnalyzer.duration;
                seekbar.value = (currentTime / duration) * 100;
                
                timeDisplay.textContent = `${this.formatTime(currentTime)} / ${this.formatTime(duration)}`;
            }
            requestAnimationFrame(updateSeekbar);
        };
        updateSeekbar();
    }

    formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    }
}
