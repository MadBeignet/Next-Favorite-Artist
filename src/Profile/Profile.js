import "./Profile.css";

export const displayUser = (user) => {
  if (!user || !user.images) return;
  return (
    <div className="profile-container">
      <h2>Profile</h2>
      <img className="profile-picture" src={user.images[0].url} alt="profile" />
      <h2>{user.display_name}</h2>
      <h2>Followers: {user.followers.total}</h2>
      <a className="profile-link" href={user.uri}>
        Visit Profile
      </a>
    </div>
  );
};
