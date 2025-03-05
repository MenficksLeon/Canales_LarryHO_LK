document.addEventListener("DOMContentLoaded", function () {
    const map = L.map('map').setView([-9.19, -75.0152], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Mapa creado por Larry Humpiri LK | © OpenStreetMap contributors'
    }).addTo(map);

    let geojsonLayer;
    let zonasData;
    let canalesLayer = null;
    let canalesData = null;
    let agenciasLayer = null;
    let agenciasData = null;

    // Cargar GeoJSON de zonas
    fetch('zonas.geojson')
        .then(response => response.json())
        .then(data => {
            zonasData = data;
            cargarFiltros(zonasData);
            mostrarZonas(zonasData);
        })
        .catch(error => console.error('Error cargando zonas:', error));

    // Cargar canales
    fetch('canales.json')
        .then(response => response.json())
        .then(data => {
            canalesData = data;
            mostrarCanales(canalesData);
        })
        .catch(error => console.error('Error cargando canales:', error));

    // Cargar agencias
    fetch('agencias.json')
        .then(response => response.json())
        .then(data => {
            agenciasData = data;
            mostrarAgencias(agenciasData);
        })
        .catch(error => console.error('Error cargando agencias:', error));

    function mostrarZonas(data) {
        if (geojsonLayer) {
            map.removeLayer(geojsonLayer);
        }
        geojsonLayer = L.geoJSON(data, {
            style: feature => ({
                color: feature.properties.color || "#FF0000",
                weight: 2,
                opacity: 0.8,
                fillOpacity: 0.2
            }),
            onEachFeature: (feature, layer) => {
                let props = feature.properties;
                layer.bindPopup(`<strong>${props.zona}</strong><br>Agencia: ${props.agencia}<br>Territorio: ${props.territorio}`);
            }
        }).addTo(map);
        if (data.features.length > 0) {
            let bounds = geojsonLayer.getBounds();
            map.fitBounds(bounds);
        }
    }

    function cargarFiltros(data) {
        let territorios = new Set();
        let agencias = new Set();
        let zonas = new Set();
        data.features.forEach(feature => {
            territorios.add(feature.properties.territorio);
            agencias.add(feature.properties.agencia);
            zonas.add(feature.properties.zona);
        });
        llenarSelect("territorio", territorios);
        llenarSelect("agencia", agencias);
        llenarSelect("zona", zonas);
        document.getElementById("territorio").addEventListener("change", actualizarFiltros);
        document.getElementById("agencia").addEventListener("change", actualizarFiltros);
        document.getElementById("zona").addEventListener("change", actualizarFiltros);
    }

    function actualizarFiltros() {
        let territorioSeleccionado = document.getElementById("territorio").value;
        let agenciaSeleccionada = document.getElementById("agencia").value;
        let zonaSeleccionada = document.getElementById("zona").value;
        let datosFiltrados = {
            type: "FeatureCollection",
            features: zonasData.features.filter(feature => {
                return (territorioSeleccionado === "" || feature.properties.territorio === territorioSeleccionado) &&
                       (agenciaSeleccionada === "" || feature.properties.agencia === agenciaSeleccionada) &&
                       (zonaSeleccionada === "" || feature.properties.zona === zonaSeleccionada);
            })
        };
        llenarSelect("territorio", new Set(datosFiltrados.features.map(f => f.properties.territorio)), territorioSeleccionado);
        llenarSelect("agencia", new Set(datosFiltrados.features.map(f => f.properties.agencia)), agenciaSeleccionada);
        llenarSelect("zona", new Set(datosFiltrados.features.map(f => f.properties.zona)), zonaSeleccionada);
        mostrarZonas(datosFiltrados);
    }

    function llenarSelect(id, valores, seleccionado = "") {
        let select = document.getElementById(id);
        select.innerHTML = '<option value="">Todos</option>';
        valores.forEach(valor => {
            let option = document.createElement("option");
            option.value = valor;
            option.textContent = valor;
            if (valor === seleccionado) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    }

    function mostrarCanales(data) {
        if (canalesLayer) {
            map.removeLayer(canalesLayer);
        }
        canalesLayer = L.layerGroup();
        data.features.forEach(feature => {
            let coords = feature.geometry.coordinates;
            let icono = L.icon({
                iconUrl: feature.properties.IMAGEN,
                iconSize: [30, 30]
            });
            let marker = L.marker([coords[1], coords[0]], { icon: icono })
                .bindPopup(
                    `<strong>Canal:</strong> ${feature.properties.NOMBRE}<br>` +
                    `<strong>Tipo:</strong> ${feature.properties.TIPO_DE_CANAL}<br>` +
                    `<strong>Ciudad:</strong> ${feature.properties.CIUDAD}<br>` +
                    `<strong>Horario:</strong> ${feature.properties.HORARIO}<br>` +
                    `<strong>Dirección:</strong> ${feature.properties.DIRECCION}`
                );
            canalesLayer.addLayer(marker);
        });
        map.addLayer(canalesLayer);
    }

    function mostrarAgencias(data) {
        if (agenciasLayer) {
            map.removeLayer(agenciasLayer);
        }
        agenciasLayer = L.layerGroup();
        data.features.forEach(feature => {
            let coords = feature.geometry.coordinates;
            let icono = L.icon({
                iconUrl: feature.properties.IMAGEN,
                iconSize: [30, 30]
            });
            let marker = L.marker([coords[1], coords[0]], { icon: icono })
                .bindPopup(`<strong>${feature.properties.NOMBRE}</strong><br>${feature.properties.DIRECCION}<br>${feature.properties.REFERENCIA}`);
            agenciasLayer.addLayer(marker);
        });
        map.addLayer(agenciasLayer);
    }
});
