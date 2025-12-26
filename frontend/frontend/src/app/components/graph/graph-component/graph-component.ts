import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { MovieService } from '../../../services/movie/movie-service';
import { Router } from '@angular/router';
import { Movie } from '../../../model/movie';
import { Network, DataSet, Node, Edge, Options } from 'vis-network/standalone'; 

@Component({
  selector: 'app-graph-component',
  imports: [],
  templateUrl: './graph-component.html',
  styleUrl: './graph-component.css',
})
export class GraphComponent {
  @Input()
  private root! : Movie;
  private recommendations : Movie[] = [];

  @ViewChild('networkContainer', { static: true }) container!: ElementRef;
  private network: Network | undefined;

  constructor(private movieService : MovieService, private router : Router){}

  makeGraph(){
    
  }

}
