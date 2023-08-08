import axios from "axios";
import constants from "../__constants/constants";

export const getTopTracks = async (token) => {
  return await axios
    .get(constants.BASE_ROUTE + "/me/top/tracks", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        limit: constants.NUM_TOP_TRACKS,
        time_range: "short_term",
      },
    })
    .then((response) => {
      return { status: "success", data: response.data.items };
    })
    .catch((err) => {
      return { status: "error", error: err };
    });
};
