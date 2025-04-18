const searchField = document.getElementById("targetlocation"); 
const suggestionsBox = document.getElementById("suggestions");
const converter = document.getElementById("converter");

const errorMessage = document.getElementById("error-message");

const weatherIcon = document.querySelector(".weathericon");
const temperature = document.querySelector(".temperature");
const feelsLike = document.querySelector(".feelslike");
const description = document.querySelector(".description");
const date = document.querySelector(".date");
const day = document.querySelector(".day");
const city = document.querySelector(".city");
const region = document.querySelector(".region");

const Hvalue = document.getElementById("Hvalue");
const Wvalue = document.getElementById("Wvalue");
const SRvalue = document.getElementById("SRvalue");
const SSvalue = document.getElementById("SSvalue");
const Cvalue = document.getElementById("Cvalue");
const UVvalue = document.getElementById("UVvalue");
const Pvalue = document.getElementById("Pvalue"); 

let tempC = 0, tempF = 0;
let feelsC = 0, feelsF = 0;

const forecastDivs = [
  document.getElementById("day1"),
  document.getElementById("day2"),
  document.getElementById("day3"),
  document.getElementById("day4"),
  document.getElementById("day5"),
  document.getElementById("day6"),
  document.getElementById("day7")
];


const getExactLocation = async (targetLocation) => {
    const url = `https://api.weatherapi.com/v1/search.json?key=91eaa71d6d464ae9b71111742251704&q=${targetLocation}`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (data.length > 0) {
            const bestMatch = data[0]; // Most relevant location
            fetchResults(bestMatch.name); 
            getSevenDaysForecast(bestMatch.name);
        } else {
            alert("Location not found.");
        }
    } catch (err) {
        console.error("Error with search.json:", err);
    }
};



const fetchResults = async (targetLocation) => {
    const url = `https://api.weatherapi.com/v1/current.json?key=91eaa71d6d464ae9b71111742251704&q=${targetLocation}&aqi=no`;

    try {
        const res = await fetch(url);
        const data = await res.json();
       
        
         // left panel 
         const locationName = data.location.name  ;
         const temp_in_c = data.current.temp_c  ;
         const temp_in_f = data.current.temp_f  ;
         const icon = data.current.condition.icon ;

         const feelslike_in_c = data.current.feelslike_c ; 
         const feelslike_in_f = data.current.feelslike_f ; 
         const weather_in_text = data.current.condition.text ;
        
         const time = data.location.localtime ;
         const region_update = data.location.region ;

         

         // right panel 
         const humidity  = data.current.humidity ;
         const windspeed = data.current.wind_kph ;
         const cloud = data.current.cloud ;
         const uvindex = data.current.uv ;
         const pressure = data.current.pressure_mb ;

         fetchAstronomyData(targetLocation);
          update_details(locationName,temp_in_c,temp_in_f,icon,feelslike_in_c,feelslike_in_f,weather_in_text,
            time,region_update,humidity,windspeed,cloud,uvindex ,pressure
         ); 

    } catch (err) {
        console.error("Error fetching data:", err);
    }   
         
};

const fetchAstronomyData = async (targetLocation) => {
     const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      
      const url = `https://api.weatherapi.com/v1/astronomy.json?key=91eaa71d6d464ae9b71111742251704&q=${targetLocation}&dt=${today}`;
  
    try {
      const res = await fetch(url);
      const data = await res.json();
  
      const sunrise = data.astronomy.astro.sunrise;
      const sunset = data.astronomy.astro.sunset;

      update_sunrise_sunset(sunrise , sunset);
  
    } catch (err) {
      console.error("Error fetching astronomy data:", err);
    }
  };

   const update_details = (locationName,temp_in_c,temp_in_f,icon,feelslike_in_c,feelslike_in_f,weather_in_text,time,region_update,humidity,windspeed,cloud,uvindex ,pressure) => {

    let splitDate = time.split(' ')[0];  //  (YYYY-MM-DD)
    let splitTime = time.split(' ')[1];  //  (HH:mm:ss)
    
    let current_Day = getDayName(new Date(`${splitDate}T00:00:00Z`).getUTCDay());
    

    tempC = temp_in_c;
    tempF = temp_in_f;
    feelsC = feelslike_in_c;
    feelsF = feelslike_in_f;

 
    applyTemperatureUnit(converter.value);

    weatherIcon.innerHTML = `<img src="https:${icon}" alt="Weather Icon"/>`; 
   
    description.innerText = weather_in_text;

    date.innerText = `Local Time: ${time}`;
    day.innerText = `${current_Day}`;
    city.innerText = `City: ${locationName}`;
    region.innerText = `Region: ${region_update}`;

    Hvalue.innerText = `${humidity}%`;
    Wvalue.innerText = `${windspeed} kph`;
    Cvalue.innerText = `${cloud}%`;
    UVvalue.innerText = uvindex;
    Pvalue.innerText = `${pressure} mb`;

  };

  const applyTemperatureUnit = (unit) => {
    if (unit === "°C") {
        temperature.innerText = `${tempC} °C`;
        feelsLike.innerText = `Feels like: ${feelsC} °C`;
    } else {
        temperature.innerText = `${tempF} °F`;
        feelsLike.innerText = `Feels like: ${feelsF} °F`;
    }
};

