import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { ScoreService } from '../../services/score.service';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss']
})

export class QuestionComponent implements OnInit {
  public options: any[];
  public correct: any;
  public disabled: boolean;
  public userAnswer: number;
  private waiting: boolean = false;
  private pendingOptions: object = null;

  constructor(
    private apollo: Apollo,
    private router: Router,
    public scoreService: ScoreService,
  ) { }

  getRandom(max: number) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  getRandomOptionWithCharacter(options: any[]) {
    options = options.filter(option => !!option.character)
    return options[this.getRandom(options.length)];
  }

  getRandomCharacterWithImage(characters: object[]) {
    const hasImage = character =>
      !character.image.large.includes('default.jpg');

    characters = characters.filter(character => hasImage(character));

    // if none of the characters have an image, return null
    if (!characters.length) {
      return null;
    }

    return characters[this.getRandom(characters.length)];
  }

  fetchQuestion() {
    // TODO: handle the rare case in which none of the options have characters
    //       with any images
    const query = gql`query ($page: Int) {
      Page (perPage: 1, page: $page) {
        media (
          type: ANIME,
          sort: [POPULARITY_DESC],
          format_in: [TV, TV_SHORT, MANGA],

        ) {
          id
          title {
            english
            romaji
          }
          characters (role: MAIN) {
            nodes {
              id
              name {
                first
                last
              }
              image {
                large
              }
            }
          }
        }
      }
    }`;

    // get random number for picking random media entries from
    // within the current most popular series
    const pages = [],
          options = [];

    while (pages.length < 3){
      let random = this.getRandom(1500);
      if (pages.indexOf(random) === -1) {
        pages.push(random);
      }
    }

    const doWatchQuery = i => this.apollo.watchQuery({
        query,
        variables: {page: pages[i]},
      }).valueChanges.subscribe(result => {
        const media = result.data && result.data['Page'].media[0];

        if (result.data) {
          options.push({
            character: this.getRandomCharacterWithImage(media.characters.nodes),
            media
          });
        }

        if (i < pages.length - 1) {
          doWatchQuery(i + 1);
        } else {
          while (options.length > 3) {
            options.splice(this.getRandom(options.length), 1);
          }

          if (!this.waiting) {
            this.setNewQuestion(options);
          } else {
            this.pendingOptions = options;
          }

        }
      });

    doWatchQuery(0);
  }

  afterTimeout() {
    this.waiting = false;
    if (this.pendingOptions) {
      this.setNewQuestion(this.pendingOptions);
    }
  }

  setNewQuestion(options) {
      this.pendingOptions = null;
      this.userAnswer = null;
      this.options = options;
      this.correct = this.getRandomOptionWithCharacter(options);
      this.disabled = false;
  }

  ngOnInit() {
    this.fetchQuestion();
  }

  onFinish() {
    this.router.navigate(['../']);
  }

  onAnswer(isCorrect: boolean, i: number) {
    if (!this.disabled) {
      this.disabled = true;
      this.userAnswer = i;
      this.scoreService.answer(isCorrect);
      if (!this.scoreService.limit || this.scoreService.tries < this.scoreService.limit) {
        this.fetchQuestion();
        this.waiting = true;
        window.setTimeout(() => this.afterTimeout(), 2000);
      } else {
        window.setTimeout(() => this.onFinish(), 2000);
      }
    }
  }
}
