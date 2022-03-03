import { buscarAlbumsPorArtista, getAlbumCover, buscarPorArtista } from './fetch/index.js';
import { Libreria } from './clases.js';

const [ divBusqueda, divLibreria ] = document.getElementsByClassName("libreria__container");
const buscarAlbumBtn = document.getElementById("buscarAlbumBtn");
const [inputArtista] = document.querySelectorAll("#searchArtistForm input");
const busquedaBtn = document.getElementById('busqueda');
const libreriaBtn = document.getElementById('libreria');
const sectionBusquedaUl = document.querySelector("#sectionBusqueda ul");
const modal = document.getElementById('modal');
const closeModalBtn = document.getElementById('modal__close');
const [ tooltipHelpBtn, tooltipCloseBtn, ...tooltips ] = document.querySelectorAll('.genericButton .tooltip');
const modalHelpBtn = document.getElementById('modal__help');
const checkboxModal = document.getElementById('checkbox');

// ======== LISTENERS ========
const helperFn = function(aux = 0, timeout) {
    const handler = function() {
        modalHelpBtn.removeEventListener('click', handler);
        tooltips.forEach(tooltip => {
            setTimeout(() => {
                tooltip.parentElement.style.boxShadow = '0px 0px 5px 0px rgba(255, 255, 255, 0.5)';
                tooltip.parentElement.style.color = 'white';
                tooltip.style.visibility = 'visible';
                tooltip.style.opacity = 1;
            }, aux * 1000);
            aux++;
            setTimeout(() => {
                tooltip.parentElement.style = null;
                tooltip.style = null;
            }, aux * 1000);    
        });
        setTimeout(() => {
            modalHelpBtn.addEventListener('click', helperFn(0, timeout));
        }, tooltips.length * timeout)
    };
    return handler;
};
modalHelpBtn.addEventListener('click', helperFn(0, 1000));

libreriaBtn.addEventListener('click', () => {
    if(divBusqueda.style.display === 'none'){ return; }
    divLibreria.style.display = 'grid';
    libreriaBtn.style.color = 'white';
    divBusqueda.style.display = 'none';
    busquedaBtn.style.color = null;
    divLibreria.textContent = "";
    if(libreria.albums.length === 0){
        const infoH2 = document.createElement('h2');
        infoH2.textContent = 'No has agregado albumes a favoritos.';
        divLibreria.appendChild(infoH2);
        return;
    }
    libreria.albums.forEach(({id, albumName, artist, year}) => {
        divLibreria.appendChild(newAlbumStructure(id, albumName, artist, year, false));
    });
});

busquedaBtn.addEventListener('click', () => {
    inputArtista.focus();
    if(divBusqueda.style.display === 'grid'){ return; } 
    divBusqueda.style.display = 'grid';
    busquedaBtn.style.color = 'white';
    libreriaBtn.style.color = null;
    divLibreria.style.display = 'none';
});

buscarAlbumBtn.addEventListener("click", (e) => {
    e.preventDefault();
    let artist = inputArtista.value;
    if (!validateInput(artist)) { return; }
    (async function asyncBuscarPorArtista() {
       let data = await buscarPorArtista(artist);
       actualizarVistaBusqueda(data.artists);
    })();
});

// ====== FUNCTIONS ======
function actualizarVistaBusqueda(artists) {
    sectionBusquedaUl.textContent = "";
    artists.forEach((artist) => {
        sectionBusquedaUl.appendChild( newArtistStructure(artist.name, artist.id) );
    });
}

function actualizarVistaLibreria(albums) {
    divBusqueda.textContent = "";
    albums.forEach(({ id, albumName, artist, year }) => {
        divBusqueda.appendChild( newAlbumStructure(id, albumName, artist, year) );
    });
}

