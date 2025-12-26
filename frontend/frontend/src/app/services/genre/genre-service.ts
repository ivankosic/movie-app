import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Genre } from '../../model/genre';

@Injectable({
  providedIn: 'root',
})
export class GenreService {
  private url = "http://localhost:5000/api/genres";

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Genre[]>(this.url);
  }

  getAllActive() {
    return this.http.get<Genre[]>(`${this.url}/active`);
  }

  getById(id: string | number) {
    return this.http.get<Genre>(`${this.url}/${id}`);
  }

  create(t: Genre) {
    return this.http.post<Genre>(`${this.url}`, t);
  }

  update(t: Genre, id: string | number) {
    return this.http.put<Genre>(`${this.url}`, t);
  }

  delete(id: string | number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  softDelete(id: string | number) {
    return this.http.delete<void>(`${this.url}/softDelete/${id}`);
  }

  search(term: string) {
    return this.http.get<Genre[]>(`${this.url}/search?term=${term}`);
  }
}
