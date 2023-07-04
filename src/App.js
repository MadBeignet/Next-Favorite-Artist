import './App.css';
import { useState, useEffect } from 'react';
import axios from 'axios';

const CLIENT_ID = "20397efaf16a42a2a08d6d9bc9b96a8a";
const REDIRECT_URI = "http://localhost:3000";
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";
const SCOPES = 'user-follow-read user-read-recently-played user-top-read';
const BASE_ROUTE = "https://api.spotify.com/v1";
const makeArtistAPICalls = false;
const makeUserAPICalls = true;

function App() {

  const [token, setToken] = useState("");
  const [user, setUser] = useState({});
  const [topArtists, setTopArtists] = useState([]);
  const [topArtistList, setTopArtistList] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [topRelatedArtistsList, setTopRelatedArtistsList] = useState([]);
  const [topRecommendedArtistsIDs, setTopRecommendedArtistsIDs] = useState([]);
  const [recommendedArtists, setRecommendedArtists] = useState([]);


  

  useEffect(() => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem('token');
    if (!token && hash) {
      token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1];

      window.location.hash = "";
      window.localStorage.setItem('token', token);
    }
    setToken(token);
  }, []);

  useEffect(() => {
    if (!token)
      return;
    getUser();
    getTopArtists();
    getTopTracks();
    


  }, [token])

  const logout = () => {
    setToken("");
    setUser({});
    setTopArtists([]);
    setTopTracks([]);
    setTopArtistList([]);
    setTopRelatedArtistsList([]);

    window.localStorage.removeItem('token');
  }

  const getUser = async () => {
    if (!makeUserAPICalls)
      return;
    const { data } = await axios.get(BASE_ROUTE + "/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).catch(err => {
      if (err.response.status === 401) {
        logout();
      }
    });
    setUser(data);
  }

  const getTopArtists = async () => {
    if (!makeUserAPICalls)
      return;
    const { data } = await axios.get(BASE_ROUTE + "/me/top/artists", {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        limit: 20
      }
    }).catch(err => {
      if (err.response.status === 401) {
        logout();
      }
    });
    setTopArtists(data.items);
    setTopArtistList(data.items.map(artist => artist.id));
  }

  useEffect(() => {
    if (!topArtistList)
      return;
   getRelatedArtists(topArtistList);

  },[topArtistList])

  useEffect(() => {
    if (!topRelatedArtistsList)
      return;
    const counts = {};
    topRelatedArtistsList.forEach((a) => {
      if (a in counts) {
        counts[a] += 1;
      }
      else {
        counts[a] = 1;
      }
    }
    )
    setTopRecommendedArtistsIDs(Object.keys(counts).sort((a,b) => counts[b]-counts[a]));
  }, [topRelatedArtistsList]);

  const getRelated = (artist) => {
    if (!makeArtistAPICalls)
      return;
    return axios.get(BASE_ROUTE + "/artists/" + artist + "/related-artists", {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        limit: 1
      }
      }).then((response) => {
        return  {
          data: response.data,
        }
      }).catch(err => console.log(err));
  }
  const resolvePromises = (allArtists) => {
    return Promise.all(allArtists.map(a => getRelated(a)));
  }
  const getRelatedArtists = async (artists) => {
    resolvePromises(artists).then(resp=> {
      setTopRelatedArtistsList(resp.map(d => d.data.artists.map(a => a.id)).flat().filter(a => !topArtistList.includes(a)));
    }).catch(e => console.log(e));
  }
  const getArtist = (artist) => {
    if (!makeArtistAPICalls)
      return;
    return axios.get(BASE_ROUTE + "/artists/" + artist, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then((response) => {
      return {
        data: response.data,
      }
    }).catch(err => {
      if (err.response.status === 401) {
        logout();
      }
      if (err.response.status === 429) {
        console.log(err.response);
      }
    });
  }

  const resolveArtists = (allArtistsIDs) => {
    return Promise.all(allArtistsIDs.map(a => getArtist(a)));
  }

  useEffect(() => {
    if (!topRecommendedArtistsIDs)
      return;
    resolveArtists(topRecommendedArtistsIDs).then(resp => {
      setRecommendedArtists(resp.map(d => d.data));
    }).catch(e => console.log(e));

    
  }, [topRecommendedArtistsIDs])

  const displayRecommendedArtists = () => {
    return (
      <div>
        <h2>Recommended Artists</h2>
        <div className="artists">
          {recommendedArtists.map((artist) => {
            return (
              <div className="artist">
                <img src={artist.images[0].url} width="100px" alt="artist" />
                <h3>{artist.name}</h3>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const getTopTracks = async () => {
    if (!makeUserAPICalls)
      return;
    const { data } = await axios.get(BASE_ROUTE + "/me/top/tracks", {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        limit: 100,
        time_range: "short_term"
      }
    });
    setTopTracks(data.items);
  }

  const displayUser = () => {
    if (!user || !user.images)
      return;
    return (
      <div className = "profile-container"> 
        <h2>{user.display_name}</h2>
        <img className="profile-picture" src={user.images[0].url} alt="profile" />
      </div>
    )
  }

  const display = () => {
    if (!token || !topArtists || !topTracks)
      return;
    return (
      <div className="container">
        {displayUser()}
        <div className="artist-container">
        <h2>Top Artists</h2>
        {topArtists.map(artist => {
          return (
            <div className="artist" key={artist.id}>
            <img className="profile-picture" src={artist.images[0].url} alt="artist" width = "100px"/>
            <h3 className="artist-name">{artist.name}</h3>
          </div>
          );
        })}
        
        </div>
        
        
        <div className="song-container">
          <h2>Recent Top Tracks</h2>
          {topTracks.map(track => {
            return (
              <div className="song" key={track.id}>
                <img src={track.album.images[0].url} className="song-picture" alt="album" />
                <p className="song-name"key={track.id}>{track.name}</p>
                </div>
            )
          
  })}
        </div>
      </div>
    )
  }




  return (
    <div className="App">
      <div className="header">
        <h1 className="header-text">Next Favorite Artist</h1>
        {!token
      ? <a className="login-logout" href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPES}`}>Login to Spotify</a>
      : <button className="login-logout" onClick={logout}>Logout</button> }
        </div>
      
      {display()}
      { recommendedArtists.length !== 0 
      ? displayRecommendedArtists() 
      : <h2>Waiting on Spotify</h2>}
    </div>
  );
}

export default App;
