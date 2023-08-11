import { createPlaylist } from "../Controllers/createUserPlaylist";
import { getSeedTracks } from "../Controllers/seedTracks";
import { addTracks } from "../Controllers/addTracks";

export default async function RecommendedPlaylist(
  name,
  user,
  token,
  makeUserAPICalls,
  data
) {
  const playlist = await createPlaylist(name, token, user.id, makeUserAPICalls);
  const playlistID = playlist.data.id;

  const seedTracks = await getSeedTracks(
    token,
    data.topArtists
      .map((artist) => artist.id)
      .slice(0, 2)
      .join(","),
    data.topTracks
      .map((track) => track.id)
      .slice(0, 2)
      .join(","),
    makeUserAPICalls,
    user.country
  );
  await addTracks(
    token,
    playlistID,
    data.recTracks.map((track) => track.uri).concat(seedTracks.data),
    makeUserAPICalls
  );
}
