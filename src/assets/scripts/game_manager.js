import GameScene from './game_scene';
import mediator from './mediator';
import {randomInteger} from './helpers';

import {NEW_STATE} from './events';
import {ARRAY_COLORS, COUNT_CIRCLE} from './constant';


export default class GameManager {
    constructor(canvas) {
        this.state = {
            matrixColor: this.getMatrixColors()
        };

        this.scene = new GameScene(canvas);
        mediator.on(NEW_STATE, this.onNewState.bind(this));

        this.render();
    }

    getMatrixColors() {
        let resultMatrix = new Array(COUNT_CIRCLE).fill();

        return resultMatrix.map(() => new Array(COUNT_CIRCLE)
            .fill()
            .map(() => randomInteger(0, ARRAY_COLORS.length - 1))
        );
    }

    render() {
        this.scene.setState(this.state);
        this.scene.render();
    }

    onNewState(payload) {
        this.state = payload;
    }

    destroy() {
        this.scene.destroy();
        mediator.off(NEW_STATE);
    }
}