import type { Playlist, Track } from "@/types";

function playlist(
  id: string,
  title: string,
  tracks: Track[],
): Playlist {
  const approxBpm = Math.round(
    tracks.reduce((sum, track) => sum + track.bpm, 0) / tracks.length,
  );

  return { id, title, approxBpm, tracks };
}

export const PLAYLISTS: Playlist[] = [
  playlist("morning-momentum", "Morning Momentum", [
    { id: "mm-1", title: "Sunrise Split", artist: "Lane Audio", durationSec: 214, bpm: 172 },
    { id: "mm-2", title: "Cadence Lights", artist: "Kite Meter", durationSec: 198, bpm: 168 },
    { id: "mm-3", title: "Greenway", artist: "North Loop", durationSec: 226, bpm: 170 },
    { id: "mm-4", title: "Kick Stride", artist: "Pulse Harbor", durationSec: 205, bpm: 166 },
    { id: "mm-5", title: "Open Lane", artist: "Lane Audio", durationSec: 231, bpm: 169 },
    { id: "mm-6", title: "Heat Check", artist: "Kite Meter", durationSec: 188, bpm: 174 },
    { id: "mm-7", title: "Last K", artist: "North Loop", durationSec: 212, bpm: 171 },
    { id: "mm-8", title: "Cool Pulse", artist: "Pulse Harbor", durationSec: 240, bpm: 164 },
  ]),
  playlist("easy-groove", "Easy Groove", [
    { id: "eg-1", title: "Soft Shoulder", artist: "Harbor Echo", durationSec: 248, bpm: 138 },
    { id: "eg-2", title: "River Bend", artist: "Slow Current", durationSec: 236, bpm: 142 },
    { id: "eg-3", title: "Shade Line", artist: "Harbor Echo", durationSec: 221, bpm: 140 },
    { id: "eg-4", title: "Low Gear", artist: "Mile Notes", durationSec: 254, bpm: 136 },
    { id: "eg-5", title: "Warm Sidewalk", artist: "Slow Current", durationSec: 229, bpm: 144 },
    { id: "eg-6", title: "Drift Pace", artist: "Mile Notes", durationSec: 242, bpm: 139 },
  ]),
  playlist("race-focus", "Race Focus", [
    { id: "rf-1", title: "Gun Time", artist: "Split Signal", durationSec: 196, bpm: 182 },
    { id: "rf-2", title: "Pack Surge", artist: "Red Kilometer", durationSec: 188, bpm: 178 },
    { id: "rf-3", title: "Marker 3", artist: "Split Signal", durationSec: 204, bpm: 180 },
    { id: "rf-4", title: "Hold Form", artist: "Apex Drum", durationSec: 191, bpm: 176 },
    { id: "rf-5", title: "Kickboard", artist: "Red Kilometer", durationSec: 183, bpm: 184 },
    { id: "rf-6", title: "Finish Chute", artist: "Apex Drum", durationSec: 201, bpm: 181 },
    { id: "rf-7", title: "Tape Break", artist: "Split Signal", durationSec: 176, bpm: 186 },
  ]),
  playlist("night-run", "Night Run", [
    { id: "nr-1", title: "Sodium Glow", artist: "Afterlight", durationSec: 233, bpm: 154 },
    { id: "nr-2", title: "Empty Overpass", artist: "Glass Mile", durationSec: 218, bpm: 158 },
    { id: "nr-3", title: "Quiet Stride", artist: "Afterlight", durationSec: 247, bpm: 151 },
    { id: "nr-4", title: "Blue Reflector", artist: "Glass Mile", durationSec: 225, bpm: 156 },
    { id: "nr-5", title: "Late Window", artist: "Night Cadence", durationSec: 239, bpm: 153 },
    { id: "nr-6", title: "Home Stretch", artist: "Night Cadence", durationSec: 210, bpm: 159 },
  ]),
  playlist("recovery-mix", "Recovery Mix", [
    { id: "rm-1", title: "Easy Breath", artist: "Cool Down Club", durationSec: 262, bpm: 118 },
    { id: "rm-2", title: "Long Exhale", artist: "Soft Terrain", durationSec: 274, bpm: 122 },
    { id: "rm-3", title: "Unlace", artist: "Cool Down Club", durationSec: 258, bpm: 116 },
    { id: "rm-4", title: "Shade Tree", artist: "Soft Terrain", durationSec: 269, bpm: 124 },
    { id: "rm-5", title: "Walk-Out", artist: "Cool Down Club", durationSec: 251, bpm: 120 },
  ]),
];
