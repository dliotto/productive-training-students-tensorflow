export class ModelController {
    #modelView;
    #studentFormView;
    #predictionView;
    #events;
    #alreadyTrained = false;

    constructor({
        modelView,
        studentFormView,
        predictionView,
        events,
    }) {
        this.#modelView = modelView;
        this.#studentFormView = studentFormView;
        this.#predictionView = predictionView;
        this.#events = events;

        this.init();
    }

    static init(deps) {
        return new ModelController(deps);
    }

    async init() {
        this.setupCallbacks();
    }

    setupCallbacks() {
        this.#modelView.registerTrainModelCallback(this.handleTrainModel.bind(this));
        this.#modelView.registerRunPredictionCallback(this.handleRunPrediction.bind(this));

        this.#events.onTrainingComplete(() => {
            this.#alreadyTrained = true;
            this.#modelView.enablePredictButton();
        });

        this.#events.onProgressUpdate(
            (progress) => {
                this.handleTrainingProgressUpdate(progress);
            }
        );

        this.#events.onPredictionReady(
            (data) => {
                this.#predictionView.renderPrediction(data);
            }
        );
    }

    async handleTrainModel() {
        this.#events.dispatchTrainModel();
    }

    handleTrainingProgressUpdate(progress) {
        this.#modelView.updateTrainingProgress(progress);
    }

    async handleRunPrediction() {
        if (!this.#alreadyTrained) return;
        const studentData = this.#studentFormView.getFormData();
        if (!studentData) return;
        this.#events.dispatchPredict(studentData);
    }
}
