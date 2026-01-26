import { Movie } from "./movie"

export interface Director {
  _id: string;
  _key: string;
  _rev: string;
  active: boolean;
  age: number;
  dateOfBirth: string;
  dateOfDeath? : string;
  fullName: string;
  imageUrl?: string;
  name: string | null;
}

export interface DirectorFull {
    director : Director;
    movies : Movie[];
}

export interface DirectorPageResponse {
  data: DirectorFull[];
  total: number;
  page: number;
  pageSize: number;
}