import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GraphComponent } from '../../../graph/graph-component/graph-component';
import { Movie, MovieFull } from '../../../../model/movie';
import { MovieService } from '../../../../services/movie/movie-service';
import { Router } from '@angular/router';
import { Network, DataSet, Edge, Node, Options } from 'vis-network';

@Component({
  selector: 'app-graph-view-component',
  imports: [GraphComponent],
  templateUrl: './graph-view-component.html',
  styleUrl: './graph-view-component.css',
})
export class GraphViewComponent implements OnInit {
  graph!: GraphComponent;
  movies : MovieFull[] = [];

  selectedMovie! : MovieFull;
  recommendations : MovieFull[] = [];

  @ViewChild('networkContainer', { static: true }) container!: ElementRef;
  private network: Network | undefined;

  constructor(private service : MovieService, private router : Router){}

  ngOnInit(): void {
    // this.service.getAllActive().subscribe(r =>{
    //     this.movies = r;
    //     console.log(this.movies);
    // });

    const nodes = new DataSet<Node>([
      { id: 1, label: 'Node 1' },
      { id: 2, label: 'Node 2' },
      // ... more nodes
    ]);

    const edges = new DataSet<Edge>([
      { from: 1, to: 2 },
      // ... more edges
    ]);

    const data = { nodes, edges };
    const options: Options = {
      // Customize your network options here (physics, interaction, etc.)
      physics: {
        enabled: true
      }
    };

    this.network = new Network(this.container.nativeElement, data, options);

  }

  getRecommendations(id : string){
    this.service.getById(id).subscribe(r => {
      this.selectedMovie = r;
      console.log("Selected movie: "+r);
    });

    this.service.recommend(id).subscribe(r =>{
      this.recommendations = r;
      console.log(`Recommendations: ${this.recommendations}`)
    });
  }
}
