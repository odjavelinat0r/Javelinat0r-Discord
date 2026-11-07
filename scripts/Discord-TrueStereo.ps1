# Discord-TrueStereo.ps1
# Patches Discord's own voice engine for true stereo, using the byte patterns published
# by the open-source aliblackeye/discord-stereo project (MIT). Run it again after a
# Discord update, because updates replace the patched files.
#
#   powershell -ExecutionPolicy Bypass -File Discord-TrueStereo.ps1 -Mode Auto
#   powershell -ExecutionPolicy Bypass -File Discord-TrueStereo.ps1 -Mode Check
#   powershell -ExecutionPolicy Bypass -File Discord-TrueStereo.ps1 -Mode Apply
#   powershell -ExecutionPolicy Bypass -File Discord-TrueStereo.ps1 -Mode Restore
#
# Auto looks for the plugin and the patched voice module and installs whatever is
# missing. If it has to patch, it closes Discord and starts it again. When everything
# is already installed it changes nothing and leaves Discord open.
# Root is the folder holding the app-* versions, so it works for Stable, PTB and Canary.
# Check changes nothing. Apply and Restore need Discord fully closed.
param(
    [ValidateSet('Auto', 'Check', 'Apply', 'Restore', 'Scan')][string]$Mode = 'Auto',
    [int]$Bitrate = 510000,
    [string]$Root = (Join-Path $env:LOCALAPPDATA 'Discord'),
    [switch]$Plugins,
    [switch]$RemoveMods
)
$ErrorActionPreference = 'Stop'

Add-Type -TypeDefinition @'
public static class StereoSig {
    // Returns the match position, -1 for no match, -2 for more than one match.
    public static int Find(byte[] data, int[] sig) {
        int found = -1, n = sig.Length, limit = data.Length - n, first = sig[0];
        for (int i = 0; i <= limit; i++) {
            if (data[i] != first) continue;
            bool ok = true;
            for (int j = 1; j < n; j++) { int s = sig[j]; if (s >= 0 && data[i + j] != s) { ok = false; break; } }
            if (ok) { if (found >= 0) return -2; found = i; }
        }
        return found;
    }
}
'@

$W = -1
$Patches = @(
    @{ Name = 'Stereo channels 1 to 2'; Offset = 6; Verify = 0x01; Write = 0x02
       Sig = 0xE8,$W,$W,$W,$W,0xBD,$W,0x00,0x00,0x00,0x80,0xBC,0x24,0x80,0x01,0x00,0x00,0x01 },
    @{ Name = 'Downmix bypass, skip mono branch'; Offset = 10; Verify = 0x74,0x0D; Write = 0x90,0x90
       Sig = 0x48,0x89,0xF9,0xE8,$W,$W,$W,$W,0x84,0xC0,0x74,0x0D,0x83,0xBE,$W,$W,$W,$W,0x09,$W,$W,$W,$W,$W,$W,0x4C,0x89,0x6C,0x24,$W,0x44,0x0F,0xB6,0xAC,0x24,$W,$W,$W,$W },
    @{ Name = 'Downmix bypass, force stereo branch'; Offset = 19; Verify = 0x0F,0x8F; Write = 0x90,0xE9
       Sig = 0x48,0x89,0xF9,0xE8,$W,$W,$W,$W,0x84,0xC0,$W,$W,0x83,0xBE,$W,$W,$W,$W,0x09,0x0F,0x8F,$W,$W,$W,$W,0x4C,0x89,0x6C,0x24,$W,0x44,0x0F,0xB6,0xAC,0x24,$W,$W,$W,$W },
    @{ Name = 'High-pass filter off'; Offset = -30; Verify = 0x41; Write = 0xC3
       Sig = 0x48,0x8B,0x42,$W,0x45,0x84,0xC0,0x74,$W,0x48,0x85,0xC0,0x0F,0x84,$W,$W,$W,$W,0x45,0x31,0xF6,0x48,0x8D,0x5C,0x24,$W },
    @{ Name = 'Opus application AUDIO'; Offset = 14; Verify = 0x00; Write = 0x01
       Sig = 0x48,0xC7,0x84,0x24,0xB0,0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x48,0xB8,0x00,0x00,0x00,0x00,$W,$W,$W,$W },
    @{ Name = 'Keep stereo, no mid-call mono drop'; Offset = 5; Verify = 0x75; Write = 0xEB
       Sig = 0x80,0x7C,0x24,0x78,0x01,0x75,0x29,0x48,0x8B,0x7C,0x24,0x70,0x48,0x39,0xBE,0xE0,0x00,0x00,0x00 },
    @{ Name = 'Opus packet-loss 0'; Offset = 0; Verify = 0x41,0x89,0xD0; Write = 0x45,0x31,0xC0
       Sig = 0x41,0x89,0xD0,0x48,0x8B,0x01,0x48,0x85,0xC0,0x74,$W,0x48,0x89,0xC1,0xBA,0xAE,0x0F,0x00,0x00 },
    @{ Name = 'Opus in-band FEC off (a)'; Offset = 10; Verify = 0x01; Write = 0x00
       Sig = 0x48,0x89,0xC1,0xBA,0xAC,0x0F,0x00,0x00,0x41,0xB8,0x01 },
    @{ Name = 'Opus in-band FEC off (b)'; Offset = 11; Verify = 0x01; Write = 0x00
       Sig = 0x48,0x8B,0x49,0x08,0xBA,0xAC,0x0F,0x00,0x00,0x41,0xB8,0x01 }
)

