import "./Profile.css";
import react from "react";
import { useState } from "react";
import RecommendedPlaylist from "../RecommendedPlaylist/RecommendedPlaylist";

export const DisplayUser = (user, token, makeUserAPICalls, data) => {
  const [playlistName, setPlaylistName] = useState("");
  const submitName = () => {
    RecommendedPlaylist(playlistName, user, token, makeUserAPICalls, data);
    setPlaylistName("");
  };

  if (!token) return;
  if (!user || !user.images) return <div className="profile-container"></div>;
  return (
    <div className="profile-container">
      <h2>Profile</h2>
      <img className="profile-picture" src={user.images[0].url} alt="profile" />
      <h2>{user.display_name}</h2>
      <h3>Followers: {user.followers.total}</h3>
      <a className="profile-link" href={user.uri}>
        Visit Profile
      </a>
      <div>
        <input
          className="playlist-name-input"
          placeholder="New Playlist Name"
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
        />
        <div className="submit-button" align="middle">
          <button className="playlist-name-submit" onClick={() => submitName()}>
            Create Curated Playlist
          </button>
          <div className="playlist-name-tooltip">
            Create a playlist based on top artists and tracks
          </div>
        </div>
      </div>
    </div>
  );
};
