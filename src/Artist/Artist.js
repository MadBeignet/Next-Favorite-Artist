import "./Artist.css";
import { Spotify } from "react-spotify-embed";

export const displayArtists = (arts) => {
  const arr = [...Array(10 + 1).keys()].slice(1);
  if (arts.length !== 0) {
    return (
      <div align="middle">
        {arts.map((a) => {
          return (
            <div key={arts.id} className="artist">
              <img
                src={a?.images ? a?.images[0]?.url : null}
                width="100px"
                height="100px"
                alt="artist"
              />
              <h3 className="artist-name">{a?.name}</h3>
            </div>
          );
        })}
        <div className="filler-artist"></div>
      </div>
    );
  } else {
    return (
      <div align="middle">
        {arr.map((i) => {
          return (
            <div key={i} className="artist">
              <div className="blank-artist-picture"></div>
              <div className="blank-artist-name-cell">
                <div className="blank-artist-name"></div>
              </div>
            </div>
          );
        })}
        <div className="filler-artist"></div>
      </div>
    );
  }
};
export const displayRecommendedArtists = (arts, tracks, embeds) => {
  const arr = [...Array(10 + 1).keys()].slice(1);
  if (arts.length !== 0 && tracks.length !== 0) {
    return (
      <div align="middle">
        {arts.map((a, ind) => {
          return (
            <div key={a.id} className="artist-with-embed">
              <img
                src={a?.images ? a?.images[0]?.url : null}
                width="100px"
                height="100px"
                alt="artist"
              />
              <h3 className="artist-name">{a?.name}</h3>
              <div className="blank-embed-cell">
                {/* <Spotify
                  style={{
                    border: "none",
                    borderRadius: "12px",
                    marginLeft: "20px",
                  }}
                  height={80}
                  link={tracks[ind]?.external_urls.spotify}
                /> */}
                {embeds && (
                  <iframe
                    title={"test"}
                    src={
                      "https://open.spotify.com/embed/track/" +
                      tracks[ind]?.id +
                      "?utm_source=generator"
                    }
                    height="80px"
                    allow="encrypted-media"
                    style={{
                      border: "none",
                      borderRadius: "12px",
                      marginLeft: "20px",
                    }}
                    onError={(error) => console.log(error)}
                  ></iframe>
                )}
              </div>
              {/* <p className="artist-track-name">{tracks[ind]?.name}</p> */}
            </div>
          );
        })}
        <div className="filler-artist"></div>
      </div>
    );
  } else {
    return (
      <div align="middle">
        {arr.map((i) => {
          return (
            <div key={i} className="artist-with-embed">
              <div className="blank-artist-picture"></div>
              <div className="blank-artist-name-cell">
                <div className="blank-artist-name"></div>
              </div>
              <div className="blank-embed-cell">
                <div className="blank-embed"></div>
              </div>
            </div>
          );
        })}
        <div className="filler-artist"></div>
      </div>
    );
  }
};