$Marker = 'DISCORD-STEREO-PATCH'
$AnchorBind = 'function bindConnectionInstance(instance) {'
$AnchorConn = '        setTransportOptions: (options) => instance.setTransportOptions(options),'
$PatchedConn = '        setTransportOptions: (options) => instance.setTransportOptions(discordStereo.connectionOptions(instance, options)), /* DISCORD-STEREO-PATCH */'
$AnchorExports = 'module.exports = VoiceEngine;'
$PatchedExports = 'discordStereo.installEngineHooks(VoiceEngine); /* DISCORD-STEREO-PATCH */'
$JsBlock = @'
/* DISCORD-STEREO-PATCH BEGIN */
const discordStereo = (() => {
    const CHANNELS = 2;
    const BITRATE = __BITRATE__;
    const PROCESSING_OFF = [
        'echoCancellation', 'echoCancellationPreEcho', 'builtInEchoCancellation',
        'noiseSuppression', 'noiseCancellation', 'noiseCancellationDuringProcessing', 'automaticGainControl',
    ];
    const connections = new WeakMap();
    let lastMessage = null;
    function say(message) {
        if (message === lastMessage) return;
        lastMessage = message;
        try { log('info', `[DiscordStereo] ${message}`); } catch (e) {}
    }
    function forceProcessingOff(value, path, changed, depth) {
        if (value == null || typeof value !== 'object' || depth > 4) return;
        for (const key of Object.keys(value)) {
            const current = value[key];
            if (PROCESSING_OFF.includes(key) && (typeof current === 'boolean' || typeof current === 'number')) {
                if (current) { value[key] = typeof current === 'boolean' ? false : 0; changed.push(path + key); }
            } else if (current != null && typeof current === 'object') {
                forceProcessingOff(current, `${path}${key}.`, changed, depth + 1);
            }
        }
    }
    function connectionOptions(instance, options) {
        try {
            if (options == null || typeof options !== 'object') return options;
            const encoder = options.audioEncoder;
            if (encoder != null && typeof encoder === 'object') {
                connections.set(instance, true);
                encoder.channels = CHANNELS;
                if (encoder.params == null || typeof encoder.params !== 'object') encoder.params = {};
                encoder.params.stereo = '1';
                if (typeof encoder.rate === 'number') encoder.rate = BITRATE;
                if (encoder.fec === true) encoder.fec = false;
                options.encodingVoiceBitRate = BITRATE;
                if (options.fec === true) options.fec = false;
                say(`stereo enforced: channels=${CHANNELS} stereo=1 bitrate=${BITRATE}`);
            } else if (connections.get(instance) === true && typeof options.encodingVoiceBitRate === 'number' && options.encodingVoiceBitRate !== BITRATE) {
                options.encodingVoiceBitRate = BITRATE;
            }
        } catch (e) { say(`connectionOptions error: ${e && e.message}`); }
        return options;
    }
    function wrapEngine(engine, name, transform) {
        const original = engine[name];
        if (typeof original !== 'function') return;
        engine[name] = function (...args) {
            try { transform(args); } catch (e) { say(`${name} error: ${e && e.message}`); }
            return original.apply(engine, args);
        };
    }
    function installEngineHooks(engine) {
        for (const name of ['setTransportOptions', 'setEmitVADLevel', 'startLocalAudioRecording', 'setLoopback']) {
            wrapEngine(engine, name, (args) => { const c = []; args.forEach((a, i) => forceProcessingOff(a, `arg${i}.`, c, 0)); if (c.length) say(`${name}: processing off`); });
        }
        wrapEngine(engine, 'setVoiceChannelCountCap', (args) => { if (typeof args[0] === 'number' && args[0] > 0 && args[0] < CHANNELS) args[0] = 0; });
        say(`loaded: channels=${CHANNELS} bitrate=${BITRATE}`);
    }
    return { connectionOptions, installEngineHooks };
})();
/* DISCORD-STEREO-PATCH END */

