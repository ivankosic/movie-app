import { Movie } from "./movie"

export interface Actor {
  _id: string;
  _key: string;
  _rev: string;
  active: boolean;
  age: number;
  dateOfBirth: string;
  dateOfDeath? : string;
  fullName: string;
  imageUrl?: string;
  //name: string | null;
}

export interface ActorFull {
    actor : Actor;
    movies : Movie[];
}

export interface ActorPageResponse {
  data: ActorFull[];
  total: number;
  page: number;
  pageSize: number;
}