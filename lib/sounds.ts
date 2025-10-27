// FILE: lib/sounds.ts

import * as Tone from 'tone';

// --- Sound Generators (Tone.js) ---
if (typeof (globalThis as any).knobOsc === 'undefined') {
    (globalThis as any).knobOsc = null;
    (globalThis as any).zapSynth = null;
    (globalThis as any).lockSynth = null;
    (globalThis as any).swooshSynth = null;
    (globalThis as any).susAudio = null;
}
declare global {
    var knobOsc: Tone.Oscillator | null;
    var zapSynth: Tone.Synth | null;
    var lockSynth: Tone.MembraneSynth | null;
    var swooshSynth: Tone.NoiseSynth | null;
    var susAudio: HTMLAudioElement | null;
}

/**
 * Ensures the Tone.js AudioContext is running.
 * Must be called by a user interaction (click, tap, etc.)
 */
export const ensureAudioContextStarted = async () => {
    if (Tone.context.state !== 'running') {
        try {
            await Tone.start();
            console.log("Audio context started by user interaction.");
        } catch (e) {
            console.error("Failed to start AudioContext:", e);
        }
    }
};

/**
 * Initializes all Tone.js synths and sets up a listener
 * to start the audio context on the first user interaction.
 * @returns A cleanup function to be called on component unmount.
 */
export const initializeSounds = () => {
    // This function now *only* sets up the synths
    // Tone.start() is handled by ensureAudioContextStarted()
    const startAudioContext = async () => {
        // We still need Tone.start() here in case the first interaction
        // isn't a button press (e.g., a background click)
        await ensureAudioContextStarted();

        if (!globalThis.knobOsc) {
            globalThis.knobOsc = new Tone.Oscillator({
                type: 'triangle', frequency: 40, volume: -30,
            }).toDestination();
            if (globalThis.knobOsc.state === 'stopped') {
                try {
                    globalThis.knobOsc.start();
                    globalThis.knobOsc.volume.value = -Infinity;
                } catch (e) {
                    console.error("Error starting knob oscillator:", e);
                }
            }
        }
        if (!globalThis.zapSynth) {
            globalThis.zapSynth = new Tone.Synth({
                oscillator: { type: 'sine' },
                envelope: { attack: 0.001, decay: 0.05, sustain: 0.01, release: 0.05 },
                volume: -15,
            }).toDestination();
        }
        if (!globalThis.lockSynth) {
            globalThis.lockSynth = new Tone.MembraneSynth({
                octaves: 4, pitchDecay: 0.1,
                envelope: { attack: 0.001, decay: 0.2, sustain: 0 },
                volume: 15,
            }).toDestination();
        }
        if (!globalThis.swooshSynth) {
            const swooshFilter = new Tone.AutoFilter('4n').toDestination().start();
            swooshFilter.filter.type = 'lowpass';
            swooshFilter.baseFrequency = 500;
            swooshFilter.octaves = 3;

            globalThis.swooshSynth = new Tone.NoiseSynth({
                noise: { type: 'pink' },
                envelope: { attack: 0.01, decay: 0.15, sustain: 0.01, release: 0.1 },
                volume: -5,
            }).connect(swooshFilter);
        }
    };

    // Keep the pointerdown listener as a fallback
    const eventType = 'pointerdown';
    const initHandler = () => {
        startAudioContext();
        document.body.removeEventListener(eventType, initHandler);
    };
    document.body.addEventListener(eventType, initHandler, { once: true, passive: true });

    // Return the main sound cleanup function
    return () => {
        document.body.removeEventListener(eventType, initHandler);
        globalThis.knobOsc?.stop();
    };
};