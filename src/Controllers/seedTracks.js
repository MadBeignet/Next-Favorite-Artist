import axios from "axios";
import constants from "../__constants/constants";

export const getSeedTracks = async (
  token,
  artists,
  tracks,
  makeUserAPICalls,
  country
) => {
  if (!makeUserAPICalls) return;
  return await axios
    .get(`${constants.BASE_ROUTE}/recommendations`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        limit: 40,
        seed_artists: artists,
        seed_tracks: tracks,
        market: country,
      },
    })
    .then((response) => {
      return {
        status: "success",
        data: response.data.tracks.map((t) => t.uri),
      };
    })
    .catch((err) => {
      return { status: "error", error: err };
    });
};
