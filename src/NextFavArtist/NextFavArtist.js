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
import { getRelatedAlbumTracks } from "../Controllers/relatedArtistGetAlbumTracks";
import { getRelatedArtistsAlbums } from "../Controllers/relatedArtistGetAlbums";

const NUM_TOP_ARTISTS = 10;
const NUM_REC_ARTISTS = 20;

const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const REDIRECT_URI = process.env.REACT_APP_BASE_URL;
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";
const SCOPES =
  "user-top-read user-read-private playlist-modify-private playlist-modify-public";

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
  const [recTracks, setRecTracks] = useState([]);

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

  // get token
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

  // sets the top tracks, top artists, and top artist list
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

  // gets top related artists
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
  }, [topRelatedArtistsList, topArtistList, topTracks]);

  useEffect(() => {
    if (!recommendedArtists) return;

    const getData = async () => {
      const relatedArtistAlbums = await getRelatedArtistsAlbums(recommendedArtists, token, user);
      if (relatedArtistAlbums?.status === "success") {
        console.log("Related Artist Albums: \n");
        console.log(relatedArtistAlbums);
        const relatedArtistTracks = await getRelatedAlbumTracks(relatedArtistAlbums.data, token);
        if (relatedArtistTracks?.status === "success") {
          setRecTracks(relatedArtistTracks.data);
          console.log("Related Artists Tracks: \n");
          console.log(relatedArtistTracks);
        }
      }
      
    }

    getData();
    // setRecTracks(relatedArtistTracks);
    
  },[recommendedArtists])

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
          <div>
            <h2>Top Artists</h2>
            <div className="artist-container">{displayArtists(topArtists)}</div>
          </div>
        )}

        {/*token && (
          <div>
            <h2>Recent Top Tracks</h2>
            <div className="song-container">{displayTracks(topTracks)}</div>
          </div>
        )*/}
        {token && (
          <div>
          <h2>Test</h2>
          <div className="song-container">{displayTracks(recTracks)}</div></div>
        )}


        {token && (
          <div>
            <h2>Recommended Artists</h2>
            <div className="artist-container">
              {displayRecommendedArtists(
                recommendedArtists,
                recommendedArtistsTracks,
                true
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const cond_mobile_display = () => {
    switch (page) {
      case "top-artists":
        return (
          <div>
            <h2>Top Artists</h2>
            <div className="artist-container" id="column">
              {displayArtists(topArtists)}
            </div>
          </div>
        );
      case "top-tracks":
        return (
          <div>
            <h2>Recent Top Tracks</h2>
            <div className="song-container" id="column">
              {displayTracks(topTracks)}
            </div>
          </div>
        );
      case "recommended-artists":
        return (
          <div>
            <h2 style={{ verticalAlign: "middle" }}>Recommended Artists</h2>
            <div className="artist-container" id="column">
              {displayRecommendedArtists(
                recommendedArtists,
                recommendedArtistsTracks,
                false
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const switchPage = (page) => {
    setPage(page);
    const el = document.getElementById("column");
    el.scrollTo({
      top: 0,
    });
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
              onClick={() => switchPage("top-artists")}
            >
              Top Artists
            </button>
            <button
              className={
                page === "top-tracks"
                  ? "spotify-button-active"
                  : "spotify-button"
              }
              onClick={() => switchPage("top-tracks")}
            >
              Top Tracks
            </button>
            <button
              className={
                page === "recommended-artists"
                  ? "spotify-button-active"
                  : "spotify-button"
              }
              onClick={() => switchPage("recommended-artists")}
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
