import axios from "axios";
import constants from "../__constants/constants";

const getRelated = (artist, token) => {
  //   if (!makeArtistAPICalls) return;
  return axios
    .get(constants.BASE_ROUTE + "/artists/" + artist + "/related-artists", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      return {
        data: response.data,
      };
    })
    .catch((err) => console.log(err));
};
const resolvePromises = (allArtists, token) => {
  return Promise.all(allArtists.map((a) => getRelated(a, token)));
};
export const getRelatedArtists = async (artists, token) => {
  return resolvePromises(artists, token)
    .then((resp) => {
      return {
        status: "success",
        data: resp.map((d) => d.data.artists).flat(),
      };
      //   setTopRelatedArtistsList(resp.map((d) => d.data.artists).flat());
    })
    .catch((e) => {
      return { status: "error", error: e };
    });
};
