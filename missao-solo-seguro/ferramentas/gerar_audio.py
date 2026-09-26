"""Gera a trilha sonora e os efeitos do jogo 'Missão Solo Seguro'.

Uso (opcional, só se quiser recriar ou alterar os sons):
    pip install numpy scipy      # e ter o ffmpeg instalado
    python ferramentas/gerar_audio.py

Todo o áudio é sintetizado aqui (sem amostras de terceiros), então pode ser
publicado livremente no GitHub. Saída: MP3 mono, compatível com todos os
navegadores modernos (Chrome, Edge, Firefox, Safari, Android e iOS).
"""
import os
import subprocess
import tempfile
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 44100
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "audio")
TMP = os.path.join(tempfile.gettempdir(), "missao-solo-seguro-wav")
os.makedirs(OUT, exist_ok=True)
os.makedirs(TMP, exist_ok=True)
rng = np.random.default_rng(7)


def t_axis(dur):
    return np.arange(int(dur * SR)) / SR


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def lp(x, fc, order=2):
    sos = butter(order, fc, btype="low", fs=SR, output="sos")
    return sosfilt(sos, x)


def hp(x, fc, order=2):
    sos = butter(order, fc, btype="high", fs=SR, output="sos")
    return sosfilt(sos, x)


def bp(x, lo, hi, order=2):
    sos = butter(order, [lo, hi], btype="band", fs=SR, output="sos")
    return sosfilt(sos, x)


def adsr(n, a=0.01, d=0.1, s=0.7, r=0.2, sus_time=None):
    a_n, d_n, r_n = int(a * SR), int(d * SR), int(r * SR)
    if sus_time is None:
        s_n = max(0, n - a_n - d_n - r_n)
    else:
        s_n = int(sus_time * SR)
    env = np.concatenate([
        np.linspace(0, 1, max(a_n, 1), endpoint=False),
        np.linspace(1, s, max(d_n, 1), endpoint=False),
        np.full(s_n, s),
        np.linspace(s, 0, max(r_n, 1)),
    ])
    if len(env) < n:
        env = np.concatenate([env, np.zeros(n - len(env))])
    return env[:n]


# ---------------------------------------------------------------- instrumentos
def marimba(f, dur=0.9, bright=1.0):
    t = t_axis(dur)
    env = np.exp(-t * 6.5)
    x = np.sin(2 * np.pi * f * t) * env
    x += 0.28 * bright * np.sin(2 * np.pi * f * 3.93 * t) * np.exp(-t * 22)
    x += 0.10 * bright * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t * 45)
    x[: int(0.002 * SR)] *= np.linspace(0, 1, int(0.002 * SR))
    return x


def bell(f, dur=1.2):
    t = t_axis(dur)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 4)
    x += 0.5 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 7)
    x += 0.25 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 12)
    x[: int(0.003 * SR)] *= np.linspace(0, 1, int(0.003 * SR))
    return x


def saw_soft(f, t, harmonics=9):
    x = np.zeros_like(t)
    for k in range(1, harmonics + 1):
        if f * k > 9000:
            break
        x += np.sin(2 * np.pi * f * k * t) / k
    return x


def pad(notes, dur, cutoff=1400, attack=0.9, release=1.2):
    t = t_axis(dur + release)
    x = np.zeros_like(t)
    for n in notes:
        f = midi(n)
        for det in (-0.12, 0.0, 0.11):
            ph = rng.uniform(0, 1)
            x += saw_soft(f * 2 ** (det / 12), t + ph / f)
    x = lp(x, cutoff)
    env = adsr(len(t), a=attack, d=0.4, s=0.8, r=release, sus_time=max(0, dur - attack - 0.4))
    # leve tremolo para "respirar"
    x *= env * (0.9 + 0.1 * np.sin(2 * np.pi * 0.25 * t))
    return x / (len(notes) * 3)


def bass(f, dur):
    t = t_axis(dur)
    x = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t)
    return x * adsr(len(t), a=0.008, d=0.15, s=0.6, r=0.12)


def kick(dur=0.3):
    t = t_axis(dur)
    f = 50 + 70 * np.exp(-t * 30)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 11)


