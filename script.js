const standardSections = [
    { "Name": "Intro", "Color": "#DAE8FC", "Duration": 4, "Comment": "" },
    { "Name": "Verse", "Color": "#D5E8D4", "Duration": 8, "Comment": "" },
    { "Name": "Bridge", "Color": "#FFF2CC", "Duration": 4, "Comment": "" },
    { "Name": "Chorus", "Color": "#FFE6CC", "Duration": 8, "Comment": "" },
    { "Name": "Tag", "Color": "#F8CECC", "Duration": 4, "Comment": "" },
    { "Name": "Middle 8", "Color": "#F5F5F5", "Duration": 8, "Comment": "" },
    { "Name": "Outro", "Color": "#E1D5E7", "Duration": 4, "Comment": "" }
];

let sections = [];
let lines = [];
let currentEditingSection = null;
let currentEditingLine = null;
let draggedLine = null;
let dragOverLine = null;
let currentViewingLine = null;

document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
});

function initializeApp() {
    initializeTrackTitle();
    initializeSettings();
    initializeStandardSections();
    initializeTimeline();
    initializeLines();

    document.getElementById('addSectionBtn').addEventListener('click', showAddSectionModal);
    document.getElementById('addLineBtn').addEventListener('click', addNewLine);
    document.getElementById('customSectionBtn').addEventListener('click', showCustomSectionModal);
    document.getElementById('closeAddSectionModal').addEventListener('click', closeAddSectionModal);
    document.getElementById('closeCustomSectionModal').addEventListener('click', closeCustomSectionModal);
    document.getElementById('addCustomSection').addEventListener('click', addCustomSection);
    document.getElementById('closeEditSectionModal').addEventListener('click', closeEditSectionModal);
    document.getElementById('applySectionChanges').addEventListener('click', applySectionChanges);
    document.getElementById('decreaseDuration').addEventListener('click', () => changeDuration(-1));
    document.getElementById('increaseDuration').addEventListener('click', () => changeDuration(1));
    document.getElementById('editDecreaseDuration').addEventListener('click', () => changeEditDuration(-1));
    document.getElementById('editIncreaseDuration').addEventListener('click', () => changeEditDuration(1));
    document.getElementById('exportTrack').addEventListener('click', exportTrack);
    document.getElementById('closeEditLineModal').addEventListener('click', closeEditLineModal);
    document.getElementById('applyLineChanges').addEventListener('click', applyLineChanges);
    document.getElementById('importTrack').addEventListener('click', triggerImport);
    document.getElementById('importFileInput').addEventListener('change', handleFileImport);
    document.getElementById('resetTrackBtn').addEventListener('click', resetTrack);
    document.getElementById('closeViewLineModal').addEventListener('click', closeViewLineModal);
    document.getElementById('exportPDF').addEventListener('click', exportToPDF);

    window.addEventListener('resize', function() {
        if (document.getElementById('viewLineModal').style.display === 'flex') {
            updateModalScrollShadows();
        }
    });

    addSection({ "Name": "Intro", "Color": "#DAE8FC", "Duration": 4, "Comment": "" });
    addSection({ "Name": "Verse", "Color": "#D5E8D4", "Duration": 8, "Comment": "" });
    addSection({ "Name": "Chorus", "Color": "#FFE6CC", "Duration": 8, "Comment": "" });

    addDefaultLines();

    synchronizeScroll();

    updateTimelineVisibility();

    initializeScrollShadows();
}

function synchronizeScroll() {
    const fixedRightTop = document.querySelector('.fixed-right-top');
    const scrollableRightBottom = document.querySelector('.scrollable-right-bottom');
    const lineHeaders = document.getElementById('lineHeaders');

    fixedRightTop.addEventListener('scroll', function () {
        scrollableRightBottom.scrollLeft = this.scrollLeft;
        updateScrollShadows();
    });

    scrollableRightBottom.addEventListener('scroll', function () {
        fixedRightTop.scrollLeft = this.scrollLeft;
        updateScrollShadows();
    });

    lineHeaders.addEventListener('scroll', function () {
        scrollableRightBottom.scrollTop = this.scrollTop;
        updateScrollShadows();
    });

    scrollableRightBottom.addEventListener('scroll', function () {
        lineHeaders.scrollTop = this.scrollTop;
        updateScrollShadows();
    });
}

function updateTimelineVisibility() {
    const showTimeline = document.getElementById('showTimeline').checked;
    const timelineHeader = document.getElementById('timelineHeader');
    const timelineRow = document.getElementById('timelineRow');

    if (showTimeline) {
        timelineHeader.style.display = 'flex';
        timelineRow.style.display = 'flex';
        updateTimeline();
    } else {
        timelineHeader.style.display = 'none';
        timelineRow.style.display = 'none';
    }
}

function initializeScrollShadows() {
    updateScrollShadows();

    window.addEventListener('resize', updateScrollShadows);
}

function updateScrollShadows() {
    const containers = [
        {
            element: document.getElementById('fixedRightTop'),
            container: document.getElementById('fixedRightTopContainer'),
            horizontal: true,
            vertical: false
        },
        {
            element: document.getElementById('linesContainer'),
            container: document.getElementById('linesContainerContainer'),
            horizontal: true,
            vertical: true
        },
        {
            element: document.getElementById('lineHeaders'),
            container: document.getElementById('lineHeadersContainer'),
            horizontal: false,
            vertical: true
        }
    ];

    containers.forEach(item => {
        if (!item.element || !item.container) return;

        const scrollableToTop = item.element.scrollTop > 0;
        const scrollableToBottom = item.element.scrollTop + item.element.clientHeight < item.element.scrollHeight - 1;
        const scrollableToLeft = item.element.scrollLeft > 0;
        const scrollableToRight = item.element.scrollLeft + item.element.clientWidth < item.element.scrollWidth - 1;

        const shadowClasses = [
            'shadow-top', 'shadow-bottom', 'shadow-left', 'shadow-right',

            'shadow-top-bottom', 'shadow-top-left', 'shadow-top-right', 'shadow-bottom-left', 'shadow-bottom-right',
            'shadow-top-bottom-left', 'shadow-top-bottom-right',

            'shadow-left-right', 'shadow-top-left', 'shadow-top-right', 'shadow-bottom-left', 'shadow-bottom-right',
            'shadow-top-left-right', 'shadow-bottom-left-right',

            'shadow-top-bottom-left-right'
        ];
        item.container.classList.remove(...shadowClasses);

        let shadowClass = 'shadow';

        if (scrollableToTop && item.vertical) shadowClass += '-top';
        if (scrollableToBottom && item.vertical) shadowClass += "-bottom";
        if (scrollableToLeft && item.horizontal) shadowClass += "-left";
        if (scrollableToRight && item.horizontal) shadowClass += "-right";

        if (scrollableToTop || scrollableToBottom || scrollableToLeft || scrollableToRight)
            item.container.classList.add(shadowClass);
    });
}

