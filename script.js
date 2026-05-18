// Datas importantes
const dates = {
    firstChat: new Date('2024-01-19'), // Primeira conversa
    firstMeeting: new Date('2024-02-08'), // Primeiro encontro
    anniversary: new Date('2024-05-19') // Pedido de namoro
};

// Carregar dados ao abrir a página
document.addEventListener('DOMContentLoaded', () => {
    updateCounters();
    loadPhotos();
    loadSidePhotos();
    setupTabNavigation();
    setupPhotoInputs();
    setupMediaTypeSelector();
    setInterval(updateCounters, 1000); // Atualizar a cada segundo
});

// Função para obter a hora atual em Brasília
function getCurrentBrasiliaTime() {
    // Cria uma data no fuso horário de Brasília
    const formatter = new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    
    const parts = formatter.formatToParts(new Date());
    const dateObj = {};
    
    parts.forEach(part => {
        dateObj[part.type] = part.value;
    });
    
    return new Date(
        dateObj.year,
        parseInt(dateObj.month) - 1,
        dateObj.day,
        dateObj.hour,
        dateObj.minute,
        dateObj.second
    );
}

// Função para calcular dias, horas e minutos
function calculateTimeElapsed(startDate) {
    const today = getCurrentBrasiliaTime();
    const timeDiff = today - startDate;
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { days, hours, minutes };
}

// Atualizar contadores
function updateCounters() {
    const time1 = calculateTimeElapsed(dates.firstChat);
    const time2 = calculateTimeElapsed(dates.firstMeeting);
    const time3 = calculateTimeElapsed(dates.anniversary);
    
    document.getElementById('counter1').textContent = `${time1.days} dias ${time1.hours} horas e ${time1.minutes} minutos`;
    document.getElementById('counter2').textContent = `${time2.days} dias ${time2.hours} horas e ${time2.minutes} minutos`;
    document.getElementById('counter3').textContent = `${time3.days} dias ${time3.hours} horas e ${time3.minutes} minutos`;
}

// Navegação entre abas
function setupTabNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Esconder todas as abas
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remover classe active de todos os botões
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Mostrar aba selecionada
    document.getElementById(tabName).classList.add('active');

    // Adicionar classe active ao botão correspondente
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}

// Configurar seletor de tipo de mídia
function setupMediaTypeSelector() {
    const mediaTypeRadios = document.querySelectorAll('input[name="mediaType"]');
    const photoInput = document.getElementById('photoInput');
    const videoInput = document.getElementById('videoInput');

    mediaTypeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'photo') {
                photoInput.style.display = 'block';
                videoInput.style.display = 'none';
                photoInput.required = true;
                videoInput.required = false;
            } else {
                photoInput.style.display = 'none';
                videoInput.style.display = 'block';
                photoInput.required = false;
                videoInput.required = true;
            }
        });
    });
}

// Adicionar mídia ao álbum
function addMedia() {
    const photoInput = document.getElementById('photoInput');
    const videoInput = document.getElementById('videoInput');
    const descriptionInput = document.getElementById('descriptionInput');
    const mediaType = document.querySelector('input[name="mediaType"]:checked').value;

    const fileInput = mediaType === 'photo' ? photoInput : videoInput;

    if (!fileInput.files[0]) {
        alert(`Por favor, selecione uma ${mediaType === 'photo' ? 'foto' : 'vídeo'}!`);
        return;
    }

    if (!descriptionInput.value.trim()) {
        alert('Por favor, descreva esse momento especial!');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const media = {
            id: Date.now(),
            data: e.target.result,
            description: descriptionInput.value.trim(),
            type: mediaType
        };

        // Salvar no localStorage
        let medias = JSON.parse(localStorage.getItem('medias')) || [];
        medias.push(media);
        localStorage.setItem('medias', JSON.stringify(medias));

        // Limpar inputs
        photoInput.value = '';
        videoInput.value = '';
        descriptionInput.value = '';

        // Recarregar galeria
        loadPhotos();
    };

    reader.readAsDataURL(fileInput.files[0]);
}

