/* ──────────────────────────────────────────
   app.js — Main application logic for СККПУ
   ────────────────────────────────────────── */

/* ── Page navigation ── */

function showPage(pageName) {
    document.querySelectorAll('.page-content').forEach(function(page) {
        page.classList.remove('active');
    });

    document.querySelectorAll('.tab-btn').forEach(function(btn) {
        btn.classList.remove('active');
    });

    if (pageName === 'dashboard') {
        document.getElementById('dashboard-page').classList.add('active');
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
    } else if (pageName === 'process') {
        document.getElementById('process-page').classList.add('active');
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
    }
}

/* ── Info popup ── */

function toggleInfoPopup(e) {
    e.stopPropagation();
    var popup = document.getElementById('infoPopup');
    var btn = document.getElementById('infoBtn');
    var rect = btn.getBoundingClientRect();
    if (!popup.classList.contains('visible')) {
        popup.style.top = (rect.bottom + 10) + 'px';
        popup.style.right = (window.innerWidth - rect.right) + 'px';
        popup.classList.add('visible');
    } else {
        popup.classList.remove('visible');
    }
}

document.addEventListener('click', function(e) {
    if (!e.target.closest('#infoBtn')) {
        document.getElementById('infoPopup').classList.remove('visible');
    }
});

/* ── State ── */

var currentData = [];

var effectTypes = {
    'Повышение качества данных': { icon: '📊', color: '#FF6B6B' },
    'Поддержание актуальности': { icon: '🔄', color: '#FF8A80' },
    'Сокращение трудозатрат': { icon: '⏱️', color: '#FF6B6B' },
    'Улучшение аналитики и принятия решений': { icon: '💡', color: '#333333' },
    'Автоматизация процессов': { icon: '⚙️', color: '#666666' },
    'Снижение нагрузки на персонал': { icon: '👥', color: '#FF8A80' },
    'Экономия бюджета': { icon: '💰', color: '#333333' },
    'Ускорение процессов': { icon: '🚀', color: '#FF6B6B' },
    'Прочие улучшения': { icon: '✨', color: '#999999' }
};

/* ── Data helpers ── */

function getTop5(data) {
    return data
        .filter(function(item) {
            return item['Место в топе'] !== null &&
                   item['Место в топе'] !== undefined &&
                   item['Место в топе'] !== '';
        })
        .sort(function(a, b) {
            return parseFloat(a['Место в топе']) - parseFloat(b['Место в топе']);
        })
        .slice(0, 5);
}

/* ── Render functions ── */

function renderDashboard(data) {
    renderStats(data);

    var content = document.getElementById('content');
    content.innerHTML =
        '<section class="section">' +
            '<h2 class="section-title">' +
                '<span>🏆</span>' +
                'ТОП-5 показателей по сокращению трудозатрат' +
            '</h2>' +
            '<div class="top5-grid" id="top5Grid"></div>' +
        '</section>' +
        '<section class="section">' +
            '<h2 class="section-title">' +
                '<span>📋</span>' +
                'Все показатели эффективности' +
            '</h2>' +
            '<div class="filter-section" id="filterSection"></div>' +
            '<div class="cards-grid" id="cardsGrid"></div>' +
        '</section>';

    renderTop5(data);
    renderFilters(data);
    renderCards(data);
}

