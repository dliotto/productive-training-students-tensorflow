import { ModelController } from './controller/ModelTrainingController.js';
import { TFVisorController } from './controller/TFVisorController.js';
import { TFVisorView } from './view/TFVisorView.js';
import { ModelView } from './view/ModelTrainingView.js';
import { StudentFormView } from './view/StudentFormView.js';
import { PredictionView } from './view/PredictionView.js';
import Events from './events/events.js';
import { WorkerController } from './controller/WorkerController.js';

// Criar views
const modelView = new ModelView();
const studentFormView = new StudentFormView();
const predictionView = new PredictionView();
const tfVisorView = new TFVisorView();

// Criar worker de ML
const mlWorker = new Worker('/src/workers/modelTrainingWorker.js', { type: 'module' });

// Configurar o controlador do worker
const w = WorkerController.init({
    worker: mlWorker,
    events: Events
});

// Treinar automaticamente ao carregar
w.triggerTrain();

// Controlador do modelo (coordena form ↔ worker ↔ resultado)
ModelController.init({
    modelView,
    studentFormView,
    predictionView,
    events: Events,
});

// Controlador do TF Visor (gráficos de treinamento)
TFVisorController.init({
    tfVisorView,
    events: Events,
});

// Botão de preencher aleatório
modelView.registerRandomStudentCallback(() => {
    studentFormView.fillRandomStudent();
});
