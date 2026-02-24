import { View } from './View.js';

export class PredictionView extends View {
    #resultContainer = document.querySelector('#predictionResult');
    #scoreDisplay = document.querySelector('#productivityScore');
    #scoreBar = document.querySelector('#scoreBar');
    #studentSummary = document.querySelector('#studentSummary');

    constructor() {
        super();
    }

    renderPrediction({ predictedProductivity, student }) {
        this.#resultContainer.style.display = 'block';

        const score = predictedProductivity;
        this.#scoreDisplay.textContent = score.toFixed(1);

        // Cor e classe baseada no score
        let colorClass = 'bg-danger';
        let label = 'Baixa';
        if (score >= 60) {
            colorClass = 'bg-success';
            label = 'Alta';
        } else if (score >= 40) {
            colorClass = 'bg-warning';
            label = 'Média';
        }

        this.#scoreBar.className = `progress-bar ${colorClass}`;
        this.#scoreBar.style.width = `${score}%`;
        this.#scoreBar.textContent = `${score.toFixed(1)} — ${label}`;

        // Resumo do aluno
        const summaryHtml = `
            <div class="row mt-3">
                <div class="col-6">
                    <small class="text-muted">
                        <i class="bi bi-book"></i> Estudo: ${student.study_hours_per_day}h/dia<br>
                        <i class="bi bi-moon"></i> Sono: ${student.sleep_hours}h<br>
                        <i class="bi bi-phone"></i> Celular: ${student.phone_usage_hours}h<br>
                        <i class="bi bi-controller"></i> Gaming: ${student.gaming_hours}h
                    </small>
                </div>
                <div class="col-6">
                    <small class="text-muted">
                        <i class="bi bi-clipboard-check"></i> Trabalhos: ${student.assignments_completed}<br>
                        <i class="bi bi-graph-up"></i> Presença: ${student.attendance_percentage}%<br>
                        <i class="bi bi-emoji-neutral"></i> Estresse: ${student.stress_level}/10<br>
                        <i class="bi bi-bullseye"></i> Foco: ${student.focus_score}
                    </small>
                </div>
            </div>
        `;

        this.#studentSummary.innerHTML = summaryHtml;
    }
}
