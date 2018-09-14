import Game from './game';
import mediator from './mediator';
import {START_GAME, FINISH_GAME} from './events';

class App {
    constructor() {
        this.canvas = document.querySelector('.game__canvas');
        this.game = new Game();

        mediator.emit(START_GAME, {
            //здесь данные, которые необходимы на экране с игрой
            payload: {
                canvas: this.canvas
            }
        });
        mediator.on(FINISH_GAME, this.onFinishGame.bind(this));
    }

    onFinishGame() {
        this.game.destroy();
    }
}

new App();
