import axios from "axios";
import constants from "../__constants/constants";

export const getTopTracks = async (token) => {
  let error = null;
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
      return { status: "error", error: err };
      // if (err.response.status === 401) {

      //   // return false;
      // }
      // if (err.response.status === 429 && err.response.headers["retry-after"]) {
      //   console.log("retrying after " + err.response.headers["retry-after"]);
      //   setMakeUserAPICalls(false);
      //   setTimeout(() => {
      //     setMakeUserAPICalls(true);
      //     getTopTracks();
      //   }, err.response.headers["retry-after"] * 1000);
      // }
    });

  return { status: "success", data: data.items };
  // setTopTracks(data.items);
};