'@

function Get-Count([string]$Text, [string]$Sub) { ([regex]::Matches($Text, [regex]::Escape($Sub))).Count }
function Test-Bytes([byte[]]$Data, [int]$At, [int[]]$Expect) {
    if ($At -lt 0 -or ($At + $Expect.Count) -gt $Data.Length) { return $false }
    for ($k = 0; $k -lt $Expect.Count; $k++) { if ($Data[$At + $k] -ne $Expect[$k]) { return $false } }
    return $true
}

# Original, Patched, NoMatch, Ambiguous or Unexpected, plus where to write.
function Resolve-Site([byte[]]$Data, $Patch) {
    $sig = [int[]]$Patch.Sig
    $write = [int[]]@($Patch.Write)
    $verify = [int[]]@($Patch.Verify)
    $m = [StereoSig]::Find($Data, $sig)
    if ($m -eq -2) { return @{ State = 'Ambiguous'; At = -1 } }
    if ($m -lt 0) {
        if ($Patch.Offset -ge 0 -and ($Patch.Offset + $write.Count) -le $sig.Count) {
            $alt = $sig.Clone()
            for ($k = 0; $k -lt $write.Count; $k++) { $alt[$Patch.Offset + $k] = $write[$k] }
            $pm = [StereoSig]::Find($Data, $alt)
            if ($pm -ge 0) { return @{ State = 'Patched'; At = ($pm + $Patch.Offset) } }
        }
        return @{ State = 'NoMatch'; At = -1 }
    }
    $at = $m + $Patch.Offset
    if (Test-Bytes $Data $at $write) { return @{ State = 'Patched'; At = $at } }
    if (Test-Bytes $Data $at $verify) { return @{ State = 'Original'; At = $at } }
    return @{ State = 'Unexpected'; At = $at }
}

