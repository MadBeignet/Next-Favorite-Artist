import axios from "axios";
import constants from "../__constants/constants";

const getAlbumTracks = async (albums, token) => {
  return axios
    .get(constants.BASE_ROUTE + "/albums", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        ids: albums,
      },
    })
    .then((response) => {
      return {
        data: response.data,
      };
    })
    .catch((err) => {
      return { status: "error", error: err };
    });
};
const resolvePromises = (allAlbums, token) => {
  const chunk = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );

  const albums_split = chunk(allAlbums, 20);
  return Promise.all(albums_split.map(a => getAlbumTracks(a.join(), token)));
};
export const getRelatedAlbumTracks = async (albums, token, user) => {
  return resolvePromises(albums, token, user)
    .then((resp) => {
      console.log("TEST2");
      const results1 = resp.map(a => a.data.albums);
      const results2 = results1.map(b => b.map(c => c.tracks));
      console.log(results2.flat(2));
      return { status: "success", data: results2.flat(2) };
    })
    .catch((e) => {
      return { status: "error", error: e };
    });
};