function initializeTrackTitle() {
    const trackTitle = document.getElementById('trackTitle');
    const editBtn = trackTitle.querySelector('.edit-btn');

    editBtn.style.width = '20px';
    editBtn.style.height = '20px';
    editBtn.style.display = 'flex';
    editBtn.style.alignItems = 'center';
    editBtn.style.justifyContent = 'center';
    editBtn.style.borderRadius = '3px';
    editBtn.style.transition = 'background-color 0.2s ease';

    editBtn.addEventListener('mouseenter', function () {
        this.style.backgroundColor = 'rgba(74, 111, 165, 0.1)';
    });

    editBtn.addEventListener('mouseleave', function () {
        this.style.backgroundColor = 'transparent';
    });

    editBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        const span = trackTitle.querySelector('span');
        const input = document.createElement('input');
        input.type = 'text';
        input.value = span.textContent;

        trackTitle.innerHTML = '';
        trackTitle.appendChild(input);
        input.focus();
        input.select();

        input.addEventListener('blur', function () {
            const newSpan = document.createElement('span');
            newSpan.textContent = input.value || 'New track';
            trackTitle.innerHTML = '';
            trackTitle.appendChild(newSpan);
            trackTitle.appendChild(editBtn);
        });

        input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                input.blur();
            }
        });
    });
}

function initializeSettings() {
    const showTimeline = document.getElementById('showTimeline');

    showTimeline.addEventListener('change', function () {
        updateTimelineVisibility();
    });

    updateTimelineVisibility();
}

function initializeStandardSections() {
    const sectionsList = document.getElementById('standardSectionsList');
    sectionsList.innerHTML = '';

    standardSections.forEach(section => {
        const sectionItem = document.createElement('div');
        sectionItem.className = 'section-item';

        const colorDiv = document.createElement('div');
        colorDiv.className = 'section-color';
        colorDiv.style.backgroundColor = section.Color;

        const infoDiv = document.createElement('div');
        infoDiv.className = 'section-info';

        const nameDiv = document.createElement('div');
        nameDiv.className = 'section-name';
        nameDiv.textContent = section.Name;

        const durationDiv = document.createElement('div');
        durationDiv.className = 'section-duration';
        durationDiv.textContent = `${section.Duration} bars`;

        infoDiv.appendChild(nameDiv);
        infoDiv.appendChild(durationDiv);

        const addBtn = document.createElement('button');
        addBtn.className = 'section-add-btn';
        addBtn.textContent = '→';
        addBtn.addEventListener('click', function () {
            addSection(section);
            closeAddSectionModal();
        });

        sectionItem.appendChild(colorDiv);
        sectionItem.appendChild(infoDiv);
        sectionItem.appendChild(addBtn);

        sectionsList.appendChild(sectionItem);
    });
}

function initializeTimeline() {
    // Timeline будет обновляться при изменении настроек и секций
}

function initializeLines() {
    // Lines будут инициализированы при добавлении
}

function addDefaultLines() {
    const defaultLines = [
        { name: "Drums", sound: "Kick", height: 50, comment: "" },
        { name: "Guitar", sound: "Guitar", height: 50, comment: "" },
        { name: "Bass", sound: "Bass", height: 50, comment: "" },
        { name: "Voice", sound: "Vocals", height: 50, comment: "" }
    ];

    defaultLines.forEach(lineData => {
        const line = {
            id: Date.now() + Math.random(),
            name: lineData.name,
            sound: lineData.sound,
            height: lineData.height,
            comment: lineData.comment,
            cells: []
        };

        sections.forEach(() => {
            line.cells.push('');
        });

        lines.push(line);
    });

    renderLineHeaders();
    renderLines();
}

function showAddSectionModal() {
    document.getElementById('addSectionModal').style.display = 'flex';
}

function closeAddSectionModal() {
    document.getElementById('addSectionModal').style.display = 'none';
}

function showCustomSectionModal() {
    document.getElementById('addCustomSectionModal').style.display = 'flex';
    closeAddSectionModal();
}

function closeCustomSectionModal() {
    document.getElementById('addCustomSectionModal').style.display = 'none';
}

function changeDuration(change) {
    const durationInput = document.getElementById('sectionDuration');
    let value = parseInt(durationInput.value) + change;
    value = Math.max(1, Math.min(64, value));
    durationInput.value = value;
}

function changeEditDuration(change) {
    const durationInput = document.getElementById('editSectionDuration');
    let value = parseInt(durationInput.value) + change;
    value = Math.max(1, Math.min(64, value));
    durationInput.value = value;
}

function addCustomSection() {
    const name = document.getElementById('sectionName').value || 'Custom';
    const color = document.getElementById('sectionColor').value;
    const comment = document.getElementById('sectionComment').value;
    const duration = parseInt(document.getElementById('sectionDuration').value);

    const section = {
        Name: name,
        Color: color,
        Comment: comment,
        Duration: duration
    };

    addSection(section);
    closeCustomSectionModal();

    document.getElementById('sectionName').value = '';
    document.getElementById('sectionColor').value = '#daa520';
    document.getElementById('sectionComment').value = '';
    document.getElementById('sectionDuration').value = 4;
}

