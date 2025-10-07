class TimerScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TimerScene' });
        this.timeInSeconds = 0;
        this.isRunning = false;
        this.timerEvent = null;
    }

    create() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        // Background
        this.add.rectangle(0, 0, 800, 600, 0x34495e).setOrigin(0);

        // Title
        this.add.text(centerX, 50, 'TIMER APP', {
            fontSize: '48px',
            fontFamily: 'Arial',
            color: '#ecf0f1',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Timer display
        this.timerText = this.add.text(centerX, centerY - 50, '00:00:00', {
            fontSize: '72px',
            fontFamily: 'Arial, monospace',
            color: '#3498db',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Start/Stop button
        this.startStopButton = this.createButton(centerX - 120, centerY + 80, 'START', 0x27ae60, () => {
            this.toggleTimer();
        });

        // Reset button
        this.resetButton = this.createButton(centerX + 120, centerY + 80, 'RESET', 0xe74c3c, () => {
            this.resetTimer();
        });

        // Lap button
        this.lapButton = this.createButton(centerX, centerY + 80, 'LAP', 0xf39c12, () => {
            this.recordLap();
        });

        // Lap times display
        this.lapTimesText = this.add.text(centerX, centerY + 180, '', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#ecf0f1',
            align: 'center'
        }).setOrigin(0.5);

        this.laps = [];
    }

    createButton(x, y, text, color, callback) {
        const buttonWidth = 100;
        const buttonHeight = 50;

        const button = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, color)
            .setInteractive({ useHandCursor: true });

        const label = this.add.text(0, 0, text, {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        button.add([bg, label]);

        // Hover effects
        bg.on('pointerover', () => {
            bg.setFillStyle(Phaser.Display.Color.GetColor(
                Math.min(255, Phaser.Display.Color.IntegerToColor(color).r + 30),
                Math.min(255, Phaser.Display.Color.IntegerToColor(color).g + 30),
                Math.min(255, Phaser.Display.Color.IntegerToColor(color).b + 30)
            ));
        });

        bg.on('pointerout', () => {
            bg.setFillStyle(color);
        });

        bg.on('pointerdown', () => {
            button.setScale(0.95);
        });

        bg.on('pointerup', () => {
            button.setScale(1);
            callback();
        });

        button.bg = bg;
        button.label = label;
        return button;
    }

    toggleTimer() {
        if (this.isRunning) {
            // Stop the timer
            this.isRunning = false;
            if (this.timerEvent) {
                this.timerEvent.remove();
                this.timerEvent = null;
            }
            this.startStopButton.label.setText('START');
            this.startStopButton.bg.setFillStyle(0x27ae60);
        } else {
            // Start the timer
            this.isRunning = true;
            this.timerEvent = this.time.addEvent({
                delay: 10,
                callback: this.updateTimer,
                callbackScope: this,
                loop: true
            });
            this.startStopButton.label.setText('STOP');
            this.startStopButton.bg.setFillStyle(0xe67e22);
        }
    }

    updateTimer() {
        this.timeInSeconds += 0.01;
        this.timerText.setText(this.formatTime(this.timeInSeconds));
    }

    resetTimer() {
        this.isRunning = false;
        if (this.timerEvent) {
            this.timerEvent.remove();
            this.timerEvent = null;
        }
        this.timeInSeconds = 0;
        this.timerText.setText('00:00:00');
        this.startStopButton.label.setText('START');
        this.startStopButton.bg.setFillStyle(0x27ae60);
        this.laps = [];
        this.updateLapDisplay();
    }

    recordLap() {
        if (this.timeInSeconds > 0) {
            this.laps.push(this.timeInSeconds);
            this.updateLapDisplay();
        }
    }

    updateLapDisplay() {
        if (this.laps.length === 0) {
            this.lapTimesText.setText('');
            return;
        }

        const recentLaps = this.laps.slice(-3).reverse();
        const lapStrings = recentLaps.map((time, index) => {
            const lapNumber = this.laps.length - index;
            return `Lap ${lapNumber}: ${this.formatTime(time)}`;
        });

        this.lapTimesText.setText(lapStrings.join('\n'));
    }

    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const centiseconds = Math.floor((seconds % 1) * 100);

        return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(secs)}.${this.pad(centiseconds)}`;
    }

    pad(num) {
        return num.toString().padStart(2, '0');
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#34495e',
    scene: TimerScene
};

const game = new Phaser.Game(config);
