import { buscarAlbumsPorArtista, getAlbumCover, buscarPorArtista } from './fetch/index.js';
import { Libreria } from './clases.js';

const libreria = new Libreria();
const [ divBusqueda, divLibreria ] = document.getElementsByClassName("libreria__container");

const buscarAlbumBtn = document.getElementById("buscarAlbumBtn");
const [inputArtista] = document.querySelectorAll("#searchArtistForm input");

const busquedaBtn = document.getElementById('busqueda');
const libreriaBtn = document.getElementById('libreria');

const sectionBusquedaUl = document.querySelector("#sectionBusqueda ul");

// ======== Listeners ========
libreriaBtn.addEventListener('click', () => {
    if(divBusqueda.style.display === 'none'){
        return;
    }
    divLibreria.style.display = 'grid';
    libreriaBtn.style.color = 'white';

    divBusqueda.style.display = 'none';
    busquedaBtn.style.color = '';

    divLibreria.innerHTML = "";
    libreria.albums.forEach(({id, albumName, artist, year}) => {
        divLibreria.appendChild(newAlbumStructure(id, albumName, artist, year, false));
    })
});

busquedaBtn.addEventListener('click', () => {
    inputArtista.focus();
    if(divBusqueda.style.display === 'grid'){
       return;
    } 
    divBusqueda.style.display = 'grid';
    busquedaBtn.style.color = 'white';

    libreriaBtn.style.color = '';
    divLibreria.style.display = 'none';
});

buscarAlbumBtn.addEventListener("click", (e) => {
    e.preventDefault();
    let artist = inputArtista.value;
    if (!validateInput(artist)) {
        return;
    }
    (async function asyncBuscarPorArtista() {
       let data = await buscarPorArtista(artist);
       actualizarVistaBusqueda(data.artists);
    })();
});

function actualizarVistaBusqueda(artists) {
    sectionBusquedaUl.innerHTML = "";
    artists.forEach((artist) => {
        sectionBusquedaUl.appendChild(
            newArtistStructure(artist.name, artist.id)
        );
    });
}

function actualizarVistaLibreria(albums) {
    divBusqueda.innerHTML = "";
    albums.forEach(({ id, albumName, artist, year }) => {
        divBusqueda.appendChild(
            newAlbumStructure(id, albumName, artist, year)
        );
    });
}

function newArtistStructure(artist, artistId) {
    const div = document.createElement("div");
    div.classList.add("artistSearchResult");
    const i = document.createElement("i");
    i.className = "fas fa-angle-right";
    div.innerHTML = artist;
    div.appendChild(i);
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
    const textNode = document.createTextNode(
        `Album: ${albumName}, Artista: ${artist}, Año: ${year}`
    );
    img.className = "album__image";
    divContainerImg.appendChild(loader());

    (async function asyncGetCover() {
        try {
            let res = await getAlbumCover(id);
            img.src = res.images[0].thumbnails.small;
        } catch (error) {
            img.src = "https://upload.wikimedia.org/wikipedia/commons/3/35/Simple_Music.svg";
        }
        divContainerImg.children[0].remove();
        divContainerImg.appendChild(img);  
    })();

    const button = document.createElement('button');
    button.classList.add('albumBtn');
    const i = document.createElement('i');

    if(isSearch){
        button.classList.add('agregarAlbumBoton');
        if(libreria.findAlbumById(id)){
            i.className = 'fa-solid fa-heart';
        } else {
            i.className = 'fa-solid fa-plus';
            button.onclick = () => {
                libreria.insertAlbum(id, albumName, artist, year);
                i.className = 'fa-solid fa-heart';
            }
        }
        
    } else {
        button.classList.add('borrarAlbumBoton');
        i.className = 'fa-solid fa-xmark';
        button.onclick = () => {
            button.parentElement.parentElement.classList.add("animate__fadeOut");
            button.onclick = null;
            libreria.deleteById(id);
            setTimeout(() => {
                button.parentElement.parentElement.remove();
            }, 1000);
        };
       
    }
    button.appendChild(i);   
    divBody.appendChild(button);
    
    divBody.className = "album__body";
    p.appendChild(textNode);
    divBody.appendChild(p);
    divContainer.className = "album__container animate__animated animate__fadeIn";
    divContainer.appendChild(divContainerImg);
    divContainer.appendChild(divBody);
    return divContainer;
}

//Validar que los inputs no esten vacios
function validateInput(...args) {
    return !Array.from(args, (el) => el.trim()).includes("");
}

//MAIN
if (!localStorage.getItem("albums")) {
    localStorage.setItem("albums", JSON.stringify(new Array()));
} else {
    let albums = JSON.parse(localStorage.getItem("albums"));
    libreria.albums = albums;
}

//Se guardan albumes en localstorage cuando se cierra o actualiza la ventana
window.onbeforeunload = () =>  {
    localStorage.setItem('albums', JSON.stringify(libreria.albums));
}

function loader() {
    const div = document.createElement('div');
    div.classList.add('lds-roller');
    for(let i = 0; i < 8; i++){
        div.appendChild(document.createElement('div'));
    }
    return div;
}
