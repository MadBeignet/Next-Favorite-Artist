import "./Profile.css";
import { useState } from "react";
import RecommendedPlaylist from "../RecommendedPlaylist/RecommendedPlaylist";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import "react-notifications/lib/notifications.css";

export const DisplayUser = (user, token, makeUserAPICalls, data) => {
  const [playlistName, setPlaylistName] = useState("");
  const submitName = async () => {
    if (!playlistName) return;
    const name = playlistName;
    setPlaylistName("");
    const tracksAdded = await RecommendedPlaylist(
      name,
      user,
      token,
      makeUserAPICalls,
      data
    );
    if (tracksAdded.status === "success") {
      NotificationManager.success("Playlist Created!", "", 2000);
    } else {
      if (tracksAdded.error.response.status === 429)
        NotificationManager.error("Error Creating Playlist", "Come back later");
      if (tracksAdded.error.response.status === 401)
        NotificationManager.error(
          "Error Creating Playlist",
          "Refresh the page and try again"
        );
    }
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
        <NotificationContainer />
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
            Creates a playlist based on top artists and tracks
          </div>
        </div>
      </div>
    </div>
  );
};
