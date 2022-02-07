const app = document.querySelector(".weather-app")
const temp = document.querySelector(".temp")
const dateOutput = document.querySelector(".date")
const timeOutput = document.querySelector(".time")
const conditionOutput = document.querySelector(".condition")
const nameOutput = document.querySelector(".name")
const icon = document.querySelector(".icon")
const cloudOutput = document.querySelector(".cloud")
const humidityOutput = document.querySelector(".humidity")
const windOutput = document.querySelector(".wind")
const form = document.querySelector("#locationInput")
const search = document.querySelector(".search")
const history = document.querySelector(".history")
const btn = document.querySelector(".submit")
const rainOutput = document.querySelector(".rain")
const nextDays = document.querySelector(".next-days li")
const myChart = document.querySelector(".myChart")

async function defaultWeather(){
    let response = await fetch(`http://ip-api.com/json/`) 
    let data = await response.json()
    window.localStorage.setItem('defaultCity', data.city)
}

defaultWeather()

let cityInput = window.localStorage.getItem("defaultCity") || "Tashkent"



form.addEventListener("submit", (e) => {
    e.preventDefault()

    if(search.value.length == 0){
        alert("Please enter a city")
    }else{
        cityInput = search.value;


        // Save search to local storage
        let historySearches  = JSON.parse(localStorage.getItem("historySearches")) || [];
        let find = historySearches.findIndex(search => search.city == cityInput)

        if(find == -1){
            historySearches.unshift({
                historyId: historySearches.length ? historySearches[0].historyId + 1 : 1,
                city: search.value,
            })
            window.localStorage.setItem('historySearches', JSON.stringify(historySearches))
        }else{
            test = historySearches.splice(find, 1)
            console.log(test)
            historySearches.unshift({
                historyId: historySearches.length ? historySearches[0].historyId + 1 : 1,
                city: search.value,
            })
            window.localStorage.setItem('historySearches', JSON.stringify(historySearches))
        }
        renderHistorySearches()
    }

    fetchWeatherData()
    search.value = "";

    app.style.opacity = "0"
})



function dayOfTheWeek(day, month, year){
    const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return weekday[new Date(`${day}/${month}/${year}`).getDay()];
}