function renderStats(data) {
    var statsGrid = document.getElementById('statsGrid');
    var typeCounts = {};
    data.forEach(function(item) {
        var type = item['Тип эффекта'] || 'Прочие улучшения';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    var sortedTypes = Object.entries(typeCounts)
        .sort(function(a, b) { return b[1] - a[1]; })
        .slice(0, 4);

    var statsHTML =
        '<div class="stat-card">' +
            '<div class="stat-icon">📊</div>' +
            '<div class="stat-value">' + data.length + '</div>' +
            '<div class="stat-label">Всего показателей</div>' +
        '</div>';

    sortedTypes.forEach(function(entry) {
        var type = entry[0];
        var count = entry[1];
        var typeInfo = effectTypes[type] || { icon: '✨', color: '#999999' };
        statsHTML +=
            '<div class="stat-card">' +
                '<div class="stat-icon">' + typeInfo.icon + '</div>' +
                '<div class="stat-value">' + count + '</div>' +
                '<div class="stat-label">' + type + '</div>' +
            '</div>';
    });

    statsGrid.innerHTML = statsHTML;
}

function renderTop5(data) {
    var top5Grid = document.getElementById('top5Grid');
    var top5 = getTop5(data);

    if (top5.length === 0) {
        top5Grid.innerHTML = '<p style="text-align: center; color: #666;">Нет данных с указанным местом в топе</p>';
        return;
    }

    var html = '';
    top5.forEach(function(item) {
        var rank = Math.round(parseFloat(item['Место в топе']));
        html +=
            '<div class="top5-item">' +
                '<div style="display: flex; align-items: flex-start;">' +
                    '<span class="rank">' + rank + '</span>' +
                    '<div style="flex: 1;">' +
                        '<div class="title">' + item['Показатель'] + '</div>' +
                        '<div class="savings">' +
                            '<span>⏱️</span>' +
                            '<span>' + (item['Тип эффекта'] || 'Эффект') + '</span>' +
                        '</div>' +
                        '<div class="effect">' +
                            '<div class="effect-text">' + item['Ожидаемый эффект'] + '</div>' +
                            '<button class="expand-btn" onclick="toggleExpand(this)">Читать далее ▾</button>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
    });

    top5Grid.innerHTML = html;
    initExpandButtons();
}

function toggleExpand(btn) {
    var textEl = btn.previousElementSibling;
    if (textEl.classList.contains('expanded')) {
        textEl.classList.remove('expanded');
        btn.textContent = 'Читать далее ▾';
    } else {
        textEl.classList.add('expanded');
        btn.textContent = 'Свернуть ▴';
    }
}

function initExpandButtons() {
    setTimeout(function() {
        var items = document.querySelectorAll('.top5-item .effect-text');
        items.forEach(function(el) {
            var btn = el.nextElementSibling;
            if (btn && el.scrollHeight > el.clientHeight + 2) {
                btn.classList.add('visible');
            } else if (btn) {
                btn.classList.remove('visible');
            }
        });
    }, 100);
}

function renderFilters(data) {
    var filterSection = document.getElementById('filterSection');
    var typesSet = {};
    data.forEach(function(item) {
        var t = item['Тип эффекта'] || 'Прочие улучшения';
        typesSet[t] = true;
    });
    var types = Object.keys(typesSet);

    var html =
        '<button class="filter-btn active" data-type="all">' +
            '✨ Все (' + data.length + ')' +
        '</button>';

    types.forEach(function(type) {
        var typeInfo = effectTypes[type] || { icon: '✨', color: '#999999' };
        var count = data.filter(function(item) {
            return (item['Тип эффекта'] || 'Прочие улучшения') === type;
        }).length;
        html +=
            '<button class="filter-btn" data-type="' + type + '">' +
                typeInfo.icon + ' ' + type + ' (' + count + ')' +
            '</button>';
    });

    filterSection.innerHTML = html;

    filterSection.querySelectorAll('.filter-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            filterSection.querySelectorAll('.filter-btn').forEach(function(b) {
                b.classList.remove('active');
            });
            this.classList.add('active');

            var filterType = this.dataset.type;
            if (filterType === 'all') {
                renderCards(currentData);
            } else {
                var filtered = currentData.filter(function(item) {
                    return (item['Тип эффекта'] || 'Прочие улучшения') === filterType;
                });
                renderCards(filtered);
            }
        });
    });
}

