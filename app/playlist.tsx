import { router } from "expo-router";

import { InfoCard } from "@/components/info-card";
import { PrimaryButton } from "@/components/primary-button";
import { ScreenScaffold } from "@/components/screen-scaffold";
import { ROUTES } from "@/constants/routes";
import { PLAYLISTS } from "@/data";
import { DEFAULT_PLAYLIST } from "@/store/defaults";

export default function PlaylistScreen() {
  return (
    <ScreenScaffold
      title="Playlist"
      subtitle="Mock playlists only. No Spotify or Apple Music in this prototype."
      footer={
        <PrimaryButton
          label="Continue to Audio Mode"
          onPress={() => router.push(ROUTES.audioMode)}
        />
      }
    >
      {PLAYLISTS.map((playlist) => (
        <InfoCard
          key={playlist.id}
          title={playlist.title}
          subtitle={playlist.tracks.map((track) => track.title).slice(0, 3).join(" · ")}
          meta={`${playlist.tracks.length} tracks · ~${playlist.approxBpm} BPM`}
          selected={playlist.id === DEFAULT_PLAYLIST.id}
        />
      ))}
    </ScreenScaffold>
  );
}
