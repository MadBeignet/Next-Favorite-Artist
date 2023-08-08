import axios from "axios";
import constants from "../__constants/constants";

const getTopTrack = async (artist, token, user) => {
  return axios
    .get(constants.BASE_ROUTE + "/artists/" + artist.id + "/top-tracks", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        country: user.country,
      },
    })
    .then((response) => {
      return {
        data: response.data.tracks[0],
      };
    })
    .catch((err) => {
      return { status: "error", error: err };
    });
};
const resolvePromises = (allArtists, token, user) => {
  return Promise.all(allArtists.map((a) => getTopTrack(a, token, user)));
};
export const getTopRelatedTracks = async (artists, token, user) => {
  return resolvePromises(artists, token, user)
    .then((resp) => {
      return { status: "success", data: resp.map((d) => d.data) };
    })
    .catch((e) => {
      return { status: "error", error: e };
    });
};
