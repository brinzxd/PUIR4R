// app.js

// элементы экранов
const screenHome   = document.getElementById('screen-home');
const screenTest   = document.getElementById('screen-test');
const screenResult = document.getElementById('screen-result');

// прочие элементы
const testsList          = document.getElementById('tests-list');
const testTitleEl        = document.getElementById('test-title');
const questionsContainer = document.getElementById('questions-container');
const testForm           = document.getElementById('test-form');

const resultPercentageEl = document.getElementById('result-percentage');
const resultScoreEl      = document.getElementById('result-score'); // Теперь здесь "Набрано баллов"
const resultWrongEl      = document.getElementById('result-wrong'); // Теперь здесь "Потеряно баллов"

// Для изменения подписей в HTML (через JS, чтобы не менять HTML файл вручную)
const labelScoreEl       = document.querySelector('.stat-card:nth-child(2) .stat-label');
const labelWrongEl       = document.querySelector('.stat-card:nth-child(3) .stat-label');

const cube               = document.getElementById('resultCube');
const cubePercentFront   = document.getElementById('cube-percent-front');
const cubePercentBottom  = document.getElementById('cube-percent-bottom');
const cubePointsBack     = document.getElementById('cube-points-back');
const cubeCorrectRight   = document.getElementById('cube-correct-right'); // Здесь тоже будут баллы
const cubeWrongLeft      = document.getElementById('cube-wrong-left');    // И здесь
const cubeTotalTop       = document.getElementById('cube-total-top');

// Тексты на гранях куба тоже меняем
const cubeLabelRight     = document.querySelector('.face.right h2');
const cubeLabelLeft      = document.querySelector('.face.left h2');

const recommendationBlock = document.getElementById('recommendation-block');
const recommendationText  = document.getElementById('recommendation-text');

// кнопки навигации
document.getElementById('logo-home').addEventListener('click', (e) => {
    e.preventDefault();
    showHome();
});
document.getElementById('btn-back-to-home').addEventListener('click', showHome);
document.getElementById('btn-result-home').addEventListener('click', showHome);
document.getElementById('btn-result-retry').addEventListener('click', () => {
    if (currentTestId != null) {
        startTest(currentTestId);
    }
});

let currentTestId = null;

// переключение экранов
function showHome() {
    screenHome.style.display   = '';
    screenTest.style.display   = 'none';
    screenResult.style.display = 'none';
    currentTestId = null;
}

function showTest() {
    screenHome.style.display   = 'none';
    screenTest.style.display   = '';
    screenResult.style.display = 'none';
}

function showResult() {
    screenHome.style.display   = 'none';
    screenTest.style.display   = 'none';
    screenResult.style.display = '';

    // Обновляем подписи при показе результатов
    if(labelScoreEl) labelScoreEl.textContent = 'Набрано баллов';
    if(labelWrongEl) labelWrongEl.textContent = 'Потеряно баллов';

    // Обновляем подписи на кубе
    if(cubeLabelRight) cubeLabelRight.textContent = 'Баллы';
    if(cubeLabelLeft)  cubeLabelLeft.textContent  = 'Потеряно';
}

// генерация списка тестов
function renderTestsList() {
    testsList.innerHTML = '';
    Object.entries(testData).forEach(([id, test]) => {
        const card = document.createElement('button');
        card.className = 'test-card';
        card.type = 'button';
        card.innerHTML = `
            <div class="test-card-inner">
                <div class="test-card-icon">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                        <circle cx="20" cy="20" r="18" stroke="url(#cardGradient-${id})" stroke-width="2"/>
                        <path d="M14 20L18 24L26 16" stroke="url(#cardGradient-${id})" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <defs>
                            <linearGradient id="cardGradient-${id}" x1="0" y1="0" x2="40" y2="40">
                                <stop offset="0%" style="stop-color:#ff6b9d"/>
                                <stop offset="100%" style="stop-color:#ffa06d"/>
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
                <h3 class="test-card-title">${test.title}</h3>
                <div class="test-card-footer">
                    <span class="test-card-cta">Начать тест</span>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M7 4L13 10L7 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
            </div>
        `;
        card.addEventListener('click', () => startTest(parseInt(id, 10)));
        testsList.appendChild(card);
    });
}

