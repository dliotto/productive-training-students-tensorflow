import { View } from './View.js';

export class TFVisorView extends View {
    #logs = [];
    #lossPoints = [];
    #maePoints = [];
    #valLossPoints = [];
    #valMaePoints = [];
    #isVisOpen = false;
    constructor() {
        super();
    }

    resetDashboard() {
        this.#logs = [];
        this.#lossPoints = [];
        this.#maePoints = [];
        this.#valLossPoints = [];
        this.#valMaePoints = [];
    }

    handleTrainingLog(log) {
        if (!this.#isVisOpen) {
            tfvis.visor().open();
            this.#isVisOpen = true;
        }

        const { epoch, loss, mae, val_loss, val_mae } = log;
        this.#lossPoints.push({ x: epoch, y: loss });
        this.#maePoints.push({ x: epoch, y: mae });
        if (val_loss !== undefined) this.#valLossPoints.push({ x: epoch, y: val_loss });
        if (val_mae !== undefined) this.#valMaePoints.push({ x: epoch, y: val_mae });
        this.#logs.push(log);

        // Gráfico de Loss (Treino vs Validação)
        tfvis.render.linechart(
            {
                name: 'Erro do Modelo (Loss)',
                tab: 'Treinamento',
                style: { display: 'inline-block', width: '49%' }
            },
            {
                values: [this.#lossPoints, this.#valLossPoints],
                series: ['treino', 'validação']
            },
            {
                xLabel: 'Época (Ciclos de Treinamento)',
                yLabel: 'MSE (Erro Quadrático Médio)',
                height: 300
            }
        );

        // Gráfico de MAE (Treino vs Validação)
        tfvis.render.linechart(
            {
                name: 'Erro Absoluto Médio (MAE)',
                tab: 'Treinamento',
                style: { display: 'inline-block', width: '49%' }
            },
            {
                values: [this.#maePoints, this.#valMaePoints],
                series: ['treino', 'validação']
            },
            {
                xLabel: 'Época (Ciclos de Treinamento)',
                yLabel: 'MAE',
                height: 300
            }
        );
    }

}