function addSection(sectionData) {
    const section = {
        id: Date.now() + Math.random(),
        name: sectionData.Name,
        color: sectionData.Color,
        comment: sectionData.Comment || '',
        duration: sectionData.Duration,
        width: sectionData.Duration * 30
    };

    sections.push(section);

    lines.forEach(line => {
        line.cells.push('');
    });

    renderSections();
    updateBars();
    updateTimeline();
    renderLines();
    updateScrollShadows();
}

function renderSections() {
    const sectionsRow = document.getElementById('sectionsRow');
    sectionsRow.innerHTML = '';

    sections.forEach((section, index) => {
        const sectionElement = document.createElement('div');
        sectionElement.className = 'section';
        sectionElement.style.backgroundColor = section.color;
        sectionElement.style.width = `${section.width}px`;
        sectionElement.setAttribute('data-id', section.id);
        sectionElement.setAttribute('data-width', section.width);

        const contentDiv = document.createElement('div');
        contentDiv.className = 'section-content';

        const sectionNumber = document.createElement('div');
        sectionNumber.className = 'section-number';
        sectionNumber.textContent = index + 1;

        sectionElement.appendChild(sectionNumber);

        const sectionInfo = document.createElement('div');
        sectionInfo.className = 'section-info';

        const nameElement = document.createElement('div');
        nameElement.className = 'section-name';
        nameElement.textContent = section.name;

        const commentElement = document.createElement('div');
        commentElement.className = 'section-comment';
        commentElement.textContent = section.comment || '';

        const durationElement = document.createElement('div');
        durationElement.className = 'section-duration';
        durationElement.textContent = `Bars: ${section.duration}`;

        sectionInfo.appendChild(nameElement);
        sectionInfo.appendChild(commentElement);
        sectionInfo.appendChild(durationElement);

        const sectionControlsContainer = document.createElement('div');
        sectionControlsContainer.className = 'section-controls-container';

        const editBtn = document.createElement('button');
        editBtn.className = 'control-btn';
        editBtn.textContent = '✏️';
        editBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            showEditSectionModal(section);
        });

        const copyBtn = document.createElement('button');
        copyBtn.className = 'control-btn';
        copyBtn.textContent = '📄';
        copyBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            copySection(section.id);
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'control-btn';
        deleteBtn.textContent = '🗑️';
        deleteBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            deleteSection(section.id);
        });

        sectionControlsContainer.appendChild(editBtn);
        sectionControlsContainer.appendChild(copyBtn);
        sectionControlsContainer.appendChild(deleteBtn);
        contentDiv.appendChild(sectionInfo);
        sectionElement.appendChild(sectionControlsContainer);
        sectionElement.appendChild(contentDiv);

        sectionElement.setAttribute('draggable', 'true');
        sectionElement.addEventListener('dragstart', function (e) {
            e.dataTransfer.setData('text/plain', section.id);
        });

        sectionElement.addEventListener('dragover', function (e) {
            e.preventDefault();
        });

        sectionElement.addEventListener('drop', function (e) {
            e.preventDefault();
            const draggedId = e.dataTransfer.getData('text/plain');
            moveSection(draggedId, section.id);
        });

        sectionsRow.appendChild(sectionElement);
    });
}

function showEditSectionModal(section) {
    currentEditingSection = section;

    document.getElementById('editSectionName').value = section.name;
    document.getElementById('editSectionColor').value = section.color;
    document.getElementById('editSectionComment').value = section.comment || '';
    document.getElementById('editSectionDuration').value = section.duration;

    document.getElementById('editSectionModal').style.display = 'flex';
}

function closeEditSectionModal() {
    document.getElementById('editSectionModal').style.display = 'none';
    currentEditingSection = null;
}

function applySectionChanges() {
    if (!currentEditingSection) return;

    const name = document.getElementById('editSectionName').value;
    const color = document.getElementById('editSectionColor').value;
    const comment = document.getElementById('editSectionComment').value;
    const duration = parseInt(document.getElementById('editSectionDuration').value);

    currentEditingSection.name = name;
    currentEditingSection.color = color;
    currentEditingSection.comment = comment;
    currentEditingSection.duration = duration;
    currentEditingSection.width = duration * 30;

    renderSections();
    updateBars();
    updateTimeline();
    renderLines();
    closeEditSectionModal();
}

function deleteSection(sectionId) {
    const sectionIndex = sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) return;

    const sectionElement = document.querySelector(`.section[data-id="${sectionId}"]`);
    const sectionWidth = sectionElement ? sectionElement.getAttribute('data-width') : '0';

    const lineCells = document.querySelectorAll(`.line-row .line-cell:nth-child(${sectionIndex + 1})`);

    if (sectionElement) {
        sectionElement.style.setProperty('--original-width', `${sectionWidth}px`);
        sectionElement.classList.add('removing');

        lineCells.forEach(cell => {
            cell.style.setProperty('--original-width', `${sectionWidth}px`);
            cell.classList.add('removing');
        });

        setTimeout(() => {
            sections = sections.filter(s => s.id !== sectionId);

            lines.forEach(line => {
                if (line.cells.length > sectionIndex) {
                    line.cells.splice(sectionIndex, 1);
                }
            });

            renderSections();
            updateBars();
            updateTimeline();
            renderLines();
            updateScrollShadows();
        }, 300);
    }
}

function moveSection(draggedId, targetId) {
    const draggedIndex = sections.findIndex(s => s.id.toString() === draggedId.toString());
    const targetIndex = sections.findIndex(s => s.id.toString() === targetId.toString());

    if (draggedIndex === -1 || targetIndex === -1) return;

    const [draggedSection] = sections.splice(draggedIndex, 1);
    sections.splice(targetIndex, 0, draggedSection);

    lines.forEach(line => {
        if (line.cells.length > draggedIndex) {
            const [draggedCell] = line.cells.splice(draggedIndex, 1);
            line.cells.splice(targetIndex, 0, draggedCell);
        }
    });

    renderSections();
    renderLines();
}

