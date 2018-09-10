import GameScene from './game_scene';

export default class GameManager {
    constructor(canvas) {
        // TODO (start, finish) подписаться на события START FINISH, NEW_STATE и вызывать соответствующие обработчики
        this.scene = new GameScene(canvas);

        // this.onStart();
    }

    onNewState(payload) {
        //изменение состояния
        this.state = payload.state;
    }

    onStart() {
        //TODO вынести отдельно класс для управления, здесь создавать экземпляр
        this.startGameLoop();
    }

    onFinish() {

    }

    startGameLoop() {
        this.requestID = requestAnimationFrame(this.gameLoop.bind(this));
    }

    gameLoop() {
        //TODO смотреть действия пользователя

        this.scene.setState(this.state); // установим новое состояние игрового мира
        this.scene.render(); // перерисуем

        this.requestID = requestAnimationFrame(this.gameLoop.bind(this));
    }

    onFinishGame() {
        if (this.requestID) {
            cancelAnimationFrame(this.requestID);
        }

        this.scene.destroy();
    }
}