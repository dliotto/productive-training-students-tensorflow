import 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js';
import { workerEvents } from '../events/constants.js';

let _globalCtx = {};
let _model = null;

// ====================================================================
// 📊 Features numéricas do dataset de produtividade estudantil
// ====================================================================
// Cada feature representa um aspecto do comportamento/perfil do aluno.
// Todas serão normalizadas para 0–1 antes de entrar na rede neural.
const NUMERIC_FEATURES = [
    'age',                    // Idade do aluno (17–30)
    'study_hours_per_day',    // Horas de estudo por dia
    'sleep_hours',            // Horas de sono
    'phone_usage_hours',      // Horas no celular
    'social_media_hours',     // Horas em redes sociais
    'youtube_hours',          // Horas no YouTube
    'gaming_hours',           // Horas jogando
    'breaks_per_day',         // Pausas por dia
    'coffee_intake_mg',       // Cafeína consumida (mg)
    'exercise_minutes',       // Minutos de exercício
    'assignments_completed',  // Trabalhos completados
    'attendance_percentage',  // Porcentagem de presença
    'stress_level',           // Nível de estresse (1–10)
    'focus_score',            // Score de foco
    'final_grade',            // Nota final
];

// 🎯 O que queremos prever:
const TARGET = 'productivity_score';

// 🔢 Normalizar valores contínuos para 0–1
// Por quê? Mantém todas as features balanceadas para o treinamento.
// Fórmula: (val - min) / (max - min)
// Exemplo: coffee=250, min=50, max=500 → (250-50)/(500-50) = 0.44
const normalize = (value, min, max) => (value - min) / ((max - min) || 1);

// ====================================================================
// 📄 Parser CSV simples
// ====================================================================
// Converte texto CSV em array de objetos JavaScript.
// Números são convertidos automaticamente, strings permanecem como strings.
function parseCSV(text) {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    return lines.slice(1).map(line => {
        const values = line.split(',');
        const obj = {};
        headers.forEach((header, i) => {
            const val = values[i]?.trim();
            obj[header] = isNaN(val) || val === '' ? val : Number(val);
        });
        return obj;
    });
}

// ====================================================================
// 🧮 Criar contexto de normalização a partir dos dados
// ====================================================================
// Calcula min/max de cada feature numérica para normalização,
// e indexa os valores categóricos (gender) para one-hot encoding.
//
// 📌 Antes: makeContext(products, users) usava preços e cores de produtos.
//    Agora: makeContext(students) usa features comportamentais de alunos.
function makeContext(students) {
    // Min/max para normalização de cada feature numérica
    // Usa reduce em vez de spread (...) para evitar stack overflow com 20k linhas
    const ranges = {};
    NUMERIC_FEATURES.forEach(feat => {
        const values = students.map(s => s[feat]);
        ranges[feat] = {
            min: values.reduce((a, b) => Math.min(a, b), Infinity),
            max: values.reduce((a, b) => Math.max(a, b), -Infinity),
        };
    });

    // Min/max do target (productivity_score)
    const targetValues = students.map(s => s[TARGET]);
    ranges[TARGET] = {
        min: targetValues.reduce((a, b) => Math.min(a, b), Infinity),
        max: targetValues.reduce((a, b) => Math.max(a, b), -Infinity),
    };

    // Gêneros para one-hot encoding (ex: Male=0, Female=1, Other=2)
    const genders = [...new Set(students.map(s => s.gender))].sort();
    const genderIndex = Object.fromEntries(genders.map((g, i) => [g, i]));

    return {
        students,
        ranges,
        genderIndex,
        genders,
        numGenders: genders.length,
        // Total de dimensões: features numéricas + one-hot de gênero
        dimensions: NUMERIC_FEATURES.length + genders.length,
    };
}

// ====================================================================
// 🔤 Codificar um estudante em vetor numérico
// ====================================================================
// 📌 Antes: encodeProduct() + encodeUser() criavam vetores separados
//    com one-hot de categoria/cor e pesos manuais.
//    Agora: encodeStudent() cria um ÚNICO vetor com todas as features.
//
// Exemplo de vetor resultante para um aluno (Male, 23 anos, etc.):
// [
//   0.55,  // age normalizada
//   0.43,  // study_hours normalizada
//   0.36,  // sleep_hours normalizada
//   ...    // demais features numéricas normalizadas
//   1, 0, 0  // one-hot de gênero (Female=0, Male=1, Other=0)
// ]
function encodeStudent(student, context) {
    // Normalizar todas as features numéricas para 0–1
    const numericValues = NUMERIC_FEATURES.map(feat =>
        normalize(student[feat], context.ranges[feat].min, context.ranges[feat].max)
    );

    const numeric = tf.tensor1d(numericValues);

    // One-hot encoding do gênero
    const gender = tf.oneHot(
        context.genderIndex[student.gender],
        context.numGenders
    ).cast('float32');

    return tf.concat1d([numeric, gender]);
}

// ====================================================================
// 📦 Criar dados de treinamento
// ====================================================================
// 📌 Antes: createTrainingData() fazia cross-join user × product,
//    gerando pares [userVector, productVector] → label (comprou/não).
//    Agora: cada LINHA do CSV = 1 exemplo de treino.
//    Input: features do aluno → Label: productivity_score normalizado.
function createTrainingData(context) {
    const inputs = [];
    const labels = [];

    context.students.forEach(student => {
        const vector = encodeStudent(student, context).dataSync();
        inputs.push([...vector]);
        // Normalizar o target (productivity_score) para 0–1
        labels.push(
            normalize(student[TARGET], context.ranges[TARGET].min, context.ranges[TARGET].max)
        );
    });

    return {
        xs: tf.tensor2d(inputs),
        ys: tf.tensor2d(labels, [labels.length, 1]),
        inputDimension: context.dimensions,
    };
}

