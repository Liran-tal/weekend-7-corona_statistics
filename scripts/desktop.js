console.log('COVID-19 Statistics');

const core_elements = {
	continent_buttons: document.querySelector('.continents-wrapper'),
	graphics_wrapper: document.querySelector('.graphics-wrapper'),
	opening_text: document.querySelector('.opening-text'),
	loader: document.querySelector('.loader'),
	data_selectors: document.querySelector('.select-data-wrapper'),
	chart_area: document.getElementById('dynamic-chart'),
	countries_wrapper: document.querySelector('.countries-wrapper'),
	current_region: 'global',
	chart_var: undefined
}

const global_data = {};
	
// TODO: refactor the whole thing: 
core_elements.continent_buttons.addEventListener('click', regionHandler);


// regionHandler function to manage the app different tasks
async function regionHandler({target}) {
	const region = target.innerText.toLowerCase();
	
	if (this === target) {
		return;
	}

	core_elements.current_region = region;

	// If button not clicked before by user, set list of that continent countries cca2 to local storage. Than, get that data and store it in an obj.
	if (!global_data[region]) {
		await setCca2ToLocalStorage(region);
		const countries_cca2 = await JSON.parse(localStorage.getItem(region));
		// console.log("region goten from local storage: ", countries_cca2);
		global_data[region] = await getCoronaData(countries_cca2)
	}
	displayData(global_data[region], 'confirmed');
}


core_elements.data_selectors.addEventListener('click', dataCategoryHandler);

function dataCategoryHandler({target}) {
	const data_category = target.innerText.toLowerCase();
	if (this === target) {
		return;
	}
	
	displayChart(global_data[core_elements.current_region], data_category);
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

	return destructureCovidData(countries, covid_full_data);
}


// The function gets an array of corona data and region object and set the data to the matching country`s object.
function destructureCovidData(region, covid_full_data) {
	let index = 0;
	for (const country in region) {
		if (covid_full_data[index].value){
			region[country].data = covid_full_data[index].value.data.data.latest_data;
			region[country].today = covid_full_data[index].value.data.data.today;
			region[country].updated_at = covid_full_data[index].value.data.data.updated_at;
		}
		else {
			delete region[country];
		}
		++ index;
	}

	// console.log(region);
	return region;
}


// Chart functions


function displayData(region, data_category) {
	displayChart(region, data_category);
	displayCountries(region);
}


function displayChart(region, data_category) {
	const labels = Object.keys(region);
	const category_data = getDataByCategory(region, data_category);
	const data = {
		labels: labels,
		datasets: [{
			label: `Number of ${data_category} per country`,
			backgroundColor: 'rgb(19, 19, 19)',
			borderColor: 'rgb(19, 19, 19)',
			data: category_data,
		}]
	};
	const config = {
		type: 'bar',
		data: data,
		options: {
			scales: {
				y: {
					beginAtZero: true
				}
			}
		}
	};

	if (core_elements.chart_var) {
		core_elements.chart_var.destroy();		
	}
	
	core_elements.chart_var = new Chart(
		core_elements.chart_area,
		config
		);
}


function getDataByCategory(region, data_category) {
	const data = [];
	console.log('region: ', region);
	// console.log('data_category: ', data_category);
	
	for (const country in region) {
		data.push(region[country].data[data_category])
	}
	// console.log(data);
	return data;
}


function displayCountries(region) {
	countries_wrapper.innerHTML = "";
	countriesNameButtons(region)	
}

function countriesNameButtons(region) {
	Object.keys(region).forEach((country) => {
		const button = document.createElement('button');
		button.classList.add("country-name-btn");
		button.innerText = country;
		countries_wrapper.append(button);
	});
	document.querySelector('.country-buttons-wrapper')
		.addEventListener('click', displayCountryData);
}

function displayCountryData({target}) {
	
	if (this === target) {
		return;
	}

}