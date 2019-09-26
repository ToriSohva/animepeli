import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { ScoreService } from '../../services/score.service';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss']
})

export class QuestionComponent implements OnInit {
  private options: object[];
  private correct: object;
  private disabled: boolean;

  constructor(
    private apollo: Apollo,
    private scoreService: ScoreService,
  ) { }

  getRandom(max: number) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  getRandomOptionWithCharacter(options: object[]) {
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
        const media = result.data && result.data.Page.media[0];

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
          this.options = options;
          this.correct = this.getRandomOptionWithCharacter(this.options);
          this.disabled = false;
        }
      });

    doWatchQuery(0);
  }

  ngOnInit() {
    this.fetchQuestion();
  }

  onAnswer(isCorrect: boolean) {
    if (!this.disabled) {
      this.disabled = true;
      this.scoreService.answer(isCorrect);
      this.fetchQuestion();
    }
  }
}
