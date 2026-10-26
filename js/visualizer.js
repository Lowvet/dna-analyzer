// ===== ДНК Анализатор — Модуль визуализации =====

const DNAVisualizer = {
    // Цвета нуклеотидов
    colors: {
        A: '#10b981',
        T: '#ef4444',
        G: '#f59e0b',
        C: '#3b82f6',
        N: '#6b7280',
        other: '#9ca3af'
    },

    // Отрисовка баров состава нуклеотидов
    drawNucleotideBars(containerId, counts, total) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const nucleotides = ['A', 'T', 'G', 'C', 'N'];
        let html = '';

        for (const nuc of nucleotides) {
            const count = counts[nuc] || 0;
            const percent = total > 0 ? (count / total * 100).toFixed(1) : 0;
            html += `
                <div class="nuc-bar">
                    <span class="nuc-label" style="color: ${this.colors[nuc]}">${nuc}</span>
                    <div class="nuc-progress">
                        <div class="nuc-fill" style="width: ${percent}%; background: ${this.colors[nuc]}"></div>
                    </div>
                    <span class="nuc-count">${count} (${percent}%)</span>
                </div>
            `;
        }

        container.innerHTML = html;
    },

    // Круговая диаграмма состава
    drawCompositionChart(canvasId, counts, total) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const radius = Math.min(centerX, centerY) - 40;

        const nucleotides = ['A', 'T', 'G', 'C', 'N'];
        let startAngle = -Math.PI / 2;

        // Очистка
        ctx.clearRect(0, 0, rect.width, rect.height);

        for (const nuc of nucleotides) {
            const count = counts[nuc] || 0;
            if (count === 0) continue;

            const sliceAngle = (count / total) * 2 * Math.PI;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = this.colors[nuc];
            ctx.fill();

            // Подпись
            const midAngle = startAngle + sliceAngle / 2;
            const labelRadius = radius * 0.7;
            const labelX = centerX + Math.cos(midAngle) * labelRadius;
            const labelY = centerY + Math.sin(midAngle) * labelRadius;

            const percent = (count / total * 100).toFixed(1);
            if (parseFloat(percent) > 5) {
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 14px Segoe UI';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${nuc}: ${percent}%`, labelX, labelY);
            }

            startAngle += sliceAngle;
        }

        // Легенда
        let legendY = 20;
        for (const nuc of nucleotides) {
            const count = counts[nuc] || 0;
            if (count === 0) continue;

            ctx.fillStyle = this.colors[nuc];
            ctx.fillRect(10, legendY, 16, 16);

            ctx.fillStyle = '#e2e8f0';
            ctx.font = '13px Segoe UI';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${nuc}: ${count}`, 32, legendY + 8);

            legendY += 24;
        }
    },

    // Линейная визуализация последовательности
    drawSequenceViewer(containerId, seq) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const cleanSeq = DNAAnalyzer.cleanSequence(seq);
        let html = '';

        for (let i = 0; i < cleanSeq.length; i++) {
            const char = cleanSeq[i];
            const color = this.colors[char] || this.colors.other;
            html += `<span class="seq-${char}" title="Позиция ${i + 1}">${char}</span>`;

            // Разделитель каждые 10 нуклеотидов
            if ((i + 1) % 10 === 0 && i < cleanSeq.length - 1) {
                html += '<span style="color: #4a5568; margin: 0 2px;">|</span>';
            }
            // Новая строка каждые 60 нуклеотидов
            if ((i + 1) % 60 === 0 && i < cleanSeq.length - 1) {
                html += '<br>';
            }
        }

        container.innerHTML = html;
    },

    // Отрисовка таблицы сайтов рестрикции
    drawRestrictionTable(containerId, sites) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (sites.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary);">Сайты рестрикции не найдены</p>';
            return;
        }

        let html = '<table><thead><tr><th>Фермент</th><th>Сайт</th><th>Кол-во</th><th>Позиции</th></tr></thead><tbody>';
        for (const site of sites) {
            html += `<tr>
                <td>${site.name}</td>
                <td><code>${site.site}</code></td>
                <td>${site.positions.length}</td>
                <td>${site.positions.slice(0, 5).join(', ')}${site.positions.length > 5 ? '...' : ''}</td>
            </tr>`;
        }
        html += '</tbody></table>';
        container.innerHTML = html;
    },

    // Отрисовка трансляции
    drawTranslation(tabsContainerId, resultContainerId, translations) {
        const tabsContainer = document.getElementById(tabsContainerId);
        const resultContainer = document.getElementById(resultContainerId);
        if (!tabsContainer || !resultContainer) return;

        // Вкладки
        let tabsHtml = '';
        translations.forEach((t, i) => {
            tabsHtml += `<button class="trans-tab ${i === 0 ? 'active' : ''}" data-frame="${i}">${t.frame}</button>`;
        });
        tabsContainer.innerHTML = tabsHtml;

        // Результат первой рамки
        resultContainer.textContent = translations[0].seq;

        // Обработчики
        tabsContainer.querySelectorAll('.trans-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                tabsContainer.querySelectorAll('.trans-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const frame = parseInt(tab.dataset.frame);
                resultContainer.textContent = translations[frame].seq;
            });
        });
    }
};