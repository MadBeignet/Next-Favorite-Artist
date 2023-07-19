import "./Track.css";

export const displayTracks = (tracks) => {
  const arr = [...Array(100 + 1).keys()].slice(1);
  if (tracks.length !== 0) {
    return (
      <div align="middle">
        {tracks.map((track) => {
          return (
            <div key={track.id} className="song">
              <img
                src={track?.album?.images[0]?.url}
                className="song-picture"
                alt="album"
              />
              <p align="left" className="song-name" key={track.id}>
                {track.name}
              </p>
            </div>
          );
        })}
      </div>
    );
  } else {
    return (
      <div align="middle">
        {arr.map((i) => {
          return (
            <div key={i}>
              <div className="blank-track-picture"></div>
              <div className="blank-track-name-cell">
                <div className="blank-track-name"></div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
};
