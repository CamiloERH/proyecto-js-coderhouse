export async function buscarPorArtista(artist) {
    const res = await fetch(
        `https://musicbrainz.org/ws/2/artist?query=${artist}&fmt=json`
    );
    return await res.json();
}

export async function buscarAlbumsPorArtista(artistId) {
    const res = await fetch(
        `https://musicbrainz.org/ws/2/release-group?artist=${artistId}&type=album&fmt=json`
    );
    return await res.json();
}

export async function getAlbumCover(albumId) {
    const res = await fetch(
        `https://coverartarchive.org/release-group/${albumId}`
    );
    return await res.json();
}

