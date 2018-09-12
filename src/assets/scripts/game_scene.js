import {randomInteger} from './helpers';
import mediator from './mediator';
import {
    SIZE_CANVAS,
    COUNT_CIRCLE,
    ARRAY_COLORS,
    SELECTED_COLOR
} from './constant';
import {NEW_STATE} from './events';

/**
 * Игровая сцена
 */
export default class GameScene {

    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');

        this.canvas.width = SIZE_CANVAS;
        this.canvas.height = SIZE_CANVAS;

        this.settings = {
            col: COUNT_CIRCLE,
            row: COUNT_CIRCLE,
            colors: ARRAY_COLORS,
            countColors: ARRAY_COLORS.length,
            radiusCircle: SIZE_CANVAS / (2 * COUNT_CIRCLE),

            offsetLeftCanvas: canvas.offsetLeft,
            offsetTopCanvas: canvas.offsetTop
        };

        this.state = {};
        this.selectedPoint = [];
        this.requestIDs = [];
        this.firstCick = true;

        document.addEventListener('click', this.onClickToCanvas.bind(this));
    }
    
    /**
     * Освобождение ресурсов
     */
    destroy() {
        document.removeEventListener('click', this.onClickToCanvas.bind(this));
    }

    /**
     * Устанавливка состояние игрового поля
     * @param state
     */
    setState(state) {
        this.state = state;

        this.matrixColors = this.state.matrixColor;
    }

    /**
     * Отображение поля, удаление повторяющихся комбинации
     */
    render() {
        if(!this.state) {
            return;
        }

        this.drawField();
        this.deleteBlock();
    }

    /**
     * Нарисовать игровое поле
     */
    drawField() {
        const {col, row, colors, radiusCircle} = this.settings;

        for (let i = 0; i < row; i++) {
            for (let j = 0; j < col; j++) {

                this.ctx.beginPath();

                this.ctx.arc(
                    radiusCircle + j * (radiusCircle * 2),
                    radiusCircle + i * (radiusCircle * 2),
                    radiusCircle,
                    0, 2 * Math.PI
                );

                this.ctx.fillStyle = colors[this.matrixColors[i][j]];
                this.ctx.fill();
            }
        }
    }

    /**
     * Обработка клика по canvas
     * @param e
     */
    onClickToCanvas(e) {
        const {offsetLeftCanvas, offsetTopCanvas, radiusCircle} = this.settings;

        let coordinateX = Math.floor((e.pageY - offsetTopCanvas) / (radiusCircle * 2));
        let coordinateY = Math.floor((e.pageX - offsetLeftCanvas) / (radiusCircle * 2));

        if (this.firstCick) {
            this.selectedPoint = this._selectCircle([coordinateX, coordinateY]);
            this.firstCick = false;
            return;
        }

        this.firstCick = true;
        if (!this._isCorrectDistance([coordinateX, coordinateY], this.selectedPoint)) {
            return;
        }

        this._swapElementMatrix(this.selectedPoint, [coordinateX, coordinateY], this.matrixColors);

        if (this._getPointsForDelete().length === 0) { // если перестановка не приведет к выстроению комбинации
            this._swapElementMatrix(this.selectedPoint, [coordinateX, coordinateY], this.matrixColors);
        }

        this.deleteBlock();

        this.drawField(); // чтобы отризовался элемент, который свапнулся
        mediator.emit(NEW_STATE, {matrixColor: this.matrixColors}); 
    }

    /**
     * Анимированное удаление найденой комбинации
     * @returns {number} 
     */
    deleteBlock() {
        let {colors, radiusCircle} = this.settings;
        let diameterCircle = 2 * radiusCircle;

        let pointsForDelete = this._getPointsForDelete();

        const animation = () => {

            radiusCircle -= 1;

            pointsForDelete.forEach(point => {
                const [row, col] = point;

                this.ctx.clearRect(
                    col * diameterCircle,
                    row * diameterCircle,
                    diameterCircle,
                    diameterCircle
                );

                this.ctx.beginPath();
                const normalize = diameterCircle / 2 - radiusCircle;

                this.ctx.arc(
                    normalize + radiusCircle + col * ((normalize + radiusCircle) * 2),
                    normalize + radiusCircle + row * ((normalize + radiusCircle) * 2),
                    radiusCircle,
                    0, 2 * Math.PI
                );

                this.ctx.fillStyle = colors[this.matrixColors[row][col]];
                this.ctx.fill();
            });

            if (radiusCircle <= 0) {
                this.requestIDs.forEach(id => cancelAnimationFrame(id));
                pointsForDelete.forEach(point => this.matrixColors[point[0]][point[1]] = -1);

                this._normalizeCircle();
                if (this._getPointsForDelete().length !== 0) { // если остались комбинации блоков, удаляем их
                    this.deleteBlock();
                }

                this.drawField();
                mediator.emit(NEW_STATE, {matrixColor: this.matrixColors});
                return;
            }

            return this.requestIDs.push(requestAnimationFrame(animation));
        };

        return this.requestIDs[0] = requestAnimationFrame(animation);
    }
    
    //TODO переписать как-нибудь
    /**
     * нахождение индексов удаляемых шариков
     * @private
     */
    _getPointsForDelete() {
        const {row, col} = this.settings;
        let arr = [];

        for (let i = 0; i < row; i++) {
            for (let j = 0; j < col; j++) {

                // находим в строке
                arr = [[i, j]];

                while (j + arr.length < col && this.matrixColors[i][j] === this.matrixColors[i][j + arr.length]) {
                    arr.push([i, j + arr.length]);
                }

                if (arr.length >= 3) {
                    return arr;
                }

                // находим в столбце
                arr = [[i, j]];

                while (i + arr.length < row && this.matrixColors[i][j] === this.matrixColors[i + arr.length][j]) {
                    arr.push([i + arr.length, j]);
                }

                if (arr.length >= 3) {
                    return arr;
                }

            }
        }

        return [];
    }

    /**
     * Меняем точку pointA c pointB местами в matrix
     * @param pointA
     * @param pointB
     * @param matrix
     * @private
     */
    _swapElementMatrix(pointA, pointB, matrix) {
        let tmp = matrix[pointA[0]][pointA[1]];
        matrix[pointA[0]][pointA[1]] = matrix[pointB[0]][pointB[1]];
        matrix[pointB[0]][pointB[1]] = tmp;
    }

    /**
     * Проверка корректного расстояния между точками, для их перестановки
     * @param pointA
     * @param pointB
     * @returns {boolean}
     * @private
     */
    _isCorrectDistance(pointA, pointB) {
        let distance = (
            ((pointA[0] - pointB[0]) ** 2 + (pointA[1] - pointB[1]) ** 2) ** 0.5
        );

        return distance === 1;
    }

    /**
     * Коррекция row и col
     * @param row
     * @param col
     * @returns {*[]}
     * @private
     */
    _getCorrectRowAndCol([row, col]) {
        row = row > COUNT_CIRCLE - 1 ?
            COUNT_CIRCLE - 1 :
            (row < 0 ? 0 : row);

        col = col > COUNT_CIRCLE - 1 ?
            COUNT_CIRCLE - 1 :
            (col < 0 ? 0 : col);

        return [row, col];
    }

    /**
     * Выделение нажатого круга
     * @returns {*[]} параметры круга
     * @private
     */
    _selectCircle() {
        const [row, col] = this._getCorrectRowAndCol(...arguments);
        const {radiusCircle} = this.settings;

        this.ctx.beginPath();

        this.ctx.arc(
            radiusCircle + col * (radiusCircle * 2),
            radiusCircle + row * (radiusCircle * 2),
            radiusCircle - 3,
            0, 2 * Math.PI
        );

        this.ctx.lineWidth = 5;
        this.ctx.strokeStyle = SELECTED_COLOR;
        this.ctx.stroke();

        return [row, col];
    }

    /**
     * Сдвиг элементов матрицы вниз
     * @private
     */
    _normalizeCircle() {
        const {row, col, countColors} = this.settings;
        let isNormalizeMatrix = false;

        while (!isNormalizeMatrix) {
            isNormalizeMatrix = true;

            for (let i = 0; i < row; i++) {
                for (let j = 0; j < col; j++) {

                    if (this.matrixColors[i][j] < 0) {
                        isNormalizeMatrix = false;

                        // найденый элемент в самом верху
                        if (i === 0) {
                            this.matrixColors[i][j] = randomInteger(0, countColors - 1);
                        }

                        if (i > 0) {
                            this.matrixColors[i][j] = this.matrixColors[i - 1][j]; // запоминаем число, которе нужно спустить
                            this.matrixColors[i - 1][j] = -1; // поднимаем -1 до условия i === 0
                        }

                    }
                }
            }
        }
    }
}