$App = Get-ChildItem -LiteralPath $Root -Directory -Filter 'app-*' | Sort-Object { [version]($_.Name -replace '^app-', '') } | Select-Object -Last 1
if (-not $App) { throw "No Discord version was found in $Root." }
$Exe = Get-ChildItem -LiteralPath $App.FullName -File -Filter 'Discord*.exe' | Select-Object -First 1
if (-not $Exe) { throw "No Discord program was found in $($App.FullName)." }
$Proc = $Exe.BaseName
$Leaf = Split-Path $Root -Leaf
$Sub = if ($Leaf -ieq 'Discord') { $App.Name } else { Join-Path $Leaf $App.Name }
$Module = Get-ChildItem (Join-Path $App.FullName 'modules') -Directory -Filter 'discord_voice*' -ErrorAction SilentlyContinue | Sort-Object { [int]($_.Name -replace '\D', '') } | Select-Object -Last 1
$NoVoiceMessage = 'Stereo: not installed yet, because Discord has not downloaded its voice module. Open Discord and join a voice channel once. Stereo then finishes at your next login, or run this again.'
if (-not $Module -and $Mode -notin 'Auto', 'Scan') { throw 'Discord has not downloaded its voice module yet. Start Discord, join a voice channel once, then run this again.' }
$Dir = if ($Module) { Join-Path $Module.FullName 'discord_voice' } else { Join-Path $App.FullName 'modules\discord_voice' }
$Node = Join-Path $Dir 'discord_voice.node'
$Index = Join-Path $Dir 'index.js'
$Backup = Join-Path $env:LOCALAPPDATA "Discord-TrueStereo-backup\$Sub"
"$Proc : $($App.Name)"

$Running = @(Get-Process -Name $Proc -ErrorAction SilentlyContinue).Count -gt 0
if ($Mode -in 'Apply', 'Restore' -and $Running) { throw 'Fully quit Discord first: right-click its tray icon and choose Quit Discord.' }

$Kit = $PSScriptRoot
$Stored = Join-Path $Kit "VoiceModule\$Sub"
$ClosedDiscord = $false

function Stop-Discord {
    if (@(Get-Process -Name $Proc -ErrorAction SilentlyContinue).Count -eq 0) { return }
    'Closing Discord...'
    Stop-Process -Name $Proc -Force -Confirm:$false -ErrorAction SilentlyContinue
    for ($i = 0; $i -lt 30 -and @(Get-Process -Name $Proc -ErrorAction SilentlyContinue).Count -gt 0; $i++) { Start-Sleep -Milliseconds 500 }
    if (@(Get-Process -Name $Proc -ErrorAction SilentlyContinue).Count -gt 0) { throw 'Discord would not close, so nothing was written.' }
    Start-Sleep -Seconds 1
    $script:ClosedDiscord = $true
}

function Start-Discord {
    if (-not $script:ClosedDiscord) { return }
    'Starting Discord...'
    $updater = Join-Path $Root 'Update.exe'
    if (Test-Path -LiteralPath $updater) { Start-Process $updater -ArgumentList '--processStart', $Exe.Name }
    else { Start-Process $Exe.FullName }
}

$Resources = Join-Path $App.FullName 'resources'
$BdHome = Join-Path $env:APPDATA 'BetterDiscord'
$BdAsar = Join-Path $Kit 'betterdiscord.asar'
$BundledPlugins = Join-Path $Kit 'plugins'
$Channel = switch ($Proc) { 'DiscordPTB' { 'ptb' } 'DiscordCanary' { 'canary' } 'DiscordDevelopment' { 'development' } default { 'stable' } }
$EnabledFile = Join-Path $BdHome "data\$Channel\plugins.json"

function Test-BetterDiscord {
    $entries = @(Join-Path $Resources 'app\index.js')
    $entries += Get-ChildItem (Join-Path $App.FullName 'modules') -Directory -Filter 'discord_desktop_core*' -ErrorAction SilentlyContinue |
        ForEach-Object { Join-Path $_.FullName 'discord_desktop_core\index.js' }
    foreach ($entry in $entries) {
        if ((Test-Path -LiteralPath $entry) -and [IO.File]::ReadAllText($entry) -match 'betterdiscord') { return $true }
    }
    return $false
}

