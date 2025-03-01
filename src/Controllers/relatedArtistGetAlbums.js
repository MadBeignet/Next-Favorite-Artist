import axios from "axios";
import constants from "../__constants/constants";

const getArtistAlbums = async (artist, token, user) => {
  return axios
    .get(constants.BASE_ROUTE + "/artists/" + artist.id + "/albums", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        market: user.country,
        include_groups: "album",
        limit: 50,
      },
    })
    .then((response) => {
      // console.log(response.data.items);
      return {
        data: response.data.items,
      };
    })
    .catch((err) => {
      return { status: "error", error: err };
    });
};
const resolvePromises = (allArtists, token, user) => {
  // console.log(allArtists);
  return Promise.all(allArtists.map((a) => getArtistAlbums(a, token, user)));
  
};
export const getRelatedArtistsAlbums = async (artists, token, user) => {
  return resolvePromises(artists, token, user)
    .then((resp) => {
      // console.log("TEST");
      // console.log(resp);
      // console.log(resp.map((aAlbums => aAlbums.map(a => a.data))));
      // const results = resp.map(aAlbums => aAlbums.map(a => a));
      // console.log(resp.map((aAlbums) => aAlbums.map(a => a)));
      // console.log(results);
      
      const results1 = resp.map(a => a.data);
      const results2 = results1.map(b => b.map(c => c.id));
      console.log(results2.flat());
      // console.log(results1.flat(2));
      return { status: "success", data: results2.flat(2)};
    })
    .catch((e) => {
      return { status: "error", error: e };
    });
};
