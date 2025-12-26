import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MovieDirector } from '../../model/movie-director';

@Injectable({
  providedIn: 'root',
})
export class MovieDirectorService {
  private url = "http://localhost:5000/api/movie-directors";

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<MovieDirector[]>(this.url);
  }

  getAllActive() {
    return this.http.get<MovieDirector[]>(`${this.url}/active`);
  }

  getById(id: string | number) {
    return this.http.get<MovieDirector>(`${this.url}/${id}`);
  }

  create(t: MovieDirector) {
    return this.http.post<MovieDirector>(`${this.url}`, t);
  }

  update(t: MovieDirector, id: string | number) {
    return this.http.put<MovieDirector>(`${this.url}`, t);
  }

  delete(id: string | number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  softDelete(id: string | number) {
    return this.http.delete<void>(`${this.url}/softDelete/${id}`);
  }

  search(term: string) {
    return this.http.get<MovieDirector[]>(`${this.url}/search?term=${term}`);
  }
}
