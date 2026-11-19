// Reduce las fotos antes de guardarlas. Una foto de teléfono pesa varios MB y,
// guardada tal cual, llena la base de datos y la memoria del navegador muy rápido.
const FOTO_LADO_MAXIMO = 1280;   // píxeles del lado más largo
const FOTO_CALIDAD = 0.82;       // calidad JPEG
const FOTO_PEQUENA = 300 * 1024; // por debajo de esto no se toca (stickers, PNG con transparencia)

// Lee un archivo o blob de imagen y entrega la foto ya reducida.
// "alTerminar" recibe lo mismo que FileReader.onload: { target: { result: dataURL } }
function leerFotoReducida(archivo, alTerminar) {
    const entregar = (dataUrl) => alTerminar({ target: { result: dataUrl } });
    const lector = new FileReader();
    lector.onload = function (e) {
        const original = e.target.result;
        if (!archivo.type || !archivo.type.startsWith('image/') || archivo.type === 'image/gif' || archivo.size <= FOTO_PEQUENA) {
            entregar(original);
            return;
        }
        const img = new Image();
        img.onload = function () {
            try {
                const escala = Math.min(1, FOTO_LADO_MAXIMO / Math.max(img.width, img.height));
                const lienzo = document.createElement('canvas');
                lienzo.width = Math.max(1, Math.round(img.width * escala));
                lienzo.height = Math.max(1, Math.round(img.height * escala));
                const ctx = lienzo.getContext('2d');
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, lienzo.width, lienzo.height);
                ctx.drawImage(img, 0, 0, lienzo.width, lienzo.height);
                const reducida = lienzo.toDataURL('image/jpeg', FOTO_CALIDAD);
                entregar(reducida.length < original.length ? reducida : original);
            } catch (err) {
                console.error('No se pudo reducir la foto:', err);
                entregar(original);
            }
        };
        img.onerror = function () { entregar(original); };
        img.src = original;
    };
    lector.onerror = function () { alert('No se pudo leer la foto. Intenta con otra.'); };
    lector.readAsDataURL(archivo);
}