def shaker(dur=0.07):
    n = int(dur * SR)
    x = hp(rng.standard_normal(n), 6500)
    return x * np.exp(-np.arange(n) / SR * 55)


def tick(dur=0.03):
    n = int(dur * SR)
    x = hp(rng.standard_normal(n), 8000, 4)
    return x * np.exp(-np.arange(n) / SR * 180)


def woodclick(f=1600, dur=0.05):
    t = t_axis(dur)
    return np.sin(2 * np.pi * f * t) * np.exp(-t * 110)


# ---------------------------------------------------------------- utilidades
def place(buf, x, start_s, gain=1.0, wrap=True):
    i = int(start_s * SR)
    n = len(x)
    L = len(buf)
    if i + n <= L:
        buf[i:i + n] += x * gain
    else:
        k = L - i
        buf[i:] += x[:k] * gain
        if wrap:  # a cauda volta para o início -> loop sem emenda
            rest = x[k:] * gain
            buf[: len(rest)] += rest[: L]


def master(x, peak=0.89, drive=1.2):
    x = x / (np.max(np.abs(x)) + 1e-9)
    x = np.tanh(x * drive) / np.tanh(drive)
    return x * peak


def export(name, x, kbps=96):
    wav = os.path.join(TMP, name + ".wav")
    mp3 = os.path.join(OUT, name + ".mp3")
    wavfile.write(wav, SR, (x * 32767).astype(np.int16))
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-ac", "1", "-codec:a", "libmp3lame",
         "-b:a", f"{kbps}k", mp3],
        check=True,
    )
    print(f"{name}.mp3  {len(x)/SR:5.2f}s  {os.path.getsize(mp3)//1024} KB")


# ---------------------------------------------------------------- trilhas
def tema_campo():
    """Exploração no território: calmo, curioso. Lá menor pentatônico, 100 BPM."""
    bpm = 100
    beat = 60 / bpm
    bar = 4 * beat
    bars = 16
    L = int(bars * bar * SR)
    buf = np.zeros(L)
    # Am  F  C  G  (2 compassos cada) x2
    prog = [
        ([57, 60, 64], 45), ([53, 57, 60], 41), ([55, 60, 64], 48), ([55, 59, 62], 43),
    ] * 2
    arps = {
        45: [69, 72, 76, 79, 76, 72, 74, 72],
        41: [69, 72, 77, 76, 72, 69, 72, 74],
        48: [72, 76, 79, 81, 79, 76, 74, 76],
        43: [71, 74, 79, 78, 74, 71, 74, 79],
    }
    for ci, (chord, root) in enumerate(prog):
        t0 = ci * 2 * bar
        place(buf, pad(chord, 2 * bar - 0.1), t0, 0.55)
        for b in range(2):
            tb = t0 + b * bar
            place(buf, bass(midi(root - 12), beat * 1.6), tb, 0.55)
            place(buf, bass(midi(root - 12), beat * 0.9), tb + 2.5 * beat, 0.42)
            place(buf, kick(), tb, 0.35)
            place(buf, kick(), tb + 2 * beat, 0.22)
            pattern = arps[root]
            for k, note in enumerate(pattern):
                # "respiração": na segunda volta, silencia algumas notas
                if ci >= 4 and k in (3, 7) and b == 1:
                    continue
                vel = 0.32 if k % 2 == 0 else 0.22
                place(buf, marimba(midi(note)), tb + k * beat / 2, vel)
            for k in range(8):
                place(buf, shaker(), tb + k * beat / 2 + beat / 4, 0.05 if k % 2 else 0.035)
    # melodia simples nos compassos 9-16
    mel = [(76, 0, 1.5), (74, 1.5, 0.5), (72, 2, 2), (69, 4, 2), (72, 6, 1), (74, 7, 1),
           (76, 8, 1.5), (79, 9.5, 0.5), (76, 10, 2), (74, 12, 3), (71, 15, 1)]
    for note, pos, d in mel:
        place(buf, bell(midi(note + 12), 0.9 + d * 0.3), 8 * bar + pos * beat * 2, 0.12)
    export("tema_campo", master(lp(buf, 9000), 0.8, 1.1), 112)