function updateBars() {
    const barsRow = document.getElementById('barsRow');
    barsRow.innerHTML = '';

    const totalBars = sections.reduce((sum, section) => sum + section.duration, 0);

    for (let i = 1; i <= totalBars; i++) {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.textContent = i;
        barsRow.appendChild(bar);
    }
}

function updateTimeline() {
    if (!document.getElementById('showTimeline').checked) return;

    const timelineRow = document.getElementById('timelineRow');
    timelineRow.innerHTML = '';

    const timelineContainer = document.createElement('div');
    timelineContainer.className = 'timeline-container';

    const totalBars = sections.reduce((sum, section) => sum + section.duration, 0);
    const barWidth = 30;
    const totalWidth = totalBars * barWidth;
    timelineContainer.style.width = `${totalWidth}px`;

    const timelineLine = document.createElement('div');
    timelineLine.className = 'timeline-line';
    timelineContainer.appendChild(timelineLine);

    const bpm = parseInt(document.getElementById('bpm').value);
    const signatureTop = parseInt(document.getElementById('signatureTop').value);
    const totalSeconds = 60 * signatureTop * totalBars / bpm;

    for (let seconds = 0; seconds <= totalSeconds; seconds++) {
        const position = (seconds / totalSeconds) * totalWidth;

        const marker = document.createElement('div');
        marker.className = 'timeline-marker';
        marker.style.left = `${position}px`;

        if (seconds % 5 === 0) {
            marker.classList.add('major');

            const label = document.createElement('div');
            label.className = 'timeline-label';
            label.textContent = `${seconds}s`;
            label.style.left = `${position}px`;
            timelineContainer.appendChild(label);
        }

        timelineContainer.appendChild(marker);
    }

    timelineRow.appendChild(timelineContainer);
}

function addNewLine() {
    const line = {
        id: Date.now() + Math.random(),
        name: 'New line',
        sound: '',
        comment: '',
        height: 50,
        cells: Array(sections.length).fill('')
    };

    lines.push(line);
    renderLineHeaders();
    renderLines();
}

function renderLineHeaders() {
    const lineHeadersContainer = document.getElementById('lineHeaders');
    lineHeadersContainer.innerHTML = '';

    lines.forEach((line, index) => {
        const lineHeader = document.createElement('div');
        lineHeader.className = 'line-header';
        lineHeader.setAttribute('data-id', line.id);
        lineHeader.setAttribute('draggable', 'true');

        const contentDiv = document.createElement('div');
        contentDiv.className = 'line-header-content';

        const lineNumber = document.createElement('div');
        lineNumber.className = 'line-number';
        lineNumber.textContent = index + 1;

        lineHeader.appendChild(lineNumber);

        const lineInfo = document.createElement('div');
        lineInfo.className = 'line-info';

        const nameElement = document.createElement('div');
        nameElement.className = 'line-name-display';
        nameElement.textContent = line.name;

        const commentElement = document.createElement('div');
        commentElement.className = 'line-comment';
        commentElement.textContent = line.comment || '';

        const soundElement = document.createElement('div');
        soundElement.className = 'line-sound';
        soundElement.textContent = line.sound || '-';

        lineInfo.appendChild(nameElement);
        lineInfo.appendChild(commentElement);
        lineInfo.appendChild(soundElement);

        const lineControlsContainer = document.createElement('div');
        lineControlsContainer.className = 'line-controls-container';

        const viewBtn = document.createElement('button');
        viewBtn.className = 'control-btn';
        viewBtn.textContent = '👁';
        viewBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            showViewLineModal(line);
        });

        const editBtn = document.createElement('button');
        editBtn.className = 'control-btn';
        editBtn.textContent = '✏️';
        editBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            showEditLineModal(line);
        });

        const copyBtn = document.createElement('button');
        copyBtn.className = 'control-btn';
        copyBtn.textContent = '📄';
        copyBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            copyLine(line.id);
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'control-btn';
        deleteBtn.textContent = '🗑️';
        deleteBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            deleteLine(line.id);
        });
        
        lineControlsContainer.appendChild(viewBtn);
        lineControlsContainer.appendChild(editBtn);
        lineControlsContainer.appendChild(copyBtn);
        lineControlsContainer.appendChild(deleteBtn);
        contentDiv.appendChild(lineInfo);
        lineHeader.appendChild(lineControlsContainer);
        lineHeader.appendChild(contentDiv);

        lineHeader.addEventListener('dragstart', handleLineDragStart);
        lineHeader.addEventListener('dragover', handleLineDragOver);
        lineHeader.addEventListener('dragleave', handleLineDragLeave);
        lineHeader.addEventListener('drop', handleLineDrop);
        lineHeader.addEventListener('dragend', handleLineDragEnd);

        lineHeadersContainer.appendChild(lineHeader);
    });

    updateScrollShadows();
}

function handleLineDragStart(e) {
    draggedLine = e.currentTarget;
    e.currentTarget.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', e.currentTarget.getAttribute('data-id'));

    document.querySelectorAll('.line-header').forEach(header => {
        if (header !== draggedLine) {
            header.classList.add('drag-possible');
        }
    });
}

function handleLineDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const lineHeader = e.currentTarget;
    if (lineHeader !== draggedLine && !lineHeader.classList.contains('drag-over')) {
        lineHeader.classList.add('drag-over');
        dragOverLine = lineHeader;
    }
}

function handleLineDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleLineDrop(e) {
    e.preventDefault();

    const draggedLineId = e.dataTransfer.getData('text/plain');
    const targetLineId = e.currentTarget.getAttribute('data-id');

    if (draggedLineId !== targetLineId) {
        moveLine(draggedLineId, targetLineId);
    }

    e.currentTarget.classList.remove('drag-over');
}

function handleLineDragEnd(e) {
    document.querySelectorAll('.line-header').forEach(header => {
        header.classList.remove('dragging', 'drag-over', 'drag-possible');
    });

    draggedLine = null;
    dragOverLine = null;
}

function moveLine(draggedLineId, targetLineId) {
    const draggedIndex = lines.findIndex(t => t.id.toString() === draggedLineId.toString());
    const targetIndex = lines.findIndex(t => t.id.toString() === targetLineId.toString());

    if (draggedIndex === -1 || targetIndex === -1) return;

    const [draggedLine] = lines.splice(draggedIndex, 1);
    lines.splice(targetIndex, 0, draggedLine);

    renderLineHeaders();
    renderLines();
}

