import axios from "axios";
import constants from "../__constants/constants";

export const getUser = async (token) => {
  const { data } = await axios
    .get(constants.BASE_ROUTE + "/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .catch((err) => {
      return { status: "error", error: err };
    });
  return { status: "success", data: data };
};
