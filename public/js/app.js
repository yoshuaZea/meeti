import { OpenStreetMapProvider } from 'leaflet-geosearch';
import asistencia  from './asistencia';
import eliminarComentario  from './eliminar-comentario';

//Obtener valires de la BD


const lat = document.querySelector('#lat').value || 18.933144;
const lng = document.querySelector('#lng').value || -99.224877;
const direccion = document.querySelector('#direccion').value || '';
const map = L.map('mapa').setView([lat, lng], 15);
let markers = new L.FeatureGroup().addTo(map);
let marker;

//Utilizar el provider y geocoder
const geocodeService = L.esri.Geocoding.geocodeService();

//Coloar el pin en edición
if(lat && lng){
    //Agregar el pin
    marker = new L.marker([lat, lng], {
        draggable: true, //mover el pin
        autoPan: true //move el mapa con el pin
    })
    .addTo(map)
    .bindPopup(direccion)
    .openPopup();

    //Asignar al contenedor markers el nuevo marker
    markers.addLayer(marker);

     //Detectar movimiento del marker
     marker.on('moveend', function(e) {
        marker = e.target;
        const posicion = marker.getLatLng();
        map.panTo(new L.LatLng(posicion.lat, posicion.lng)); //Centrar mapa y asignar posición

        //Reverse geocoding cuando el usuario reubica el pin
        geocodeService.reverse().latlng(posicion, 15).run(function(error, result){
            llenarInputs(result);

            //Asignar los valores al popup
            marker.bindPopup(result.address.LongLabel)
        });
    });
}


document.addEventListener('DOMContentLoaded', () => {
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    //Buscar dirección
    const buscador = document.querySelector('#formbuscador');
    buscador.addEventListener('input', buscarDireccion);
});

const buscarDireccion = (e) => {
    if(e.target.value.length > 8){
        //Si existe pin, limpiarlo
        markers.clearLayers();

        //Utilizar el provider
        const provider = new OpenStreetMapProvider();
        // console.log(provider); //Ver info del objeto y funciones que soporte

        provider.search({ query: e.target.value }).then((resultado) => {
            geocodeService.reverse().latlng(resultado[0].bounds[0], 15).run(function(error, result){
                llenarInputs(result);

                //Mostrar el mapa
                map.setView(resultado[0].bounds[0], 15);

                //Agregar el pin
                marker = new L.marker(resultado[0].bounds[0], {
                    draggable: true, //mover el pin
                    autoPan: true //move el mapa con el pin
                })
                .addTo(map)
                .bindPopup(resultado[0].label)
                .openPopup();

                //Asignar al contenedor markers el nuevo marker
                markers.addLayer(marker);

                //Detectar movimiento del marker
                marker.on('moveend', function(e) {
                    marker = e.target;
                    const posicion = marker.getLatLng();
                    map.panTo(new L.LatLng(posicion.lat, posicion.lng)); //Centrar mapa y asignar posición

                    //Reverse geocoding cuando el usuario reubica el pin
                    geocodeService.reverse().latlng(posicion, 15).run(function(error, result){
                        llenarInputs(result);

                        //Asignar los valores al popup
                        marker.bindPopup(result.address.LongLabel)
                    });
                });
            });
        });
    }
}

const llenarInputs = (resultado) => {
    document.querySelector('#direccion').value = resultado.address.Address || '';
    document.querySelector('#ciudad').value = resultado.address.City || '';
    document.querySelector('#estado').value = resultado.address.Region || '';
    document.querySelector('#pais').value = resultado.address.CountryCode || '';
    document.querySelector('#lat').value = resultado.latlng.lat || '';
    document.querySelector('#lng').value = resultado.latlng.lng || '';
}

