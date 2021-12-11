console.log('COVID-19 Statistics');

const core_elements = {
	continent_buttons: document.querySelector('.continents-wrapper'),
	graphics_wrapper: document.querySelector('.graphics-wrapper'),
	opening_text: document.querySelector('.opening-text'),
	loader: document.querySelector('.loader'),
	data_selector: document.querySelector('.select-data-wrapper'),
	data_category: "confirmed cases",
	countries_wrapper: document.querySelector('.countries-wrapper'),
}

const global_data = {
	// africa: ,
	// americas,
	// asia,
	// europe,
	// oceania
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
	if (!global_data[region]) {
		await setCca2ToLocalStorage(region);
		const countries_cca2 = await JSON.parse(localStorage.getItem(region));
		// console.log("region goten from local storage: ", countries_cca2);
		global_data[region] = await getCoronaData(countries_cca2)
		.then((covid_full_data) => {
			destructureCovidData(countries_cca2, covid_full_data)
		});
	}

	displayData(global_data[region], core_elements.data_category);
}


// API functions


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

	const covid_full_data = await Promise.allSettled(promises);

	return covid_full_data;
}


// The function gets an array of corona data and region object and set the data to the matching country`s object.
function destructureCovidData(region, covid_full_data) {
	let index = 0;
	for (const country in region) {
		region[country].data = covid_full_data[index].data.data.latest_data;
		region[country].today = covid_full_data[index].data.data.today;
		region[country].updated_at = covid_full_data[index].data.data.updated_at;
		++ index;
	}

	// console.log(region);
	return region;
}


// Chart functions
// TODO: graph destroy, videos on charts (traversy, minecraft), https://www.youtube.com/watch?v=fqARSwfsV9w


function displayData(region, data_category) {
	const labels = Object.keys(region);
	const category_data = getDataByCategory(region, data_category);
	const data = {
		labels: labels,
		datasets: [{
			label: `Number of ${data_category} per country`,
			backgroundColor: 'rgb(255, 99, 132)',
			borderColor: 'rgb(255, 99, 132)',
			data: category_data,
		}]
	};
	const config = {
		type: 'line',
		data: data,
		options: {}
	};

	const chart = new Chart(
		document.getElementById('dynamic-chart'),
		config
	);
}


function getDataByCategory(region, data_category) {
	const data = [];
	console.log('region: ', region);
	console.log('data_category: ', data_category);

	for (const country in region) {
		console.log("country: ", country);
		console.log("country.data: ", country.data);
		console.log("country.data.latest_data: ", country.data);
		data.push(country.data[data_category])
	}
	return data;
}