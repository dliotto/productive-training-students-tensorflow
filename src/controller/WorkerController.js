import { workerEvents } from "../events/constants.js";

export class WorkerController {
    #worker;
    #events;
    #alreadyTrained = false;
    constructor({ worker, events }) {
        this.#worker = worker;
        this.#events = events;
        this.#alreadyTrained = false;
        this.init();
    }

    async init() {
        this.setupCallbacks();
    }

    static init(deps) {
        return new WorkerController(deps);
    }

    setupCallbacks() {
        this.#events.onTrainModel(() => {
            this.#alreadyTrained = false;
            this.triggerTrain();
        });
        this.#events.onTrainingComplete(() => {
            this.#alreadyTrained = true;
        });

        this.#events.onPredict((data) => {
            if (!this.#alreadyTrained) return;
            this.triggerPredict(data);
        });

        const eventsToIgnoreLogs = [
            workerEvents.progressUpdate,
            workerEvents.trainingLog,
            workerEvents.tfVisData,
            workerEvents.tfVisLogs,
            workerEvents.trainingComplete,
        ];
        this.#worker.onmessage = (event) => {
            if (!eventsToIgnoreLogs.includes(event.data.type))
                console.log(event.data);

            if (event.data.type === workerEvents.progressUpdate) {
                this.#events.dispatchProgressUpdate(event.data.progress);
            }

            if (event.data.type === workerEvents.trainingComplete) {
                this.#events.dispatchTrainingComplete(event.data);
            }

            // Handle tfvis data from the worker for initial visualization
            if (event.data.type === workerEvents.tfVisData) {
                this.#events.dispatchTFVisorData(event.data.data);
            }

            // Handle tfvis training log data
            if (event.data.type === workerEvents.trainingLog) {
                this.#events.dispatchTFVisLogs(event.data);
            }

            // Handle prediction result
            if (event.data.type === workerEvents.predict) {
                this.#events.dispatchPredictionReady(event.data);
            }
        };
    }

    triggerTrain() {
        this.#worker.postMessage({ action: workerEvents.trainModel });
    }

    triggerPredict(student) {
        this.#worker.postMessage({ action: workerEvents.predict, student });
    }
}
