import "./NextFavArtist.css";
import { useState, useEffect } from "react";
import { spotify_logo } from "../__images";

import { displayArtists, displayRecommendedArtists } from "../Artist/Artist";
import { displayTracks } from "../Track/Track";
import { DisplayUser } from "../Profile/Profile";

import { getTopTracks } from "../Controllers/topTracksController";
import { getTopArtists } from "../Controllers/topArtistsController";
import { getUser } from "../Controllers/userController";
import { getRelatedArtists } from "../Controllers/relatedArtistsController";
import { getTopRelatedTracks } from "../Controllers/relatedArtistTrackController";

const NUM_TOP_ARTISTS = 10;
const NUM_REC_ARTISTS = 20;

const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const REDIRECT_URI = process.env.REACT_APP_BASE_URL;
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";
const SCOPES =
  "user-top-read user-read-private playlist-modify-private playlist-modify-public";

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

  // const makeArtistAPICalls = true;
  // const makeUserAPICalls = true;

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

  const errorHandler = (err) => {
    // console.log(err);
    if (err.response.status === 401) {
      logout();
    }
    if (err.response.status === 429 && err.response.headers["retry-after"]) {
      console.log("retrying after " + err.response.headers["retry-after"]);
      setMakeUserAPICalls(false);
      setMakeArtistAPICalls(false);
      setTimeout(() => {
        setMakeUserAPICalls(true);
        setMakeArtistAPICalls(true);
        // getTopArtists();
      }, err.response.headers["retry-after"] * 1000);
    }
  };

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
    const getData = async () => {
      if (!makeUserAPICalls || !makeArtistAPICalls) return;
      const user = await getUser(token);
      const tracks = await getTopTracks(token);
      const artists = await getTopArtists(token);

      if (tracks?.status === "success") {
        setTopTracks(tracks.data);
      } else {
        errorHandler(tracks.error);
      }
      if (artists?.status === "success") {
        setTopArtists(artists.data.items.slice(0, NUM_TOP_ARTISTS));
        setTopArtistList(artists.data.items.map((artist) => artist.id));
      } else {
        errorHandler(artists.error);
      }
      if (user?.status === "success") {
        setUser(user.data);
      } else {
        errorHandler(user.error);
      }
    };
    getData();
  }, [token, makeUserAPICalls, makeArtistAPICalls]);

  useEffect(() => {
    if (!topArtists || !token) return;
    const getData = async () => {
      const relatedArtists = await getRelatedArtists(
        topArtists.map((a) => a.id),
        token
      );
      // console.log(relatedArtists);
      if (relatedArtists?.status === "success") {
        setTopRelatedArtistsList(relatedArtists.data);
      }
    };
    getData();
    // getRelatedArtists(topArtists.map((a) => a.id));
  }, [topArtists, token]);
  useEffect(() => {
    if (!recommendedArtists || !token || !user?.country) return;
    const getData = async () => {
      const tracks = await getTopRelatedTracks(recommendedArtists, token, user);
      if (tracks?.status === "success") {
        setRecommendedArtistsTracks(tracks.data);
      }
    };
    getData();
    // getTopTracks(recommendedArtists);
  }, [recommendedArtists, token, user]);

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
        .filter(
          (a) =>
            !topArtistList.includes(a) &&
            !topTracks.map((t) => t.artists[0].id).includes(a)
        )
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
    if (!topArtists || !topTracks) return;
    return (
      <div className="container">
        {DisplayUser(user, token, makeUserAPICalls, {
          topArtists: topArtists,
          topTracks: topTracks,
          recTracks: recommendedArtistsTracks,
          recArtists: recommendedArtists,
        })}
        {token && (
          <div className="artist-container">
            <h2>Top Artists</h2>
            {displayArtists(topArtists)}
          </div>
        )}

        {token && (
          <div className="song-container">
            <h2>Recent Top Tracks</h2>
            {displayTracks(topTracks)}
          </div>
        )}

        {token && (
          <div className="artist-container">
            <h2>Recommended Artists</h2>
            {displayRecommendedArtists(
              recommendedArtists,
              recommendedArtistsTracks
            )}
          </div>
        )}
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
                className="login-button"
                href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPES}`}
              >
                Login to Spotify
              </a>
            ) : (
              <button align="middle" className="login-logout" onClick={logout}>
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
                className="login-button"
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
