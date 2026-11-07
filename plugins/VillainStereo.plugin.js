/**
 * @name VillainStereoV4
 * @description Injects stereo into your microphone. Made by @dojoz, highest quality stereo plugin. Best used with a Stereo inputted microphone. XenoLib, DoNotTrack, and ZeresPlugin are needed for this to work.
 * @version 4.0.0
 * @author dojo | @dojoz
 * @authorId 758133930242080788
 * @source discord.gg/jit
 * @website https://www.youtube.com/channel/UCi3Eni8JghBI3aoLY9w1ypg
 */

module.exports = class LightcordStereo {
    constructor() {
        this.voiceModule = null;
    }

    start() {
        this.voiceModule = BdApi.Webpack.getModule(m => m.prototype && "setLocalVolume" in m.prototype);
        if (!this.voiceModule) return;
        
        BdApi.Patcher.before("LightcordStereo", this.voiceModule.prototype, "setLocalVolume", (thisObj) => {
            if (!thisObj || !thisObj.conn || !thisObj.conn.setTransportOptions) return;
            
            const conn = thisObj.conn;
            const setTransportOptions = conn.setTransportOptions.bind(conn);
            
            conn.setTransportOptions = (options) => {
                if (!options || typeof options !== "object") return setTransportOptions(options);
                
                Object.assign(options, {
                    audioEncoder: {
                        ...options.audioEncoder,
                        channels: 2,
                        freq: 48000,
                        rate: 512000,
                        pacsize: 960,
                    },
                    packetLossRate: 0,
                    encodingBitRate: 512000,
                });
                
                setTransportOptions(options);
            };
        });
    }

    stop() {
        BdApi.Patcher.unpatchAll("LightcordStereo");
    }
};