// Carregar fotos e vídeos da galeria
function loadPhotos() {
    const gallery = document.getElementById('gallery');
    const medias = JSON.parse(localStorage.getItem('medias')) || [];
    // Compatibilidade com dados antigos (fotos antigas)
    const oldPhotos = JSON.parse(localStorage.getItem('photos')) || [];
    const allMedias = [
        ...medias,
        ...oldPhotos.map(photo => ({
            id: photo.id,
            data: photo.image,
            description: photo.description,
            type: 'photo'
        }))
    ].sort((a, b) => b.id - a.id);

    gallery.innerHTML = '';

    if (allMedias.length === 0) {
        gallery.innerHTML = '<div class="empty-gallery">Comece a adicionar fotos e vídeos de seus momentos especiais! 💕</div>';
        return;
    }

    allMedias.forEach(media => {
        const polaroid = document.createElement('div');
        polaroid.className = 'polaroid';
        
        let mediaContent = '';
        if (media.type === 'photo') {
            mediaContent = `<img src="${media.data}" alt="Momento" class="polaroid-image">`;
        } else if (media.type === 'video') {
            mediaContent = `<video src="${media.data}" class="polaroid-image" controls></video>`;
        }

        polaroid.innerHTML = `
            ${mediaContent}
            <p class="polaroid-description">${media.description}</p>
            <button class="delete-btn" onclick="deletePhoto(${media.id})" title="Deletar">✕</button>
        `;
        gallery.appendChild(polaroid);
    });
}

// Deletar foto ou vídeo
function deletePhoto(mediaId) {
    if (confirm('Tem certeza que deseja deletar esta mídia?')) {
        let medias = JSON.parse(localStorage.getItem('medias')) || [];
        medias = medias.filter(media => media.id !== mediaId);
        localStorage.setItem('medias', JSON.stringify(medias));
        
        // Tentar deletar de fotos antigas também
        let oldPhotos = JSON.parse(localStorage.getItem('photos')) || [];
        oldPhotos = oldPhotos.filter(photo => photo.id !== mediaId);
        localStorage.setItem('photos', JSON.stringify(oldPhotos));
        
        loadPhotos();
    }
}

// Configurar inputs de foto dos lados
function setupPhotoInputs() {
    // Foto esquerda
    const leftInput = document.getElementById('leftPhotoInput');
    leftInput.addEventListener('change', (e) => {
        handleSidePhotoUpload(e, 'leftPhoto', 'left');
    });

    // Foto direita
    const rightInput = document.getElementById('rightPhotoInput');
    rightInput.addEventListener('change', (e) => {
        handleSidePhotoUpload(e, 'rightPhoto', 'right');
    });
}

function handleSidePhotoUpload(event, photoId, side) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = document.getElementById(photoId);
        const placeholder = document.querySelector(`.${side}-side .photo-placeholder`);

        img.src = e.target.result;
        img.style.display = 'block';
        placeholder.style.display = 'none';

        // Salvar no localStorage
        localStorage.setItem(`sidePhoto_${side}`, e.target.result);
    };

    reader.readAsDataURL(file);
}

// Carregar fotos dos lados
function loadSidePhotos() {
    const leftPhoto = localStorage.getItem('sidePhoto_left');
    const rightPhoto = localStorage.getItem('sidePhoto_right');

    if (leftPhoto) {
        const leftImg = document.getElementById('leftPhoto');
        leftImg.src = leftPhoto;
        leftImg.style.display = 'block';
        document.querySelector('.left-side .photo-placeholder').style.display = 'none';
        document.getElementById('leftRemoveBtn').style.display = 'flex';
    }

    if (rightPhoto) {
        const rightImg = document.getElementById('rightPhoto');
        rightImg.src = rightPhoto;
        rightImg.style.display = 'block';
        document.querySelector('.right-side .photo-placeholder').style.display = 'none';
        document.getElementById('rightRemoveBtn').style.display = 'flex';
    }
}

// Remover foto do lado
function removePhoto(side) {
    const photoId = side === 'left' ? 'leftPhoto' : 'rightPhoto';
    const img = document.getElementById(photoId);
    const placeholder = document.querySelector(`.${side}-side .photo-placeholder`);
    const removeBtn = document.getElementById(`${side}RemoveBtn`);
    
    img.src = '';
    img.style.display = 'none';
    placeholder.style.display = 'flex';
    removeBtn.style.display = 'none';
    
    localStorage.removeItem(`sidePhoto_${side}`);
}
