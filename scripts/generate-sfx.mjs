import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function writeWav(filename, generateSample, durationMs) {
  const sampleRate = 44100;
  const numChannels = 1;
  const bitsPerSample = 16;
  const numSamples = Math.floor((durationMs / 1000) * sampleRate);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const chunkSize = 36 + dataSize;
  
  const buffer = Buffer.alloc(44 + dataSize);
  
  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(chunkSize, 4);
  buffer.write('WAVE', 8);
  // fmt chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = generateSample(t, i, numSamples);
    
    // Apply fade in/out envelope
    const fadeLen = 0.01 * sampleRate;
    let envelope = 1.0;
    if (i < fadeLen) envelope = i / fadeLen;
    else if (i > numSamples - fadeLen) envelope = (numSamples - i) / fadeLen;
    
    sample *= envelope;
    
    // Clip
    if (sample > 1) sample = 1;
    if (sample < -1) sample = -1;
    
    const intSample = Math.floor(sample * 32767);
    buffer.writeInt16LE(intSample, 44 + i * 2);
  }
  
  const filepath = path.join(__dirname, '..', 'assets', 'sounds', filename);
  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  fs.writeFileSync(filepath, buffer);
  console.log(`Generated ${filename}`);
}

// 1. Move: clic de pieza de madera, suave, 70-100 ms.
writeWav('move.wav', (t) => {
  const env = Math.exp(-t * 40); 
  const noise = (Math.random() * 2 - 1) * 0.5;
  const tone = Math.sin(t * 2 * Math.PI * 150) * 0.5;
  return (noise + tone) * env * 0.8;
}, 85);

// 2. Capture: golpe más grave y marcado, 120-170 ms.
writeWav('capture.wav', (t) => {
  const env = Math.exp(-t * 25);
  const noise = (Math.random() * 2 - 1) * 0.3;
  const freq = 120 - t * 400; 
  const tone = Math.sin(t * 2 * Math.PI * Math.max(freq, 40)) * 0.8;
  return (noise + tone) * env * 0.9;
}, 150);

// 3. Check: aviso breve de dos tonos, 180-250 ms.
writeWav('check.wav', (t) => {
  const isFirst = t < 0.1;
  const freq = isFirst ? 523.25 : 659.25; // C5 : E5
  const localT = isFirst ? t : t - 0.1;
  const env = Math.exp(-localT * 15);
  return Math.sin(localT * 2 * Math.PI * freq) * env * 0.6;
}, 220);

// 4. Victory: arpegio positivo de cuatro notas, 600-900 ms.
writeWav('victory.wav', (t) => {
  const noteDuration = 0.15;
  const step = Math.floor(t / noteDuration);
  const freqs = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
  if (step >= freqs.length) return 0;
  
  const freq = freqs[step];
  const localT = t - step * noteDuration;
  const env = step === freqs.length - 1 ? Math.exp(-localT * 5) : Math.exp(-localT * 10);
  
  return Math.sin(localT * 2 * Math.PI * freq) * env * 0.5;
}, 800);
