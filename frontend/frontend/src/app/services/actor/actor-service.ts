import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actor } from '../../model/actor';

@Injectable({
  providedIn: 'root',
})
export class ActorService {
  private url = "http://localhost:5000/api/actors";

  constructor(private http : HttpClient){}

  getAll(){
    return this.http.get<Actor[]>(this.url);
  }

  getAllActive(){
    return this.http.get<Actor[]>(`${this.url}/active`);
  }

  getById(id : string | number){
    return this.http.get<Actor>(`${this.url}/${id}`);
  }

  create(t : Actor){
    return this.http.post<Actor>(`${this.url}`, t);
  }

  update(t : Actor, id : string | number){
    return this.http.put<Actor>(`${this.url}`, t);
  }

  delete(id : string | number){
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  softDelete(id : string | number){
    return this.http.delete<void>(`${this.url}/softDelete/${id}`);
  }

  search(term : string){
    return this.http.get<Actor[]>(`${this.url}/search?term=${term}`);
  }

}
