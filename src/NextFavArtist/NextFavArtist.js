import "./NextFavArtist.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { spotify_logo } from "../__images";

import { displayArtists, displayRecommendedArtists } from "../Artist/Artist";
import { displayTracks } from "../Track/Track";
import { displayUser } from "../Profile/Profile";

import { getTopTracks } from "../Controllers/topTracksController";

const NUM_TOP_ARTISTS = 10;
const NUM_TOP_ARTISTS_USED = 40;
const NUM_TOP_TRACKS = 100;
const NUM_REC_ARTISTS = 20;

const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const REDIRECT_URI = process.env.REACT_APP_BASE_URL;
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";
const SCOPES = "user-top-read user-read-private";
const BASE_ROUTE = "https://api.spotify.com/v1";

// response.headers.["retry-after"]

function NextFavArtist() {
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [topArtists, setTopArtists] = useState([]);
  const [topArtistList, setTopArtistList] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [topRelatedArtistsList, setTopRelatedArtistsList] = useState([]);
  const [recommendedArtists, setRecommendedArtists] = useState([]);
  const [recommendedArtistsTracks, setRecommendedArtistsTracks] = useState([]);
  const [page, setPage] = useState("top-artists");
  const [makeArtistAPICalls, setMakeArtistAPICalls] = useState(true);
  const [makeUserAPICalls, setMakeUserAPICalls] = useState(true);

  useEffect(() => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem("token");
    if (!token && hash) {
      token = hash
        .substring(1)
        .split("&")
        .find((elem) => elem.startsWith("access_token"))
        .split("=")[1];

      window.location.hash = "";
      window.localStorage.setItem("token", token);
    }
    setToken(token);
  }, []);

  useEffect(() => {
    if (!token) return;
    const getUser = async () => {
      if (!makeUserAPICalls) return;
      const { data } = await axios
        .get(BASE_ROUTE + "/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .catch((err) => {
          if (err.response.status === 401) {
            logout();
          }
          if (
            err.response.status === 429 &&
            err.response.headers["retry-after"]
          ) {
            console.log(
              "retrying after " + err.response.headers["retry-after"]
            );
            setMakeUserAPICalls(false);
            setTimeout(() => {
              setMakeUserAPICalls(true);
              getUser();
            }, err.response.headers["retry-after"] * 1000);
          }
        });
      setUser(data);
    };
    const getTopArtists = async () => {
      if (!makeUserAPICalls || !token) return;
      const { data } = await axios
        .get(BASE_ROUTE + "/me/top/artists", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            limit: NUM_TOP_ARTISTS_USED,
            time_range: "medium_term",
          },
        })
        .catch((err) => {
          if (err.response.status === 401) {
            logout();
          }
          if (
            err.response.status === 429 &&
            err.response.headers["retry-after"]
          ) {
            console.log(
              "retrying after " + err.response.headers["retry-after"]
            );
            setMakeUserAPICalls(false);
            setTimeout(() => {
              setMakeUserAPICalls(true);
              getTopArtists();
            }, err.response.headers["retry-after"] * 1000);
          }
        });
      setTopArtists(data.items.slice(0, NUM_TOP_ARTISTS));
      setTopArtistList(data.items.map((artist) => artist.id));
    };
    if (makeUserAPICalls) return;
    getUser();
    getTopArtists();
    getTopTracks(logout);
  }, [token]);

  const logout = () => {
    // console.log("logging out");
    setToken("");
    setUser({});
    setTopArtists([]);
    setTopTracks([]);
    setTopArtistList([]);
    setTopRelatedArtistsList([]);
    setRecommendedArtists([]);
    setRecommendedArtistsTracks([]);

    window.localStorage.removeItem("token");
  };

  useEffect(() => {
    if (!topArtists || !token) return;
    const getRelated = (artist) => {
      if (!makeArtistAPICalls) return;
      return axios
        .get(BASE_ROUTE + "/artists/" + artist + "/related-artists", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          return {
            data: response.data,
          };
        })
        .catch((err) => console.log(err));
    };
    const resolvePromises = (allArtists) => {
      return Promise.all(allArtists.map((a) => getRelated(a)));
    };
    const getRelatedArtists = async (artists) => {
      resolvePromises(artists)
        .then((resp) => {
          setTopRelatedArtistsList(resp.map((d) => d.data.artists).flat());
        })
        .catch((e) => console.log(e));
    };
    getRelatedArtists(topArtists.map((a) => a.id));
  }, [topArtists, token]);
  useEffect(() => {
    if (!recommendedArtists || !token || !user?.country) return;
    const getTopTrack = async (artist) => {
      return axios
        .get(BASE_ROUTE + "/artists/" + artist.id + "/top-tracks", {
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
          if (err.response.status === 401) {
            logout();
          }
          if (
            err.response.status === 429 &&
            err.response.headers["retry-after"]
          ) {
            console.log(
              "retrying after " + err.response.headers["retry-after"]
            );
            setMakeArtistAPICalls(false);
            setTimeout(() => {
              setMakeArtistAPICalls(true);
              getTopTrack(artist);
            }, err.response.headers["retry-after"] * 1000);
          }
        });
    };
    const resolvePromises = (allArtists) => {
      return Promise.all(recommendedArtists.map((a) => getTopTrack(a)));
    };
    const getTopTracks = async (artists) => {
      resolvePromises(artists)
        .then((resp) => {
          setRecommendedArtistsTracks(resp.map((d) => d.data));
        })
        .catch((e) => {
          if (e.response.status === 401) {
            logout();
          }
          if (e.response.status === 429 && e.response.headers["retry-after"]) {
            console.log("retrying after " + e.response.headers["retry-after"]);
            setMakeArtistAPICalls(false);
            setTimeout(() => {
              setMakeArtistAPICalls(true);
              getTopTracks(artists);
            }, e.response.headers["retry-after"] * 1000);
          }
        });
    };
    getTopTracks(recommendedArtists);
  }, [recommendedArtists, token, user?.country]);

  useEffect(() => {
    if (!topRelatedArtistsList) return;
    const idToArtist = (artist) => {
      return topRelatedArtistsList.find((a) => artist === a.id);
    };
    const counts = {};
    topRelatedArtistsList.forEach((a, ind) => {
      if (a.id in counts) {
        counts[a.id] += Math.ceil((topRelatedArtistsList.length - ind) / 20);
      } else {
        counts[a.id] = Math.ceil((topRelatedArtistsList.length - ind) / 20);
      }
    });
    setRecommendedArtists(
      Object.keys(counts)
        .sort((a, b) => counts[b] - counts[a])
        .filter((a) => !topArtistList.includes(a))
        .map((art) => idToArtist(art))
        .slice(
          0,
          Object.keys(counts).length > NUM_REC_ARTISTS
            ? NUM_REC_ARTISTS
            : Object.keys(counts).length
        )
    );
  }, [topRelatedArtistsList, topArtistList]);

  const display = () => {
    if (!token || !topArtists || !topTracks) return;
    return (
      <div className="container">
        {user ? displayUser(user) : <div className="profile-container"></div>}
        <div className="artist-container">
          <h2>Top Artists</h2>
          {displayArtists(topArtists)}
        </div>

        <div className="song-container">
          <h2>Recent Top Tracks</h2>
          {displayTracks(topTracks)}
        </div>

        <div className="artist-container">
          <h2>Recommended Artists</h2>
          {displayRecommendedArtists(
            recommendedArtists,
            recommendedArtistsTracks
          )}
        </div>
      </div>
    );
  };

  const cond_mobile_display = () => {
    switch (page) {
      case "top-artists":
        return (
          <div className="artist-container">
            <h2>Top Artists</h2>
            {displayArtists(topArtists)}
          </div>
        );
      case "top-tracks":
        return (
          <div className="song-container">
            <h2>Recent Top Tracks</h2>
            {displayTracks(topTracks)}
          </div>
        );
      case "recommended-artists":
        return (
          <div className="artist-container">
            <h2 style={{ verticalAlign: "middle" }}>Recommended Artists</h2>
            {displayRecommendedArtists(
              recommendedArtists,
              recommendedArtistsTracks
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="desktop-display">
        <div className="App">
          <div className="header-spotify">
            <h1 className="header-text-spotify">Next Favorite Artist</h1>
            {!token ? (
              <a
                className="login-logout"
                href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPES}`}
              >
                Login to Spotify
              </a>
            ) : (
              <button className="login-logout" onClick={logout}>
                Logout
              </button>
            )}
            <img className="spotify-logo" src={spotify_logo} alt="logo" />
          </div>

          {display()}
        </div>
      </div>
      <div className="mobile-display">
        <div className="App">
          <div className="header-spotify">
            <h1 className="header-text-spotify">Next Favorite Artist</h1>
            {!token ? (
              <a
                className="login-logout"
                href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPES}`}
              >
                Login to Spotify
              </a>
            ) : (
              <button className="login-logout" onClick={logout}>
                Logout
              </button>
            )}
            <img className="spotify-logo" src={spotify_logo} alt="logo" />
          </div>
          <div className="button-container">
            <button
              className={
                page === "top-artists"
                  ? "spotify-button-active"
                  : "spotify-button"
              }
              onClick={() => setPage("top-artists")}
            >
              Top Artists
            </button>
            <button
              className={
                page === "top-tracks"
                  ? "spotify-button-active"
                  : "spotify-button"
              }
              onClick={() => setPage("top-tracks")}
            >
              Top Tracks
            </button>
            <button
              className={
                page === "recommended-artists"
                  ? "spotify-button-active"
                  : "spotify-button"
              }
              onClick={() => setPage("recommended-artists")}
            >
              Recommended Artists
            </button>
          </div>
          {token ? cond_mobile_display() : null}
        </div>
      </div>
    </div>
  );
}

export default NextFavArtist;