converter.addEventListener("change", () => {
    applyTemperatureUnit(converter.value);
});


  const update_sunrise_sunset = (sunrise, sunset) => {
    SRvalue.innerText = sunrise ;
    SSvalue.innerText = sunset ;
}; 

const searchForLocation = () => {
    const targetLocation = searchField.value.trim();
    if (targetLocation !== "") {
        getExactLocation(targetLocation); 
    }
};




searchField.addEventListener("input", async () => {
    const query = searchField.value.trim();
    if (query.length < 2) {
        suggestionsBox.innerHTML = "";
        return;
    }

    try {
        const res = await fetch(`https://api.weatherapi.com/v1/search.json?key=91eaa71d6d464ae9b71111742251704&q=${query}`);
        const data = await res.json();

        suggestionsBox.innerHTML = "";
        data.forEach(item => {
            const li = document.createElement("li");
            li.textContent = `${item.name}, ${item.region}, ${item.country}`;
            li.addEventListener("click", () => {
                searchField.value = item.name;
                suggestionsBox.innerHTML = "";
                getExactLocation(item.name); 
            });
            suggestionsBox.appendChild(li);
        });
    } catch (err) {
        console.error("Error fetching suggestions:", err);
    }
});

document.addEventListener("click", (e) => {
    if (!suggestionsBox.contains(e.target) && e.target !== searchField) {
        suggestionsBox.innerHTML = "";
    }
});
 

const getDayName = (number) => {
   switch (number) {
     case 0 :
       return "Sunday" ;
     case 1 :
       return "Monday";
     case 2 :
       return "Tuesday";
     case 3 :
       return "Wednesday";
     case 4 :
       return "Thursday";
     case 5 :
       return "Friday";
     case 6 :
       return "Saturday";
    }

}


const getSevenDaysForecast = async (targetLocation) => {
  const url = `https://api.weatherapi.com/v1/forecast.json?key=91eaa71d6d464ae9b71111742251704&q=${targetLocation}&days=7`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Error fetching data: ${res.statusText}`);
    }

    const data = await res.json();

    if (data && data.forecast && data.forecast.forecastday) {
    
      data.forecast.forecastday.forEach((day, index) => {
        if (forecastDivs[index]) {
         
          const locationTimezone = data.location.tz_id;  // Get the location's timezone
          const localDate = new Date(day.date).toLocaleString("en-US", { timeZone: locationTimezone });
          const localDay = getDayName(new Date(localDate).getDay());  // Get the day name using the local time

         
          forecastDivs[index].innerHTML = `
            <h3>${localDay}, ${day.date}</h3>  <!-- Display the day of the week and date -->
            <img src="http:${day.day.condition.icon}" alt="weather icon" />
            <p>Condition: ${day.day.condition.text}</p>
            <p>${day.day.mintemp_c}°C / ${day.day.maxtemp_c}°C</p>
            <p>Humidity: ${day.day.avghumidity}%</p>
          `;
        }
      });

      document.getElementById("forecast-container").style.display = "block";

    } else {
      console.log("No forecast data found.");
      
    }
  } catch (err) {
    console.error("Error with forecast request:", err);
    
  }
};

// Add event listener for the search icon or button
document.querySelector(".fa-search").addEventListener("click", searchForLocation);