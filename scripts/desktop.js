console.log('COVID-19 Statistics');

const core_elements = {
	continent_buttons: document.querySelector('.continents-wrapper'),
	opening_text: document.querySelector('.graphics-wrapper'),
	opening_text: document.querySelector('.opening-text'),
	opening_text: document.querySelector('.loader'),
	opening_text: document.querySelector('.countries-wrapper'),
}
	
// console.log(core_elements);

core_elements.continent_buttons.addEventListener('click', getCountriesCodeByContinent);
async function getCountriesCodeByContinent({target}) {
	let countries_url = "https://intense-mesa-62220.herokuapp.com/https://restcountries.herokuapp.com/api/v1";

	if (this === target) {
		return;
	}
	// console.log(target.innerText);
	if (target.innerText !== 'Global') {
		countries_url += `/region/${target.innerText.toLowerCase()}`;
	}
	// console.log(countries_url);
	const {data: countries_full_data} = await axios.get(countries_url);
	
	// console.log(countries_full_data);

	const countries_cca2 = {};
	for (const country of countries_full_data) {
		countries_cca2[country.name.common] = country.cca2;
	}
	// console.log(countries_cca2);
}


