/**
 * @name Bonk
 * @author Kerminat0r
 * @version 1.0.0
 * @description Clic droit sur quelqu'un puis Bonk : coup de marteau, écran qui tremble et bruit de bonk, avec un compteur par personne. Seul toi le vois.
 */

const PLUGIN = "Bonk";
const HAMMER_ID = "bonk-hammer";
const STYLE_ID = "bonk-style";
const SHAKE_MS = 450;
const HAMMER_MS = 600;

module.exports = class Bonk {
  constructor(meta) {
    this.meta = meta;
  }

  start() {
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      @keyframes bonk-shake{0%,100%{transform:translate(0,0)}15%{transform:translate(-10px,6px)}30%{transform:translate(9px,-7px)}45%{transform:translate(-7px,-4px)}60%{transform:translate(6px,5px)}80%{transform:translate(-3px,2px)}}
      @keyframes bonk-swing{0%{transform:translate(-50%,-50%) rotate(-70deg) scale(.7);opacity:0}45%{transform:translate(-50%,-50%) rotate(25deg) scale(1.2);opacity:1}100%{transform:translate(-50%,-50%) rotate(0) scale(1);opacity:0}}
      .bonk-shaking{animation:bonk-shake ${SHAKE_MS}ms linear}`;
    document.head.append(style);
    this.unpatch = BdApi.ContextMenu.patch("user-context", (tree, props) => this.addItem(tree, props));
  }

  stop() {
    this.unpatch?.();
    this.unpatch = null;
    clearTimeout(this.timer);
    document.getElementById(HAMMER_ID)?.remove();
    document.getElementById("app-mount")?.classList.remove("bonk-shaking");
    document.getElementById(STYLE_ID)?.remove();
    this.audio?.close?.();
    this.audio = null;
  }

  // Anti-crash: any problem leaves Discord's menu as it was.
  addItem(tree, props) {
    try {
      const user = props?.user;
      if (!user || !tree?.props) return;
      const count = this.counts[user.id] ?? 0;
      const label = count > 0 ? `Bonk ! (${count})` : "Bonk !";
      const item = BdApi.ContextMenu.buildItem({ type: "text", id: "bonk-user", label, action: () => this.bonk(user) });
      tree.props.children = [...[tree.props.children].flat(), item];
    } catch (e) {
      console.error(`[${PLUGIN}] menu failed`, e);
    }
  }

  get counts() {
    return BdApi.Data.load(PLUGIN, "counts") ?? {};
  }

  bonk(user) {
    const counts = this.counts;
    counts[user.id] = (counts[user.id] ?? 0) + 1;
    BdApi.Data.save(PLUGIN, "counts", counts);
    this.animate();
    this.sound();
    BdApi.UI.showToast(`Bonk ! ${user.globalName || user.username} : ${counts[user.id]}`, { type: "info" });
  }

  animate() {
    const app = document.getElementById("app-mount");
    if (app) {
      app.classList.remove("bonk-shaking");
      void app.offsetWidth;
      app.classList.add("bonk-shaking");
    }
    document.getElementById(HAMMER_ID)?.remove();
    const hammer = document.createElement("div");
    hammer.id = HAMMER_ID;
    hammer.textContent = "🔨";
    hammer.style.cssText = `position:fixed;left:50%;top:50%;z-index:100002;font-size:150px;pointer-events:none;animation:bonk-swing ${HAMMER_MS}ms ease-out forwards`;
    document.body.append(hammer);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      hammer.remove();
      app?.classList.remove("bonk-shaking");
    }, Math.max(SHAKE_MS, HAMMER_MS));
  }

  // A low thud with a short ring on top, made on the spot.
  sound() {
    try {
      this.audio ??= new AudioContext();
      const now = this.audio.currentTime;
      const play = (type, from, to, level, length) => {
        const tone = this.audio.createOscillator();
        const gain = this.audio.createGain();
        tone.type = type;
        tone.frequency.setValueAtTime(from, now);
        tone.frequency.exponentialRampToValueAtTime(to, now + length);
        gain.gain.setValueAtTime(level, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + length);
        tone.connect(gain).connect(this.audio.destination);
        tone.start(now);
        tone.stop(now + length);
      };
      play("sine", 180, 45, 0.5, 0.22);
      play("triangle", 900, 500, 0.12, 0.16);
    } catch (e) {
      console.error(`[${PLUGIN}] sound failed`, e);
    }
  }
};
