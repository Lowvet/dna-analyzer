// ===== ДНК Анализатор — Главный модуль =====

document.addEventListener('DOMContentLoaded', () => {
    // Табы
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.tab;
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(target).classList.add('active');
        });
    });

    // Загрузка файла
    const fileInput = document.getElementById('fileInput');
    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    let fileContent = '';

    fileUploadArea.addEventListener('click', () => fileInput.click());

    fileUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUploadArea.style.borderColor = 'var(--accent)';
    });

    fileUploadArea.addEventListener('dragleave', () => {
        fileUploadArea.style.borderColor = 'var(--border)';
    });

    fileUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUploadArea.style.borderColor = 'var(--border)';
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleFile(file);
    });

    function handleFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            fileContent = e.target.result;
            fileName.textContent = file.name;
            fileSize.textContent = (file.size / 1024).toFixed(1) + ' КБ';
            fileInfo.style.display = 'flex';
        };
        reader.readAsText(file);
    }

    // Анализ
    const analyzeBtn = document.getElementById('analyzeBtn');
    const analyzeFileBtn = document.getElementById('analyzeFileBtn');
    const clearBtn = document.getElementById('clearBtn');
    const sampleBtn = document.getElementById('sampleBtn');

    analyzeBtn.addEventListener('click', () => {
        const name = document.getElementById('seqName').value || 'Без названия';
        const sequence = document.getElementById('sequence').value.trim();

        if (!sequence) {
            alert('Введите последовательность ДНК');
            return;
        }

        runAnalysis(name, sequence);
    });

    analyzeFileBtn.addEventListener('click', () => {
        if (!fileContent) {
            alert('Загрузите файл');
            return;
        }

        const name = document.getElementById('seqNameFile').value || 'Без названия';
        runAnalysis(name, fileContent);
    });

    clearBtn.addEventListener('click', () => {
        document.getElementById('seqName').value = '';
        document.getElementById('sequence').value = '';
        document.getElementById('resultsSection').style.display = 'none';
    });

    sampleBtn.addEventListener('click', () => {
        document.getElementById('seqName').value = 'Пример: Фрагмент BRCA1';
        document.getElementById('sequence').value = '>BRCA1_exon1\nATGCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCG\nGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGC\nTATATATATATATATATATATATATATATATATATATATATATATATATA\nGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCG\nATATATATATATATATATATATATATATATATATATATATATATATATAT\nGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCG';
    });

    function runAnalysis(name, rawSequence) {
        // Парсинг FASTA если нужно
        let sequence = rawSequence;
        if (rawSequence.includes('>')) {
            const parsed = DNAAnalyzer.parseFasta(rawSequence);
            sequence = parsed.sequence;
            if (!document.getElementById('seqName').value && parsed.name) {
                document.getElementById('seqName').value = parsed.name;
                name = parsed.name;
            }
        }

        const cleanSeq = DNAAnalyzer.cleanSequence(sequence);
        if (cleanSeq.length === 0) {
            alert('Последовательность не содержит валидных нуклеотидов');
            return;
        }

        // Анализ
        const analysis = DNAAnalyzer.analyze(cleanSeq);

        // Отображение результатов
        document.getElementById('resultsSection').style.display = 'block';

        // Статистика
        document.getElementById('statLength').textContent = analysis.length.toLocaleString();
        document.getElementById('statGC').textContent = analysis.gc + '%';
        document.getElementById('statMW').textContent = analysis.molecularWeight.toLocaleString();
        document.getElementById('statTm').textContent = analysis.tm + '°C';

        // Визуализации
        DNAVisualizer.drawNucleotideBars('nucleotideBars', analysis.counts, analysis.length);
        DNAVisualizer.drawCompositionChart('compositionChart', analysis.counts, analysis.length);
        DNAVisualizer.drawSequenceViewer('sequenceViewer', cleanSeq);
        DNAVisualizer.drawRestrictionTable('restrictionTable', analysis.restrictionSites);
        DNAVisualizer.drawTranslation('translationTabs', 'translationResult', analysis.translations);

        // Обратная комплементарная
        document.getElementById('reverseComp').textContent = analysis.reverseComplement;

        // Поиск мотивов
        const searchMotifBtn = document.getElementById('searchMotifBtn');
        const motifInput = document.getElementById('motifInput');
        const motifResults = document.getElementById('motifResults');

        searchMotifBtn.onclick = () => {
            const motif = motifInput.value.trim();
            if (!motif) return;
            const positions = DNAAnalyzer.findMotif(cleanSeq, motif);
            if (positions.length === 0) {
                motifResults.innerHTML = '<p style="color: var(--text-secondary);">Мотив не найден</p>';
            } else {
                motifResults.innerHTML = `<span class="motif-tag">${motif}: <span class="count">${positions.length}</span> вхождений</span>
                    <span class="motif-tag">Позиции: ${positions.slice(0, 20).join(', ')}${positions.length > 20 ? '...' : ''}</span>`;
            }
        };

        // Сохранение
        document.getElementById('saveToProfile').onclick = () => {
            DNAStorage.saveSequence({
                name: name,
                sequence: cleanSeq,
                length: analysis.length,
                gc: analysis.gc,
                molecularWeight: analysis.molecularWeight,
                tm: analysis.tm
            });
            alert('Последовательность сохранена в профиль!');
        };

        // Экспорт
        document.getElementById('exportFasta').onclick = () => {
            DNAStorage.exportFasta(name, cleanSeq);
        };

        document.getElementById('exportReport').onclick = () => {
            DNAStorage.exportReport(analysis, name);
        };

        // Копирование
        document.getElementById('copyRevComp').onclick = () => {
            navigator.clipboard.writeText(analysis.reverseComplement).then(() => {
                alert('Скопировано в буфер обмена!');
            });
        };

        // Прокрутка к результатам
        document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
    }
});