// ====================================================================
// 🧠 Configuração e treinamento da rede neural
// ====================================================================
// 📌 Mudanças em relação ao e-commerce:
//    - Loss: binaryCrossentropy → meanSquaredError (REGRESSÃO)
//    - Métrica: accuracy → mae (Mean Absolute Error)
//    - Ativação final: sigmoid (target normalizado 0–1)
//    - Adicionado Dropout para evitar overfitting (20k amostras)
//    - Validação split 80/20
async function configureNeuralNetAndTrain(trainData) {
    const model = tf.sequential();

    // Camada de entrada
    // - inputShape: número de features (15 numéricas + 3 one-hot de gênero = 18)
    // - units: 128 neurônios para detectar padrões iniciais
    // - activation: 'relu' (mantém apenas sinais positivos)
    model.add(
        tf.layers.dense({
            inputShape: [trainData.inputDimension],
            units: 128,
            activation: 'relu'
        })
    );
    // Dropout: desliga 20% dos neurônios aleatoriamente a cada passo
    // Por quê? Com 20k amostras, ajuda a evitar overfitting
    model.add(tf.layers.dropout({ rate: 0.2 }));

    // Camada oculta 1 — 64 neurônios (comprimindo informação)
    model.add(
        tf.layers.dense({
            units: 64,
            activation: 'relu'
        })
    );
    model.add(tf.layers.dropout({ rate: 0.2 }));

    // Camada oculta 2 — 32 neurônios (destilando padrões mais fortes)
    model.add(
        tf.layers.dense({
            units: 32,
            activation: 'relu'
        })
    );

    // Camada de saída
    // - 1 neurônio: retorna o score de produtividade previsto
    // - sigmoid: comprime para 0–1 (compatível com target normalizado)
    model.add(
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
    );

    // 📌 Mudança crítica: MSE para regressão (antes era binaryCrossentropy)
    model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'meanSquaredError',
        metrics: ['mae'] // Mean Absolute Error — erro médio absoluto
    });

    // Separar dados em treino (80%) e validação (20%)
    const numSamples = trainData.xs.shape[0];
    const splitIndex = Math.floor(numSamples * 0.8);

    const xTrain = trainData.xs.slice(0, splitIndex);
    const yTrain = trainData.ys.slice(0, splitIndex);
    const xVal = trainData.xs.slice(splitIndex);
    const yVal = trainData.ys.slice(splitIndex);

    await model.fit(xTrain, yTrain, {
        epochs: 50,
        batchSize: 64,
        validationData: [xVal, yVal],
        shuffle: true,
        callbacks: {
            onEpochEnd: (epoch, logs) => {
                postMessage({
                    type: workerEvents.trainingLog,
                    epoch: epoch,
                    loss: logs.loss,
                    mae: logs.mae,
                    val_loss: logs.val_loss,
                    val_mae: logs.val_mae,
                });
            }
        }
    });

    return model;
}

// ====================================================================
// 🚀 Treinar o modelo
// ====================================================================
// 📌 Antes: recebia users e buscava products.json.
//    Agora: busca students.csv e parseia diretamente no worker.
async function trainModel() {
    console.log('Training model with student productivity dataset...');
    postMessage({ type: workerEvents.progressUpdate, progress: { progress: 1 } });

    // Carregar e parsear o CSV (20.000 alunos)
    const csvText = await (await fetch('/data/students.csv')).text();
    const students = parseCSV(csvText);
    console.log(`Loaded ${students.length} students from CSV`);

    const context = makeContext(students);
    _globalCtx = context;

    const trainData = createTrainingData(context);
    _model = await configureNeuralNetAndTrain(trainData);

    postMessage({ type: workerEvents.progressUpdate, progress: { progress: 100 } });
    postMessage({ type: workerEvents.trainingComplete });
}

// ====================================================================
// 🔮 Prever produtividade de um aluno
// ====================================================================
// 📌 Antes: recommend() calculava scores de compatibilidade user×product.
//    Agora: predict() recebe features de um aluno e retorna o
//    productivity_score previsto pela rede neural.
//
// Fluxo:
// 1. Codificar as features do aluno em vetor numérico
// 2. Passar pelo modelo treinado
// 3. Desnormalizar o resultado para a escala original (0–100)
// 4. Enviar resultado de volta para a UI
function predict({ student }) {
    if (!_model) return;
    const context = _globalCtx;

    // 1️⃣ Codificar as features do aluno no mesmo formato do treino
    const vector = encodeStudent(student, context);
    const inputTensor = vector.reshape([1, context.dimensions]);

    // 2️⃣ Rodar a previsão
    const prediction = _model.predict(inputTensor);

    // 3️⃣ Desnormalizar: resultado 0–1 → escala original
    const normalizedScore = prediction.dataSync()[0];
    const { min, max } = context.ranges[TARGET];
    const score = normalizedScore * (max - min) + min;

    // 4️⃣ Enviar para a thread principal
    postMessage({
        type: workerEvents.predict,
        student,
        predictedProductivity: Math.round(score * 100) / 100,
    });
}

// ====================================================================
// 📡 Handler de mensagens do worker
// ====================================================================
const handlers = {
    [workerEvents.trainModel]: trainModel,
    [workerEvents.predict]: predict,
};

self.onmessage = e => {
    const { action, ...data } = e.data;
    if (handlers[action]) handlers[action](data);
};