def tema_laboratorio():
    """Laboratório / decisão: pulso de relógio, investigativo. Ré menor, 112 BPM."""
    bpm = 112
    beat = 60 / bpm
    bar = 4 * beat
    bars = 16
    L = int(bars * bar * SR)
    buf = np.zeros(L)
    prog = [([62, 65, 69], 50), ([58, 62, 65], 46), ([55, 58, 62], 43), ([57, 61, 64], 45)] * 2
    for ci, (chord, root) in enumerate(prog):
        t0 = ci * 2 * bar
        place(buf, pad(chord, 2 * bar - 0.1, cutoff=1100), t0, 0.5)
        for b in range(2):
            tb = t0 + b * bar
            for k in range(8):
                note = root - 12 if k % 4 != 3 else root - 5
                place(buf, bass(midi(note), beat * 0.42), tb + k * beat / 2, 0.42 if k % 2 == 0 else 0.3)
            place(buf, kick(), tb, 0.35)
            place(buf, kick(), tb + 2 * beat, 0.3)
            for k in range(16):
                place(buf, tick(), tb + k * beat / 4, 0.09 if k % 4 == 0 else 0.045)
            seq = [chord[0] + 12, chord[1] + 12, chord[2] + 12, chord[1] + 12]
            for k in range(8):
                if (k + b) % 3 == 2:
                    continue
                place(buf, marimba(midi(seq[k % 4]), 0.5, 0.8), tb + k * beat / 2, 0.2)
            place(buf, woodclick(1100), tb + 3.5 * beat, 0.12)
    export("tema_laboratorio", master(lp(buf, 8500), 0.8, 1.1), 112)


# ---------------------------------------------------------------- efeitos
def one_shot(dur):
    return np.zeros(int(dur * SR))


def sfx_clique():
    b = one_shot(0.08)
    place(b, woodclick(1500, 0.06), 0, 0.9, wrap=False)
    place(b, tick(0.02), 0, 0.3, wrap=False)
    export("clique", master(b, 0.6))


def sfx_selecionar():
    t = t_axis(0.16)
    f = 700 + 900 * t / 0.16
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 16)
    export("selecionar", master(x, 0.55))


def sfx_acerto():
    b = one_shot(1.1)
    place(b, bell(midi(88), 1.0), 0.0, 0.7, wrap=False)
    place(b, bell(midi(95), 1.0), 0.09, 0.8, wrap=False)
    place(b, marimba(midi(76), 0.6), 0.0, 0.35, wrap=False)
    export("acerto", master(b, 0.75))


def sfx_erro():
    t = t_axis(0.5)
    f = 210 - 70 * t / 0.5
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sign(np.sin(ph)) * 0.5 + np.sin(ph)
    x = lp(x, 900) * adsr(len(t), 0.01, 0.1, 0.7, 0.2)
    b = one_shot(0.55)
    place(b, x, 0, 1, wrap=False)
    place(b, x * 0.6, 0.0, 1, wrap=False)
    export("erro", master(b, 0.6))


def sfx_conquista():
    b = one_shot(2.0)
    for i, n in enumerate([72, 76, 79, 84, 88]):
        place(b, bell(midi(n), 1.3), i * 0.08, 0.5, wrap=False)
    shimmer = hp(rng.standard_normal(int(1.2 * SR)), 7000) * np.exp(-t_axis(1.2) * 3.5) * 0.08
    place(b, shimmer, 0.35, 1, wrap=False)
    place(b, pad([72, 76, 79], 0.8, cutoff=2500, attack=0.05, release=0.8), 0.35, 0.8, wrap=False)
    export("conquista", master(b, 0.8))