function Install-BetterDiscord {
    foreach ($dir in 'plugins', 'themes', 'data\stable', 'data\ptb', 'data\canary', 'data\development') {
        New-Item -ItemType Directory -Force (Join-Path $BdHome $dir) | Out-Null
    }
    $target = Join-Path $BdHome 'data\betterdiscord.asar'
    if (-not (Test-Path -LiteralPath $target)) { Copy-Item -LiteralPath $BdAsar $target }
    $asar = Join-Path $Resources 'app.asar'
    $renamed = Join-Path $Resources 'betterdiscord.app.asar'
    if (Test-Path -LiteralPath $asar) {
        if (Test-Path -LiteralPath $renamed) { Remove-Item -LiteralPath $renamed -Force -Confirm:$false }
        Move-Item -LiteralPath $asar $renamed
    } elseif (-not (Test-Path -LiteralPath $renamed)) {
        throw 'Could not find Discord''s app.asar, so BetterDiscord was not installed.'
    }
    $appDir = Join-Path $Resources 'app'
    New-Item -ItemType Directory -Force $appDir | Out-Null
    Copy-Item -LiteralPath (Join-Path $Kit 'bd-index.js') (Join-Path $appDir 'index.js') -Force
    [IO.File]::WriteAllText((Join-Path $appDir 'package.json'), '{"main": "./index.js"}', (New-Object Text.UTF8Encoding($false)))
    Add-Content -LiteralPath (Join-Path $Kit 'bd-installed.txt') -Value $Root -Encoding UTF8
    'BetterDiscord: installed.'
}

function Get-PluginNames {
    Get-ChildItem -LiteralPath $BundledPlugins -Filter '*.plugin.js' | ForEach-Object {
        $name = (Select-String -LiteralPath $_.FullName -Pattern '@name[ \t]+(.+?)\s*$' -List).Matches[0].Groups[1].Value
        if ($name) { $name }
    }
}

function Test-PluginWork {
    if (-not $Plugins -or -not (Test-Path -LiteralPath $BundledPlugins)) { return $false }
    foreach ($file in Get-ChildItem -LiteralPath $BundledPlugins -File) {
        if (-not (Test-Path -LiteralPath (Join-Path $BdHome "plugins\$($file.Name)"))) { return $true }
    }
    if (-not (Test-Path -LiteralPath $EnabledFile)) { return $true }
    $state = Get-Content -LiteralPath $EnabledFile -Raw | ConvertFrom-Json
    foreach ($name in Get-PluginNames) { if ($null -eq $state.$name) { return $true } }
    return $false
}

function Install-Plugins {
    New-Item -ItemType Directory -Force (Join-Path $BdHome 'plugins'), (Split-Path $EnabledFile) | Out-Null
    foreach ($file in Get-ChildItem -LiteralPath $BundledPlugins -File) {
        $dest = Join-Path $BdHome "plugins\$($file.Name)"
        if (-not (Test-Path -LiteralPath $dest)) { Copy-Item -LiteralPath $file.FullName $dest }
    }
    $state = [ordered]@{}
    if (Test-Path -LiteralPath $EnabledFile) {
        (Get-Content -LiteralPath $EnabledFile -Raw | ConvertFrom-Json).PSObject.Properties | ForEach-Object { $state[$_.Name] = $_.Value }
    }
    # Anything already listed keeps its on or off choice.
    # VillainStereo drives the same audio settings as the voice patch, so it starts off.
    $startOff = 'VillainStereoV4'
    foreach ($name in Get-PluginNames) { if (-not $state.Contains($name)) { $state[$name] = ($startOff -notcontains $name) } }
    [IO.File]::WriteAllText($EnabledFile, ($state | ConvertTo-Json), (New-Object Text.UTF8Encoding($false)))
    'Plugins: installed and turned on.'
}

