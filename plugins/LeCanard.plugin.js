/**
 * @name LeCanard
 * @author Kerminat0r
 * @version 1.0.0
 * @description Le canard de Javelinat0r se promène en bas de Discord, sprinte quand quelqu'un rejoint ton vocal et panique quand tu reçois trop de pings. Clique dessus pour qu'il réponde.
 */

const PLUGIN = "LeCanard";
const DUCK_ID = "le-canard";
const STRIP = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPIAAAAWCAYAAAD6vcEwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAGCSURBVHhe7dkxTgJBGEfxbYwlpacwsfEixEMYz2HhFWz1GFaew9pwA9s13zyHHSbgwsLXvZf8A4Tht1RLwTCYmZmZmVl2Lw/D2K5/f2m6pEu6lOIGNG5W4/jzxjari+C6pEu6lOLuoPHY7OluOa5LuqRLWe4E/20YhrF0JqxLuqRLvdtukfv5OIx1z7cTHl+4fOmFsC7pki4dcsOKLXIL9Dot8PX1hMe+P672wnFHade+p0u6pEtZbimgdj369c6dop6v0NyFdUmXdCnL3dYfbtF2cxfu0yVd0qUsdwfuV+8K++4Oc7Au6ZIuZbn/wu0Ci7MVnYN1SZd0KcudhQOq2PrmeFiXdEmXstxSHOjBilakwu3z3unTJV3SpSz3IBwfbtdfpHf6dEmXdCnLLQVef9bbn/d9u+fP8aPSJV3SpSy31N8F+gV4Mqq7TZd0KcstxZ/VFejXnz0lXdIlXcpyS4G3ry+C6m7TJV3KctNgXdIlXUpxK1ofK3ourku6pEtL3F9Nh0t/+trLfwAAAABJRU5ErkJggg==";
const FRAMES = 11;
const CELL = 22;
const ZOOM = 2;
const SIZE = CELL * ZOOM;
const FRAME_MS = 110;
const SPEED = { walk: 0.8, sprint: 5, panic: 7 };
const SPRINT_MS = 3000;
const PANIC_MS = 6000;
const PANIC_PINGS = 3;
const PANIC_WINDOW_MS = 30000;
const WATCH_MS = 1000;