function showEditLineModal(line) {
    currentEditingLine = line;

    document.getElementById('editLineName').value = line.name;
    document.getElementById('editLineComment').value = line.comment || '';
    document.getElementById('editLineSound').value = line.sound || '';

    document.getElementById('editLineModal').style.display = 'flex';
}

function closeEditLineModal() {
    document.getElementById('editLineModal').style.display = 'none';
    currentEditingLine = null;
}

function applyLineChanges() {
    if (!currentEditingLine) return;

    const name = document.getElementById('editLineName').value;
    const comment = document.getElementById('editLineComment').value;
    const sound = document.getElementById('editLineSound').value;

    currentEditingLine.name = name;
    currentEditingLine.comment = comment;
    currentEditingLine.sound = sound;

    renderLineHeaders();
    renderLines();
    closeEditLineModal();
}

function updateLineRowHeight(lineId) {
    const lineHeader = document.querySelector(`.line-header[data-id="${lineId}"]`);
    const lineRow = document.querySelector(`.line-row[data-id="${lineId}"]`);
    const line = lines.find(t => t.id === lineId);

    if (!lineHeader || !lineRow || !line) return;

    lineHeader.style.height = 'auto';
    lineRow.style.height = 'auto';

    const headerHeight = lineHeader.scrollHeight;

    let maxCellHeight = 0;

    const cellTextareas = lineRow.querySelectorAll('textarea');
    cellTextareas.forEach(textarea => {
        textarea.style.height = 'auto';
        const textareaScrollHeight = textarea.scrollHeight;

        const calculatedHeight = Math.max(textareaScrollHeight, 20);

        if (calculatedHeight > maxCellHeight) {
            maxCellHeight = calculatedHeight;
        }

        if (parseInt(textarea.style.height) !== calculatedHeight) {
            textarea.style.height = `${calculatedHeight}px`;
        }
    });

    const cellPadding = 10;
    const finalHeight = Math.max(headerHeight, maxCellHeight + cellPadding, 50);

    if (parseInt(lineHeader.style.height) !== finalHeight) {
        lineHeader.style.height = `${finalHeight}px`;
        lineRow.style.height = `${finalHeight}px`;
        line.height = finalHeight;
    }

    updateScrollShadows();
}

function updateLinePlaceholders(lineId) {
    const line = lines.find(t => t.id === lineId);
    if (!line) return;

    const lineRow = document.querySelector(`.line-row[data-id="${lineId}"]`);
    if (!lineRow) return;

    const textareas = lineRow.querySelectorAll('textarea');
    textareas.forEach((textarea, index) => {
        textarea.placeholder = `Some description for ${line.name} on ${sections[index].name}...`;
    });
}

function deleteLine(lineId) {
    const lineIndex = lines.findIndex(t => t.id === lineId);
    if (lineIndex === -1) return;

    const lineHeader = document.querySelector(`.line-header[data-id="${lineId}"]`);
    const lineRow = document.querySelector(`.line-row[data-id="${lineId}"]`);

    if (lineHeader && lineRow) {
        lineHeader.classList.add('removing');
        lineRow.classList.add('removing');

        setTimeout(() => {
            lines.splice(lineIndex, 1);
            renderLineHeaders();
            renderLines();
            updateScrollShadows();
        }, 300);
    }
}

function renderLines() {
    const linesContainer = document.getElementById('linesContainer');
    linesContainer.innerHTML = '';

    lines.forEach(line => {
        const lineRow = document.createElement('div');
        lineRow.className = 'line-row';
        lineRow.setAttribute('data-id', line.id);

        sections.forEach((section, index) => {
            const cell = document.createElement('div');
            cell.className = 'line-cell';
            cell.style.backgroundColor = section.color;
            cell.style.width = `${section.width}px`;
            cell.setAttribute('data-width', section.width);

            const textarea = document.createElement('textarea');
            textarea.value = line.cells[index] || '';

            textarea.placeholder = `Some description for ${line.name} on ${section.name}...`;

            textarea.addEventListener('input', function () {
                line.cells[index] = this.value;

                updateLineRowHeight(line.id);
            });

            cell.appendChild(textarea);
            lineRow.appendChild(cell);
        });

        linesContainer.appendChild(lineRow);

        setTimeout(() => {
            updateLineRowHeight(line.id);
        }, 0);
    });

    updateScrollShadows();
}

