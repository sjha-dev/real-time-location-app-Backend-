const socket = io();
let myId = null;
socket.on('connect', () => {
    myId = socket.id;
});

if(navigator.geolocation){
    navigator.geolocation.watchPosition((position)=>{
        const {latitude, longitude} = position.coords;
        console.log(latitude, longitude);
        socket.emit("send-location", {latitude, longitude});
    } , 
    (error)=>{
        console.error(error);
    },
    {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge:0,
    }
    );
};

const map = L.map("map").setView([0, 0], 10);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "OpenStreetMap "

}).addTo(map);

const marker = {};

function createColoredIcon(color){
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
      <path d="M12.5 0C7 0 2.5 4.5 2.5 10c0 7.5 10 20 10 20s10-12.5 10-20C22.5 4.5 18 0 12.5 0z" fill="${color}"/>
      <circle cx="12.5" cy="10" r="4" fill="#ffffff"/>
    </svg>`;
    return L.divIcon({
        html: svg,
        className: '',
        iconSize: [25, 41],
        iconAnchor: [12, 41]
    });
}

socket.on("receive-location", (data)=>{
    const {id, latitude, longitude} = data;
    const isMe = id === myId;
    const color = isMe ? 'green' : 'red';

    if(isMe){
        map.setView([latitude, longitude], 18);
    }

    if(marker[id]){
        marker[id].setLatLng([latitude, longitude]);
        marker[id].setIcon(createColoredIcon(color));
    } else {
        marker[id] = L.marker([latitude, longitude], {icon: createColoredIcon(color)}).addTo(map);
    }
});   

socket.on("user-disconnected", (id)=>{
    if(marker[id]){
        map.removeLayer(marker[id]);
        delete marker[id];
    }
});    