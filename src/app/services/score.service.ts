import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScoreService {
  score: number = 0; // number of right answers
  tries: number = 0; // tries in the current game
  limit: number = 0; // total rounds, 0 if endless

  constructor() { }

  reset(limit: number = 0) {
    this.score = 0;
    this.tries = 0;
    this.limit = limit;
  }

  answer(isCorrect: boolean) {
    if (isCorrect) {
      this.score += 1;
    }
    this.tries += 1;
  }
}
