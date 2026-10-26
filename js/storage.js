// ===== ДНК Анализатор — Модуль хранения данных =====

const DNAStorage = {
    KEYS: {
        PROFILE: 'dna_profile',
        SEQUENCES: 'dna_sequences',
        HISTORY: 'dna_history'
    },

    // Получить профиль
    getProfile() {
        const data = localStorage.getItem(this.KEYS.PROFILE);
        return data ? JSON.parse(data) : { name: '', organization: '' };
    },

    // Сохранить профиль
    saveProfile(profile) {
        localStorage.setItem(this.KEYS.PROFILE, JSON.stringify(profile));
    },

    // Получить все последовательности
    getSequences() {
        const data = localStorage.getItem(this.KEYS.SEQUENCES);
        return data ? JSON.parse(data) : [];
    },

    // Сохранить последовательность
    saveSequence(seqData) {
        const sequences = this.getSequences();
        seqData.id = Date.now();
        seqData.date = new Date().toISOString();
        sequences.unshift(seqData);
        localStorage.setItem(this.KEYS.SEQUENCES, JSON.stringify(sequences));

        // Также добавляем в историю
        this.addToHistory(seqData);

        return seqData;
    },

    // Удалить последовательность
    deleteSequence(id) {
        let sequences = this.getSequences();
        sequences = sequences.filter(s => s.id !== id);
        localStorage.setItem(this.KEYS.SEQUENCES, JSON.stringify(sequences));
    },

    // Получить историю
    getHistory() {
        const data = localStorage.getItem(this.KEYS.HISTORY);
        return data ? JSON.parse(data) : [];
    },

    // Добавить в историю
    addToHistory(seqData) {
        const history = this.getHistory();
        history.unshift({
            id: seqData.id,
            name: seqData.name,
            length: seqData.length,
            gc: seqData.gc,
            date: seqData.date
        });
        // Храним последние 100 записей
        if (history.length > 100) history.pop();
        localStorage.setItem(this.KEYS.HISTORY, JSON.stringify(history));
    },

    // Очистить историю
    clearHistory() {
        localStorage.removeItem(this.KEYS.HISTORY);
    },

    // Экспорт в FASTA
    exportFasta(name, sequence) {
        const fasta = `>${name}\n${sequence}\n`;
        const blob = new Blob([fasta], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${name.replace(/\s+/g, '_')}.fasta`;
        a.click();
        URL.revokeObjectURL(url);
    },

    // Экспорт отчёта
    exportReport(analysis, name) {
        const report = {
            name: name,
            date: new Date().toLocaleString('ru-RU'),
            length: analysis.length,
            gc: analysis.gc,
            molecularWeight: analysis.molecularWeight,
            tm: analysis.tm,
            counts: analysis.counts,
            restrictionSites: analysis.restrictionSites.map(s => ({
                enzyme: s.name,
                site: s.site,
                positions: s.positions
            }))
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${name.replace(/\s+/g, '_')}_report.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
};