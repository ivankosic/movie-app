import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Movie, MovieFull } from '../../model/movie';
import { environment } from '../../environment';

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  private url = `${environment.baseUrl}/movies`;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<MovieFull[]>(this.url);
  }

  getAllActive() {
    return this.http.get<MovieFull[]>(`${this.url}/active`);
  }

  getById(id: string | number) {
    return this.http.get<MovieFull>(`${this.url}/${id}`);
  }

  create(t: Movie) {
    return this.http.post<Movie>(`${this.url}`, t);
  }

  update(t: Movie, id: string | number) {
    return this.http.put<Movie>(`${this.url}`, t);
  }

  delete(id: string | number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  softDelete(id: string | number) {
    return this.http.delete<void>(`${this.url}/softDelete/${id}`);
  }

  search(term: string) {
    return this.http.get<Movie[]>(`${this.url}/search?term=${term}`);
  }

  recommend(id : string | number){
    return this.http.get<MovieFull[]>(`${this.url}/${id}/recommend`);
  }
}
