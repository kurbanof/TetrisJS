export default class Controller {

  constructor(game, view) {
    this.game = game;
    this.view = view;
    this.intervalId = null;
    this.isPlaying = false;
    this.isStart = true;

    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));

    this.view.renderStartScreen();
  }

  update() {
    this.game.movePieceDown();
    this.updateView();
  }

  play() {
    this.isPlaying = true;
    this.startTimer();
    this.updateView();
  }

  pause() {
    this.isPlaying = false;
    this.stopTimer();
    this.updateView();
  }

  reset() {
    this.game.reset();
    this.play();
  }

  updateView() {
    const state = this.game.getState();

    if (state.isGameOver) {
      this.view.renderEndScreen(state)
    } else if  (!this.isPlaying && !this.isStart) {
      this.view.renderPauseScreen()
    } else if (!this.isStart){
      this.view.renderMainScreen(state)
    }
  }

  startTimer() {
    const speed = 1000 - this.game.getState().level * 100;

    if (!this.intervalId) {
      this.intervalId = setInterval(() => {
        this.update()
      }, speed > 0 ? speed : 100)
    }
  }

  stopTimer() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  handleKeyDown(event) {
    const state = this.game.getState();

    switch (event.key) {
      case 'Enter':
        this.isStart = false;
        if (state.isGameOver) {
          this.reset();
        }
        else if (this.isPlaying) {
          this.pause();
        } else { this.play(); }
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (this.isPlaying) {
          this.game.movePieceRight();
        }
        this.updateView();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (this.isPlaying) {
          this.game.movePieceLeft();
        }
        this.updateView();
        break;
      case 'ArrowDown':
        // event.preventDefault();
        if (!this.isStart) {
          this.stopTimer();
          this.game.movePieceDown();
        }
          this.updateView();
        
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.game.rotatePeace();
        this.updateView();
        break;
    }
  }

  handleKeyUp(event) {
    switch (event.key) {
        case 'ArrowDown':
        event.preventDefault();
        this.startTimer();
        break;
    }
  }
}



