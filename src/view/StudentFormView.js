import { View } from './View.js';

export class StudentFormView extends View {
    // Campos do formulário
    #age = document.querySelector('#studentAge');
    #gender = document.querySelector('#studentGender');
    #studyHours = document.querySelector('#studyHours');
    #sleepHours = document.querySelector('#sleepHours');
    #phoneUsage = document.querySelector('#phoneUsage');
    #socialMedia = document.querySelector('#socialMedia');
    #youtubeHours = document.querySelector('#youtubeHours');
    #gamingHours = document.querySelector('#gamingHours');
    #breaksPerDay = document.querySelector('#breaksPerDay');
    #coffeeIntake = document.querySelector('#coffeeIntake');
    #exerciseMinutes = document.querySelector('#exerciseMinutes');
    #assignmentsCompleted = document.querySelector('#assignmentsCompleted');
    #attendancePercentage = document.querySelector('#attendancePercentage');
    #stressLevel = document.querySelector('#stressLevel');
    #focusScore = document.querySelector('#focusScore');
    #finalGrade = document.querySelector('#finalGrade');

    constructor() {
        super();
        this.setupRangeListeners();
    }

    setupRangeListeners() {
        // Atualizar labels de range inputs em tempo real
        document.querySelectorAll('input[type="range"]').forEach(range => {
            const valueDisplay = document.querySelector(`#${range.id}Value`);
            if (valueDisplay) {
                range.addEventListener('input', () => {
                    valueDisplay.textContent = range.value;
                });
            }
        });
    }

    getFormData() {
        return {
            age: Number(this.#age.value),
            gender: this.#gender.value,
            study_hours_per_day: Number(this.#studyHours.value),
            sleep_hours: Number(this.#sleepHours.value),
            phone_usage_hours: Number(this.#phoneUsage.value),
            social_media_hours: Number(this.#socialMedia.value),
            youtube_hours: Number(this.#youtubeHours.value),
            gaming_hours: Number(this.#gamingHours.value),
            breaks_per_day: Number(this.#breaksPerDay.value),
            coffee_intake_mg: Number(this.#coffeeIntake.value),
            exercise_minutes: Number(this.#exerciseMinutes.value),
            assignments_completed: Number(this.#assignmentsCompleted.value),
            attendance_percentage: Number(this.#attendancePercentage.value),
            stress_level: Number(this.#stressLevel.value),
            focus_score: Number(this.#focusScore.value),
            final_grade: Number(this.#finalGrade.value),
        };
    }

    fillRandomStudent() {
        // Preencher com valores aleatórios dentro de ranges razoáveis
        this.#age.value = Math.floor(Math.random() * 13) + 17;
        this.#gender.value = ['Male', 'Female', 'Other'][Math.floor(Math.random() * 3)];
        this.#studyHours.value = (Math.random() * 10).toFixed(1);
        this.#sleepHours.value = (Math.random() * 7 + 3).toFixed(1);
        this.#phoneUsage.value = (Math.random() * 12).toFixed(1);
        this.#socialMedia.value = (Math.random() * 8).toFixed(1);
        this.#youtubeHours.value = (Math.random() * 6).toFixed(1);
        this.#gamingHours.value = (Math.random() * 6).toFixed(1);
        this.#breaksPerDay.value = Math.floor(Math.random() * 15) + 1;
        this.#coffeeIntake.value = Math.floor(Math.random() * 450) + 50;
        this.#exerciseMinutes.value = Math.floor(Math.random() * 110) + 10;
        this.#assignmentsCompleted.value = Math.floor(Math.random() * 20);
        this.#attendancePercentage.value = (Math.random() * 60 + 40).toFixed(1);
        this.#stressLevel.value = Math.floor(Math.random() * 10) + 1;
        this.#focusScore.value = Math.floor(Math.random() * 70) + 30;
        this.#finalGrade.value = (Math.random() * 50 + 50).toFixed(1);

        // Atualizar os displays dos range inputs
        document.querySelectorAll('input[type="range"]').forEach(range => {
            const valueDisplay = document.querySelector(`#${range.id}Value`);
            if (valueDisplay) {
                valueDisplay.textContent = range.value;
            }
        });
    }
}
