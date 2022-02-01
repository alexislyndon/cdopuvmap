var map = L.map('map').setView([8.477703150412395,124.64379231398955],13);// target is rizal monument

        L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=VhesJPHeAqyxwLGSnrFq', 
        {
            attribution:'<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
        }).addTo(map);
        
        
        //adds marker (blue teardrop) on the map using [latlng]. useful for points of interest (?)
        var userMarker = L.marker([8.477703150412395,124.64379231398955]).addTo(map)

        L.control.locate().addTo(map); //check top left corner for added button/control

