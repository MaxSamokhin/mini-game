import GameManager from './game_manager';

class App {
    constructor() {
        this.canvas = document.querySelector('.game__canvas');
        this.gameManager = new GameManager(this.canvas);
    }
}

new App();

