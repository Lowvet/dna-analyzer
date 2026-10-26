// ===== ДНК Анализатор — Модуль профиля =====

document.addEventListener('DOMContentLoaded', () => {
    // Загрузка профиля
    const profile = DNAStorage.getProfile();
    document.getElementById('userName').value = profile.name || '';
    document.getElementById('userOrg').value = profile.organization || '';

    // Сохранение профиля
    document.getElementById('saveProfileBtn').addEventListener('click', () => {
        const name = document.getElementById('userName').value;
        const organization = document.getElementById('userOrg').value;
        DNAStorage.saveProfile({ name, organization });
        alert('Профиль сохранён!');
    });

    // Обновление статистики
    updateStats();

    // Отображение сохранённых последовательностей
    renderSavedSequences();
});

function updateStats() {
    const sequences = DNAStorage.getSequences();
    const history = DNAStorage.getHistory();

    document.getElementById('totalAnalyses').textContent = history.length;
    document.getElementById('savedSequences').textContent = sequences.length;

    const totalNucleotides = sequences.reduce((sum, s) => sum + (s.length || 0), 0);
    document.getElementById('totalNucleotides').textContent = totalNucleotides.toLocaleString();
}

function renderSavedSequences() {
    const container = document.getElementById('savedList');
    const sequences = DNAStorage.getSequences();

    if (sequences.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>Нет сохранённых последовательностей</p>
                <a href="analysis.html" class="btn btn-primary">Создать первый анализ</a>
            </div>
        `;
        return;
    }

    let html = '';
    for (const seq of sequences) {
        const date = new Date(seq.date).toLocaleDateString('ru-RU');
        html += `
            <div class="sequence-item">
                <div class="sequence-item-info">
                    <h4>${seq.name}</h4>
                    <p>Длина: ${seq.length.toLocaleString()} п.н. | GC: ${seq.gc}% | ${date}</p>
                </div>
                <div class="sequence-item-actions">
                    <button class="btn btn-secondary" onclick="viewSequence(${seq.id})">Просмотр</button>
                    <button class="btn btn-danger" onclick="deleteSequence(${seq.id})">Удалить</button>
                </div>
            </div>
        `;
    }
    container.innerHTML = html;
}

function viewSequence(id) {
    const sequences = DNAStorage.getSequences();
    const seq = sequences.find(s => s.id === id);
    if (seq) {
        // Переход на страницу анализа с загруженной последовательностью
        sessionStorage.setItem('viewSequence', JSON.stringify(seq));
        window.location.href = 'analysis.html?view=' + id;
    }
}

function deleteSequence(id) {
    if (confirm('Удалить эту последовательность?')) {
        DNAStorage.deleteSequence(id);
        updateStats();
        renderSavedSequences();
    }
}