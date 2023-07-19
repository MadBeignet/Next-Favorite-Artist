import axios from "axios";
import constants from "../constants/constants";

export const getTopTracks = async (logout, token) => {
  const { data } = await axios
    .get(constants.BASE_ROUTE + "/me/top/tracks", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        limit: constants.NUM_TOP_TRACKS,
        time_range: "short_term",
      },
    })
    .catch((err) => {
      if (err.response.status === 401) {
        logout();
      }
      if (err.response.status === 429 && err.response.headers["retry-after"]) {
        console.log("retrying after " + err.response.headers["retry-after"]);
        setMakeUserAPICalls(false);
        setTimeout(() => {
          setMakeUserAPICalls(true);
          getTopTracks();
        }, err.response.headers["retry-after"] * 1000);
      }
    });
  setTopTracks(data.items);
};
