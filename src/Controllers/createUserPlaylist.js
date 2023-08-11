import axios from "axios";
import constants from "../__constants/constants";

export const createPlaylist = async (name, token, userID, makeUserAPICalls) => {
  if (!makeUserAPICalls) return;
  return await axios
    .post(
      `${constants.BASE_ROUTE}/users/${userID}/playlists`,
      {
        name: name,
        description: "Playlist created by NextFavoriteArtist",
        public: false,
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
