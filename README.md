# Next Favorite Artist

Stuck on the same few artists and want a few new suggestions? This app will help you find new artists based on your current favorites.

## Description

By using your top 10 artists, spotify's API, and a little bit of math, this app will find artists that are similar to your current favorites. Each top artist will lead to 20 related artists, which are then weighted by the ranking of the related top artist and then squashed all into a summation along with a sort from greatest to least. After these artists are squashed and sorted, the top 40 artists are filtered out, ultimately leaving you with your [`next favorite artist`](https://www.nextfavartist.dev).

## To do:

- [ ] Dynamic font size for artists with long names without spaces

## Eventual To Dos:

- [ ] Add arrow icon at bottom of list to indicate scrolling down

## Goals

- Create backend
- Utilize caching to reduce API calls but also keep the data relevant
- Create a playlist using Spotify's recommendations API using the recommended artists and top 5-10 genres in top tracks.
- ... a few other things that I'll think about later
- Eventually submit for an extended quota

## Playlist Creation (eventually)

- [ ] Get top genres in top tracks, top artists
- [ ] Pick which songs to recommend depending on the top genres
