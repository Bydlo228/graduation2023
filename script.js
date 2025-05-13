// Настройки
const VIDEO_QUALITY = '720p'; // Для будущего использования
const MAX_ATTEMPTS = 3;

// Инициализация данных
let students = {};
let studentsLoaded = false;

// Элементы
const form = document.getElementById('accessForm');
const input = document.getElementById('surname');
const videoContainer = document.getElementById('videoContainer');
const backgroundMusic = document.getElementById('backgroundMusic');
const muteButton = document.getElementById('muteButton');

// Состояние звука
let isMuted = false;

// Загрузка данных студентов при фокусе на поле ввода
input.addEventListener('focus', async () => {
    if (!studentsLoaded) {
        try {
            students = await fetch('students.json').then(response => response.json());
            studentsLoaded = true;
            console.log('Данные студентов загружены.');
        } catch (error) {
            console.error('Ошибка загрузки данных студентов:', error);
            alert('Произошла ошибка при загрузке данных. Попробуйте позже.');
        }
    }
});

// Обработчик отправки формы
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const surname = input.value.trim().toLowerCase();
    input.classList.remove('error');
    videoContainer.innerHTML = '';

    if (!surname) return;

    try {
        if (!students[surname]) {
            throw new Error('Фамилия не найдена');
        }

        const student = students[surname];
        const video = createVideoElement(student.video);
        
        // Показываем контент
        videoContainer.append(
            createGreetingElement(student.name),
            video
        );
        
        input.value = '';
        
        // Ленивая загрузка видео
        video.addEventListener('canplay', () => {
            video.style.opacity = 1;
            video.play();
            addShareButton(video.src); // Добавляем кнопку "Поделиться"
        });

    } catch (error) {
        handleError(error, input);
    }
});

// Создание элементов
function createGreetingElement(name) {
    const greeting = document.createElement('h2');
    greeting.className = 'greeting animate__animated animate__bounceIn';
    greeting.textContent = `Привет, ${name}!`;
    return greeting;
}

function createVideoElement(src) {
    const video = document.createElement('video');
    video.className = 'animate__animated animate__zoomIn';
    video.src = `${src}?q=${VIDEO_QUALITY}`; // Для управления качеством
    video.controls = true;
    video.preload = 'auto';
    video.loading = 'lazy';
    video.style.opacity = 0;
    video.onerror = () => handleError(new Error('Ошибка загрузки видео'), video);
    
    // Управление звуком
    video.onplay = () => backgroundMusic.pause();
    video.onpause = () => !isMuted && backgroundMusic.play();
    
    return video;
}

// Обработка ошибок
function handleError(error, element) {
    console.error(error);
    element.classList.add('error');
    
    if (element === input) {
        setTimeout(() => input.classList.remove('error'), 1000);
        alert('Фамилия не найдена. Попробуйте еще раз!');
    } else {
        videoContainer.innerHTML = '<p>Ошибка загрузки видео. Попробуйте позже.</p>';
        backgroundMusic.play();
    }
}

// Управление звуком
muteButton.addEventListener('click', () => {
    isMuted = !isMuted;
    backgroundMusic.muted = isMuted;
    muteButton.textContent = isMuted ? '🔇' : '🔊';
});

// Мобильные улучшения
document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('touchstart', () => {});
});

// Кнопка "Поделиться"
function addShareButton(videoUrl) {
    if (navigator.share) {
        const shareButton = document.createElement('button');
        shareButton.textContent = 'Поделиться';
        shareButton.style.marginTop = '10px';
        shareButton.style.padding = '10px 20px';
        shareButton.style.background = '#ff6f61';
        shareButton.style.color = 'white';
        shareButton.style.border = 'none';
        shareButton.style.borderRadius = '5px';
        shareButton.style.cursor = 'pointer';

        shareButton.addEventListener('click', () => {
            navigator.share({
                title: 'Выпускной 2025',
                text: 'Посмотрите моё персональное поздравление!',
                url: videoUrl || window.location.href,
            });
        });

        videoContainer.appendChild(shareButton);
    }
}
