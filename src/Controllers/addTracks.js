import axios from "axios";
import constants from "../__constants/constants";

export const addTracks = async (
  token,
  playlistID,
  tracks,
  makeUserAPICalls
) => {
  if (!makeUserAPICalls) return;
  return await axios
    .post(
      `${constants.BASE_ROUTE}/playlists/${playlistID}/tracks`,
      {
        position: 0,
        uris: tracks,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then((response) => {
      return { status: "success", data: response.data };
    })
    .catch((err) => {
      return { status: "error", error: err };
    });
};
