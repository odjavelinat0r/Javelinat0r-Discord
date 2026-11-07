/**
 * @name CameraQuality
 * @author Kerminat0r
 * @version 1.1.0
 * @description Ajoute une section « Qualité caméra » au menu de la caméra pour choisir la résolution (p), les FPS et le débit de ta caméra, avec des valeurs libres.
 */

const PLUGIN = "CameraQuality";

const DEFAULTS = {
  enabled: false,
  height: 360, // in p, 0 = keep Discord's resolution
  fps: 15, // 0 = keep Discord's FPS
  bitrate: -1 // in kbps, -1 = automatic
};

const HEIGHT_CHOICES = [36, 72, 144, 240, 360, 480, 720, 1080];
const FPS_CHOICES = [1, 5, 10, 15, 24, 30, 60];
const BITRATE_CHOICES = [50, 150, 300, 600, 1500, 2500];

const PRESET_LIMIT = 20;
const PRESET_NAME_LIMIT = 32;
const BUILT_IN_PRESETS = [
  { name: "Faible connexion", height: 360, fps: 15, bitrate: 300 },
  { name: "Équilibré", height: 720, fps: 30, bitrate: 1500 },
  { name: "Qualité max", height: 1080, fps: 30, bitrate: 2500 }
];

module.exports = class CameraQuality {
  constructor(meta) {
    this.meta = meta;
    this.unpatchMenu = null;
  }

  get settings() {
    return { ...DEFAULTS, ...(BdApi.Data.load(PLUGIN, "settings") ?? {}) };
  }

  set(patch) {
    BdApi.Data.save(PLUGIN, "settings", { ...this.settings, ...patch });
    this.reapply();
  }

  get presets() {
    const saved = BdApi.Data.load(PLUGIN, "presets");
    return Array.isArray(saved) ? saved : [];
  }

  applyPreset(preset) {
    this.set({ height: preset.height, fps: preset.fps, bitrate: preset.bitrate, enabled: true });
    BdApi.UI.showToast(`Préréglage appliqué : ${preset.name}`, { type: "success" });
  }

  // Saving under an existing name replaces that preset, so settings can be updated in one step.
  savePreset(rawName) {
    const name = rawName.trim();
    const same = (p) => p.name.toLowerCase() === name.toLowerCase();
    if (!name) return BdApi.UI.showToast("Donne un nom au préréglage", { type: "error" });
    if (name.length > PRESET_NAME_LIMIT) return BdApi.UI.showToast(`Nom trop long (${PRESET_NAME_LIMIT} caractères max)`, { type: "error" });
    if (BUILT_IN_PRESETS.some(same)) return BdApi.UI.showToast("Ce nom est déjà pris par un préréglage intégré", { type: "error" });
    const list = this.presets;
    const others = list.filter((p) => !same(p));
    if (others.length === list.length && list.length >= PRESET_LIMIT) return BdApi.UI.showToast(`Limite de ${PRESET_LIMIT} préréglages atteinte`, { type: "error" });
    const { height, fps, bitrate } = this.settings;
    BdApi.Data.save(PLUGIN, "presets", [...others, { name, height, fps, bitrate }]);
    BdApi.UI.showToast(`Préréglage enregistré : ${name}`, { type: "success" });
  }

  deletePreset(name) {
    BdApi.Data.save(PLUGIN, "presets", this.presets.filter((p) => p.name !== name));
    BdApi.UI.showToast(`Préréglage supprimé : ${name}`, { type: "info" });
  }

  start() {
    this.patchQuality();
    this.patchMenuComponent();
    this.reapply();
  }

  // The camera menu opens as a popout, which BdApi.ContextMenu.patch never sees,
  // so patch the component that renders the "video-device-context" menu instead.
  // Discord only initializes this module the first time the camera UI needs it,
  // so wait for it instead of looking it up once at startup.
  patchMenuComponent() {
    this.abort?.abort();
    this.abort = new AbortController();
    const signal = this.abort.signal;
    const hasMenu = (v) => typeof v === "function" && v.toString().includes('"video-device-context"');
    BdApi.Webpack.waitForModule(BdApi.Webpack.Filters.bySource('navId:"video-device-context"'), { signal, defaultExport: false })
      .then((module) => {
        if (signal.aborted || !module) return;
        const key = Object.keys(module).find((k) => {
          try { return hasMenu(module[k]); } catch { return false; }
        });
        if (!key) {
          BdApi.UI.showToast("CameraQuality : menu caméra de Discord introuvable", { type: "error" });
          return;
        }
        BdApi.Patcher.after(PLUGIN, module, key, (_, __, ret) => {
          this.patchMenu(ret);
          return ret;
        });
      })
      .catch((e) => {
        if (!signal.aborted) console.error(`[${PLUGIN}] waiting for camera menu failed`, e);
      });
  }

  stop() {
    this.abort?.abort();
    this.abort = null;
    BdApi.Patcher.unpatchAll(PLUGIN);
    this.reapply();
  }

  // Discord's VideoQualityManager computes what the camera sends; override it for non-stream contexts.
  patchQuality() {
    const Manager = BdApi.Webpack.getByPrototypeKeys("applyQualityConstraints", "setGoliveQuality", { searchExports: true });
    if (!Manager) {
      BdApi.UI.showToast("CameraQuality : module vidéo de Discord introuvable", { type: "error" });
      return;
    }
    const plugin = this;
    // YABDP4Nitro pushes its stream bitrates into the camera's qualityOverwrite on every
    // updateVideoQuality. While CameraQuality is on, compute the camera quality without that
    // overwrite so the two plugins don't fight over the camera.
    BdApi.Patcher.instead(PLUGIN, Manager.prototype, "getQuality", (manager, args, original) => {
      if (!plugin.appliesTo(manager)) return original.apply(manager, args);
      const saved = manager.qualityOverwrite;
      manager.qualityOverwrite = undefined;
      try {
        return original.apply(manager, args);
      } finally {
        manager.qualityOverwrite = saved;
      }
    });
    BdApi.Patcher.after(PLUGIN, Manager.prototype, "getQuality", (manager, __, ret) => {
      if (ret == null || !plugin.appliesTo(manager)) return ret;
      const s = plugin.settings;

      const out = Object.assign(Object.create(Object.getPrototypeOf(ret)), ret);
      const cap = ret.capture ?? ret.encode;
      const ratio = cap?.width > 0 && cap?.height > 0 ? cap.width / cap.height : 16 / 9;
      const height = s.height > 0 ? Math.round(s.height) : cap?.height;
      const width = s.height > 0 ? Math.max(2, Math.round((height * ratio) / 2) * 2) : cap?.width;
      const fps = s.fps > 0 ? Math.round(s.fps) : cap?.framerate;
      if (height > 0 && width > 0) {
        const res = { width, height, framerate: fps, pixelCount: width * height };
        out.capture = { ...res };
        out.encode = { ...res };
      }
      // Auto bitrate: scale with pixels × FPS (~0.1 bit per pixel, Discord's 720p30 ratio)
      // so a tiny resolution doesn't keep Discord's full camera bitrate and eat the upload.
      let bps = s.bitrate > 0 ? Math.round(s.bitrate * 1000) : null;
      if (bps == null && height > 0 && width > 0 && fps > 0) {
        const scaled = Math.max(30000, Math.round(width * height * fps * 0.1));
        if (!(ret.bitrateMax > 0) || scaled < ret.bitrateMax) bps = scaled;
      }
      if (bps != null) {
        out.bitrateMax = bps;
        out.bitrateTarget = bps;
        out.bitrateMin = Math.min(ret.bitrateMin ?? bps, bps);
      }
      return out;
    });
  }

  // Only the camera: never a Go Live stream, and never a screen share sent through the call connection
  // (DM calls share the screen on the "default" connection).
  appliesTo(manager) {
    try {
      if (!this.settings.enabled || manager?.isStreamContext) return false;
      return !manager?.connection?.hasDesktopSource?.();
    } catch {
      return false;
    }
  }

  // Ask every camera (non-stream) connection to recompute its quality right away.
  reapply() {
    try {
      const engine = BdApi.Webpack.Stores.MediaEngineStore?.getMediaEngine?.();
      const connections = engine?.connections;
      const list = connections?.values ? Array.from(connections.values()) : Array.from(connections ?? []);
      for (const conn of list) {
        if (conn?.context === "stream" || conn?.videoQualityManager?.isStreamContext) continue;
        if (!(conn?.videoStreamParameters?.length > 0) || conn?.hasDesktopSource?.()) continue;
        try { conn.updateVideoQuality?.(); } catch (e) { console.error(`[${PLUGIN}] update failed`, e); }
      }
    } catch (e) {
      console.error(`[${PLUGIN}] reapply failed`, e);
    }
  }

  // Plain DOM prompt: no React/BetterDiscord components, so it cannot crash Discord's UI.
  promptNumber(title, current, min, onValue) {
    const parse = (raw) => {
      const n = Math.round(Number(raw));
      return Number.isFinite(n) && n >= min ? n : null;
    };
    this.prompt(title, current, (input) => { input.type = "number"; input.min = String(min); }, parse, onValue);
  }

  promptText(title, current, onValue) {
    this.prompt(title, current, (input) => { input.type = "text"; input.maxLength = PRESET_NAME_LIMIT; }, (raw) => raw, onValue);
  }

  prompt(title, current, setUp, parse, onValue) {
    try {
      document.getElementById("camera-quality-prompt")?.remove();
      const overlay = document.createElement("div");
      overlay.id = "camera-quality-prompt";
      overlay.style.cssText = "position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.6)";
      const box = document.createElement("div");
      box.style.cssText = "background:var(--background-base-low,#2b2d31);color:var(--text-normal,#dbdee1);padding:20px;border-radius:8px;min-width:300px;font-family:var(--font-primary,sans-serif);box-shadow:0 8px 24px rgba(0,0,0,.5)";
      const label = document.createElement("div");
      label.textContent = title;
      label.style.cssText = "font-size:16px;font-weight:600;margin-bottom:12px";
      const input = document.createElement("input");
      setUp(input);
      input.value = String(current);
      input.style.cssText = "width:100%;box-sizing:border-box;padding:10px;font-size:16px;border-radius:4px;border:1px solid var(--border-subtle,#3f4147);background:var(--input-background,#1e1f22);color:var(--text-normal,#dbdee1);outline:none";
      const row = document.createElement("div");
      row.style.cssText = "display:flex;justify-content:flex-end;gap:8px;margin-top:16px";
      const mkButton = (text, primary) => {
        const b = document.createElement("button");
        b.textContent = text;
        b.style.cssText = `padding:8px 16px;border:none;border-radius:4px;cursor:pointer;font-size:14px;color:#fff;background:${primary ? "var(--brand-500,#5865f2)" : "var(--background-mod-strong,#4e5058)"}`;
        return b;
      };
      const cancel = mkButton("Annuler", false);
      const ok = mkButton("OK", true);
      const close = () => overlay.remove();
      const confirm = () => {
        const value = parse(input.value);
        close();
        if (value != null) onValue(value);
        else BdApi.UI.showToast("Valeur invalide", { type: "error" });
      };
      cancel.onclick = close;
      ok.onclick = confirm;
      overlay.onclick = (e) => { if (e.target === overlay) close(); };
      input.onkeydown = (e) => {
        e.stopPropagation();
        if (e.key === "Enter") confirm();
        else if (e.key === "Escape") close();
      };
      row.append(cancel, ok);
      box.append(label, input, row);
      overlay.append(box);
      document.body.append(overlay);
      setTimeout(() => { input.focus(); input.select(); }, 0);
    } catch (e) {
      console.error(`[${PLUGIN}] prompt failed`, e);
    }
  }

  // Discord's menu items are marker components with minified names that change every build.
  // Take the real Item and Group types from the camera menu Discord just rendered.
  findMenuTypes(menu) {
    const elements = [];
    const walk = (node, depth = 0) => {
      if (depth > 6 || node == null || typeof node !== "object") return;
      if (Array.isArray(node)) return node.forEach((n) => walk(n, depth + 1));
      if (node.$$typeof && node.props) {
        elements.push(node);
        walk(node.props.children, depth + 1);
      }
    };
    walk(menu.children);
    const isFn = (t) => typeof t === "function";
    // A plain item: clickable, and not a radio/checkbox/control/custom-render item, whose required props
    // (checked, control, render...) our items don't pass.
    const isPlainItem = (p) => p.id != null && p.label != null && typeof p.action === "function" &&
      !("checked" in p) && !("group" in p) && !("control" in p) && !("render" in p) && !("children" in p && p.children != null);
    const Item = elements.find((e) => isFn(e.type) && isPlainItem(e.props))?.type;
    const Group = elements.find((e) => isFn(e.type) && e.type !== Item && e.props.id == null && e.props.label == null && e.props.children != null)?.type;
    return isFn(Item) && isFn(Group) ? { Item, Group } : null;
  }

  buildSection({ Item, Group }) {
    const h = BdApi.React.createElement;
    const s = this.settings;
    const resLabel = s.height > 0 ? `${s.height}p` : "Auto";
    const fpsLabel = s.fps > 0 ? `${s.fps} FPS` : "Auto";
    const brLabel = s.bitrate > 0 ? `${s.bitrate} kbps` : "Auto";
    const mark = (on) => (on ? "● " : "○ ");
    const item = (id, label, action, extra = {}) => h(Item, { key: id, id, label, action, ...extra });
    const choiceList = (prefix, values, fmt, current, isAuto, setValue, autoValue, prompt) => [
      h(Group, { key: `${prefix}-values` },
        ...values.map((v) => item(`${prefix}-${v}`, mark(current === v) + fmt(v), () => this.set({ ...setValue(v), enabled: true }))),
        item(`${prefix}-auto`, mark(isAuto) + "Auto (Discord)", () => this.set(autoValue))
      ),
      h(Group, { key: `${prefix}-custom-group` },
        item(`${prefix}-custom`, "Personnalisé…", prompt)
      )
    ];

    const summary = (p) => [p.height > 0 ? `${p.height}p` : "Auto", p.fps > 0 ? `${p.fps} FPS` : "Auto", p.bitrate > 0 ? `${p.bitrate} kbps` : "Auto"].join(" · ");
    const isActive = (p) => s.enabled && p.height === s.height && p.fps === s.fps && p.bitrate === s.bitrate;
    const presetItem = (p, prefix) => item(`camera-quality-${prefix}-${p.name}`, mark(isActive(p)) + p.name, () => this.applyPreset(p), { subtext: summary(p) });
    const saved = this.presets;
    const active = [...BUILT_IN_PRESETS, ...saved].find(isActive);
    const presetGroups = [
      h(Group, { key: "camera-quality-builtin" }, ...BUILT_IN_PRESETS.map((p) => presetItem(p, "builtin")))
    ];
    if (saved.length > 0) {
      presetGroups.push(h(Group, { key: "camera-quality-saved" }, ...saved.map((p) => presetItem(p, "saved"))));
    }
    const presetActions = [
      item("camera-quality-preset-save", "Enregistrer les réglages actuels…", () => this.promptText("Nom du préréglage", active && saved.includes(active) ? active.name : "", (name) => this.savePreset(name)))
    ];
    if (saved.length > 0) {
      presetActions.push(h(Item, { key: "camera-quality-preset-delete", id: "camera-quality-preset-delete", label: "Supprimer un préréglage" },
        h(Group, { key: "camera-quality-delete-group" },
          ...saved.map((p) => item(`camera-quality-delete-${p.name}`, p.name, () => this.deletePreset(p.name))))));
    }
    presetGroups.push(h(Group, { key: "camera-quality-preset-actions" }, ...presetActions));

    return h(Group, { key: "camera-quality-group" },
      h(Item, {
        key: "camera-quality",
        id: "camera-quality",
        label: "Qualité caméra",
        subtext: s.enabled ? `${resLabel} · ${fpsLabel} · ${brLabel}` : "Désactivée"
      },
        h(Group, { key: "camera-quality-toggle-group" },
          item("camera-quality-enabled", (s.enabled ? "✅ " : "⬜ ") + "Activer la qualité perso", () => this.set({ enabled: !this.settings.enabled }))
        ),
        h(Group, { key: "camera-quality-presets-group" },
          h(Item, { key: "camera-quality-presets", id: "camera-quality-presets", label: active ? `Préréglages (${active.name})` : "Préréglages" }, ...presetGroups)
        ),
        h(Group, { key: "camera-quality-settings-group" },
          h(Item, { key: "camera-quality-res", id: "camera-quality-res", label: `Résolution (${resLabel})` },
            ...choiceList("camera-quality-res", HEIGHT_CHOICES, (v) => `${v}p`, s.height, !(s.height > 0), (v) => ({ height: v }), { height: 0 },
              () => this.promptNumber("Résolution caméra (en p)", s.height > 0 ? s.height : 360, 1, (n) => this.set({ height: n, enabled: true })))
          ),
          h(Item, { key: "camera-quality-fps", id: "camera-quality-fps", label: `FPS (${fpsLabel})` },
            ...choiceList("camera-quality-fps", FPS_CHOICES, (v) => `${v} FPS`, s.fps, !(s.fps > 0), (v) => ({ fps: v }), { fps: 0 },
              () => this.promptNumber("FPS caméra", s.fps > 0 ? s.fps : 15, 1, (n) => this.set({ fps: n, enabled: true })))
          ),
          h(Item, { key: "camera-quality-bitrate", id: "camera-quality-bitrate", label: `Débit (${brLabel})` },
            ...choiceList("camera-quality-bitrate", BITRATE_CHOICES, (v) => `${v} kbps`, s.bitrate, !(s.bitrate > 0), (v) => ({ bitrate: v }), { bitrate: -1 },
              () => this.promptNumber("Débit caméra (en kbps)", s.bitrate > 0 ? s.bitrate : 300, 1, (n) => this.set({ bitrate: n, enabled: true })))
          )
        )
      )
    );
  }

  // Anti-crash: any problem here leaves Discord's menu untouched instead of breaking it.
  patchMenu(tree) {
    try {
      const menu = BdApi.Utils.findInTree(tree, (n) => n?.navId === "video-device-context", { walkable: ["props", "children"] });
      if (!menu) return;
      const types = this.findMenuTypes(menu);
      if (!types) {
        if (!this.warnedTypes) {
          this.warnedTypes = true;
          console.warn(`[${PLUGIN}] menu item types not found, camera menu left unchanged`);
        }
        return;
      }
      const section = this.buildSection(types);
      menu.children = [...[menu.children].flat(), section];
    } catch (e) {
      console.error(`[${PLUGIN}] menu patch failed`, e);
    }
  }

  getSettingsPanel() {
    const s = this.settings;
    return BdApi.UI.buildSettingsPanel({
      settings: [
        { type: "switch", id: "enabled", name: "Activer la qualité perso", value: s.enabled },
        { type: "number", id: "height", name: "Résolution (en p, 0 = auto)", value: s.height, min: 0 },
        { type: "number", id: "fps", name: "FPS (0 = auto)", value: s.fps, min: 0 },
        { type: "number", id: "bitrate", name: "Débit en kbps (-1 = auto)", value: s.bitrate, min: -1 }
      ],
      onChange: (_, id, value) => this.set({ [id]: id === "enabled" ? Boolean(value) : Number(value) })
    });
  }
};