function fetchWeatherData(){
    fetch("http://api.weatherapi.com/v1/current.json?key=0ca95fae0fde4866832182136220502&q=" + cityInput)
    .then(response => response.json())
    .then(data => {
        temp.innerHTML = Math.round(data.current.temp_c) + "&#176;";
        conditionOutput.innerHTML = data.current.condition.text;

        const date = data.location.localtime;
        const y = date.substr(0, 4);
        const m = date.substr(5, 2);
        const d = date.substr(8, 2);

        const time = date.substr(11);

        dateOutput.innerHTML = `${dayOfTheWeek(d, m, y)} ${d}, ${m} ${y}`;
        timeOutput.innerHTML = time;
        nameOutput.innerHTML = data.location.name
        
        const iconId = data.current.condition.icon.substr("//cdn.weatherapi.com/weather/64x64/".length);
        icon.src = `./icons/${iconId}`;
        
        cloudOutput.innerHTML = data.current.cloud + "%";
        humidityOutput.innerHTML = data.current.humidity + "%";
        windOutput.innerHTML = data.current.wind_kph + "km/h";
        rainOutput.innerHTML = data.current.precip_mm + "mm";


        //Next days weatherapi
        fetch("http://api.weatherapi.com/v1/forecast.json?key=0ca95fae0fde4866832182136220502&q=" + cityInput + "&days=7")
        .then(response => response.json())
        .then(data => {
            const forecast = data.forecast.forecastday;
            let nextDaysHtml = ""
            for(let i = 0; i < forecast.length; i++){
                const day = forecast[i];
                const date = day.date;
                const y = date.substr(0, 4);
                const m = date.substr(5, 2);
                const d = date.substr(8, 2);
                nextDaysHtml += `
                <div class="days">
                    <div class="date-box"><span>${d}</span><span>${String(dayOfTheWeek(d, m, y)).split("").splice(0, 3).join("")}</span></div>
                    <div class="temperatures">
                        <div><i class="fas fa-long-arrow-alt-down"></i><span>${ Math.round(day.day.mintemp_c)}</span></div>
                        <div><i class="fas fa-long-arrow-alt-up"></i><span>${Math.round(day.day.maxtemp_c)}</span></div>
                    </div>
                    <div class="rain"><i class="fas fa-tint"></i><span>${day.day.totalprecip_mm}mm</span></div>
                    <p class="description">${day.day.condition.text}</p>
                </div>
                `
            }
            nextDays.innerHTML = nextDaysHtml;
        
            console.log()
            //Setting chart data
            let chartStatus = Chart.getChart("myChart");
            if (chartStatus != undefined) {
                chartStatus.destroy();
            }   
            new Chart(document.getElementById("myChart"), {
                type: 'line',
                data: {
                labels: ["00:00","3:00","6:00","9:00","12:00","15:00", "18:00", "21:00" ],
                datasets: [{ 
                    data: [forecast[0].hour[0].temp_c, forecast[0].hour[3].temp_c, forecast[0].hour[6].temp_c, forecast[0].hour[9].temp_c, forecast[0].hour[12].temp_c, forecast[0].hour[15].temp_c, forecast[0].hour[18].temp_c, forecast[0].hour[21].temp_c], 
                    label: `°C Temperature`,
                    borderColor: "#fff",
                    fill: false
                    },
                ]
                },
                options: {
                title: {
                    display: true,
                    text: 'World population per region (in millions)'
                }
                }
            });

            //
            const historySearches = JSON.parse(localStorage.getItem("historySearches")) || [];
            if(historySearches.length >= 4){
                console.log(historySearches.length)
                //Set history widht to 250px and overflow to scroll
                history.style.height = "225px";
                history.style.overflowY = "scroll";
                history.firstElementChild.style.marginTop = "0px";
            }
            
        })
        let timeOfDay = "day";

        const code = data.current.condition.code;

        if(!data.current.is_day){
            timeOfDay = "night";
        }

        if(code == 1000){
            app.style.backgroundImage = `url(./img/${timeOfDay}/clear.jpg)`;

            btn.style.background = "#e5ba92";
            if(timeOfDay == "night"){
                btn.style.background = "#181e27";
            }
        }else if(code == 1003 || code == 1006 || code == 1009 || code == 1030 || code == 1069 || code == 1087 || code == 1135 || code == 1273 || code == 1276 || code == 1279 || code == 1282){
            app.style.backgroundImage = `url(./img/${timeOfDay}/cloudy.jpg)`;
            btn.style.background = "#fa6d1b";
            if(timeOfDay == "night"){
                btn.style.background = "#181e27"
            }
        }else if(code == 1003 || code == 1006 || code == 1009 || code == 1030 || code == 1069 || code == 1087 || code == 1135 || code == 1273 || code == 1276 || code == 1279 || code == 1282){
            app.style.backgroundImage = `url(./img/${timeOfDay}/cloudy.jpg)`;
            btn.style.background = "#fa6d1b";
            if(timeOfDay == "night"){
                btn.style.background = "#181e27"
            }
        }else if(code == 1063 || code == 1069 || code == 1072 || code == 1150 || code == 1153 || code == 1180 || code == 1183 || code == 1186 || code == 1189 || code == 1192 || code == 1195 || code == 1204 || code == 1207 || code == 1240 || code == 1243 || code == 1246 || code == 1249 || code == 1252){
            app.style.backgroundImage = `url(./img/${timeOfDay}/rain.jpg)`;
            btn.style.background = "#647d75";
            if(timeOfDay == "night"){
                btn.style.background = "#325c80"
            }
        }else{
            app.style.backgroundImage = `url(./img/${timeOfDay}/snow.jpg)`;
            btn.style.backgroundImage = "#4d72aa"
        }
        app.style.opacity = "1"



    })

    .catch((err) => {
        alert("City not found, please try again")
        app.style.opacity = "1";
    })
}

fetchWeatherData()

app.style.opacity = "1"

// Close preloader when setTimeout is done
setTimeout(() => {
    document.querySelector(".preloader").style.opacity = "0";
    // Set transition time to 0.5s
    document.querySelector(".preloader").style.zIndex = "-1";
    document.querySelector(".background-loader").style.opacity = "0";
    
}, 1000);

setTimeout(() => {
    document.querySelector(".background-loader").style.display = "none";
    
}, 1200);



//History panel

function renderHistorySearches(){
    let historySearches = JSON.parse(window.localStorage.getItem('historySearches')) || []
        let allSearches = ""
        for(let search of historySearches){
            allSearches += `                
            <li class="city" data-id="${search.historyId}">
                <span>
                    <i class="fas fa-map-marker-alt"></i>
                    <span class="historyText" onclick="setData(this)">${search.city}</span>
                </span>
                <span>
                    <!-- Close button -->
                    <button onclick="deleteHistorySearch(this)"><i class="fas fa-times"></i></button>
                </span>
            </li>
            `
        }
    history.innerHTML = allSearches || `<span class="lead">There are no recent searches</span>`;
    console.log(allSearches)

}
    

renderHistorySearches()

function deleteHistorySearch(e){
    let historySearches = JSON.parse(window.localStorage.getItem('historySearches')) || []
    let historyId = e.parentElement.parentElement.dataset.id
    let find = historySearches.findIndex(search => search.historyId == historyId)
    historySearches.splice(find, 1)
    window.localStorage.setItem('historySearches', JSON.stringify(historySearches))


    if(historySearches.length < 4){
        console.log(historySearches.length < 4)
        history.style.overflowY = null;
        history.style.height = null;
    }
    renderHistorySearches()
}


function setData(e){
    cityInput = e.innerHTML
    fetchWeatherData()
}