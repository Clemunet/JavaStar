function createSweepingTone(options) {
    if (!soundEffectsEnabled) return;
    const context = getAudioContext();
    if (!context) return;

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;

    oscillator.type = options.waveType;
    oscillator.frequency.setValueAtTime(options.startFrequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(
        options.endFrequency,
        now + options.duration
    );
    gain.gain.setValueAtTime(options.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + options.duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + options.duration);
}

function playPlayerLaserSound(weaponType = "front") {
    const isSideBattery = weaponType === "side";

    createSweepingTone({
        startFrequency: isSideBattery ? 720 : 980,
        endFrequency: isSideBattery ? 210 : 360,
        duration: isSideBattery ? 0.11 : 0.075,
        volume: isSideBattery ? 0.035 : 0.025,
        waveType: "square"
    });
    createSweepingTone({
        startFrequency: isSideBattery ? 360 : 490,
        endFrequency: 120,
        duration: isSideBattery ? 0.13 : 0.09,
        volume: 0.012,
        waveType: "triangle"
    });
}

function playMissileLaunchSound() {
    createSweepingTone({
        startFrequency: 190,
        endFrequency: 55,
        duration: 0.34,
        volume: 0.055,
        waveType: "sawtooth"
    });
    createSweepingTone({
        startFrequency: 95,
        endFrequency: 38,
        duration: 0.42,
        volume: 0.035,
        waveType: "square"
    });
    window.setTimeout(function () {
        createSweepingTone({
            startFrequency: 420,
            endFrequency: 120,
            duration: 0.16,
            volume: 0.018,
            waveType: "triangle"
        });
    }, 45);
}