def sfx_fase():
    """Fase concluída: pequena fanfarra."""
    b = one_shot(1.8)
    notes = [(67, 0.0), (72, 0.13), (76, 0.26), (79, 0.39)]
    for n, s in notes:
        t = t_axis(0.35)
        x = lp(saw_soft(midi(n), t, 12), 3000) * adsr(len(t), 0.01, 0.08, 0.7, 0.12)
        place(b, x, s, 0.35, wrap=False)
    t = t_axis(1.2)
    chord = sum(lp(saw_soft(midi(n), t, 12), 2600) for n in (72, 76, 79, 84))
    place(b, chord * adsr(len(t), 0.02, 0.2, 0.6, 0.7), 0.52, 0.22, wrap=False)
    place(b, kick(), 0.52, 0.5, wrap=False)
    export("fase", master(b, 0.8))


def sfx_vitoria():
    b = one_shot(4.2)
    seq = [(60, 0.0), (64, 0.15), (67, 0.3), (72, 0.45), (67, 0.75), (72, 0.9)]
    for n, s in seq:
        t = t_axis(0.4)
        x = lp(saw_soft(midi(n), t, 12), 3200) * adsr(len(t), 0.01, 0.1, 0.7, 0.15)
        place(b, x, s, 0.35, wrap=False)
        place(b, marimba(midi(n + 12), 0.6), s, 0.25, wrap=False)
    t = t_axis(2.6)
    for n in (60, 64, 67, 72, 76):
        place(b, lp(saw_soft(midi(n), t, 12), 2800) * adsr(len(t), 0.03, 0.3, 0.6, 1.4), 1.2, 0.16, wrap=False)
    for i, n in enumerate([84, 88, 91, 96]):
        place(b, bell(midi(n), 1.6), 1.2 + i * 0.07, 0.25, wrap=False)
    place(b, kick(0.4), 1.2, 0.6, wrap=False)
    export("vitoria", master(b, 0.85))


def sfx_transicao():
    n = int(0.7 * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    # varredura de filtro em blocos
    block = 512
    for i in range(0, n, block):
        frac = i / n
        fc = 400 + 5000 * np.sin(np.pi * frac)
        seg = bp(noise[max(0, i - 2048):i + block], fc * 0.7, min(fc * 1.3, 20000))
        out[i:i + block] = seg[-len(out[i:i + block]):]
    out *= np.sin(np.pi * t / 0.7) ** 2
    export("transicao", master(out, 0.45))


def sfx_carimbo():
    b = one_shot(0.4)
    t = t_axis(0.18)
    thump = np.sin(2 * np.pi * (90 + 60 * np.exp(-t * 40)) * t) * np.exp(-t * 28)
    slap = lp(rng.standard_normal(len(t)), 2500) * np.exp(-t * 60)
    place(b, thump, 0, 0.9, wrap=False)
    place(b, slap, 0, 0.5, wrap=False)
    export("carimbo", master(b, 0.75))


def sfx_lama():
    """Estrondo grave e contínuo para a animação da onda de rejeitos (sem tom de espetáculo)."""
    dur = 4.0
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = lp(rng.standard_normal(n), 140, 4) * 3.0
    x += lp(rng.standard_normal(n), 600, 2) * 0.25
    env = np.clip(t / 1.2, 0, 1) * np.clip((dur - t) / 1.5, 0, 1)
    x *= env * (0.8 + 0.2 * np.sin(2 * np.pi * 3.3 * t))
    export("lama", master(x, 0.7, 1.5))


def sfx_tique():
    b = one_shot(0.12)
    place(b, woodclick(2400, 0.04), 0, 0.8, wrap=False)
    place(b, woodclick(1800, 0.04), 0.05, 0.5, wrap=False)
    export("tique", master(b, 0.5))


def sfx_papel():
    """Folha do laudo deslizando."""
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    x = bp(rng.standard_normal(n), 1800, 7000) * (np.sin(np.pi * t / 0.45) ** 1.5)
    x *= 0.7 + 0.3 * np.sin(2 * np.pi * 23 * t)
    export("papel", master(x, 0.45))


if __name__ == "__main__":
    tema_campo()
    tema_laboratorio()
    sfx_clique()
    sfx_selecionar()
    sfx_acerto()
    sfx_erro()
    sfx_conquista()
    sfx_fase()
    sfx_vitoria()
    sfx_transicao()
    sfx_carimbo()
    sfx_lama()
    sfx_tique()
    sfx_papel()
