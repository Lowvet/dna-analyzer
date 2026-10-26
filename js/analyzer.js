// ===== ДНК Анализатор — Модуль анализа =====

const DNAAnalyzer = {
    // Стандартный генетический код
    codonTable: {
        'TTT': 'F', 'TTC': 'F', 'TTA': 'L', 'TTG': 'L',
        'CTT': 'L', 'CTC': 'L', 'CTA': 'L', 'CTG': 'L',
        'ATT': 'I', 'ATC': 'I', 'ATA': 'I', 'ATG': 'M',
        'GTT': 'V', 'GTC': 'V', 'GTA': 'V', 'GTG': 'V',
        'TCT': 'S', 'TCC': 'S', 'TCA': 'S', 'TCG': 'S',
        'CCT': 'P', 'CCC': 'P', 'CCA': 'P', 'CCG': 'P',
        'ACT': 'T', 'ACC': 'T', 'ACA': 'T', 'ACG': 'T',
        'GCT': 'A', 'GCC': 'A', 'GCA': 'A', 'GCG': 'A',
        'TAT': 'Y', 'TAC': 'Y', 'TAA': '*', 'TAG': '*',
        'CAT': 'H', 'CAC': 'H', 'CAA': 'Q', 'CAG': 'Q',
        'AAT': 'N', 'AAC': 'N', 'AAA': 'K', 'AAG': 'K',
        'GAT': 'D', 'GAC': 'D', 'GAA': 'E', 'GAG': 'E',
        'TGT': 'C', 'TGC': 'C', 'TGA': '*', 'TGG': 'W',
        'CGT': 'R', 'CGC': 'R', 'CGA': 'R', 'CGG': 'R',
        'AGT': 'S', 'AGC': 'S', 'AGA': 'R', 'AGG': 'R',
        'GGT': 'G', 'GGC': 'G', 'GGA': 'G', 'GGG': 'G'
    },

    // Молекулярные массы нуклеотидов (Да)
    molecularWeights: {
        'A': 313.2, 'T': 304.2, 'G': 329.2, 'C': 289.2, 'U': 306.2
    },

    // Популярные рестриктазы
    restrictionEnzymes: [
        { name: 'EcoRI', site: 'GAATTC' },
        { name: 'BamHI', site: 'GGATCC' },
        { name: 'HindIII', site: 'AAGCTT' },
        { name: 'PstI', site: 'CTGCAG' },
        { name: 'SalI', site: 'GTCGAC' },
        { name: 'SmaI', site: 'CCCGGG' },
        { name: 'KpnI', site: 'GGTACC' },
        { name: 'SacI', site: 'GAGCTC' },
        { name: 'XbaI', site: 'TCTAGA' },
        { name: 'XhoI', site: 'CTCGAG' },
        { name: 'NotI', site: 'GCGGCCGC' },
        { name: 'NcoI', site: 'CCATGG' },
        { name: 'NdeI', site: 'CATATG' },
        { name: 'BglII', site: 'AGATCT' },
        { name: 'ClaI', site: 'ATCGAT' },
        { name: 'MluI', site: 'ACGCGT' },
        { name: 'SpeI', site: 'ACTAGT' },
        { name: 'MscI', site: 'TGGCCA' },
        { name: 'NarI', site: 'GGCGCC' },
        { name: 'EcoRV', site: 'GATATC' },
        { name: 'StuI', site: 'AGGCCT' },
        { name: 'NruI', site: 'TCGCGA' },
        { name: 'BssHII', site: 'GCGCGC' },
        { name: 'AscI', site: 'GGCGCGCC' },
        { name: 'PacI', site: 'TTAATTAA' },
        { name: 'PmeI', site: 'GTTTAAAC' },
        { name: 'SwaI', site: 'ATTTAAAT' },
        { name: 'FseI', site: 'GGCCGGCC' },
        { name: 'AvrII', site: 'CCTAGG' },
        { name: 'NheI', site: 'GCTAGC' },
        { name: 'AgeI', site: 'ACCGGT' }
    ],

    // Очистка последовательности
    cleanSequence(seq) {
        return seq.toUpperCase().replace(/[^ATGCUNRYKMSWBDHV]/g, '');
    },

    // Парсинг FASTA
    parseFasta(text) {
        const lines = text.trim().split('\n');
        let name = '';
        let sequence = '';

        for (const line of lines) {
            if (line.startsWith('>')) {
                name = line.substring(1).trim();
            } else {
                sequence += line.trim();
            }
        }

        return { name, sequence };
    },

    // Подсчёт нуклеотидов
    countNucleotides(seq) {
        const counts = { A: 0, T: 0, G: 0, C: 0, U: 0, N: 0, other: 0 };
        for (const char of seq) {
            if (counts.hasOwnProperty(char)) {
                counts[char]++;
            } else {
                counts.other++;
            }
        }
        return counts;
    },

    // GC-содержание
    calcGC(seq) {
        const gc = (seq.match(/[GC]/gi) || []).length;
        return seq.length > 0 ? (gc / seq.length * 100).toFixed(2) : 0;
    },

    // Молекулярная масса
    calcMolecularWeight(seq) {
        let weight = 0;
        for (const char of seq) {
            if (this.molecularWeights[char]) {
                weight += this.molecularWeights[char];
            }
        }
        return Math.round(weight);
    },

    // Температура плавления (формула для коротких олигонуклеотидов)
    calcTm(seq) {
        const length = seq.length;
        if (length < 14) {
            // Формула для коротких последовательностей
            const a = (seq.match(/[AT]/g) || []).length;
            const gc = (seq.match(/[GC]/g) || []).length;
            return (2 * a + 4 * gc).toFixed(1);
        } else {
            // Формула для длинных последовательностей
            const gc = this.calcGC(seq);
            return (64.9 + 41 * (gc - 16.4) / length).toFixed(1);
        }
    },

    // Обратная комплементарная последовательность
    reverseComplement(seq) {
        const complement = { A: 'T', T: 'A', G: 'C', C: 'G', U: 'A', N: 'N', R: 'Y', Y: 'R', K: 'M', M: 'K', S: 'S', W: 'W', B: 'V', D: 'H', H: 'D', V: 'B' };
        return seq.split('').reverse().map(c => complement[c] || 'N').join('');
    },

    // Трансляция
    translate(seq, frame = 0) {
        const cleanSeq = this.cleanSequence(seq);
        const protein = [];
        for (let i = frame; i < cleanSeq.length - 2; i += 3) {
            const codon = cleanSeq.substring(i, i + 3);
            protein.push(this.codonTable[codon] || 'X');
        }
        return protein.join('');
    },

    // Все 6 рамок чтения
    translateAllFrames(seq) {
        const cleanSeq = this.cleanSequence(seq);
        const revComp = this.reverseComplement(cleanSeq);
        return [
            { frame: '+1', seq: this.translate(cleanSeq, 0) },
            { frame: '+2', seq: this.translate(cleanSeq, 1) },
            { frame: '+3', seq: this.translate(cleanSeq, 2) },
            { frame: '-1', seq: this.translate(revComp, 0) },
            { frame: '-2', seq: this.translate(revComp, 1) },
            { frame: '-3', seq: this.translate(revComp, 2) }
        ];
    },

    // Поиск мотива
    findMotif(seq, motif) {
        const positions = [];
        const cleanSeq = this.cleanSequence(seq);
        const cleanMotif = this.cleanSequence(motif);
        let pos = cleanSeq.indexOf(cleanMotif);
        while (pos !== -1) {
            positions.push(pos + 1);
            pos = cleanSeq.indexOf(cleanMotif, pos + 1);
        }
        return positions;
    },

    // Поиск сайтов рестрикции
    findRestrictionSites(seq) {
        const results = [];
        const cleanSeq = this.cleanSequence(seq);
        for (const enzyme of this.restrictionEnzymes) {
            const positions = this.findMotif(cleanSeq, enzyme.site);
            if (positions.length > 0) {
                results.push({ ...enzyme, positions });
            }
        }
        return results;
    },

    // Полный анализ
    analyze(seq) {
        const cleanSeq = this.cleanSequence(seq);
        const counts = this.countNucleotides(cleanSeq);
        const total = cleanSeq.length;

        return {
            length: total,
            counts: counts,
            gc: this.calcGC(cleanSeq),
            molecularWeight: this.calcMolecularWeight(cleanSeq),
            tm: this.calcTm(cleanSeq),
            reverseComplement: this.reverseComplement(cleanSeq),
            translations: this.translateAllFrames(cleanSeq),
            restrictionSites: this.findRestrictionSites(cleanSeq)
        };
    }
};