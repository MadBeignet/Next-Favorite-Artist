import "./App.css";
import { useState, useEffect } from "react";
import axios from "axios";

const NUM_TOP_ARTISTS = 1;
const NUM_REC_ARTISTS = 1;
const NUM_TOP_TRACKS = 100;

const CLIENT_ID = "20397efaf16a42a2a08d6d9bc9b96a8a";
const REDIRECT_URI = "http://localhost:3000";
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";
const SCOPES = "user-follow-read user-read-recently-played user-top-read";
const BASE_ROUTE = "https://api.spotify.com/v1";
const makeArtistAPICalls = true;
const makeUserAPICalls = true;

function App() {
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [topArtists, setTopArtists] = useState([]);
  const [topArtistList, setTopArtistList] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [topRelatedArtistsList, setTopRelatedArtistsList] = useState([]);
  const [recommendedArtists, setRecommendedArtists] = useState([]);

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
    getUser();
    getTopArtists();
    getTopTracks();
  }, [token]);

  const logout = () => {
    setToken("");
    setUser({});
    setTopArtists([]);
    setTopTracks([]);
    setTopArtistList([]);
    setTopRelatedArtistsList([]);

    window.localStorage.removeItem("token");
  };

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
      });
    setUser(data);
  };

  const getTopArtists = async () => {
    if (!makeUserAPICalls) return;
    const { data } = await axios
      .get(BASE_ROUTE + "/me/top/artists", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          limit: NUM_TOP_ARTISTS,
        },
      })
      .catch((err) => {
        if (err.response.status === 401) {
          logout();
        }
      });
    setTopArtists(data.items);
    setTopArtistList(data.items.map((artist) => artist.id));
  };

  useEffect(() => {
    if (!topArtistList) return;
    getRelatedArtists(topArtistList);
  }, [topArtistList]);
  const idToArtist = (artist) => {
    return topRelatedArtistsList.find((a) => artist === a.id);
  };
  useEffect(() => {
    if (!topRelatedArtistsList) return;
    const counts = {};
    topRelatedArtistsList.forEach((a) => {
      if (a.id in counts) {
        counts[a.id] += 1;
      } else {
        counts[a.id] = 1;
      }
    });
    setRecommendedArtists(
      Object.keys(counts)
        .sort((a, b) => counts[b] - counts[a])
        .map((art) => idToArtist(art))
    );
  }, [topRelatedArtistsList]);

  const getRelated = (artist) => {
    if (!makeArtistAPICalls) return;
    return axios
      .get(BASE_ROUTE + "/artists/" + artist + "/related-artists", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          limit: NUM_REC_ARTISTS,
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
        setTopRelatedArtistsList(
          resp
            .map((d) => d.data.artists)
            .flat()
            .filter((a) => !topArtistList.includes(a.id))
        );
      })
      .catch((e) => console.log(e));
  };

  const displayArtists = (arts) => {
    if (arts.length !== 0) {
      return (
        <div className="artists">
          {arts.map((a) => {
            return (
              <div key={arts.id} className="artist">
                <img
                  src={a?.images ? a?.images[0]?.url : null}
                  width="100px"
                  alt="artist"
                />
                <h3 className="artist-name">{a?.name}</h3>
              </div>
            );
          })}
        </div>
      );
    } else {
      return (
        <div className="artists">
          <div className="artist">
            <div className="blank-artist-picture"></div>
            <div className="blank-artist-name-cell">
              <div className="blank-artist-name"></div>
            </div>
          </div>
        </div>
      );
    }
  };
  const displayTracks = (tracks) => {
    if (tracks.length !== 0) {
      return (
        <div>
          {tracks.map((track) => {
            return (
              <div key={track.id} className="song">
                <img
                  src={track?.album?.images[0]?.url}
                  className="song-picture"
                  alt="album"
                />
                <p className="song-name" key={track.id}>
                  {track.name}
                </p>
              </div>
            );
          })}
        </div>
      );
    } else {
      return (
        <div>
          <div className="blank-track-picture"></div>
          <div className="blank-track-name-cell">
            <div className="blank-track-name"></div>
          </div>
        </div>
      );
    }
  };

  const getTopTracks = async () => {
    if (!makeUserAPICalls) return;
    const { data } = await axios.get(BASE_ROUTE + "/me/top/tracks", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        limit: NUM_TOP_TRACKS,
        time_range: "short_term",
      },
    });
    setTopTracks(data.items);
  };

  const displayUser = () => {
    if (!user || !user.images) return;
    return (
      <div className="profile-container">
        <h2>Profile</h2>
        <img
          className="profile-picture"
          src={user.images[0].url}
          alt="profile"
        />
        <h2>{user.display_name}</h2>
        <h2>Followers: {user.followers.total}</h2>
        <a className="profile-link" href={user.uri}>
          Visit Profile
        </a>
      </div>
    );
  };

  const display = () => {
    if (!token || !topArtists || !topTracks) return;
    return (
      <div className="container">
        {user ? displayUser() : <div className="profile-container"></div>}
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
          {displayArtists(recommendedArtists)}
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      <div className="header">
        <h1 className="header-text">Next Favorite Artist</h1>
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
      </div>

      {display()}
    </div>
  );
}

export default App;
