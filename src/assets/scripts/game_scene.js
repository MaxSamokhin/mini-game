import {
    SIZE_CANVAS,
    COUNT_CIRCLE,
    ARRAY_COLORS,
    SELECTED_COLOR
} from './constant';

import {randomInteger} from './helpers';

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

        this.selectedPoint = [];
        this.requestIDs = [];

        this.render();
        document.addEventListener('click', this.onClickToCanvas.bind(this));
    }

    // находит удаляемые комбинации шариков
    getPointsForDelete() {
        return [[1, 1], [1, 2], [1, 3]];
    }

    deleteBlock(matrixColors) {
        let {colors, radiusCircle} = this.settings;
        let diameterCircle = 2 * radiusCircle;

        let pointsForDelete = this.getPointsForDelete();

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
                const normalize = (diameterCircle / 2 - radiusCircle);

                this.ctx.arc(
                    normalize + radiusCircle + col * ((normalize + radiusCircle) * 2),
                    normalize + radiusCircle + row * ((normalize + radiusCircle) * 2),
                    radiusCircle,
                    0, 2 * Math.PI
                );

                this.ctx.fillStyle = colors[matrixColors[row][col]];
                this.ctx.fill();

            });

            if (radiusCircle > 0) {
                this.requestIDs.push(requestAnimationFrame(animation));
                return void 0;
            }

            this.requestIDs.forEach(id => cancelAnimationFrame(id));
        };

        this.requestIDs[0] = requestAnimationFrame(animation);
    }

    onClickToCanvas(e) {
        const {offsetLeftCanvas, offsetTopCanvas, radiusCircle} = this.settings;

        let coordinateX = Math.floor((e.pageX - offsetLeftCanvas) / (radiusCircle * 2));
        let coordinateY = Math.floor((e.pageY - offsetTopCanvas) / (radiusCircle * 2));

        this.selectedPoint = [coordinateY, coordinateX];

        this.isSelected(this.selectedPoint);

    }

    getCorrectRowAndCol([row, col]) {
        row = row > COUNT_CIRCLE - 1 ?
            COUNT_CIRCLE - 1 :
            (row < 0 ? 0 : row);

        col = col > COUNT_CIRCLE - 1 ?
            COUNT_CIRCLE - 1 :
            (col < 0 ? 0 : col);

        return [row, col];
    }

    isSelected() {
        const [row, col] = this.getCorrectRowAndCol(...arguments);
        const {radiusCircle} = this.settings;

        this.ctx.beginPath();

        this.ctx.arc(
            radiusCircle + col * (radiusCircle * 2),
            radiusCircle + row * (radiusCircle * 2),
            radiusCircle,
            0, 2 * Math.PI
        );

        this.ctx.lineWidth = 5;
        this.ctx.strokeStyle = SELECTED_COLOR;
        this.ctx.stroke();
    }

    getMatrixColors() {
        const {col, row, countColors} = this.settings;

        let resultMatrix = new Array(row).fill();

        return resultMatrix.map(() => new Array(col)
            .fill()
            .map(() => randomInteger(0, countColors - 1))
        );
    }


    drawField(matrixColors) {
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

                this.ctx.fillStyle = colors[matrixColors[i][j]];
                this.ctx.fill();

            }
        }
    }

    setState(state) {
        this.state = state;
    }

    render() {
        let matrixColors = this.getMatrixColors(); // вынести в this конструктора
        this.drawField(matrixColors);
        this.deleteBlock(matrixColors);
    }
}
