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
      //   if (err.response.status === 401) {
      //     logout();
      //   }
      //   if (err.response.status === 429 && err.response.headers["retry-after"]) {
      //     console.log("retrying after " + err.response.headers["retry-after"]);
      //     setMakeArtistAPICalls(false);
      //     setTimeout(() => {
      //     //   setMakeArtistAPICalls(true);
      //       getTopTrack(artist);
      //     }, err.response.headers["retry-after"] * 1000);
      //   }
    });
};
const resolvePromises = (allArtists, token, user) => {
  return Promise.all(allArtists.map((a) => getTopTrack(a, token, user)));
};
export const getTopRelatedTracks = async (artists, token, user) => {
  return resolvePromises(artists, token, user)
    .then((resp) => {
      return { status: "success", data: resp.map((d) => d.data) };
      //   setRecommendedArtistsTracks(resp.map((d) => d.data));
    })
    .catch((e) => {
      return { status: "error", error: e };
      //   if (e.response.status === 401) {
      //     logout();
      //   }
      //   if (e.response.status === 429 && e.response.headers["retry-after"]) {
      //     console.log("retrying after " + e.response.headers["retry-after"]);
      //     setMakeArtistAPICalls(false);
      //     setTimeout(() => {
      //       setMakeArtistAPICalls(true);
      //       getTopTracks(artists);
      //     }, e.response.headers["retry-after"] * 1000);
      //   }
    });
};
