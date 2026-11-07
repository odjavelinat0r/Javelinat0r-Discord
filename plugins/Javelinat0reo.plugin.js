/**
 * @name Javelinat0reo
 * @author Claude
 * @version 1.1.0
 * @description Sends your voice in stereo on Discord. Leave and rejoin the voice channel after enabling.
 */

// Voice bitrate in bits per second. Opus tops out around 510 kbps.
const VOICE_BITRATE = 510000;

const NAME = "Javelinat0reo";

module.exports = class Javelinat0reo {
    start() {
        this.wrapped = new Map();
        this.logged = new WeakSet();

        const { Webpack, Patcher, UI } = BdApi;
        const found = Webpack.getMangled(Webpack.Filters.bySource("getCodecOptions"), {
            Connection: (x) => x?.prototype?.getCodecOptions
        }, { mapDeclarations: true });
        const VoiceConnection = Webpack.getModule(Webpack.Filters.byPrototypeKeys("updateVideoQuality"));

        if (!found?.Connection || !VoiceConnection) {
            console.error(`[${NAME}] voice connection code not found`, !!found?.Connection, !!VoiceConnection);
            UI.showToast(`${NAME}: Discord's voice code has changed, stereo is off`, { type: "error" });
            return;
        }

        // Runs whenever Discord builds the audio settings for a call.
        Patcher.after(NAME, found.Connection.prototype, "getCodecOptions", (self, _args, options) => {
            if (this.isVoice(self) && options) {
                this.tune(options);
                this.report(self, options, "codec options");
            }
            return options;
        });

        // Discord lowers the bitrate to the channel's limit, so hold it at ours.
        Patcher.before(NAME, found.Connection.prototype, "setVoiceBitRate", (self, args) => {
            if (this.isVoice(self)) args[0] = Math.max(args[0] ?? 0, VOICE_BITRATE);
        });

        // Catches settings Discord sends directly to the native connection.
        Patcher.after(NAME, VoiceConnection.prototype, "updateVideoQuality", (self) => {
            if (this.isVoice(self)) this.wrap(self);
        });

        console.info(`[${NAME}] started, hooks installed`);
        this.applyToCurrentCall();

        UI.showToast(`${NAME} on`, { type: "success" });
    }

    // Discord only sets up audio when a call starts, so update a call that is already running.
    applyToCurrentCall() {
        try {
            const engine = BdApi.Webpack.getStore("MediaEngineStore")?.getMediaEngine?.();
            const connections = Array.from(engine?.connections?.values?.() ?? []);
            for (const connection of connections) {
                if (!this.isVoice(connection)) continue;
                this.wrap(connection);
                const codec = connection.codecs?.find((c) => c?.type === "audio")?.name;
                if (!codec || typeof connection.conn?.setTransportOptions !== "function") {
                    console.info(`[${NAME}] current call not updated: codec=${codec} native=${typeof connection.conn?.setTransportOptions}`);
                    continue;
                }
                const { audioEncoder } = connection.getCodecOptions(codec, "", connection.context);
                connection.conn.setTransportOptions({ audioEncoder, encodingVoiceBitRate: VOICE_BITRATE, fec: false });
                connection.setVoiceBitRate?.(VOICE_BITRATE);
                console.info(`[${NAME}] current call updated`);
            }
        } catch (e) {
            console.warn(`[${NAME}] could not update current call`, String(e));
        }
    }

    stop() {
        BdApi.Patcher.unpatchAll(NAME);
        for (const [conn, original] of this.wrapped) {
            try {
                conn.setTransportOptions = original;
            } catch (e) {
                console.warn(`[${NAME}] could not restore connection`, String(e));
            }
        }
        this.wrapped.clear();
    }

    // Only your own voice, not screen share audio.
    isVoice(connection) {
        return connection?.context === "default";
    }

    tune(options) {
        if (options.audioEncoder) {
            options.audioEncoder = {
                ...options.audioEncoder,
                channels: 2,
                rate: VOICE_BITRATE,
                params: { ...options.audioEncoder.params, stereo: "1" }
            };
        }
        if ("encodingVoiceBitRate" in options) {
            options.encodingVoiceBitRate = Math.max(options.encodingVoiceBitRate ?? 0, VOICE_BITRATE);
        }
        if ("fec" in options) options.fec = false;
    }

    wrap(connection) {
        const conn = connection.conn;
        if (typeof conn?.setTransportOptions !== "function") {
            if (!this.logged.has(connection)) {
                this.logged.add(connection);
                console.info(`[${NAME}] no native setTransportOptions on this connection, using codec options only`);
            }
            return;
        }
        if (this.wrapped.has(conn)) return;
        const original = conn.setTransportOptions;
        try {
            conn.setTransportOptions = (options, ...rest) => {
                if (options) {
                    this.tune(options);
                    if (options.audioEncoder) this.report(connection, options, "transport options");
                }
                return original.call(conn, options, ...rest);
            };
            this.wrapped.set(conn, original);
        } catch (e) {
            console.warn(`[${NAME}] could not hook connection`, String(e));
        }
    }

    report(connection, options, source) {
        const encoder = options.audioEncoder;
        console.info(
            `[${NAME}] ${source}: channels=${encoder?.channels} stereo=${encoder?.params?.stereo} ` +
            `codec=${encoder?.name} freq=${encoder?.freq} bitrate=${options.encodingVoiceBitRate} fec=${options.fec} ` +
            `fields=${Object.keys(options).join(",")}`
        );
    }
};
