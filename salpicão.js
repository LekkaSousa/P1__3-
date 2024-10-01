const listElement = document.getElementById('manga-list');
const detailElement = document.getElementById('manga-detail');
let currentPage = 1;
let isLoading = false;
let favoriteMangas = localStorage.getItem('favoriteMangas') ? localStorage.getItem('favoriteMangas').split(',') : [];
let mangaList = [];

async function loadMangas() {
  isLoading = true;
  try {
    const response = await fetch(`https://kitsu.io/api/edge/manga?page[limit]=20&page[offset]=${(currentPage - 1) * 20}`);
   
    const data = await response.json();
    const newMangaList = data.data;

    newMangaList.forEach(manga => {
      mangaList.push(manga);
    });

    renderMangas();
    currentPage++;
    isLoading = false;
  } catch (error) {
    console.error('Error:', error);
  }
}

async function buscarManga() {
    const filterValue = document.getElementById('procurar').value.toLowerCase().trim();
    
    if (!filterValue) {
      console.log();
      renderMangas();
      return;
    }
  
    try {
      const response = await fetch(`https://kitsu.io/api/edge/manga?filter[text]=${filterValue}&page[limit]=20`);
      const data = await response.json();
      const filteredMangas = data.data;
  
      if (filteredMangas.length > 0) {
        renderMangas(filteredMangas); 
      } else {
        console.log("Nenhum mangá encontrado.");
        renderMangas(); 
      }
    } catch (error) {
      console.error("Erro ao buscar mangás:", error);
      renderMangas(); 
    }
  }
  
  document.getElementById('buscar').onclick = async () => {
    await buscarManga();
  };
  
  

function renderMangas(mangas = mangaList) {
  listElement.innerHTML = ''; // Limpa a lista de mangás
  mangas.forEach(manga => {
    const listItem = document.createElement('li');
    const mangaImage = document.createElement('img');
    mangaImage.src = manga.attributes.posterImage.small;
    const mangaName = document.createElement('span');
    mangaName.textContent = manga.attributes.titles.en_jp;
    const favoriteCheckbox = document.createElement('input');
    favoriteCheckbox.type = 'checkbox';
    favoriteCheckbox.classList.add('favorite-checkbox');
    if (favoriteMangas.includes(manga.attributes.titles.en_jp)) {
      favoriteCheckbox.checked = true;
    }
    favoriteCheckbox.addEventListener('change', () => {
      if (favoriteCheckbox.checked) {
        if (!favoriteMangas.includes(manga.attributes.titles.en_jp)) {
          favoriteMangas.push(manga.attributes.titles.en_jp);
          localStorage.setItem('favoriteMangas', favoriteMangas.join(','));
          console.log("Manga adicionado:", manga.attributes.titles.en_jp);
        }
      } else {
        const index = favoriteMangas.indexOf(manga.attributes.titles.en_jp);
        if (index !== -1) {
          favoriteMangas.splice(index, 1);
          localStorage.setItem('favoriteMangas', favoriteMangas.join(','));
          console.log("Manga removido:", manga.attributes.titles.en_jp);
        }
      }
    });
    listItem.appendChild(favoriteCheckbox);
    listItem.appendChild(mangaImage);
    listItem.appendChild(mangaName);

    const mangaContent = document.createElement('div');
    mangaContent.classList.add('manga-content');
    mangaContent.innerHTML = `
      <h2>${manga.attributes.titles.en_jp}</h2>
      <p><img src="${manga.attributes.posterImage.small}" alt="${manga.attributes.titles.en_jp}"><p id="cf">${manga.attributes.ageRating}</p></p>
      <p><strong>Gênero:</strong> ${manga.attributes.subtype}</p>
      <p><strong>Sinopse:</strong> ${manga.attributes.synopsis}</p>
      <p><strong>Capitulos:</strong> ${manga.attributes.chapterCount}</p>
      <p><strong>Temporadas:</strong> ${manga.attributes.status}</p>
    `;
    listItem.appendChild(mangaContent);

    listItem.addEventListener('click', () => {
      if (event.target !== favoriteCheckbox) {
        if (listItem.classList.contains('active')) {
          listItem.classList.remove('active');
          mangaContent.classList.remove('expanded');
          mangaImage.classList.remove('hidden');
          mangaName.classList.remove('hidden');
        } else {
          listItem.classList.add('active');
          mangaContent.classList.add('expanded');
          mangaImage.classList.add('hidden');
          mangaName.classList.add('hidden');
        }
      }
    });
    listElement.appendChild(listItem);
  });
}

loadMangas();

listElement.addEventListener('scroll', () => {
  if (listElement.scrollTop + listElement.offsetHeight >= listElement.scrollHeight && !isLoading) {
    loadMangas();
  }
  });
document.getElementById('procurar').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      buscarManga();
    }
});

document.getElementById('buscar').addEventListener('click', buscarManga);