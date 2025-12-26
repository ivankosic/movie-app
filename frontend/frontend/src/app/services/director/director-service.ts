import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Director } from '../../model/director';

@Injectable({
  providedIn: 'root',
})
export class DirectorService {
  private url = "http://localhost:5000/api/directors";

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<Director[]>(this.url);
  }

  getAllActive() {
    return this.http.get<Director[]>(`${this.url}/active`);
  }

  getById(id: string | number) {
    return this.http.get<Director>(`${this.url}/${id}`);
  }

  create(t: Director) {
    return this.http.post<Director>(`${this.url}`, t);
  }

  update(t: Director, id: string | number) {
    return this.http.put<Director>(`${this.url}`, t);
  }

  delete(id: string | number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  softDelete(id: string | number) {
    return this.http.delete<void>(`${this.url}/softDelete/${id}`);
  }

  search(term: string) {
    return this.http.get<Director[]>(`${this.url}/search?term=${term}`);
  }
}