function exportTrack() {
    const trackTitleElement = document.getElementById('trackTitle');
    let trackName = 'New track';

    if (trackTitleElement) {
        const span = trackTitleElement.querySelector('span');
        if (span) {
            trackName = span.textContent;
        } else {
            const input = trackTitleElement.querySelector('input');
            if (input) {
                trackName = input.value;
            }
        }
    }

    const descriptions = [];

    lines.forEach((line, lineIndex) => {
        sections.forEach((section, sectionIndex) => {
            const description = line.cells[sectionIndex] || '';
            if (description.trim() !== '') {
                descriptions.push({
                    sectionNumber: sectionIndex + 1,
                    lineNumber: lineIndex + 1,
                    description: description
                });
            }
        });
    });

    const exportData = {
        settings: {
            trackName: trackName,
            showTimeline: document.getElementById('showTimeline').checked,
            bpm: parseInt(document.getElementById('bpm').value),
            signatureNumerator: parseInt(document.getElementById('signatureTop').value),
            signatureDenominator: parseInt(document.getElementById('signatureBottom').value)
        },
        sections: sections.map((section, index) => ({
            number: index + 1,
            name: section.name,
            duration: section.duration,
            color: section.color,
            comment: section.comment || ''
        })),
        lines: lines.map((line, index) => ({
            number: index + 1,
            name: line.name,
            sound: line.sound,
            comment: line.comment || ''
        })),
        descriptions: descriptions
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `${trackName}_structure.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}

function triggerImport() {
    document.getElementById('importFileInput').click();
}

function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = JSON.parse(e.target.result);
            importTrackData(data, file.name);
        } catch (error) {
            alert('Error reading file: ' + error.message);
        }
    };
    reader.readAsText(file);

    event.target.value = '';
}

function importTrackData(data, fileName) {
    const validation = validateImportData(data);
    if (!validation.isValid) {
        alert(validation.message);
        return;
    }

    let trackName = data.settings.trackName || extractTrackNameFromFileName(fileName);

    applyImportedData(data);

    setTrackTitle(trackName);

    alert(`File '${fileName}' imported successfully`);
}

function validateImportData(data) {
    const missingAttributes = [];
    const invalidAttributes = [];

    if (!data.settings) missingAttributes.push('settings');
    if (!data.sections) missingAttributes.push('sections');
    if (!data.lines) missingAttributes.push('lines');
    if (!data.descriptions) missingAttributes.push('descriptions');

    if (missingAttributes.length > 0) {
        return {
            isValid: false,
            message: `Invalid file structure. Missed required attribute(-s): ${missingAttributes.join(', ')}`
        };
    }

    if (typeof data.settings !== 'object') {
        invalidAttributes.push('settings (should be object)');
    } else {
        if (typeof data.settings.showTimeline !== 'boolean') {
            invalidAttributes.push('settings.showTimeline (should be boolean)');
        }

        if (typeof data.settings.bpm !== 'number' || !Number.isInteger(data.settings.bpm) ||
            data.settings.bpm < 1 || data.settings.bpm > 256) {
            invalidAttributes.push('settings.bpm (should be integer between 1 and 256)');
        }

        if (typeof data.settings.signatureNumerator !== 'number' || !Number.isInteger(data.settings.signatureNumerator) ||
            data.settings.signatureNumerator < 1 || data.settings.signatureNumerator > 8) {
            invalidAttributes.push('settings.signatureNumerator (should be integer between 1 and 8)');
        }

        const validDenominators = [1, 2, 4, 8];
        if (typeof data.settings.signatureDenominator !== 'number' || !Number.isInteger(data.settings.signatureDenominator) ||
            !validDenominators.includes(data.settings.signatureDenominator)) {
            invalidAttributes.push('settings.signatureDenominator (should be one of: 1, 2, 4, 8)');
        }
    }

    if (Array.isArray(data.sections)) {
        data.sections.forEach((section, index) => {
            const path = `sections[${index}]`;

            if (typeof section.number !== 'number' || !Number.isInteger(section.number) || section.number <= 0) {
                invalidAttributes.push(`${path}.number`);
            }
            if (typeof section.name !== 'string') {
                invalidAttributes.push(`${path}.name`);
            }
            if (typeof section.duration !== 'number' || !Number.isInteger(section.duration) || section.duration <= 0 || section.duration >= 65) {
                invalidAttributes.push(`${path}.duration`);
            }
            if (typeof section.color !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(section.color)) {
                invalidAttributes.push(`${path}.color`);
            }
            if (section.hasOwnProperty('comment') && typeof section.comment !== 'string') {
                invalidAttributes.push(`${path}.comment`);
            }
        });
    } else {
        invalidAttributes.push('sections (should be array)');
    }

    if (Array.isArray(data.lines)) {
        data.lines.forEach((line, index) => {
            const path = `lines[${index}]`;

            if (typeof line.number !== 'number' || !Number.isInteger(line.number) || line.number <= 0) {
                invalidAttributes.push(`${path}.number`);
            }
            if (typeof line.name !== 'string') {
                invalidAttributes.push(`${path}.name`);
            }
            if (typeof line.sound !== 'string') {
                invalidAttributes.push(`${path}.sound`);
            }
            if (line.hasOwnProperty('comment') && typeof line.comment !== 'string') {
                invalidAttributes.push(`${path}.comment`);
            }
        });
    } else {
        invalidAttributes.push('lines (should be array)');
    }

    if (Array.isArray(data.descriptions)) {
        data.descriptions.forEach((desc, index) => {
            const path = `descriptions[${index}]`;

            if (typeof desc.sectionNumber !== 'number' || !Number.isInteger(desc.sectionNumber) || desc.sectionNumber <= 0) {
                invalidAttributes.push(`${path}.sectionNumber`);
            }
            if (typeof desc.lineNumber !== 'number' || !Number.isInteger(desc.lineNumber) || desc.lineNumber <= 0) {
                invalidAttributes.push(`${path}.lineNumber`);
            }
            if (typeof desc.description !== 'string') {
                invalidAttributes.push(`${path}.description`);
            }
        });
    } else {
        invalidAttributes.push('descriptions (should be array)');
    }

    if (invalidAttributes.length > 0) {
        return {
            isValid: false,
            message: `Invalid value for attribute(-s): ${invalidAttributes.join(', ')}`
        };
    }

    return { isValid: true };
}

function extractTrackNameFromFileName(fileName) {
    let nameWithoutExtension = fileName.replace(/\.json$/, '');

    const structureIndex = nameWithoutExtension.indexOf('_structure');

    if (structureIndex !== -1) {
        return nameWithoutExtension.substring(0, structureIndex);
    } else {
        return nameWithoutExtension;
    }
}

function applyImportedData(data) {
    applySettings(data.settings);

    sections = [];
    lines = [];

    const sortedSections = data.sections.sort((a, b) => a.number - b.number);
    sortedSections.forEach(section => {
        addSection({
            Name: section.name,
            Color: section.color,
            Duration: section.duration,
            Comment: section.comment || ''
        });
    });

    const sortedLines = data.lines.sort((a, b) => a.number - b.number);
    sortedLines.forEach(lineData => {
        const line = {
            id: Date.now() + Math.random(),
            name: lineData.name,
            sound: lineData.sound,
            comment: lineData.comment || '',
            height: 50,
            cells: Array(sections.length).fill('')
        };
        lines.push(line);
    });

    data.descriptions.forEach(desc => {
        const sectionIndex = desc.sectionNumber - 1;
        const lineIndex = desc.lineNumber - 1;

        if (sectionIndex >= 0 && sectionIndex < sections.length &&
            lineIndex >= 0 && lineIndex < lines.length) {
            lines[lineIndex].cells[sectionIndex] = desc.description;
        }
    });

    renderSections();
    updateBars();
    updateTimeline();
    renderLineHeaders();
    renderLines();
    updateScrollShadows();
}

function applySettings(settings) {
    document.getElementById('showTimeline').checked = settings.showTimeline;
    document.getElementById('bpm').value = settings.bpm;
    document.getElementById('signatureTop').value = settings.signatureNumerator;
    document.getElementById('signatureBottom').value = settings.signatureDenominator;

    updateTimelineVisibility();

    if (settings.showTimeline) {
        updateTimeline();
    }
}

function setTrackTitle(trackName) {
    const trackTitleElement = document.getElementById('trackTitle');
    if (!trackTitleElement) return;

    const input = trackTitleElement.querySelector('input');
    if (input) {
        input.value = trackName;
    } else {
        const span = trackTitleElement.querySelector('span');
        if (span) {
            span.textContent = trackName;
        }
    }
}

function resetTrack() {
    sections = [];
    lines = [];

    setTrackTitle("New track");

    renderSections();
    updateBars();
    updateTimeline();
    renderLineHeaders();
    renderLines();
    updateScrollShadows();
}

function copySection(sectionId) {
    const originalSection = sections.find(s => s.id === sectionId);
    if (!originalSection) return;

    // Создаем копию секции
    const copiedSection = {
        id: Date.now() + Math.random(),
        name: `${originalSection.name} (copy)`,
        color: originalSection.color,
        comment: originalSection.comment,
        duration: originalSection.duration,
        width: originalSection.width
    };

    sections.push(copiedSection);

    const originalSectionIndex = sections.findIndex(s => s.id === sectionId);
    lines.forEach(line => {
        if (line.cells.length > originalSectionIndex) {
            const cellContent = line.cells[originalSectionIndex];
            line.cells.push(cellContent);
        } else {
            line.cells.push('');
        }
    });

    renderSections();
    updateBars();
    updateTimeline();
    renderLines();
    updateScrollShadows();
}

function copyLine(lineId) {
    const originalLine = lines.find(t => t.id === lineId);
    if (!originalLine) return;

    const copiedLine = {
        id: Date.now() + Math.random(),
        name: `${originalLine.name} (copy)`,
        sound: originalLine.sound,
        comment: originalLine.comment,
        height: originalLine.height,
        cells: [...originalLine.cells]
    };

    lines.push(copiedLine);

    // Обновляем интерфейс
    renderLineHeaders();
    renderLines();
    updateScrollShadows();
}

function showViewLineModal(line) {
    currentViewingLine = line;
    
    document.getElementById('viewLineName').textContent = line.name;
    document.getElementById('viewLineSound').textContent = line.sound || '-';
    document.getElementById('viewLineComment').textContent = line.comment || '-';
    
    const sectionsContainer = document.querySelector('.line-modal-sections');
    const cellsContainer = document.querySelector('.line-modal-cells');
    sectionsContainer.innerHTML = '';
    cellsContainer.innerHTML = '';
    
    sections.forEach((section, index) => {
        const sectionElement = document.createElement('div');
        sectionElement.className = 'line-modal-section';
        sectionElement.style.backgroundColor = section.color;
        sectionElement.setAttribute('data-index', index);
        
        const sectionName = document.createElement('div');
        sectionName.className = 'line-modal-section-name';
        sectionName.textContent = section.name;
        
        const sectionComment = document.createElement('div');
        sectionComment.className = 'line-modal-section-comment';
        sectionComment.textContent = section.comment || '-';
        
        const sectionDuration = document.createElement('div');
        sectionDuration.className = 'line-modal-section-duration';
        sectionDuration.textContent = `${section.duration} bars`;
        
        sectionElement.appendChild(sectionName);
        sectionElement.appendChild(sectionComment);
        sectionElement.appendChild(sectionDuration);
        
        sectionsContainer.appendChild(sectionElement);
        
        const cellElement = document.createElement('div');
        cellElement.className = 'line-modal-cell';
        cellElement.style.backgroundColor = section.color;
        cellElement.setAttribute('data-index', index);
        
        const textarea = document.createElement('textarea');
        textarea.className = 'line-modal-textarea';
        textarea.value = line.cells[index] || '';
        textarea.placeholder = `Some description for ${line.name} on ${section.name}...`;
        
        textarea.addEventListener('input', function() {
            line.cells[index] = this.value;

            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';

            syncModalHeights(index);
            updateMainLineCell(line.id, index, this.value);
            updateModalScrollShadows();
        });

        cellElement.appendChild(textarea);
        cellsContainer.appendChild(cellElement);

        setTimeout(() => {
            textarea.style.height = 'auto';
            textarea.style.height = (textarea.scrollHeight) + 'px';
            syncModalHeights(index);
        }, 0);
    });

    syncModalScroll();

    setTimeout(() => {
        updateModalScrollShadows();
    }, 100);
    
    document.getElementById('viewLineModal').style.display = 'flex';
}

function closeViewLineModal() {
    document.getElementById('viewLineModal').style.display = 'none';
    currentViewingLine = null;
}

function updateMainLineCell(lineId, sectionIndex, value) {
    const lineRow = document.querySelector(`.line-row[data-id="${lineId}"]`);
    if (lineRow) {
        const cell = lineRow.querySelector(`.line-cell:nth-child(${sectionIndex + 1})`);
        if (cell) {
            const textarea = cell.querySelector('textarea');
            if (textarea && textarea.value !== value) {
                textarea.value = value;

                textarea.style.height = 'auto';
                textarea.style.height = (textarea.scrollHeight) + 'px';
            }
        }
    }

    updateLineRowHeight(lineId);
}

function syncModalHeights(index) {
    const sectionElement = document.querySelector(`.line-modal-section:nth-child(${index + 1})`);
    const cellElement = document.querySelector(`.line-modal-cell:nth-child(${index + 1})`);

    if (!sectionElement || !cellElement) return;

    sectionElement.style.height = 'auto';
    cellElement.style.height = 'auto';

    const sectionHeight = sectionElement.scrollHeight;
    const cellHeight = cellElement.scrollHeight;

    const finalHeight = Math.max(sectionHeight, cellHeight, 50);

    sectionElement.style.height = `${finalHeight}px`;
    cellElement.style.height = `${finalHeight}px`;

    updateModalScrollShadows();
}

function syncModalScroll() {
    const sectionsContainer = document.querySelector('.line-modal-sections');
    const cellsContainer = document.querySelector('.line-modal-cells');
    
    if (!sectionsContainer || !cellsContainer) return;
    
    sectionsContainer.addEventListener('scroll', function() {
        cellsContainer.scrollTop = this.scrollTop;
        updateModalScrollShadows();
    });
    
    cellsContainer.addEventListener('scroll', function() {
        sectionsContainer.scrollTop = this.scrollTop;
        updateModalScrollShadows();
    });
}

function updateModalScrollShadows() {
    const modalContainers = [
        {
            element: document.getElementById('lineModalSections'),
            container: document.getElementById('lineModalSectionsContainer'),
            horizontal: false,
            vertical: true
        },
        {
            element: document.getElementById('lineModalCells'),
            container: document.getElementById('lineModalCellsContainer'),
            horizontal: false,
            vertical: true
        }
    ];

    modalContainers.forEach(item => {
        if (!item.element || !item.container) return;

        const scrollableToTop = item.element.scrollTop > 0;
        const scrollableToBottom = item.element.scrollTop + item.element.clientHeight < item.element.scrollHeight - 1;

        const shadowClasses = [
            'shadow-top', 'shadow-bottom', 'shadow-top-bottom'
        ];
        item.container.classList.remove(...shadowClasses);

        let shadowClass = 'shadow';

        if (scrollableToTop && item.vertical) shadowClass += '-top';
        if (scrollableToBottom && item.vertical) shadowClass += "-bottom";

        if (scrollableToTop || scrollableToBottom) {
            item.container.classList.add(shadowClass);
        }
    });
}

function exportToPDF() {
    const trackTitleElement = document.getElementById('trackTitle');
    let trackName = 'New track';

    const { jsPDF } = window.jspdf;

    if (trackTitleElement) {
        const span = trackTitleElement.querySelector('span');
        const input = trackTitleElement.querySelector('input');
        if (span) {
            trackName = span.textContent;
        } else if (input) {
            trackName = input.value;
        }
    }

    const bpm = document.getElementById('bpm').value;
    const signatureTop = document.getElementById('signatureTop').value;
    const signatureBottom = document.getElementById('signatureBottom').value;

    // Создаем временный контейнер для PDF
    const pdfContainer = document.createElement('div');
    pdfContainer.className = 'pdf-export-container';
    pdfContainer.style.width = '1000px'; // Начальная ширина
    
    // Заголовок PDF
    const pdfHeader = document.createElement('div');
    pdfHeader.className = 'pdf-header';
    
    const titleDiv = document.createElement('div');
    titleDiv.className = 'pdf-track-title';
    titleDiv.textContent = trackName;
    
    const settingsDiv = document.createElement('div');
    settingsDiv.className = 'pdf-settings';
    
    const bpmSetting = document.createElement('div');
    bpmSetting.className = 'pdf-setting-item';
    bpmSetting.innerHTML = '<span>BPM:</span><span>' + bpm + '</span>';
    
    const signatureSetting = document.createElement('div');
    signatureSetting.className = 'pdf-setting-item';
    signatureSetting.innerHTML = '<span>Signature:</span><span>' + signatureTop + '/' + signatureBottom + '</span>';
    
    settingsDiv.appendChild(bpmSetting);
    settingsDiv.appendChild(signatureSetting);
    
    pdfHeader.appendChild(titleDiv);
    pdfHeader.appendChild(settingsDiv);
    pdfContainer.appendChild(pdfHeader);
    
    // Создаем таблицу
    const table = document.createElement('table');
    table.className = 'pdf-table';
    
    // Создаем строку заголовков
    const headerRow = document.createElement('tr');
    
    // Пустая ячейка для секций
    const emptyHeader = document.createElement('th');
    emptyHeader.className = 'pdf-section-column';
    headerRow.appendChild(emptyHeader);
    
    // Заголовки для дорожек
    lines.forEach(line => {
        const lineHeader = document.createElement('th');
        lineHeader.className = 'pdf-line-column pdf-line-header';
        lineHeader.textContent = line.name;
        headerRow.appendChild(lineHeader);
    });
    
    table.appendChild(headerRow);
    
    // Добавляем строки с секциями и содержимым дорожек
    sections.forEach((section, sectionIndex) => {
        const row = document.createElement('tr');
        
        // Ячейка секции
        const sectionCell = document.createElement('td');
        sectionCell.className = 'pdf-section-column pdf-section-cell';
        sectionCell.style.backgroundColor = section.color;
        sectionCell.textContent = section.name;
        row.appendChild(sectionCell);
        
        // Ячейки дорожек
        lines.forEach(line => {
            const lineCell = document.createElement('td');
            lineCell.className = 'pdf-line-column pdf-line-cell';
            lineCell.style.backgroundColor = section.color;
            
            const cellContent = line.cells[sectionIndex] || '';
            lineCell.textContent = cellContent;
            
            // Автоматическая высота ячейки
            if (cellContent) {
                const lineCount = cellContent.split('\n').length;
                const approximateHeight = Math.min(Math.max(lineCount * 20, 20), 300);
                lineCell.style.height = approximateHeight + 'px';
            }
            
            row.appendChild(lineCell);
        });
        
        table.appendChild(row);
    });
    
    pdfContainer.appendChild(table);
    document.body.appendChild(pdfContainer);
    
    // Используем html2canvas и jsPDF для создания PDF
    html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        logging: false
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const pdf = new jsPDF({
            orientation: 'album',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });
        
        pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
        pdf.save(trackName + '_structure.pdf');
        
        // Удаляем временный контейнер
        document.body.removeChild(pdfContainer);
    });
}