# A real Discord app.asar is several MB. Mods swap it for a tiny loader and keep the
# original under another name, so size and that saved copy tell us what happened.
$RealAsarSize = 1MB
$SavedNames = '_app.asar', 'app.orig.asar'
$BackupNames = 'app.asar.backup', 'app.asar.bak', 'app.asar.orig'
$KnownMods = [ordered]@{ equicord = 'Equicord'; vencord = 'Vencord'; replugged = 'Replugged'; moonlight = 'moonlight'; openasar = 'OpenAsar'; shelter = 'shelter'; powercord = 'Powercord'; goosemod = 'GooseMod'; lightcord = 'Lightcord' }

function Get-ModName([string[]]$Paths) {
    foreach ($path in $Paths) {
        if (-not (Test-Path -LiteralPath $path)) { continue }
        $files = if (Test-Path -LiteralPath $path -PathType Container) { @(Get-ChildItem -LiteralPath $path -File -Recurse -Filter '*.js*' -ErrorAction SilentlyContinue | Select-Object -First 20) } else { @(Get-Item -LiteralPath $path) }
        foreach ($file in $files) {
            if ($file.Length -gt 2MB) { continue }
            $text = [Text.Encoding]::GetEncoding(28591).GetString([IO.File]::ReadAllBytes($file.FullName)).ToLowerInvariant()
            foreach ($key in $KnownMods.Keys) { if ($text.Contains($key)) { return $KnownMods[$key] } }
        }
    }
    return 'Unknown mod'
}

function Get-FileSize([string]$Path) {
    $item = Get-Item -LiteralPath $Path -ErrorAction SilentlyContinue
    if ($item -and -not $item.PSIsContainer) { return $item.Length }
    return 0
}

function Get-CoreFiles {
    @(Get-ChildItem (Join-Path $App.FullName 'modules') -Directory -Filter 'discord_desktop_core*' -ErrorAction SilentlyContinue |
        ForEach-Object { Join-Path $_.FullName 'discord_desktop_core\index.js' } |
        Where-Object { Test-Path -LiteralPath $_ })
}

function Test-OursAppFolder {
    $index = Join-Path $Resources 'app\index.js'
    return (Test-Path -LiteralPath $index) -and ([IO.File]::ReadAllText($index) -match 'betterdiscord')
}

function Find-Mods {
    $names = New-Object System.Collections.Generic.List[string]
    $asar = Join-Path $Resources 'app.asar'
    $folder = Join-Path $Resources 'app'
    $renamed = Join-Path $Resources 'betterdiscord.app.asar'
    $saved = @($SavedNames | ForEach-Object { Join-Path $Resources $_ } | Where-Object { Test-Path -LiteralPath $_ })
    $ours = Test-OursAppFolder

    $tampered = $saved.Count -gt 0
    if ((Test-Path -LiteralPath $folder) -and -not $ours) { $tampered = $true }
    if (Test-Path -LiteralPath $asar -PathType Container) { $tampered = $true }
    if ((Test-Path -LiteralPath $asar -PathType Leaf) -and (Get-FileSize $asar) -lt $RealAsarSize) { $tampered = $true }
    if ((Test-Path -LiteralPath $renamed) -and (Get-FileSize $renamed) -lt $RealAsarSize) { $tampered = $true }
    if ($tampered) {
        $looks = @($asar, $renamed)
        if (-not $ours) { $looks += $folder }
        $names.Add((Get-ModName $looks))
    }

    # Stock Discord has exactly one line here. BetterDiscord's own installer also edits it.
    foreach ($core in Get-CoreFiles) {
        $text = [IO.File]::ReadAllText($core)
        if ($text -match 'betterdiscord') { continue }
        if ($text -notmatch '^\s*module\.exports\s*=\s*require\(\s*[''"]\./core\.asar[''"]\s*\)\s*;?\s*$') { $names.Add((Get-ModName @($core))) }
    }
    return @($names | Sort-Object -Unique)
}

