/**
 * @name CameraQuality
 * @author Kerminat0r
 * @version 1.0.0
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
    BdApi.Patcher.after(PLUGIN, Manager.prototype, "getQuality", function (_, __, ret) {
      if (this.isStreamContext || ret == null) return ret;
      const s = plugin.settings;
      if (!s.enabled) return ret;

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
      if (s.bitrate > 0) {
        const bps = Math.round(s.bitrate * 1000);
        out.bitrateMax = bps;
        out.bitrateTarget = bps;
        out.bitrateMin = Math.min(ret.bitrateMin ?? bps, bps);
      }
      return out;
    });
  }

  // Ask every camera (non-stream) connection to recompute its quality right away.
  reapply() {
    try {
      const engine = BdApi.Webpack.Stores.MediaEngineStore?.getMediaEngine?.();
      const connections = engine?.connections;
      const list = connections?.values ? Array.from(connections.values()) : Array.from(connections ?? []);
      for (const conn of list) {
        if (conn?.context === "stream" || conn?.videoQualityManager?.isStreamContext) continue;
        conn?.updateVideoQuality?.();
      }
    } catch (e) {
      console.error(`[${PLUGIN}] reapply failed`, e);
    }
  }

  promptNumber(title, current, min, onValue) {
    const React = BdApi.React;
    let value = String(current);
    BdApi.UI.showConfirmationModal(title, React.createElement("input", {
      type: "number",
      min,
      defaultValue: value,
      autoFocus: true,
      onChange: (e) => { value = e.target.value; },
      style: {
        width: "100%",
        boxSizing: "border-box",
        padding: "10px",
        fontSize: "16px",
        borderRadius: "4px",
        border: "1px solid var(--border-subtle, #3f4147)",
        background: "var(--input-background, #1e1f22)",
        color: "var(--text-normal, #dbdee1)"
      }
    }), {
      confirmText: "OK",
      cancelText: "Annuler",
      onConfirm: () => {
        const n = Math.round(Number(value));
        if (Number.isFinite(n) && n >= min) onValue(n);
        else BdApi.UI.showToast("Valeur invalide", { type: "error" });
      }
    });
  }

  buildSection() {
    const s = this.settings;
    const radio = (group, id, label, checked, action) => ({ type: "radio", group, id, label, checked, action });
    const resLabel = s.height > 0 ? `${s.height}p` : "Auto";
    const fpsLabel = s.fps > 0 ? `${s.fps} FPS` : "Auto";
    const brLabel = s.bitrate > 0 ? `${s.bitrate} kbps` : "Auto";

    return {
      type: "submenu",
      id: "camera-quality",
      label: "Qualité caméra",
      subtext: s.enabled ? `${resLabel} · ${fpsLabel} · ${brLabel}` : "Désactivée",
      items: [
        {
          type: "toggle",
          id: "camera-quality-enabled",
          label: "Activer la qualité perso",
          checked: s.enabled,
          action: () => this.set({ enabled: !this.settings.enabled })
        },
        { type: "separator" },
        {
          type: "submenu",
          id: "camera-quality-res",
          label: `Résolution (${resLabel})`,
          items: [
            ...HEIGHT_CHOICES.map((h) => radio("camera-quality-res", `camera-quality-res-${h}`, `${h}p`, s.height === h, () => this.set({ height: h, enabled: true }))),
            radio("camera-quality-res", "camera-quality-res-auto", "Auto (Discord)", !(s.height > 0), () => this.set({ height: 0 })),
            { type: "separator" },
            {
              id: "camera-quality-res-custom",
              label: "Personnalisé…",
              action: () => this.promptNumber("Résolution caméra (en p)", s.height > 0 ? s.height : 360, 1, (n) => this.set({ height: n, enabled: true }))
            }
          ]
        },
        {
          type: "submenu",
          id: "camera-quality-fps",
          label: `FPS (${fpsLabel})`,
          items: [
            ...FPS_CHOICES.map((f) => radio("camera-quality-fps", `camera-quality-fps-${f}`, `${f} FPS`, s.fps === f, () => this.set({ fps: f, enabled: true }))),
            radio("camera-quality-fps", "camera-quality-fps-auto", "Auto (Discord)", !(s.fps > 0), () => this.set({ fps: 0 })),
            { type: "separator" },
            {
              id: "camera-quality-fps-custom",
              label: "Personnalisé…",
              action: () => this.promptNumber("FPS caméra", s.fps > 0 ? s.fps : 15, 1, (n) => this.set({ fps: n, enabled: true }))
            }
          ]
        },
        {
          type: "submenu",
          id: "camera-quality-bitrate",
          label: `Débit (${brLabel})`,
          items: [
            ...BITRATE_CHOICES.map((b) => radio("camera-quality-bitrate", `camera-quality-bitrate-${b}`, `${b} kbps`, s.bitrate === b, () => this.set({ bitrate: b, enabled: true }))),
            radio("camera-quality-bitrate", "camera-quality-bitrate-auto", "Auto (Discord)", !(s.bitrate > 0), () => this.set({ bitrate: -1 })),
            { type: "separator" },
            {
              id: "camera-quality-bitrate-custom",
              label: "Personnalisé…",
              action: () => this.promptNumber("Débit caméra (en kbps)", s.bitrate > 0 ? s.bitrate : 300, 1, (n) => this.set({ bitrate: n, enabled: true }))
            }
          ]
        }
      ]
    };
  }

  patchMenu(tree) {
    try {
      const menu = BdApi.Utils.findInTree(tree, (n) => n?.navId === "video-device-context", { walkable: ["props", "children"] });
      if (!menu) return;
      const section = BdApi.ContextMenu.buildMenuChildren([{ type: "group", items: [this.buildSection()] }]);
      menu.children = [...[menu.children].flat(), ...[section].flat()];
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
