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
let tracks = [];
let currentEditingSection = null;
let currentEditingTrack = null;
let draggedTrack = null;
let dragOverTrack = null;

document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
});

function initializeApp() {
    initializeTrackTitle();
    initializeSettings();
    initializeStandardSections();
    initializeTimeline();
    initializeTracks();

    document.getElementById('addSectionBtn').addEventListener('click', showAddSectionModal);
    document.getElementById('addLineBtn').addEventListener('click', addNewTrack);
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
    document.getElementById('closeEditTrackModal').addEventListener('click', closeEditTrackModal);
    document.getElementById('applyTrackChanges').addEventListener('click', applyTrackChanges);
    document.getElementById('importTrack').addEventListener('click', triggerImport);
    document.getElementById('importFileInput').addEventListener('change', handleFileImport);
    document.getElementById('resetTrackBtn').addEventListener('click', resetTrack);

    addSection({ "Name": "Intro", "Color": "#DAE8FC", "Duration": 4, "Comment": "" });
    addSection({ "Name": "Verse", "Color": "#D5E8D4", "Duration": 8, "Comment": "" });
    addSection({ "Name": "Chorus", "Color": "#FFE6CC", "Duration": 8, "Comment": "" });

    addDefaultTracks();

    synchronizeScroll();

    updateTimelineVisibility();

    initializeScrollShadows();
}

