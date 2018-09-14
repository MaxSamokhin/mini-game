import GameManager from './game_manager';
import mediator from './mediator';

import {START_GAME} from './events';

export default class Game {
    constructor() {
        mediator.on(START_GAME, this.onStartGame.bind(this));
    }

    onStartGame(data) {
        const {canvas} = data.payload;

        //можно передать стратегии игры, данные пользователя
        this.manager = new GameManager(canvas);
    }

    destroy() {
        this.manager.destroy();
        mediator.off(START_GAME);
    }
}
