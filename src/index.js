import { Notify } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';

const inputField = document.querySelector('input');
const form = document.querySelector('.search-form');
const listOfGallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

loadMoreBtn.style.display = 'none';

const BASE_URL = 'https://pixabay.com/api/';
const API = '30800169-3713389dad872250f057e0e33';

let pageToFetch = 0;
let keyword = '';
let rest = 0;

let gallery = new SimpleLightbox('.gallery a', {
  enableKeboard: true,
  docClose: true,
  overlay: true,
  nav: true,
  close: true,
  showCounter: true,
});

form.addEventListener('submit', onSubmit);

async function onSubmit(event) {
  event.preventDefault();

  listOfGallery.innerHTML = '';
  pageToFetch = 1;

  keyword = inputField.value;
  const result = keyword.trim();

  if (result === '') {
    loadMoreBtn.style.display = 'none';
    return Notify.failure('Input field has no value');
  }
  try {
    const response = await axios.get(`${BASE_URL}`, {
      params: {
        key: API,
        q: result,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: pageToFetch,
        per_page: 40,
      },
    });

    const elements = response.data.hits;
    const totalHits = response.data.totalHits;

    if (elements.length === 0) {
      loadMoreBtn.style.display = 'none';
      return Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }

    Notify.info(`Hooray! We found ${totalHits} images.`);

    rest += 40;
    if (rest <= totalHits) {
      return renderList(elements);
    }

    loadMoreBtn.style.display = 'none';
    Notify.failure(
      "We're sorry, but you've reached the end of search results."
    );
  } catch (error) {
    console.error(error);
  }
}

async function renderList(elements) {
  const markup = await elements
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) =>
        `<a href="${largeImageURL}">
      <div class="photo-card">
  <img src="${webformatURL}" alt="${tags}" loading="lazy" />
  <div class="info">
    <p class="info-item">
      <b>Likes</b><span class='likes'>${likes}</span>
    </p>
    <p class="info-item">
      <b>Views</b><span class='views'>${views}</span>
    </p>
    <p class="info-item">
      <b>Comments</b><span class='comments'>${comments}</span>
    </p>
    <p class="info-item">
      <b>Downloads</b><span class='downloads'>${downloads}</span>
    </p>
  </div>
</div>
</a>`
    )
    .join('');

  listOfGallery.insertAdjacentHTML('beforeend', markup);

  gallery.refresh();

  loadMoreBtn.style.display = '';
  loadMoreBtn.addEventListener('click', fetchMoreItems);
}

async function fetchMoreItems(event) {
  event.preventDefault();

  pageToFetch += 1;
  keyword = inputField.value;
  const result = keyword.trim();

  try {
    const response = await axios.get(`${BASE_URL}`, {
      params: {
        key: API,
        q: result,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: pageToFetch,
        per_page: 40,
      },
    });

    const elements = response.data.hits;
    const totalHits = response.data.totalHits;

    rest += 40;
    console.log(rest);
    if (rest <= totalHits) {
      return renderList(elements);
    }
    loadMoreBtn.style.display = 'none';
    Notify.failure(
      "We're sorry, but you've reached the end of search results."
    );
  } catch (error) {
    console.error(error);
  }
}

// В ответе будет массив изображений удовлетворивших критериям параметров запроса.
// Каждое изображение описывается объектом, из которого тебе интересны только
// следующие свойства:
// webformatURL - ссылка на маленькое изображение для списка карточек.
// largeImageURL - ссылка на большое изображение.
// tags - строка с описанием изображения. Подойдет для атрибута alt.
// likes - количество лайков.
// views - количество просмотров.
// comments - количество комментариев.
// downloads - количество загрузок.

// Если бэкенд возвращает пустой массив, значит ничего подходящего найдено небыло.
// В таком случае показывай уведомление с текстом "Sorry, there are no images
//matching your search query.Please try again.".

//Для уведомлений используй библиотеку notiflix.
// Элемент div.gallery изначально есть в HTML документе, и в него необходимо рендерить
// разметку карточек изображений.При поиске по новому ключевому слову необходимо
// полностью очищать содержимое галереи, чтобы не смешивать результаты.
// Шаблон разметки карточки одного изображения для галереи.
/* <div class="photo-card">
  <img src="" alt="" loading="lazy" />
  <div class="info">
    <p class="info-item">
      <b>Likes</b>
    </p>
    <p class="info-item">
      <b>Views</b>
    </p>
    <p class="info-item">
      <b>Comments</b>
    </p>
    <p class="info-item">
      <b>Downloads</b>
    </p>
  </div>
</div>; */
// }

// ПАГИНАЦИЯ
// Pixabay API поддерживает пагинацию и предоставляет параметры page и per_page.
// Сделай так, чтобы в каждом ответе приходило 40 объектов(по умолчанию 20).

// Изначально значение параметра page должно быть 1.
// При каждом последующем запросе, его необходимо увеличить на 1.
// При поиске по новому ключевому слову значение page надо вернуть в исходное,
//так как будет пагинация по новой коллекции изображений.

// разметка кнопки load more
// Изначально кнопка должна быть скрыта.
// После первого запроса кнопка появляется в интерфейсе под галереей.
// При повторном сабмите формы кнопка сначала прячется, а после запроса опять отображается.

// В ответе бэкенд возвращает свойство totalHits - общее количество изображений
// которые подошли под критерий поиска(для бесплатного аккаунта).
// Если пользователь дошел до конца коллекции, пряч кнопку и выводи уведомление
//  с текстом "We're sorry, but you've reached the end of search results.".

// Уведомление​
// После первого запроса при каждом новом поиске выводить уведомление в котором
// будет написано сколько всего нашли изображений(свойство totalHits).
// Текст уведомления "Hooray! We found totalHits images."

// Библиотека SimpleLightbox
// Добавить отображение большой версии изображения с библиотекой SimpleLightbox
//для полноценной галереи.

// В разметке необходимо будет обернуть каждую карточку изображения в ссылку,
//как указано в документации.
// У библиотеки есть метод refresh() который обязательно нужно вызывать каждый раз
// после добавления новой группы карточек изображений.

// Прокрутка страницы​
// Сделать плавную прокрутку страницы после запроса и отрисовки каждой следующей
// группы изображений.Вот тебе код подсказка, а разберись в нём самостоятельно.

// const { height: cardHeight } = document
//   .querySelector('.gallery')
//   .firstElementChild.getBoundingClientRect();

// window.scrollBy({
//   top: cardHeight * 2,
//   behavior: 'smooth',
// });

// Бесконечный скролл​
// Вместо кнопки «Load more» можно сделать бесконечную загрузку изображений при
// прокрутке страницы.Мы предоставлям тебе полную свободу действий в реализации,
// можешь использовать любые библиотеки.
