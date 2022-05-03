"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchQuery = $("#search-query");
const $submit = $("button[type=submit]");
const $episodeList = $("#episodes-list");

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(searchTerm) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  try {
    let searchResults = await axios.get("https://api.tvmaze.com/search/shows", {
      params: { q: searchTerm },
    });
    return searchResults.data;
  } catch (error) {
    console.log(error);
  }
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    let showInfo = condenseShowInfo(show.show);
    const $show = $(
      `<div data-show-id="${showInfo.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src="${showInfo.image.medium}"
              alt="Poster for ${showInfo.name}"
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${showInfo.name}</h5>
             <div><small>${showInfo.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `
    );

    $showsList.append($show);
  }
}


/*  Summarize the show into the relevant data and avoid
    iterating over all object attributes while checking 
    for null values from the GET request.
 */
function condenseShowInfo(show) {
  let showInfo = {
    image: show.image,
    name: show.name,
    summary: show.summary,
    id: show.id,
  };
  if (showInfo.image === null || showInfo.image.medium === null) {
    showInfo.image = { medium: "https://tinyurl.com/tv-missing" };
  }
  for (let attribute in showInfo) {
    if (showInfo[attribute] === null) {
      showInfo[attribute] = `No ${attribute}`;
    }
  }
  return showInfo;
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $searchQuery.val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$submit.on("click", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

$showsList.on("click", async function (evt) {
  if (evt.target.nodeName === "BUTTON") {
    let showID = $(evt.target).closest("div.Show").data("show-id");
    let episodes = await getEpisodesOfShow(showID);
    populateEpisodes(episodes);
  }
});

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  try {
    let searchResults = await axios.get(
      `https://api.tvmaze.com/shows/${id}/episodes`,
      {
        params: { specials: 1 },
      }
    );
    return searchResults.data;
  } catch (error) {
    console.log(error);
  }
}

/** Write a clear docstring for this function... */

/*  Given an array of episodes, iterate through it and append
    the episode's information to the episode list UL. This also
    reveals the episodeArea and empties the list of any previous
    entries.
    
    To avoid any errors, the episodeInfo replaces null values
    in case the list from the GET request is missing any
    information.
 */
function populateEpisodes(episodes) {
  $episodesArea.show();
  $episodeList.empty();
  for (let episode of episodes) {
    let episodeInfo = {
      name: episode.name,
      season: episode.season,
      number: episode.number,
    };
    for (let attribute in episodeInfo) {
      if (episodeInfo[attribute] === null) {
        episodeInfo[attribute] = `No ${attribute}`;
      }
    }
    const $episode = $(
      `<li>Season ${episodeInfo.season}, Episode ${episodeInfo.number}: ${episodeInfo.name} </li>`
    );
    $episodeList.append($episode);
  }
}
