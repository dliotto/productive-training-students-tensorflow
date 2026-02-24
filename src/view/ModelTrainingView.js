import { View } from './View.js';

export class ModelView extends View {
    #trainModelBtn = document.querySelector('#trainModelBtn');
    #runPredictionBtn = document.querySelector('#runPredictionBtn');
    #randomStudentBtn = document.querySelector('#randomStudentBtn');
    #onTrainModel;
    #onRunPrediction;

    constructor() {
        super();
        this.attachEventListeners();
    }

    registerTrainModelCallback(callback) {
        this.#onTrainModel = callback;
    }
    registerRunPredictionCallback(callback) {
        this.#onRunPrediction = callback;
    }

    attachEventListeners() {
        this.#trainModelBtn.addEventListener('click', () => {
            if (this.#onTrainModel) this.#onTrainModel();
        });
        this.#runPredictionBtn.addEventListener('click', () => {
            if (this.#onRunPrediction) this.#onRunPrediction();
        });
    }

    registerRandomStudentCallback(callback) {
        if (this.#randomStudentBtn) {
            this.#randomStudentBtn.addEventListener('click', () => {
                callback();
            });
        }
    }

    enablePredictButton() {
        this.#runPredictionBtn.disabled = false;
    }

    updateTrainingProgress(progress) {
        this.#trainModelBtn.disabled = true;
        this.#trainModelBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Treinando...';

        if (progress.progress === 100) {
            this.#trainModelBtn.disabled = false;
            this.#trainModelBtn.innerHTML = '<i class="bi bi-cpu"></i> Treinar Modelo';
        }
    }
}
