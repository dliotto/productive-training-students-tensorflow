import { events } from "./constants.js";

export default class Events {

    static onTrainingComplete(callback) {
        document.addEventListener(events.trainingComplete, (event) => {
            return callback(event.detail);
        });
    }
    static dispatchTrainingComplete(data) {
        const event = new CustomEvent(events.trainingComplete, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    static onPredict(callback) {
        document.addEventListener(events.predict, (event) => {
            return callback(event.detail);
        });
    }
    static dispatchPredict(data) {
        const event = new CustomEvent(events.predict, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    static onPredictionReady(callback) {
        document.addEventListener(events.predictionReady, (event) => {
            return callback(event.detail);
        });
    }
    static dispatchPredictionReady(data) {
        const event = new CustomEvent(events.predictionReady, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    static onTrainModel(callback) {
        document.addEventListener(events.modelTrain, (event) => {
            return callback(event.detail);
        });
    }
    static dispatchTrainModel(data) {
        const event = new CustomEvent(events.modelTrain, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    static onTFVisLogs(callback) {
        document.addEventListener(events.tfvisLogs, (event) => {
            return callback(event.detail);
        });
    }

    static dispatchTFVisLogs(data) {
        const event = new CustomEvent(events.tfvisLogs, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    static onTFVisorData(callback) {
        document.addEventListener(events.tfvisData, (event) => {
            return callback(event.detail);
        });
    }
    static dispatchTFVisorData(data) {
        const event = new CustomEvent(events.tfvisData, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    static onProgressUpdate(callback) {
        document.addEventListener(events.modelProgressUpdate, (event) => {
            return callback(event.detail);
        });
    }

    static dispatchProgressUpdate(progressData) {
        const event = new CustomEvent(events.modelProgressUpdate, {
            detail: progressData
        });
        document.dispatchEvent(event);
    }
}
