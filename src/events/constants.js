export const events = {
    modelTrain: 'training:train',
    trainingComplete: 'training:complete',
    modelProgressUpdate: 'model:progress-update',
    predict: 'predict',
    predictionReady: 'prediction:ready',
}

export const workerEvents = {
    trainingComplete: 'training:complete',
    trainModel: 'train:model',
    predict: 'predict',
    trainingLog: 'training:log',
    progressUpdate: 'progress:update',
    tfVisData: 'tfvis:data',
    tfVisLogs: 'tfvis:logs',
}
