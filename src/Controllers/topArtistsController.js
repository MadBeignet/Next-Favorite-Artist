import axios from "axios";
import constants from "../__constants/constants";

export const getTopArtists = async (token) => {
  return await axios
    .get(constants.BASE_ROUTE + "/me/top/artists", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        limit: constants.NUM_TOP_ARTISTS_USED,
        time_range: "medium_term",
      },
    })
    .then((response) => {
      return { status: "success", data: response.data };
    })
    .catch((err) => {
      return { status: "error", error: err };
    });
};
