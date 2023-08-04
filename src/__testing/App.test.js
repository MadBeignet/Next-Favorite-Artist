import { render, screen } from "@testing-library/react";
import NextFavArtist from "../NextFavArtist/NextFavArtist";

test("renders learn react link", () => {
  render(<NextFavArtist />);
  const title = screen.getByText(/Next Favorite Artist/i);
  expect(title).toBeTruthy();
});