function Remove-Mods {
    $asar = Join-Path $Resources 'app.asar'
    $folder = Join-Path $Resources 'app'
    $renamed = Join-Path $Resources 'betterdiscord.app.asar'
    $original = $SavedNames + $BackupNames | ForEach-Object { Join-Path $Resources $_ } | Where-Object { (Get-FileSize $_) -ge $RealAsarSize } | Select-Object -First 1
    if (-not $original -and (Get-FileSize $renamed) -ge $RealAsarSize) { $original = $renamed }
    if (-not $original -and (Get-FileSize $asar) -lt $RealAsarSize) {
        throw "The original Discord file is missing, so the mod can't be removed safely. Reinstall this Discord version, then run this again."
    }
    if ($original) {
        if (Test-Path -LiteralPath $asar) { Remove-Item -LiteralPath $asar -Recurse -Force -Confirm:$false }
        Remove-Item -LiteralPath $folder -Recurse -Force -Confirm:$false -ErrorAction SilentlyContinue
        Move-Item -LiteralPath $original $asar
        foreach ($stale in @($renamed) + @($SavedNames | ForEach-Object { Join-Path $Resources $_ })) {
            if (Test-Path -LiteralPath $stale) { Remove-Item -LiteralPath $stale -Force -Confirm:$false }
        }
    } elseif ((Test-Path -LiteralPath $folder) -and -not (Test-OursAppFolder)) {
        Remove-Item -LiteralPath $folder -Recurse -Force -Confirm:$false
    }
    foreach ($core in Get-CoreFiles) {
        $text = [IO.File]::ReadAllText($core)
        if ($text -notmatch 'betterdiscord' -and $text -notmatch '^\s*module\.exports\s*=\s*require\(\s*[''"]\./core\.asar[''"]\s*\)\s*;?\s*$') {
            [IO.File]::WriteAllText($core, "module.exports = require('./core.asar');`n", (New-Object Text.UTF8Encoding($false)))
        }
    }
}

if ($Mode -eq 'Scan') {
    Find-Mods | ForEach-Object { "MOD|$_" }
    return
}

$NeedBd = $false
$NeedPlugins = $false
if ($Mode -eq 'Auto') {
    # Never removed without the person agreeing in the app, so the login check only skips.
    $Mods = @(Find-Mods)
    if ($Mods.Count -gt 0) {
        if (-not $RemoveMods) {
            "Other mod found: $($Mods -join ', '). This version was skipped."
            return
        }
        Stop-Discord
        try { Remove-Mods } catch { Start-Discord; throw }
        $left = @(Find-Mods)
        if ($left.Count -gt 0) { Start-Discord; throw "Could not fully remove: $($left -join ', '). Reinstall this Discord version, then run this again." }
        "Other mods removed: $($Mods -join ', ')."
    }

    $NeedBd = (Test-Path -LiteralPath $BdAsar) -and -not (Test-BetterDiscord)
    $NeedPlugins = Test-PluginWork
    "BetterDiscord: $(if ($NeedBd) { 'missing' } else { 'ok' })"
    "Plugins: $(if ($NeedPlugins) { 'missing' } else { 'ok' })"

    # These come first, so a stereo problem can never stop them from installing.
    if ($NeedBd -or $NeedPlugins) {
        Stop-Discord
        if ($NeedBd) { Install-BetterDiscord }
        if ($NeedPlugins) { Install-Plugins }
    }

    if (-not ((Test-Path -LiteralPath $Node) -and (Test-Path -LiteralPath $Index))) {
        $haveCopy = (Test-Path -LiteralPath (Join-Path $Stored 'discord_voice.node')) -and (Test-Path -LiteralPath (Join-Path $Stored 'index.js'))
        if (-not (Test-Path -LiteralPath $Dir) -or -not $haveCopy) {
            $NoVoiceMessage
            Start-Discord
            return
        }
        Stop-Discord
        Copy-Item -LiteralPath (Join-Path $Stored 'discord_voice.node') $Node -Force
        Copy-Item -LiteralPath (Join-Path $Stored 'index.js') $Index -Force
        'Voice module: restored from this folder.'
    }
}

