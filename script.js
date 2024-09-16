
const apiKey = "Your API Key";

// Selectors

const searchForm = document.getElementById("search-form");
const searchResult = document.getElementById("result");

let sentObserver;

//Event listeners

const setupListeners = () => {
  searchForm.addEventListener("submit", onSearchFormSubmit);
};

//Event handlers

const onSearchFormSubmit = (e) => {
  e.preventDefault();

  const query = searchForm.query.value.trim();

  if (!query) {
    alert("Please provide a valid search term");
    return;
  }
  const apiUrl = `https://api.pexels.com/v1/search?query=${query}&orientation=landscape`;

  showLoading();

  fetchImages(apiUrl).then((data) => displayResults(data)).finally(hideLoading);
};

//Render functions

const displayResults = (data) => {
  console.log(data);

  //remove previous observer
  removeObserver();

  //if no results found

  if (data.total_results === 0) {
    searchResult.innerHTML = `<div class="no-result">No images found!</div>`;
    return;
  }

  //clear the previous results

  if (data.page === 1) {
    searchResult.innerHTML = "";
  }

  data.photos.forEach((photo) => {
    searchResult.innerHTML += `
         <div class="grid-item">
                <a href="${photo.url}" target="_blank">
                    <img src="${photo.src.medium}" alt="${photo.alt}">
                    <div class="image-content">
                        <h3 class="photographer">${photo.photographer}</h3>
                    </div>
                </a>
            </div>
        
        `;
  });

  //initialize observer if there is next page
  createObserver(data.next_page);
};

const showLoading = () => {
    const div = document.createElement('div');
    div.classList.add('loader');
    document.body.prepend(div);
};
const hideLoading = () => {
    const loader = document.querySelector('.loader');
    loader && loader.remove();
};

const createObserver = (nextPageUrl) => {

    if(!nextPageUrl) return;

    //create element to observe

    const sent = document.createElement('div');
    sent.id = 'sent';

    //append elemenets to grid

    document.querySelector('.container').appendChild(sent);

    //initialize the intersection observer

    sentObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => { 
            if(entry.isIntersecting) {
                loadMoreResults(nextPageUrl);
            }
        })
    })

    //connect the element to observer

    sentObserver.observe(sent);
    
}

const removeObserver = () => {


    //remove observer element

    const sent = document.getElementById('sent');
    sent && sent.remove();

    //disconnect the observer 

    if(sentObserver) {
        sentObserver.disconnect();
        sentObserver = 'null';
    }
    
}

//Helper functions

const fetchImages = async (apiUrl) => {
  try {
    const response = await fetch(apiUrl, {
      headers: { Authorization: apiKey },
    });

    if (!response.ok) {
      throw new Error(`HTTP Error! status=${(await response).status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch error", error);
  }
};

const loadMoreResults = (nextPageUrl) => {
    showLoading();
    fetchImages(nextPageUrl).then(data => displayResults(data)).finally(hideLoading);
}

//Initialize

setupListeners();
