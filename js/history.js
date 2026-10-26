// ===== ДНК Анализатор — Модуль истории =====

document.addEventListener('DOMContentLoaded', () => {
    renderHistory();

    // Поиск
    document.getElementById('historySearch').addEventListener('input', renderHistory);

    // Сортировка
    document.getElementById('historySort').addEventListener('change', renderHistory);

    // Очистка
    document.getElementById('clearHistoryBtn').addEventListener('click', () => {
        if (confirm('Очистить всю историю?')) {
            DNAStorage.clearHistory();
            renderHistory();
        }
    });
});

function renderHistory() {
    const container = document.getElementById('historyList');
    const search = document.getElementById('historySearch').value.toLowerCase();
    const sort = document.getElementById('historySort').value;

    let history = DNAStorage.getHistory();

    // Фильтрация
    if (search) {
        history = history.filter(h => h.name.toLowerCase().includes(search));
    }

    // Сортировка
    switch (sort) {
        case 'oldest':
            history.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'longest':
            history.sort((a, b) => b.length - a.length);
            break;
        case 'shortest':
            history.sort((a, b) => a.length - b.length);
            break;
        default:
            history.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    if (history.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>История пуста</p>
                <a href="analysis.html" class="btn btn-primary">Создать первый анализ</a>
            </div>
        `;
        return;
    }

    let html = '';
    for (const item of history) {
        const date = new Date(item.date).toLocaleString('ru-RU');
        html += `
            <div class="history-item">
                <div class="history-item-info">
                    <h4>${item.name}</h4>
                    <p>GC: ${item.gc}%</p>
                </div>
                <div class="history-item-meta">
                    <div>${item.length.toLocaleString()} п.н.</div>
                    <div>${date}</div>
                </div>
            </div>
        `;
    }
    container.innerHTML = html;
}