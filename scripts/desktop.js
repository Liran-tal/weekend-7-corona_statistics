console.log('COVID-19 Statistics');

const core_elements = {
	continent_buttons: document.querySelector('.continents-wrapper'),
	graphics_wrapper: document.querySelector('.graphics-wrapper'),
	opening_text: document.querySelector('.opening-text'),
	loader: document.querySelector('.loader'),
	countries_wrapper: document.querySelector('.countries-wrapper'),
}
	
// TODO: refactor the whole thing: 
core_elements.continent_buttons.addEventListener('click', main);


// Main function to manage the app different tasks
async function main({target}) {
	const region = target.innerText.toLowerCase();
	
	if (this === target) {
		console.log("Wrapper clicked");
		return;
	}
	// If button not clicked before by user, set list of that continent countries cca2 to local storage. Than, get that data and store it in an obj.
	await setCca2ToLocalStorage(region);
	const countries_cca2 = await JSON.parse(localStorage.getItem(region));
	// console.log("region goten from local storage: ", countries_cca2);

	const continent_data = getCoronaData(countries_cca2);
	
}


// Fetch data from Restcountries API, create an object of relevant region with countries: cca2 pairs and set it to local storage.
async function setCca2ToLocalStorage(region) {
	const countries_cca2 = {};
	let countries_url = "https://intense-mesa-62220.herokuapp.com/https://restcountries.herokuapp.com/api/v1";

	if (!localStorage.getItem(region)) {
		// console.log(target.innerText);
		if (region !== 'global') {
			countries_url += `/region/${region}`;
		}
		// console.log(countries_url);
		const {data: countries_full_data} = await axios.get(countries_url);
		// console.log(countries_full_data);
		
		for (const country of countries_full_data) {
			countries_cca2[country.name.common] = {cca2: country.cca2};
		};
		localStorage.setItem(region, JSON.stringify(countries_cca2));
		// console.log("new region set to local storage: ", countries_cca2);
	}
}


// The function gets an object with pairs of country: cca2 and fetch corona data of countries in relevant region from ABOUT-CORONA.NET API. 
async function getCoronaData(countries) {
	const promises = [];
	const cca2_array = Object.values(countries);

	cca2_array.forEach(country => {
		promises.push(axios.get(`https://intense-mesa-62220.herokuapp.com/http://corona-api.com/countries/${country.cca2}`));
	});

	const covid_full_data = await Promise.all(promises);

	return destructureCovidData(countries, covid_full_data);
}


// The function gets an array of corona data and region object and set the data to the matching country`s object.
function destructureCovidData(countries, covid_full_data) {
	let index = 0;
	for (const country in countries) {
		countries[country].data = covid_full_data[index].data.data.latest_data;
		countries[country].today = covid_full_data[index].data.data.today;
		countries[country].updated_at = covid_full_data[index].data.data.updated_at;
		++ index;
	}

	console.log(countries);
	return countries;
}



// TODO: graph destroy, videos on charts (traversy, minecraft), https://www.youtube.com/watch?v=fqARSwfsV9w