module.exports = class LeCanard {
  constructor(meta) {
    this.meta = meta;
  }

  store(name) {
    return BdApi.Webpack.Stores?.[name] ?? BdApi.Webpack.getStore?.(name);
  }

  start() {
    this.voice = this.store("VoiceStateStore");
    this.selected = this.store("SelectedChannelStore");
    this.users = this.store("UserStore");
    this.dispatcher = this.voice?._dispatcher ?? this.users?._dispatcher;
    this.x = 80;
    this.direction = 1;
    this.mode = "walk";
    this.modeUntil = 0;
    this.pings = [];
    this.frame = 0;
    this.frameAt = 0;
    this.seen = null;
    this.channel = null;
    this.build();
    this.running = true;
    this.onFrame = (now) => this.step(now);
    requestAnimationFrame(this.onFrame);
    this.watcher = setInterval(() => this.watch(), WATCH_MS);
    this.onMessage = (event) => this.message(event);
    this.dispatcher?.subscribe?.("MESSAGE_CREATE", this.onMessage);
  }

  stop() {
    this.running = false;
    clearInterval(this.watcher);
    this.dispatcher?.unsubscribe?.("MESSAGE_CREATE", this.onMessage);
    document.getElementById(DUCK_ID)?.remove();
    this.audio?.close?.();
    this.audio = null;
  }

  build() {
    const duck = document.createElement("div");
    duck.id = DUCK_ID;
    duck.title = "Coin !";
    duck.style.cssText = `position:fixed;left:0;bottom:0;z-index:9999;width:${SIZE}px;height:${SIZE}px;cursor:pointer`;
    const body = document.createElement("div");
    body.style.cssText = `width:100%;height:100%;background:url(${STRIP}) 0 0/${FRAMES * SIZE}px ${SIZE}px no-repeat;image-rendering:pixelated`;
    const bubble = document.createElement("div");
    bubble.style.cssText = "position:absolute;left:50%;bottom:100%;transform:translateX(-50%);padding:2px 7px;border-radius:7px;background:#fff;color:#111;font:700 12px var(--font-primary,sans-serif);white-space:nowrap;display:none";
    duck.append(body, bubble);
    duck.onclick = () => this.quack();
    document.body.append(duck);
    this.element = duck;
    this.body = body;
    this.bubble = bubble;
  }

  say(text, ms) {
    this.bubble.textContent = text;
    this.bubble.style.display = "block";
    clearTimeout(this.bubbleTimer);
    this.bubbleTimer = setTimeout(() => { this.bubble.style.display = "none"; }, ms);
  }

  setMode(mode, ms, text) {
    this.mode = mode;
    this.modeUntil = performance.now() + ms;
    this.say(text, ms);
  }

  step(now) {
    if (!this.running) return;
    try {
      if (this.mode !== "walk" && now >= this.modeUntil) this.mode = "walk";
      const limit = Math.max(SIZE, window.innerWidth - SIZE);
      if (this.mode === "panic" && Math.random() < 0.06) this.direction *= -1;
      this.x += SPEED[this.mode] * this.direction;
      if (this.x <= 0) { this.x = 0; this.direction = 1; }
      if (this.x >= limit) { this.x = limit; this.direction = -1; }
      const wait = this.mode === "walk" ? FRAME_MS : FRAME_MS / 3;
      if (now - this.frameAt >= wait) {
        this.frameAt = now;
        this.frame = (this.frame + 1) % FRAMES;
        this.body.style.backgroundPositionX = `${-this.frame * SIZE}px`;
      }
      this.element.style.transform = `translateX(${this.x}px)`;
      this.body.style.transform = `scaleX(${this.direction})`;
    } catch (e) {
      console.error(`[${PLUGIN}] step failed`, e);
    }
    requestAnimationFrame(this.onFrame);
  }

  // Joining a call yourself doesn't count: the list is only compared inside the same channel.
  watch() {
    try {
      const channel = this.selected?.getVoiceChannelId?.() ?? null;
      const states = channel ? this.voice?.getVoiceStatesForChannel?.(channel) : null;
      const ids = new Set(states ? Object.entries(states).map(([key, state]) => state?.userId ?? key) : []);
      if (channel && channel === this.channel && this.seen && [...ids].some((id) => !this.seen.has(id))) {
        this.setMode("sprint", SPRINT_MS, "Un visiteur !");
      }
      this.channel = channel;
      this.seen = ids;
    } catch (e) {
      console.error(`[${PLUGIN}] watch failed`, e);
    }
  }

  message(event) {
    try {
      const me = this.users?.getCurrentUser?.()?.id;
      const mentioned = (event?.message?.mentions ?? []).some((user) => (user?.id ?? user) === me);
      if (!me || !mentioned) return;
      const now = performance.now();
      this.pings = [...this.pings.filter((at) => now - at < PANIC_WINDOW_MS), now];
      if (this.pings.length >= PANIC_PINGS) {
        this.pings = [];
        this.setMode("panic", PANIC_MS, "AAAAH TROP DE PINGS");
      }
    } catch (e) {
      console.error(`[${PLUGIN}] ping check failed`, e);
    }
  }

  // Two quick falling notes, made on the spot.
  quack() {
    this.say("Coin !", 900);
    this.setMode("sprint", 700, "Coin !");
    try {
      this.audio ??= new AudioContext();
      const start = this.audio.currentTime;
      [0, 0.16].forEach((delay) => {
        const tone = this.audio.createOscillator();
        const gain = this.audio.createGain();
        tone.type = "sawtooth";
        tone.frequency.setValueAtTime(420, start + delay);
        tone.frequency.exponentialRampToValueAtTime(220, start + delay + 0.12);
        gain.gain.setValueAtTime(0.08, start + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, start + delay + 0.13);
        tone.connect(gain).connect(this.audio.destination);
        tone.start(start + delay);
        tone.stop(start + delay + 0.14);
      });
    } catch (e) {
      console.error(`[${PLUGIN}] sound failed`, e);
    }
  }
};
