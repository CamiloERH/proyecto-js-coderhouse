export class Album {
    constructor(id, albumName, artist, year) {
        this.id = id;
        this.albumName = albumName;
        this.artist = artist;
        this.year = year;
    }
}

export class Libreria {
    constructor() {
        this.albums = [];
    }

    findAlbumById(id){
        return this.albums.find((album) => album.id === id);
    }

    insertAlbum(id, albumName, artist, year) {
        if(this.findAlbumById(id)){ return ;}
        let newAlbum = new Album(id, albumName, artist, year);
        this.albums.push(newAlbum);
        return newAlbum;
    }

    deleteById(id) {
        let album = this.findAlbumById(id);
        if (!album) {
            return;
        } else {
            this.albums = this.albums.filter((album) => album.id !== id);
        }
    }
}
