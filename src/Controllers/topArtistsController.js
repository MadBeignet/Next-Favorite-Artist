import axios from "axios";
import constants from "../__constants/constants";

export const getTopArtists = async (token) => {
  const { data } = await axios
    .get(constants.BASE_ROUTE + "/me/top/artists", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        limit: constants.NUM_TOP_ARTISTS_USED,
        time_range: "medium_term",
      },
    })
    .catch((err) => {
      return { status: "error", error: err };
      //   if (err.response.status === 401) {
      //     logout();
      //   }
      //   if (err.response.status === 429 && err.response.headers["retry-after"]) {
      //     console.log("retrying after " + err.response.headers["retry-after"]);
      //     setMakeUserAPICalls(false);
      //     setTimeout(() => {
      //       setMakeUserAPICalls(true);
      //       getTopArtists();
      //     }, err.response.headers["retry-after"] * 1000);
      //   }
    });
  return { status: "success", data: data.items };
};
