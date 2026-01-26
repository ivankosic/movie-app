import { Actor } from "./actor";
import { Director } from "./director";

export interface Genre {
  _id: string;
  _key: string;
  _rev: string;
  active: boolean;
  name: string;
}

export interface Movie {
  _id: string;
  _key: string;
  _rev: string;
  active: boolean;
  description: string;
  imageUrl: string;
  releaseDate: string;
  runningTime: number;
  title: string;
}

export interface MovieFull {
  movie: Movie;
  genres: { genre: Genre }[];
  actors : { actor: Actor }[];
  directors : { director: Director }[];
}

export interface MoviePageResponse {
  data: MovieFull[];
  total: number;
  page: number;
  pageSize: number;
}

export interface MovieRecommendation {
  movie: Movie;
  score: number;
  sharedActors: number;
  sharedDirectors: number;
  sharedGenres: number;
}

export interface SearchParams {
  searchText: string;
  actorName: string | null;
  directorName: string | null;
  genreName: string | null;
  releaseDateStart: string | null;
  releaseDateEnd: string | null;
  runningTimeMin: number | null;
  runningTimeMax: number | null;
  page: number;
  pageSize: number;
}