const standardSections = [
    { "Name": "Intro", "Color": "#DAE8FC", "Duration": 4 },
    { "Name": "Verse", "Color": "#D5E8D4", "Duration": 8 },
    { "Name": "Bridge", "Color": "#FFF2CC", "Duration": 4 },
    { "Name": "Chorus", "Color": "#FFE6CC", "Duration": 8 },
    { "Name": "Tag", "Color": "#F8CECC", "Duration": 4 },
    { "Name": "Middle 8", "Color": "#F5F5F5", "Duration": 8 },
    { "Name": "Outro", "Color": "#E1D5E7", "Duration": 4 }
];

let sections = [];
let tracks = [];
let currentEditingSection = null;

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

    addSection({ "Name": "Intro", "Color": "#DAE8FC", "Duration": 4 });
    addSection({ "Name": "Verse", "Color": "#D5E8D4", "Duration": 8 });
    addSection({ "Name": "Chorus", "Color": "#FFE6CC", "Duration": 8 });

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

        if (scrollableToTop) shadowClass += '-top';
        if (scrollableToBottom) shadowClass += "-bottom";
        if (scrollableToLeft) shadowClass += "-left";
        if (scrollableToRight) shadowClass += "-right";
        
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
        { name: "Drums", height: 50 },
        { name: "Guitar", height: 50 },
        { name: "Bass", height: 50 },
        { name: "Voice", height: 50 }
    ];

    defaultTracks.forEach(trackData => {
        const track = {
            id: Date.now() + Math.random(),
            name: trackData.name,
            height: trackData.height,
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
    const duration = parseInt(document.getElementById('sectionDuration').value);

    const section = {
        Name: name,
        Color: color,
        Duration: duration
    };

    addSection(section);
    closeCustomSectionModal();

    document.getElementById('sectionName').value = '';
    document.getElementById('sectionColor').value = '#daa520';
    document.getElementById('sectionDuration').value = 4;
}

function addSection(sectionData) {
    const section = {
        id: Date.now() + Math.random(),
        name: sectionData.Name,
        color: sectionData.Color,
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

    sections.forEach(section => {
        const sectionElement = document.createElement('div');
        sectionElement.className = 'section';
        sectionElement.style.backgroundColor = section.color;
        sectionElement.style.width = `${section.width}px`;
        sectionElement.setAttribute('data-id', section.id);
        sectionElement.setAttribute('data-width', section.width);

        const nameElement = document.createElement('div');
        nameElement.className = 'section-name';
        nameElement.textContent = section.name;

        const durationElement = document.createElement('div');
        durationElement.className = 'section-duration';
        durationElement.textContent = `Bars: ${section.duration}`;

        sectionElement.appendChild(nameElement);
        sectionElement.appendChild(durationElement);

        const sectionControls = document.createElement('div');
        sectionControls.className = 'section-controls';

        const editBtn = document.createElement('button');
        editBtn.className = 'section-control';
        editBtn.textContent = '✏️';
        editBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            showEditSectionModal(section);
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'section-control';
        deleteBtn.textContent = '🗑️';
        deleteBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            deleteSection(section.id);
        });

        sectionControls.appendChild(editBtn);
        sectionControls.appendChild(deleteBtn);
        sectionElement.appendChild(sectionControls);

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
    const duration = parseInt(document.getElementById('editSectionDuration').value);

    currentEditingSection.name = name;
    currentEditingSection.color = color;
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

        const contentDiv = document.createElement('div');
        contentDiv.className = 'track-header-content';

        const trackNumber = document.createElement('div');
        trackNumber.className = 'track-number';
        trackNumber.textContent = index + 1;

        trackHeader.appendChild(trackNumber);

        const nameTextarea = document.createElement('textarea');
        nameTextarea.className = 'track-name';
        nameTextarea.value = track.name;

        nameTextarea.addEventListener('input', function () {
            track.name = this.value;

            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';

            updateTrackRowHeight(track.id);

            updateTrackPlaceholders(track.id);
        });

        setTimeout(() => {
            nameTextarea.style.height = 'auto';
            nameTextarea.style.height = nameTextarea.scrollHeight + 'px';

            updateTrackRowHeight(track.id);
        }, 0);

        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'track-controls';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-track-btn';
        deleteBtn.textContent = '🗑️';
        deleteBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            deleteTrack(track.id);
        });

        controlsDiv.appendChild(deleteBtn);
        contentDiv.appendChild(nameTextarea);
        contentDiv.appendChild(controlsDiv);
        trackHeader.appendChild(contentDiv);

        trackHeadersContainer.appendChild(trackHeader);
    });

    updateScrollShadows();
}

function updateTrackRowHeight(trackId) {
    const trackHeader = document.querySelector(`.track-header[data-id="${trackId}"]`);
    const trackRow = document.querySelector(`.track-row[data-id="${trackId}"]`);
    const track = tracks.find(t => t.id === trackId);

    if (!trackHeader || !trackRow || !track) return;

    const headerTextarea = trackHeader.querySelector('.track-name');
    const headerHeight = headerTextarea ? headerTextarea.scrollHeight + 10 : 50;

    let maxCellHeight = 50;

    const cellTextareas = trackRow.querySelectorAll('textarea');
    cellTextareas.forEach(textarea => {
        textarea.style.height = 'auto';
        const calculatedHeight = textarea.scrollHeight + 8;

        if (calculatedHeight > maxCellHeight) {
            maxCellHeight = calculatedHeight;
        }

        textarea.style.height = `${calculatedHeight}px`;
    });

    const finalHeight = Math.max(headerHeight, maxCellHeight, 50);

    trackHeader.style.height = `${finalHeight}px`;
    trackRow.style.height = `${finalHeight}px`;
    track.height = finalHeight;

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