function renderCards(data) {
    var cardsGrid = document.getElementById('cardsGrid');
    var html = '';

    data.forEach(function(item) {
        var effectType = item['Тип эффекта'] || 'Прочие улучшения';
        var typeInfo = effectTypes[effectType] || { icon: '✨', color: '#999999' };
        html +=
            '<div class="effect-card" style="border-left-color: ' + typeInfo.color + '">' +
                '<div class="card-header">' +
                    '<div class="card-icon">' + typeInfo.icon + '</div>' +
                    '<div class="card-number">№ ' + item['№ п/п'] + '</div>' +
                '</div>' +
                '<div class="card-title">' + item['Показатель'] + '</div>' +
                '<div class="card-type" style="background-color: ' + typeInfo.color + '15; color: ' + typeInfo.color + '">' +
                    effectType +
                '</div>' +
                '<div class="card-description">' + item['Ожидаемый эффект'] + '</div>' +
            '</div>';
    });

    cardsGrid.innerHTML = html;
}

/* ── CSV parser ── */

function parseCSVInline(text) {
    var delimiter = ';';
    var rows = [];
    var row = [];
    var field = '';
    var inQuotes = false;
    var i = 0;
    while (i < text.length) {
        var ch = text[i];
        if (inQuotes) {
            if (ch === '"') {
                if (i + 1 < text.length && text[i + 1] === '"') { field += '"'; i += 2; continue; }
                else { inQuotes = false; i++; continue; }
            }
            field += ch;
        } else {
            if (ch === '"') { inQuotes = true; i++; continue; }
            if (ch === delimiter) { row.push(field.trim()); field = ''; i++; continue; }
            if (ch === '\r') { i++; continue; }
            if (ch === '\n') {
                row.push(field.trim()); field = '';
                if (row.some(function(v) { return v.length > 0; })) rows.push(row);
                row = []; i++; continue;
            }
            field += ch;
        }
        i++;
    }
    if (field.trim() || row.length) {
        row.push(field.trim());
        if (row.some(function(v) { return v.length > 0; })) rows.push(row);
    }
    if (!rows.length) return [];
    var headers = rows[0];
    var result = [];
    for (var r = 1; r < rows.length; r++) {
        if (!rows[r].join('').trim()) continue;
        var obj = {};
        headers.forEach(function(h, idx) {
            obj[h.trim()] = rows[r][idx] !== undefined ? rows[r][idx] : '';
        });
        result.push(obj);
    }
    return result;
}

/* ── CSV file upload handler ── */

document.getElementById('csvFile').addEventListener('change', function(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
        try {
            var parsed = parseCSVInline(ev.target.result);
            var data = parsed.map(function(row) {
                var cleaned = {};
                Object.keys(row).forEach(function(k) {
                    var key = k.trim();
                    var val = row[k] ? row[k].trim() : '';
                    if (key === '№ п/п') { cleaned[key] = parseInt(val) || val; }
                    else if (key === 'Место в топе') { cleaned[key] = val ? parseInt(val) : null; }
                    else { cleaned[key] = val; }
                });
                return cleaned;
            }).filter(function(row) {
                return row['№ п/п'] && row['Показатель'];
            });
            if (data.length > 0) {
                currentData = data;
                document.getElementById('infoPopupText').textContent =
                    '📁 Загружен: ' + file.name + ' (' + data.length + ' записей)';
                var yearMatch = file.name.match(/(20\d{2})/);
                if (yearMatch) {
                    document.getElementById('dashboardTitle').textContent =
                        '📊 Дашборд результатов ' + yearMatch[1];
                }
                renderDashboard(data);
            } else {
                alert('Файл загружен, но данные не распознаны. Проверьте формат CSV (разделитель «;»).');
            }
        } catch(err) {
            alert('Ошибка: ' + err.message);
        }
    };
    reader.readAsText(file, 'windows-1251');
});

/* ── Initialization: load data from JSON, then render ── */

document.addEventListener('DOMContentLoaded', function() {
    fetch('data/default-data.json')
        .then(function(response) { return response.json(); })
        .then(function(data) {
            currentData = data;
            renderDashboard(data);
        })
        .catch(function(err) {
            console.error('Failed to load default data:', err);
            document.getElementById('content').innerHTML =
                '<div class="loading">Ошибка загрузки данных. Загрузите CSV файл.</div>';
        });
});