if ($Mode -eq 'Restore') {
    foreach ($pair in @(@('discord_voice.node', $Node), @('index.js', $Index))) {
        $saved = Join-Path $Backup $pair[0]
        if (Test-Path -LiteralPath $saved) { Copy-Item -LiteralPath $saved $pair[1] -Force; "Restored $($pair[0])" }
        else { "No backup of $($pair[0]) for this Discord version." }
    }
    return
}

$Data = [IO.File]::ReadAllBytes($Node)
$Text = [IO.File]::ReadAllText($Index)
$Plan = @()
$Blocked = $false
foreach ($p in $Patches) {
    $r = Resolve-Site $Data $p
    '{0,-11} {1}' -f $r.State, $p.Name
    if ($r.State -eq 'Original') { $Plan += @{ Patch = $p; At = $r.At } }
    elseif ($r.State -ne 'Patched') { $Blocked = $true }
}
$JsDone = $Text.Contains($Marker)
$JsReady = $JsDone -or ((Get-Count $Text $AnchorBind) -eq 1 -and (Get-Count $Text $AnchorConn) -eq 1 -and (Get-Count $Text $AnchorExports) -eq 1)
"JS hook: $(if ($JsDone) { 'Patched' } elseif ($JsReady) { 'Original' } else { 'NoMatch' })"
if (-not $JsReady) { $Blocked = $true }

if ($Mode -eq 'Check') {
    if ($Blocked) { 'RESULT: not safe to apply on this build.' } else { 'RESULT: all checks passed.' }
    return
}
if ($Blocked) {
    Start-Discord
    throw 'Stereo was not installed, because this Discord version does not match the patch. BetterDiscord and the plugins are not affected.'
}
if ($Mode -eq 'Auto' -and $Plan.Count -eq 0 -and $JsDone) {
    if ($NeedBd -or $NeedPlugins) { 'Stereo: already installed.' } else { 'Everything is already installed. Nothing to do.' }
    Start-Discord
    return
}
if ($Mode -eq 'Auto') { Stop-Discord }

New-Item -ItemType Directory -Force $Backup | Out-Null
foreach ($pair in @(@('discord_voice.node', $Node), @('index.js', $Index))) {
    $saved = Join-Path $Backup $pair[0]
    if (-not (Test-Path -LiteralPath $saved)) { Copy-Item -LiteralPath $pair[1] $saved }
}
"Backup: $Backup"

if ($Plan.Count -gt 0) {
    foreach ($item in @($Plan)) {
        $bytes = [int[]]@($item.Patch.Write)
        for ($k = 0; $k -lt $bytes.Count; $k++) { $Data[$item.At + $k] = [byte]$bytes[$k] }
    }
    [IO.File]::WriteAllBytes($Node, $Data)
    $after = [IO.File]::ReadAllBytes($Node)
    foreach ($item in $Plan) {
        if (-not (Test-Bytes $after $item.At ([int[]]@($item.Patch.Write)))) { throw "Verify failed: $($item.Patch.Name)" }
    }
    "Native: $($Plan.Count) sites patched and verified."
}
if (-not $JsDone) {
    $block = ($JsBlock -replace '__BITRATE__', "$Bitrate") -replace "`r`n", "`n"
    $new = $Text.Replace($AnchorBind, $block + $AnchorBind).Replace($AnchorConn, $PatchedConn).Replace($AnchorExports, "$PatchedExports`n$AnchorExports")
    [IO.File]::WriteAllText($Index, $new, (New-Object Text.UTF8Encoding($false)))
    'JS hook added.'
}
if ($Mode -eq 'Auto') {
    New-Item -ItemType Directory -Force $Stored | Out-Null
    Copy-Item -LiteralPath $Node $Stored -Force
    Copy-Item -LiteralPath $Index $Stored -Force
    "Saved a copy of the patched module for $($App.Name)."
    Start-Discord
}
'Done.'