// запуск теста
function startTest(testId) {
    const test = testData[testId];
    if (!test) return;

    currentTestId = testId;
    testTitleEl.textContent = test.title;
    questionsContainer.innerHTML = '';

    test.questions.forEach((q, index) => {
        const qDiv = document.createElement('div');
        qDiv.className = 'question-card';

        const optionsHtml = Object.entries(q.options).map(
            ([key, opt]) => `
            <label class="option-label">
                <input type="radio" name="question_${q.id}" value="${key}" required>
                <span class="option-content">
                    <span class="option-radio"></span>
                    <span class="option-text">${opt.text}</span>
                </span>
            </label>
        `).join('');

        qDiv.innerHTML = `
            <div class="question-number">Вопрос ${index + 1} из ${test.questions.length}</div>
            <h3 class="question-text">${q.text}</h3>
            <div class="options-container">
                ${optionsHtml}
            </div>
        `;
        questionsContainer.appendChild(qDiv);
    });

    showTest();
}

// обработка сабмита теста
testForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (currentTestId == null) return;

    const test = testData[currentTestId];
    const formData = new FormData(testForm);

    let totalScore    = 0;
    let totalMax      = test.max_score || 0;

    test.questions.forEach((q) => {
        const value = formData.get(`question_${q.id}`);
        if (!value) return;

        const options = q.options || {};
        const opt = options[value];
        let points = opt ? opt.points : 0;

        if (typeof points === 'string') {
            const parsed = parseInt(points, 10);
            points = isNaN(parsed) ? 0 : parsed;
        }

        totalScore += points;
    });

    const percentage = totalMax ? Math.round((totalScore / totalMax) * 100) : 0;
    const lostPoints = Math.max(0, totalMax - totalScore);

    renderResult(currentTestId, totalScore, totalMax, percentage, lostPoints);
});

// рендер результата и рекомендаций
function renderResult(testId, score, total, percentage, lost) {
    resultPercentageEl.textContent = `${percentage}%`;
    resultScoreEl.textContent      = score; // Показываем баллы
    resultWrongEl.textContent      = lost;  // Показываем потерянные баллы

    cubePercentFront.textContent  = `${percentage}%`;
    cubePercentBottom.textContent = `${percentage}%`;
    cubePointsBack.textContent    = `${score}/${total}`;

    cubeCorrectRight.textContent  = score; // На грани куба тоже баллы
    cubeWrongLeft.textContent     = lost;  // И потерянные баллы
    cubeTotalTop.textContent      = total;

    const test = testData[testId];
    let recText = '';
    if (test && Array.isArray(test.recommendations)) {
        const sorted = [...test.recommendations].sort((a, b) => a.max_score - b.max_score);
        for (const tier of sorted) {
            if (score <= tier.max_score) {
                recText = tier.text;
                break;
            }
        }
        if (!recText && sorted.length > 0) {
            recText = sorted[sorted.length - 1].text;
        }
    }

    if (recText) {
        recommendationText.textContent = recText;
        recommendationBlock.style.display = '';
    } else {
        recommendationBlock.style.display = 'none';
    }

    resetCubeAutoAnimation();
    showResult();
}

// логика умного куба
let isDragging = false;
let isHovered  = false;
let prevX = 0;
let prevY = 0;
let rotX = 0;
let rotY = 0;

function resetCubeAutoAnimation() {
    cube.style.animation = 'autoRotate 15s infinite linear';
    cube.classList.remove('dragging');
    isDragging = false;
}

cube.parentElement.addEventListener('mouseenter', () => {
    isHovered = true;
    cube.style.animationPlayState = 'paused';
});

cube.parentElement.addEventListener('mouseleave', () => {
    isHovered = false;
    if (!isDragging) {
        cube.style.animationPlayState = 'running';
        cube.classList.remove('dragging');
    }
});

cube.addEventListener('mousedown', (e) => {
    isDragging = true;
    prevX = e.clientX;
    prevY = e.clientY;
    cube.classList.add('dragging');
    cube.style.animation = 'none';
    e.preventDefault();
});

document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    cube.classList.remove('dragging');
    if (!isHovered) {
        resetCubeAutoAnimation();
    }
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - prevX;
    const dy = e.clientY - prevY;

    rotY += dx * 0.5;
    rotX -= dy * 0.5;

    cube.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;

    prevX = e.clientX;
    prevY = e.clientY;
});

cube.addEventListener('touchstart', (e) => {
    isDragging = true;
    const t = e.touches[0];
    prevX = t.clientX;
    prevY = t.clientY;
    cube.classList.add('dragging');
    cube.style.animation = 'none';
});

cube.addEventListener('touchend', () => {
    isDragging = false;
    cube.classList.remove('dragging');
    if (!isHovered) {
        resetCubeAutoAnimation();
    }
});

cube.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const t = e.touches[0];
    const dx = t.clientX - prevX;
    const dy = t.clientY - prevY;

    rotY += dx * 0.5;
    rotX -= dy * 0.5;

    cube.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;

    prevX = t.clientX;
    prevY = t.clientY;
    e.preventDefault();
});

renderTestsList();
showHome();
