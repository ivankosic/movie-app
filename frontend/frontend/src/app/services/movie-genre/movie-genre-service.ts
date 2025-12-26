import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MovieGenre } from '../../model/movie-genre';

@Injectable({
  providedIn: 'root',
})
export class MovieGenreService {
  private url = "http://localhost:5000/api/movie-genres";

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<MovieGenre[]>(this.url);
  }

  getAllActive() {
    return this.http.get<MovieGenre[]>(`${this.url}/active`);
  }

  getById(id: string | number) {
    return this.http.get<MovieGenre>(`${this.url}/${id}`);
  }

  create(t: MovieGenre) {
    return this.http.post<MovieGenre>(`${this.url}`, t);
  }

  update(t: MovieGenre, id: string | number) {
    return this.http.put<MovieGenre>(`${this.url}`, t);
  }

  delete(id: string | number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  softDelete(id: string | number) {
    return this.http.delete<void>(`${this.url}/softDelete/${id}`);
  }

  search(term: string) {
    return this.http.get<MovieGenre[]>(`${this.url}/search?term=${term}`);
  }
}
