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

        // Sporty gradient background
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x0a0e27, 0x0a0e27, 0x1a1f3a, 0x1a1f3a, 1);
        graphics.fillRect(0, 0, 800, 600);

        // Dynamic racing stripes
        for (let i = 0; i < 3; i++) {
            const stripe = this.add.rectangle(
                -200 + i * 350,
                300,
                800,
                8,
                0xff3366,
                0.15
            ).setAngle(-25);
        }

        // Corner accent lines (sporty effect)
        const accentColor = 0xff3366;
        this.add.rectangle(0, 0, 150, 4, accentColor).setOrigin(0, 0);
        this.add.rectangle(0, 0, 4, 150, accentColor).setOrigin(0, 0);
        this.add.rectangle(800, 0, 150, 4, accentColor).setOrigin(1, 0);
        this.add.rectangle(800, 0, 4, 150, accentColor).setOrigin(1, 0);

        // Title with sporty style
        const titleShadow = this.add.text(centerX + 3, 53, 'STOPWATCH', {
            fontSize: '56px',
            fontFamily: 'Impact, Arial Black, Arial',
            color: '#000000',
            fontStyle: 'bold',
            letterSpacing: '4px'
        }).setOrigin(0.5);
        titleShadow.setAlpha(0.3);

        this.add.text(centerX, 50, 'STOPWATCH', {
            fontSize: '56px',
            fontFamily: 'Impact, Arial Black, Arial',
            color: '#ffffff',
            fontStyle: 'bold',
            letterSpacing: '4px'
        }).setOrigin(0.5);

        // Racing accent bar under title
        this.add.rectangle(centerX, 85, 280, 5, 0xff3366).setOrigin(0.5);

        // Timer display background panel
        const timerPanel = this.add.graphics();
        timerPanel.fillStyle(0x000000, 0.4);
        timerPanel.fillRoundedRect(centerX - 280, centerY - 100, 560, 120, 10);

        // Sporty border for timer
        timerPanel.lineStyle(3, 0xff3366, 1);
        timerPanel.strokeRoundedRect(centerX - 280, centerY - 100, 560, 120, 10);

        // Timer display with glow effect
        this.timerText = this.add.text(centerX, centerY - 40, '00:00:00.00', {
            fontSize: '80px',
            fontFamily: 'Arial',
            color: '#00ff88',
            align: 'center'
        }).setOrigin(0.5);

        // Add glow/shadow effect
        this.timerText.setShadow(2, 2, '#00ff88', 10);

        // Start/Stop button
        this.startStopButton = this.createSportyButton(centerX - 140, centerY + 80, 'START', 0x00cc44, () => {
            this.toggleTimer();
        });

        // Reset button
        this.resetButton = this.createSportyButton(centerX + 140, centerY + 80, 'RESET', 0xff3366, () => {
            this.resetTimer();
        });

        // Lap button
        this.lapButton = this.createSportyButton(centerX, centerY + 80, 'LAP', 0xffaa00, () => {
            this.recordLap();
        });

        // Lap times display with panel
        this.lapTimesText = this.add.text(centerX, centerY + 180, '', {
            fontSize: '18px',
            fontFamily: 'Arial Black, Arial',
            color: '#ffffff',
            align: 'center',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.laps = [];
    }

    createSportyButton(x, y, text, color, callback) {
        const buttonWidth = 120;
        const buttonHeight = 55;

        const button = this.add.container(x, y);

        // Button shadow for depth
        const shadow = this.add.rectangle(2, 4, buttonWidth, buttonHeight, 0x000000, 0.5);
        shadow.setStrokeStyle(2, 0x000000, 0.3);

        // Main button background with angle
        const bg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, color)
            .setInteractive({ useHandCursor: true });

        // Sporty border
        const border = this.add.rectangle(0, 0, buttonWidth, buttonHeight);
        border.setStrokeStyle(3, 0xffffff, 0.8);
        border.setFillStyle(color);

        // Accent stripe on button
        const stripe = this.add.rectangle(-20, -10, 80, 4, 0xffffff, 0.3).setAngle(-20);

        const label = this.add.text(0, 0, text, {
            fontSize: '22px',
            fontFamily: 'Impact, Arial Black, Arial',
            color: '#ffffff',
            fontStyle: 'bold',
            letterSpacing: '2px'
        }).setOrigin(0.5);

        button.add([shadow, bg, border, stripe, label]);

        // Hover effects
        bg.on('pointerover', () => {
            button.setScale(1.05);
            bg.setFillStyle(Phaser.Display.Color.GetColor(
                Math.min(255, Phaser.Display.Color.IntegerToColor(color).r + 40),
                Math.min(255, Phaser.Display.Color.IntegerToColor(color).g + 40),
                Math.min(255, Phaser.Display.Color.IntegerToColor(color).b + 40)
            ));
        });

        bg.on('pointerout', () => {
            button.setScale(1);
            bg.setFillStyle(color);
        });

        bg.on('pointerdown', () => {
            button.setScale(0.95);
        });

        bg.on('pointerup', () => {
            button.setScale(1.05);
            callback();
        });

        button.bg = bg;
        button.border = border;
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
            this.startStopButton.bg.setFillStyle(0x00cc44);
            this.startStopButton.border.setFillStyle(0x00cc44);
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
            this.startStopButton.bg.setFillStyle(0xff6600);
            this.startStopButton.border.setFillStyle(0xff6600);
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
        this.timerText.setText('00:00:00.00');
        this.startStopButton.label.setText('START');
        this.startStopButton.bg.setFillStyle(0x00cc44);
        this.startStopButton.border.setFillStyle(0x00cc44);
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
            return `LAP ${lapNumber} ▸ ${this.formatTime(time)}`;
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
    type: Phaser.CANVAS,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#0a0e27',
    scene: TimerScene,
    render: {
        antialias: true,
        pixelArt: false
    }
};

const game = new Phaser.Game(config);