function newArtistStructure(artist, artistId) {
    const div = document.createElement("div");
    const icon = document.createElement("i");
    div.classList.add("artistSearchResult");
    icon.className = "fas fa-angle-right";
    div.textContent = artist;
    div.appendChild(icon);
    div.onclick = async () => {
        let res = await buscarAlbumsPorArtista(artistId);
        const albums = Array.from(res['release-groups'], (album) => {
            const newObject = {};
            newObject.albumName = album['title'];
            newObject.artist = artist;
            newObject.year = album['first-release-date'].split('-')[0];
            newObject.id = album['id'];
            return newObject;
        });
        busquedaBtn.click();
        actualizarVistaLibreria(albums);
    };
    const li = document.createElement("li");
    li.appendChild(div);
    return li;
}

function newAlbumStructure(id, albumName, artist, year, isSearch = true) {
    const divContainer = document.createElement("div");
    const divContainerImg = document.createElement('div');
    const img = document.createElement("img");
    const divBody = document.createElement("div"); 
    const p = document.createElement("p");
    const paragraphText = document.createTextNode(`Album: ${albumName}, Artista: ${artist}, Año: ${year}`);
    divContainer.className = "album__container animate__animated animate__fadeIn";
    divBody.className = "album__body";
    img.className = "album__image";
    
    divContainerImg.appendChild(loader());

    (async function asyncGetCover() {
        try {
            let res = await getAlbumCover(id);
            img.src = res.images[0].thumbnails.small;
        } catch (error) {
            img.src = "https://upload.wikimedia.org/wikipedia/commons/3/35/Simple_Music.svg";
        }
        divContainerImg.appendChild(img);
        divContainerImg.children[0].remove();    
    })();

    const button = document.createElement('button');
    button.classList.add('albumBtn');
    const icon = document.createElement('i');

    if(isSearch){
        button.classList.add('agregarAlbumBoton');
        icon.className = libreria.findAlbumById(id) ? 'fa-solid fa-heart' : 'fa-solid fa-plus';
        button.onclick = () => {
            libreria.insertAlbum(id, albumName, artist, year);
            icon.className = 'fa-solid fa-heart';
        }    
    } else {
        button.classList.add('borrarAlbumBoton');
        icon.className = 'fa-solid fa-xmark';
        button.onclick = () => {
            button.parentElement.parentElement.classList.add("animate__fadeOut");
            button.onclick = null;
            libreria.deleteById(id);
            setTimeout(() => {
                button.parentElement.parentElement.remove();
            }, 1000);
        };   
    }

    button.appendChild(icon);   
    divBody.appendChild(button);
    p.appendChild(paragraphText);
    divBody.appendChild(p);
    divContainer.appendChild(divContainerImg);
    divContainer.appendChild(divBody);
    return divContainer;
}

//Validar que los inputs no esten vacios
function validateInput(...args) {
    return !Array.from(args, (el) => el.trim()).includes("");
}

// ====== MAIN ======
const libreria = new Libreria();

//Recuperar albumes de localstorage o crear nuevo item de albums
if (!localStorage.getItem("albums")) {
    localStorage.setItem("albums", JSON.stringify(new Array()));
} else {
    let albums = JSON.parse(localStorage.getItem("albums"));
    libreria.albums = albums;
}

//Modal explicativo inicial
if(!sessionStorage.getItem('modalRemove')){
    const closeModalFn = function() {
        const handler = function() {
            closeModalBtn.removeEventListener('click', handler);
            modal.remove();
            if(checkboxModal.checked){
                sessionStorage.setItem('modalRemove', true);
            }
        };
        return handler;
    };
    closeModalBtn.addEventListener('click', closeModalFn());

    document.addEventListener('click', (e) => {
        if(!e.target.closest('#modal')){
            modal.remove();
        }
        if(checkboxModal.checked){
            sessionStorage.setItem('modalRemove', true);
        }
    });
} else {
    modal.remove();
}

//Se guardan albumes en localstorage cuando se cierra o actualiza la ventana
window.onbeforeunload = () =>  {
    localStorage.setItem('albums', JSON.stringify(libreria.albums));
}

// Helper para animacion de loading
function loader() {
    const div = document.createElement('div');
    div.classList.add('lds-roller');
    for(let i = 0; i < 8; i++){
        div.appendChild(document.createElement('div'));
    }
    return div;
}


