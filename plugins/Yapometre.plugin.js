/**
 * @name Yapometre
 * @author Kerminat0r
 * @version 1.0.0
 * @description Classement en direct de qui parle le plus en vocal, avec des titres et un récap à copier à la fin de l'appel. Rien n'est envoyé automatiquement.
 */

const PLUGIN = "Yapometre";
const TICK_MS = 500;
const PANEL_ROWS = 8;
const MIN_RECAP_SECONDS = 10;
const PANEL_ID = "yapometre-panel";
const RECAP_ID = "yapometre-recap";

const clock = (seconds) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

// Ranks speakers and gives each one a title. Silent people always come last as ghosts.
function ranking(times) {
  const rows = [...times.values()].sort((a, b) => b.seconds - a.seconds);
  const total = rows.reduce((sum, row) => sum + row.seconds, 0);
  return rows.map((row, index) => {
    let title = "Timide";
    const share = total > 0 ? row.seconds / total : 0;
    if (row.seconds <= 0) title = "Fantôme";
    else if (index === 0) title = "Moulin à paroles";
    else if (share >= 0.25) title = "Podcasteur";
    else if (share >= 0.1) title = "Commentateur";
    return { ...row, title };
  });
}

function recapText(rows) {
  const total = rows.reduce((sum, row) => sum + row.seconds, 0);
  const lines = rows.map((row, index) => `${index + 1}. ${row.name} : ${clock(row.seconds)} (${row.title})`);
  return [`Yap-o-mètre : ${clock(total)} de blabla`, ...lines].join("\n");
}