function synchronizeScroll() {
    const fixedRightTop = document.querySelector('.fixed-right-top');
    const scrollableRightBottom = document.querySelector('.scrollable-right-bottom');
    const trackHeaders = document.getElementById('trackHeaders');

    fixedRightTop.addEventListener('scroll', function () {
        scrollableRightBottom.scrollLeft = this.scrollLeft;
        updateScrollShadows();
    });

    scrollableRightBottom.addEventListener('scroll', function () {
        fixedRightTop.scrollLeft = this.scrollLeft;
        updateScrollShadows();
    });

    trackHeaders.addEventListener('scroll', function () {
        scrollableRightBottom.scrollTop = this.scrollTop;
        updateScrollShadows();
    });

    scrollableRightBottom.addEventListener('scroll', function () {
        trackHeaders.scrollTop = this.scrollTop;
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
            element: document.getElementById('tracksContainer'),
            container: document.getElementById('tracksContainerContainer'),
            horizontal: true,
            vertical: true
        },
        {
            element: document.getElementById('trackHeaders'),
            container: document.getElementById('trackHeadersContainer'),
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

function initializeTracks() {
    // Tracks будут инициализированы при добавлении
}

function addDefaultTracks() {
    const defaultTracks = [
        { name: "Drums", sound: "Kick", height: 50, comment: "" },
        { name: "Guitar", sound: "Guitar", height: 50, comment: "" },
        { name: "Bass", sound: "Bass", height: 50, comment: "" },
        { name: "Voice", sound: "Vocals", height: 50, comment: "" }
    ];

    defaultTracks.forEach(trackData => {
        const track = {
            id: Date.now() + Math.random(),
            name: trackData.name,
            sound: trackData.sound,
            height: trackData.height,
            comment: trackData.comment,
            cells: []
        };

        sections.forEach(() => {
            track.cells.push('');
        });

        tracks.push(track);
    });

    renderTrackHeaders();
    renderTracks();
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

    tracks.forEach(track => {
        track.cells.push('');
    });

    renderSections();
    updateBars();
    updateTimeline();
    renderTracks();
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
    renderTracks();
    closeEditSectionModal();
}

function deleteSection(sectionId) {
    const sectionIndex = sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) return;

    const sectionElement = document.querySelector(`.section[data-id="${sectionId}"]`);
    const sectionWidth = sectionElement ? sectionElement.getAttribute('data-width') : '0';

    const trackCells = document.querySelectorAll(`.track-row .track-cell:nth-child(${sectionIndex + 1})`);

    if (sectionElement) {
        sectionElement.style.setProperty('--original-width', `${sectionWidth}px`);
        sectionElement.classList.add('removing');

        trackCells.forEach(cell => {
            cell.style.setProperty('--original-width', `${sectionWidth}px`);
            cell.classList.add('removing');
        });

        setTimeout(() => {
            sections = sections.filter(s => s.id !== sectionId);

            tracks.forEach(track => {
                if (track.cells.length > sectionIndex) {
                    track.cells.splice(sectionIndex, 1);
                }
            });

            renderSections();
            updateBars();
            updateTimeline();
            renderTracks();
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

    tracks.forEach(track => {
        if (track.cells.length > draggedIndex) {
            const [draggedCell] = track.cells.splice(draggedIndex, 1);
            track.cells.splice(targetIndex, 0, draggedCell);
        }
    });

    renderSections();
    renderTracks();
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

function addNewTrack() {
    const track = {
        id: Date.now() + Math.random(),
        name: 'New line',
        sound: '',
        comment: '',
        height: 50,
        cells: Array(sections.length).fill('')
    };

    tracks.push(track);
    renderTrackHeaders();
    renderTracks();
}

function renderTrackHeaders() {
    const trackHeadersContainer = document.getElementById('trackHeaders');
    trackHeadersContainer.innerHTML = '';

    tracks.forEach((track, index) => {
        const trackHeader = document.createElement('div');
        trackHeader.className = 'track-header';
        trackHeader.setAttribute('data-id', track.id);
        trackHeader.setAttribute('draggable', 'true');

        const contentDiv = document.createElement('div');
        contentDiv.className = 'track-header-content';

        const trackNumber = document.createElement('div');
        trackNumber.className = 'track-number';
        trackNumber.textContent = index + 1;

        trackHeader.appendChild(trackNumber);

        const trackInfo = document.createElement('div');
        trackInfo.className = 'track-info';

        const nameElement = document.createElement('div');
        nameElement.className = 'track-name-display';
        nameElement.textContent = track.name;

        const commentElement = document.createElement('div');
        commentElement.className = 'track-comment';
        commentElement.textContent = track.comment || '';

        const soundElement = document.createElement('div');
        soundElement.className = 'track-sound';
        soundElement.textContent = track.sound || '-';

        trackInfo.appendChild(nameElement);
        trackInfo.appendChild(commentElement);
        trackInfo.appendChild(soundElement);

        const trackControlsContainer = document.createElement('div');
        trackControlsContainer.className = 'track-controls-container';

        const editBtn = document.createElement('button');
        editBtn.className = 'control-btn';
        editBtn.textContent = '✏️';
        editBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            showEditTrackModal(track);
        });

        const copyBtn = document.createElement('button');
        copyBtn.className = 'control-btn';
        copyBtn.textContent = '📄';
        copyBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            copyTrack(track.id);
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'control-btn';
        deleteBtn.textContent = '🗑️';
        deleteBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            deleteTrack(track.id);
        });

        trackControlsContainer.appendChild(editBtn);
        trackControlsContainer.appendChild(copyBtn);
        trackControlsContainer.appendChild(deleteBtn);
        contentDiv.appendChild(trackInfo);
        trackHeader.appendChild(trackControlsContainer);
        trackHeader.appendChild(contentDiv);

        trackHeader.addEventListener('dragstart', handleTrackDragStart);
        trackHeader.addEventListener('dragover', handleTrackDragOver);
        trackHeader.addEventListener('dragleave', handleTrackDragLeave);
        trackHeader.addEventListener('drop', handleTrackDrop);
        trackHeader.addEventListener('dragend', handleTrackDragEnd);

        trackHeadersContainer.appendChild(trackHeader);
    });

    updateScrollShadows();
}

function handleTrackDragStart(e) {
    draggedTrack = e.currentTarget;
    e.currentTarget.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', e.currentTarget.getAttribute('data-id'));

    document.querySelectorAll('.track-header').forEach(header => {
        if (header !== draggedTrack) {
            header.classList.add('drag-possible');
        }
    });
}

function handleTrackDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const trackHeader = e.currentTarget;
    if (trackHeader !== draggedTrack && !trackHeader.classList.contains('drag-over')) {
        trackHeader.classList.add('drag-over');
        dragOverTrack = trackHeader;
    }
}

function handleTrackDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleTrackDrop(e) {
    e.preventDefault();

    const draggedTrackId = e.dataTransfer.getData('text/plain');
    const targetTrackId = e.currentTarget.getAttribute('data-id');

    if (draggedTrackId !== targetTrackId) {
        moveTrack(draggedTrackId, targetTrackId);
    }

    e.currentTarget.classList.remove('drag-over');
}

function handleTrackDragEnd(e) {
    document.querySelectorAll('.track-header').forEach(header => {
        header.classList.remove('dragging', 'drag-over', 'drag-possible');
    });

    draggedTrack = null;
    dragOverTrack = null;
}

function moveTrack(draggedTrackId, targetTrackId) {
    const draggedIndex = tracks.findIndex(t => t.id.toString() === draggedTrackId.toString());
    const targetIndex = tracks.findIndex(t => t.id.toString() === targetTrackId.toString());

    if (draggedIndex === -1 || targetIndex === -1) return;

    const [draggedTrack] = tracks.splice(draggedIndex, 1);
    tracks.splice(targetIndex, 0, draggedTrack);

    renderTrackHeaders();
    renderTracks();
}

function showEditTrackModal(track) {
    currentEditingTrack = track;

    document.getElementById('editTrackName').value = track.name;
    document.getElementById('editTrackComment').value = track.comment || '';
    document.getElementById('editTrackSound').value = track.sound || '';

    document.getElementById('editTrackModal').style.display = 'flex';
}

function closeEditTrackModal() {
    document.getElementById('editTrackModal').style.display = 'none';
    currentEditingTrack = null;
}

function applyTrackChanges() {
    if (!currentEditingTrack) return;

    const name = document.getElementById('editTrackName').value;
    const comment = document.getElementById('editTrackComment').value;
    const sound = document.getElementById('editTrackSound').value;

    currentEditingTrack.name = name;
    currentEditingTrack.comment = comment;
    currentEditingTrack.sound = sound;

    renderTrackHeaders();
    renderTracks();
    closeEditTrackModal();
}

function updateTrackRowHeight(trackId) {
    const trackHeader = document.querySelector(`.track-header[data-id="${trackId}"]`);
    const trackRow = document.querySelector(`.track-row[data-id="${trackId}"]`);
    const track = tracks.find(t => t.id === trackId);

    if (!trackHeader || !trackRow || !track) return;

    // Сбрасываем высоту строки и заголовка к автоматической для перерасчета
    trackHeader.style.height = 'auto';
    trackRow.style.height = 'auto';

    // Получаем естественную высоту заголовка
    const headerHeight = trackHeader.scrollHeight;

    let maxCellHeight = 0;

    const cellTextareas = trackRow.querySelectorAll('textarea');
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

    if (parseInt(trackHeader.style.height) !== finalHeight) {
        trackHeader.style.height = `${finalHeight}px`;
        trackRow.style.height = `${finalHeight}px`;
        track.height = finalHeight;
    }

    updateScrollShadows();
}

function updateTrackPlaceholders(trackId) {
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;

    const trackRow = document.querySelector(`.track-row[data-id="${trackId}"]`);
    if (!trackRow) return;

    const textareas = trackRow.querySelectorAll('textarea');
    textareas.forEach((textarea, index) => {
        textarea.placeholder = `Some description for ${track.name} on ${sections[index].name}...`;
    });
}

function deleteTrack(trackId) {
    const trackIndex = tracks.findIndex(t => t.id === trackId);
    if (trackIndex === -1) return;

    const trackHeader = document.querySelector(`.track-header[data-id="${trackId}"]`);
    const trackRow = document.querySelector(`.track-row[data-id="${trackId}"]`);

    if (trackHeader && trackRow) {
        trackHeader.classList.add('removing');
        trackRow.classList.add('removing');

        setTimeout(() => {
            tracks.splice(trackIndex, 1);
            renderTrackHeaders();
            renderTracks();
            updateScrollShadows();
        }, 300);
    }
}

function renderTracks() {
    const tracksContainer = document.getElementById('tracksContainer');
    tracksContainer.innerHTML = '';

    tracks.forEach(track => {
        const trackRow = document.createElement('div');
        trackRow.className = 'track-row';
        trackRow.setAttribute('data-id', track.id);

        sections.forEach((section, index) => {
            const cell = document.createElement('div');
            cell.className = 'track-cell';
            cell.style.backgroundColor = section.color;
            cell.style.width = `${section.width}px`;
            cell.setAttribute('data-width', section.width);

            const textarea = document.createElement('textarea');
            textarea.value = track.cells[index] || '';

            textarea.placeholder = `Some description for ${track.name} on ${section.name}...`;

            textarea.addEventListener('input', function () {
                track.cells[index] = this.value;

                updateTrackRowHeight(track.id);
            });

            cell.appendChild(textarea);
            trackRow.appendChild(cell);
        });

        tracksContainer.appendChild(trackRow);

        setTimeout(() => {
            updateTrackRowHeight(track.id);
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

    // Создаем массив описаний в нужном формате
    const descriptions = [];

    tracks.forEach((track, trackIndex) => {
        sections.forEach((section, sectionIndex) => {
            const description = track.cells[sectionIndex] || '';
            if (description.trim() !== '') {
                descriptions.push({
                    sectionNumber: sectionIndex + 1,
                    trackNumber: trackIndex + 1,
                    description: description
                });
            }
        });
    });

    const exportData = {
        settings: {
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
        tracks: tracks.map((track, index) => ({
            number: index + 1,
            name: track.name,
            sound: track.sound,
            comment: track.comment || ''
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

    // Сброс значения input
    event.target.value = '';
}

function importTrackData(data, fileName) {
    // Валидация структуры
    const validation = validateImportData(data);
    if (!validation.isValid) {
        alert(validation.message);
        return;
    }

    // Извлечение имени трека из имени файла
    let trackName = extractTrackNameFromFileName(fileName);

    // Применение данных
    applyImportedData(data);

    // Установка имени трека
    setTrackTitle(trackName);

    alert(`File '${fileName}' imported successfully`);
}

function validateImportData(data) {
    const missingAttributes = [];
    const invalidAttributes = [];

    // Проверка корневых атрибутов
    if (!data.settings) missingAttributes.push('settings');
    if (!data.sections) missingAttributes.push('sections');
    if (!data.tracks) missingAttributes.push('tracks');
    if (!data.descriptions) missingAttributes.push('descriptions');

    if (missingAttributes.length > 0) {
        return {
            isValid: false,
            message: `Invalid file structure. Missed required attribute(-s): ${missingAttributes.join(', ')}`
        };
    }

    // Валидация настроек
    if (typeof data.settings !== 'object') {
        invalidAttributes.push('settings (should be object)');
    } else {
        // showTimeline
        if (typeof data.settings.showTimeline !== 'boolean') {
            invalidAttributes.push('settings.showTimeline (should be boolean)');
        }
        
        // bpm
        if (typeof data.settings.bpm !== 'number' || !Number.isInteger(data.settings.bpm) || 
            data.settings.bpm < 1 || data.settings.bpm > 256) {
            invalidAttributes.push('settings.bpm (should be integer between 1 and 256)');
        }
        
        // signatureNumerator
        if (typeof data.settings.signatureNumerator !== 'number' || !Number.isInteger(data.settings.signatureNumerator) || 
            data.settings.signatureNumerator < 1 || data.settings.signatureNumerator > 8) {
            invalidAttributes.push('settings.signatureNumerator (should be integer between 1 and 8)');
        }
        
        // signatureDenominator
        const validDenominators = [1, 2, 4, 8];
        if (typeof data.settings.signatureDenominator !== 'number' || !Number.isInteger(data.settings.signatureDenominator) || 
            !validDenominators.includes(data.settings.signatureDenominator)) {
            invalidAttributes.push('settings.signatureDenominator (should be one of: 1, 2, 4, 8)');
        }
    }

    // Валидация секций
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

    // Валидация дорожек
    if (Array.isArray(data.tracks)) {
        data.tracks.forEach((track, index) => {
            const path = `tracks[${index}]`;

            if (typeof track.number !== 'number' || !Number.isInteger(track.number) || track.number <= 0) {
                invalidAttributes.push(`${path}.number`);
            }
            if (typeof track.name !== 'string') {
                invalidAttributes.push(`${path}.name`);
            }
            if (typeof track.sound !== 'string') {
                invalidAttributes.push(`${path}.sound`);
            }
            if (track.hasOwnProperty('comment') && typeof track.comment !== 'string') {
                invalidAttributes.push(`${path}.comment`);
            }
        });
    } else {
        invalidAttributes.push('tracks (should be array)');
    }

    // Валидация описаний
    if (Array.isArray(data.descriptions)) {
        data.descriptions.forEach((desc, index) => {
            const path = `descriptions[${index}]`;

            if (typeof desc.sectionNumber !== 'number' || !Number.isInteger(desc.sectionNumber) || desc.sectionNumber <= 0) {
                invalidAttributes.push(`${path}.sectionNumber`);
            }
            if (typeof desc.trackNumber !== 'number' || !Number.isInteger(desc.trackNumber) || desc.trackNumber <= 0) {
                invalidAttributes.push(`${path}.trackNumber`);
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
    // Удаляем расширение .json
    let nameWithoutExtension = fileName.replace(/\.json$/, '');

    // Ищем подстроку "_structure"
    const structureIndex = nameWithoutExtension.indexOf('_structure');

    if (structureIndex !== -1) {
        // Если найдено "_structure", берем подстроку до него
        return nameWithoutExtension.substring(0, structureIndex);
    } else {
        // Иначе берем полное имя файла (без расширения)
        return nameWithoutExtension;
    }
}

function applyImportedData(data) {
    // Применяем настройки
    applySettings(data.settings);
    
    // Очистка текущих данных
    sections = [];
    tracks = [];

    // Сортировка и импорт секций
    const sortedSections = data.sections.sort((a, b) => a.number - b.number);
    sortedSections.forEach(section => {
        addSection({
            Name: section.name,
            Color: section.color,
            Duration: section.duration,
            Comment: section.comment || ''
        });
    });

    // Сортировка и импорт дорожек
    const sortedTracks = data.tracks.sort((a, b) => a.number - b.number);
    sortedTracks.forEach(trackData => {
        const track = {
            id: Date.now() + Math.random(),
            name: trackData.name,
            sound: trackData.sound,
            comment: trackData.comment || '',
            height: 50,
            cells: Array(sections.length).fill('')
        };
        tracks.push(track);
    });

    // Импорт описаний
    data.descriptions.forEach(desc => {
        const sectionIndex = desc.sectionNumber - 1;
        const trackIndex = desc.trackNumber - 1;

        if (sectionIndex >= 0 && sectionIndex < sections.length &&
            trackIndex >= 0 && trackIndex < tracks.length) {
            tracks[trackIndex].cells[sectionIndex] = desc.description;
        }
    });

    // Обновление интерфейса
    renderSections();
    updateBars();
    updateTimeline();
    renderTrackHeaders();
    renderTracks();
    updateScrollShadows();
}

function applySettings(settings) {
    // Применяем настройки к элементам управления
    document.getElementById('showTimeline').checked = settings.showTimeline;
    document.getElementById('bpm').value = settings.bpm;
    document.getElementById('signatureTop').value = settings.signatureNumerator;
    document.getElementById('signatureBottom').value = settings.signatureDenominator;
    
    // Обновляем видимость таймлайна
    updateTimelineVisibility();
    
    // Обновляем таймлайн (если он видим)
    if (settings.showTimeline) {
        updateTimeline();
    }
}

function setTrackTitle(trackName) {
    const trackTitleElement = document.getElementById('trackTitle');
    if (!trackTitleElement) return;

    // Проверяем, находится ли элемент в режиме редактирования
    const input = trackTitleElement.querySelector('input');
    if (input) {
        // Если в режиме редактирования, обновляем значение input
        input.value = trackName;
    } else {
        // Иначе обновляем текст в span
        const span = trackTitleElement.querySelector('span');
        if (span) {
            span.textContent = trackName;
        }
    }
}

function resetTrack() {
    // Очистка данных
    sections = [];
    tracks = [];

    // Сброс заголовка
    setTrackTitle("New track");

    // Обновление интерфейса
    renderSections();
    updateBars();
    updateTimeline();
    renderTrackHeaders();
    renderTracks();
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

    // Добавляем секцию в конец списка
    sections.push(copiedSection);

    // Копируем содержимое ячеек для всех дорожек
    const originalSectionIndex = sections.findIndex(s => s.id === sectionId);
    tracks.forEach(track => {
        if (track.cells.length > originalSectionIndex) {
            const cellContent = track.cells[originalSectionIndex];
            track.cells.push(cellContent);
        } else {
            track.cells.push('');
        }
    });

    // Обновляем интерфейс
    renderSections();
    updateBars();
    updateTimeline();
    renderTracks();
    updateScrollShadows();
}

function copyTrack(trackId) {
    const originalTrack = tracks.find(t => t.id === trackId);
    if (!originalTrack) return;

    // Создаем глубокую копию дорожки
    const copiedTrack = {
        id: Date.now() + Math.random(),
        name: `${originalTrack.name} (copy)`,
        sound: originalTrack.sound,
        comment: originalTrack.comment,
        height: originalTrack.height,
        cells: [...originalTrack.cells] // копируем массив ячеек
    };

    // Добавляем дорожку в конец списка
    tracks.push(copiedTrack);

    // Обновляем интерфейс
    renderTrackHeaders();
    renderTracks();
    updateScrollShadows();
}