import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MovieActor } from '../../model/movie-actor';

@Injectable({
  providedIn: 'root',
})
export class MovieActorService {
  private url = "http://localhost:5000/api/movie-actors";

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<MovieActor[]>(this.url);
  }

  getAllActive() {
    return this.http.get<MovieActor[]>(`${this.url}/active`);
  }

  getById(id: string | number) {
    return this.http.get<MovieActor>(`${this.url}/${id}`);
  }

  create(t: MovieActor) {
    return this.http.post<MovieActor>(`${this.url}`, t);
  }

  update(t: MovieActor, id: string | number) {
    return this.http.put<MovieActor>(`${this.url}`, t);
  }

  delete(id: string | number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  softDelete(id: string | number) {
    return this.http.delete<void>(`${this.url}/softDelete/${id}`);
  }

  search(term: string) {
    return this.http.get<MovieActor[]>(`${this.url}/search?term=${term}`);
  }
}
