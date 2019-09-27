import { Component, OnInit } from '@angular/core';
import { ScoreService } from '../../services/score.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss']
})
export class StartComponent implements OnInit {

  constructor(
    private scoreService: ScoreService,
    private router: Router,
  ) { }

  ngOnInit() {
  }

  onGameStart(limit: number) {
    this.scoreService.reset(limit);
    this.router.navigate(['/quiz']);
  }

}
