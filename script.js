// -----------------Start Scripting------------------------
// API Key
const API_KEY = "168771779c71f3d64106d8a88376808a";

const userTab = document.querySelector("[data-user-weather]");
const searchTab = document.querySelector("[data-search-weather]");
// const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-contianer");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");

// Fetching elements to show error message
const errorContainer = document.querySelector(".error-container");
const errorMsg = document.querySelector("[data-errorMsg]");
const errorBtn = document.querySelector(".errorBtn");
const errorImg = document.querySelector("[error-img]");

// initial variables
let currentTab = userTab;
currentTab.classList.add("current-tab");

// Initial function call when user loads 
getfromSessionStorage();

// Tab switching

function switchTab(clickedTab) {
    if(clickedTab != currentTab) {
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");

        if(!searchForm.classList.contains("active")){
            // first remove grant access ui if visible
            // remove user container
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else {
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("remove");
            // for saved cooradinates of user
            getfromSessionStorage();
        }
    }
}

userTab.addEventListener("click", () => {
    switchTab(userTab);
});

searchTab.addEventListener("click", () => {
    switchTab(searchTab);
});

// check if coordinates are already saved in session storage
function getfromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("userCoordinates");
    if(!localCoordinates){
        grantAccessContainer.classList.add("active");
    }else {
        const cooradinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(cooradinates);
    }
}

async function fetchUserWeatherInfo (cooradinates) {
    const {lat, lon} = cooradinates;
    // since its api call make grantaccess invisible 
    grantAccessContainer.classList.remove("active");
    // make loader visible until api loads
    loadingScreen.classList.add("active");

    // Api Calll
    try{ 
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await res.json();
        errorContainer.classList.remove("active");
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherinfo(data);
    }
    catch(err) {
        loadingScreen.classList.remove("active")
        errorContainer.classList.add("active");
        errorImg.style.display = "none";
        errorMsg.innerText = `Error: ${err?.message}`;
        errorBtn.style.display = "block";
        errorBtn.addEventListener("click", fetchUserWeatherInfo);
    }
}

function renderWeatherinfo(weatherInfo) {
    // first fetch the element
    const cityName = document.querySelector("[data-cityName]");
    const desc = document.querySelector("[data-weatherDes]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const clouds = document.querySelector("[data-cloudiness]");

    // fetch values from weatherinfo object 
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp.toFixed(2)} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed.toFixed(2)} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity.toFixed(2)} %`;
    clouds.innerText = `${weatherInfo?.clouds?.all.toFixed(2)} %`;
}

const grantAccessButton = document.querySelector("[data-grantAccess]");

function getLocation() {
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    }else{
        // show alert for no location support
        alert("Your Device does not support Geo-Location Services");
    }
}

function showPosition(position) {
    const userCoordinates = {
        lat: position.coords.latitude ,
        lon: position.coords.longitude
    };

    sessionStorage.setItem("userCoordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

grantAccessButton.addEventListener("click" , getLocation);


const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let cityName = searchInput.value;

    if(cityName === ""){
        return;
    }else{
        fetchSearchWeatherInfo(cityName);
    }
});


async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await res.json();
        if (!data.sys) {
            throw data;
        }
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherinfo(data);
    }
    catch(err) {
        // alert("Not found");
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.remove("active");
        errorContainer.classList.add("active");
        errorMsg.innerText = `${err?.message}`;
        errorBtn.style.display = "none";
    }
}