module.exports = class Yapometre {
  constructor(meta) {
    this.meta = meta;
    this.timer = null;
    this.channel = null;
    this.times = new Map();
    this.ticks = 0;
  }

  store(name) {
    return BdApi.Webpack.Stores?.[name] ?? BdApi.Webpack.getStore?.(name);
  }

  start() {
    this.voice = this.store("VoiceStateStore");
    this.selected = this.store("SelectedChannelStore");
    this.speaking = this.store("SpeakingStore");
    this.users = this.store("UserStore");
    this.members = this.store("GuildMemberStore");
    this.channels = this.store("ChannelStore");
    if (!this.voice || !this.selected || !this.speaking || !this.users) {
      BdApi.UI.showToast("Yap-o-mètre : Discord a changé, plugin en pause", { type: "error" });
      return;
    }
    this.timer = setInterval(() => this.tick(), TICK_MS);
  }

  stop() {
    clearInterval(this.timer);
    this.timer = null;
    this.channel = null;
    document.getElementById(PANEL_ID)?.remove();
    document.getElementById(RECAP_ID)?.remove();
  }

  memberIds(channelId) {
    const states = this.voice.getVoiceStatesForChannel?.(channelId);
    if (!states) return [];
    return Object.entries(states).map(([key, state]) => state?.userId ?? key);
  }

  displayName(id) {
    const user = this.users.getUser(id);
    const guildId = this.channels?.getChannel?.(this.channel)?.guild_id;
    return (guildId && this.members?.getNick?.(guildId, id)) || user?.globalName || user?.username || "Inconnu";
  }

  tick() {
    try {
      const channel = this.selected.getVoiceChannelId() ?? null;
      if (channel !== this.channel) {
        if (this.channel) this.finishCall();
        this.channel = channel;
        this.times = new Map();
        document.getElementById(PANEL_ID)?.remove();
      }
      if (!channel) return;
      for (const id of this.memberIds(channel)) {
        if (!this.times.has(id)) this.times.set(id, { id, name: this.displayName(id), seconds: 0 });
        if (this.speaking.isSpeaking(id)) this.times.get(id).seconds += TICK_MS / 1000;
      }
      if (this.ticks++ % 2 === 0) this.render();
    } catch (e) {
      console.error(`[${PLUGIN}] tick failed`, e);
    }
  }

  panel() {
    const found = document.getElementById(PANEL_ID);
    if (found) return found;
    const saved = BdApi.Data.load(PLUGIN, "place") ?? { right: 20, top: 60 };
    const panel = document.createElement("div");
    panel.id = PANEL_ID;
    panel.style.cssText = `position:fixed;right:${saved.right}px;top:${saved.top}px;z-index:10000;width:250px;padding:10px 12px;border-radius:10px;background:rgba(17,18,20,.92);color:#fff;font:13px var(--font-primary,sans-serif);box-shadow:0 6px 20px rgba(0,0,0,.45);cursor:move;user-select:none`;
    const title = document.createElement("div");
    title.textContent = "Yap-o-mètre";
    title.style.cssText = "font-weight:700;margin-bottom:6px";
    const list = document.createElement("div");
    list.className = "yapometre-list";
    panel.append(title, list);
    panel.onmousedown = (e) => this.drag(e, panel);
    document.body.append(panel);
    return panel;
  }

  drag(event, panel) {
    const box = panel.getBoundingClientRect();
    const grabX = event.clientX - box.left;
    const grabY = event.clientY - box.top;
    const move = (e) => {
      panel.style.top = `${Math.max(0, e.clientY - grabY)}px`;
      panel.style.right = `${Math.max(0, window.innerWidth - (e.clientX - grabX) - box.width)}px`;
    };
    const drop = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", drop);
      BdApi.Data.save(PLUGIN, "place", { right: parseInt(panel.style.right), top: parseInt(panel.style.top) });
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", drop);
  }

  render() {
    const list = this.panel().querySelector(".yapometre-list");
    list.replaceChildren(...ranking(this.times).slice(0, PANEL_ROWS).map((row, index) => {
      const line = document.createElement("div");
      line.style.cssText = "display:flex;justify-content:space-between;gap:8px;padding:2px 0";
      const who = document.createElement("span");
      who.textContent = `${index + 1}. ${row.name}`;
      who.style.cssText = "overflow:hidden;white-space:nowrap;text-overflow:ellipsis";
      const stat = document.createElement("span");
      stat.textContent = `${clock(row.seconds)} · ${row.title}`;
      stat.style.cssText = "flex:none;color:#b5bac1";
      line.append(who, stat);
      return line;
    }));
  }

  copy(text) {
    if (window.DiscordNative?.clipboard?.copy) window.DiscordNative.clipboard.copy(text);
    else navigator.clipboard?.writeText(text);
    BdApi.UI.showToast("Récap copié. Colle-le où tu veux.", { type: "success" });
  }

  finishCall() {
    const rows = ranking(this.times);
    if (rows.reduce((sum, row) => sum + row.seconds, 0) < MIN_RECAP_SECONDS) return;
    document.getElementById(RECAP_ID)?.remove();
    const text = recapText(rows);
    const box = document.createElement("div");
    box.id = RECAP_ID;
    box.style.cssText = "position:fixed;right:20px;bottom:20px;z-index:10001;width:320px;padding:14px;border-radius:10px;background:#111214;color:#fff;font:13px var(--font-primary,sans-serif);box-shadow:0 8px 24px rgba(0,0,0,.5)";
    const body = document.createElement("div");
    body.textContent = text;
    body.style.cssText = "white-space:pre-wrap;margin-bottom:12px";
    const button = (label, primary, action) => {
      const b = document.createElement("button");
      b.textContent = label;
      b.style.cssText = `margin-right:8px;padding:7px 14px;border:none;border-radius:4px;cursor:pointer;color:#fff;background:${primary ? "#5865f2" : "#4e5058"}`;
      b.onclick = action;
      return b;
    };
    box.append(body, button("Copier", true, () => this.copy(text)), button("Fermer", false, () => box.remove()));
    document.body.append(box);
  }
};

module.exports.ranking = ranking;
module.exports.recapText = recapText;
