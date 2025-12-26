import { Actor } from "./actor";
import { Director } from "./director";
import { Genre } from "./genre";

export interface Movie {
    _key?: string,
    _id?: string,
    title: string,
    description: string
    releaseDate: string,
    runningTime: number,
    imageUrl?: string,
    active?: boolean
}

export interface MovieFull {
  movie: Movie;
  actors: { actor: any }[];
  directors: { director: any }[];
  genres: { genre: any }[];
}