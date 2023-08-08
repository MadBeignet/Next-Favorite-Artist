import axios from "axios";
import constants from "../__constants/constants";

export const getUser = async (token) => {
  return await axios
    .get(constants.BASE_ROUTE + "/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      return { status: "success", data: response.data };
    })
    .catch((err) => {
      return { status: "error", error: err };
    });
};
