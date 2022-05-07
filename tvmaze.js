"use strict";

const $showsList = $("#shows-list");
const $searchQuery = $("#search-query");
const $submit = $("button[type=submit]");
let $episodeList = $();

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
      `<div 
          data-show-id="${showInfo.id}"
          class="Show card" 
          style="height: fit-content; width: 33.3rem; padding: 0; margin: 1rem; background-color:#d6d6d6;"
          >
          <div class="row g-0"
            style="height: 18.5rem;">
            <div class="col-md-auto"
              style="height: 100%;">
              <img
                src="${showInfo.image.medium}"
                alt="Poster for ${showInfo.name}"
                class="rounded-start"
                style="height: 100%; max-width: 13.15rem"
                >
            </div>
            <div class="col-md-7"
              style="height: 100%; width: 20rem">
              <div class="card-body" 
                style="background-color:#d6d6d6; padding: 0.5rem;">
                <h5 class="card-title text-center"
                  style="margin: 0;">
                  ${showInfo.name}</h5>
              </div>
              <div
                class="border-start bg-light"
                style="overflow-y: auto; padding: 1rem; height: 70%">
                ${showInfo.summary}
              </div>
              <div style="padding: 0.5rem; background-color:#d6d6d6;">
                <button class="btn btn-dark btn-sm Show-getEpisodes d-block mx-auto">
                  Episodes
                </button>
              </div>
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

  populateShows(shows);
}

$submit.on("click", async function (evt) {
  evt.preventDefault();
  if ($searchQuery.get(0).reportValidity()) {
    await searchForShowAndDisplay();
  }
});

$showsList.on("click", async function (evt) {
  if (evt.target.nodeName === "BUTTON") {
    let showID = $(evt.target).closest("div.Show").data("show-id");
    let episodeData = await getEpisodesOfShow(showID);
    populateEpisodes({ showID, episodeData });
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
async function populateEpisodes(episodes) {
  $episodeList.remove();
  if ($episodeList.find("#episodes").data("showId") === episodes.showID) {
    $episodeList = $();
    return;
  }
  createEpisodeList(episodes.showID);
  const $list = $("#episodes");
  for (let episode of episodes.episodeData) {
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
    $list.append($episode);
  }
}

function createEpisodeList(showID) {
  const $card = $(`.Show[data-show-id = ${showID}]`);
  $episodeList = $(
    `<div class="row g-0 border-top border-bottom">
        <div class="card-body bg-light rounded-bottom">
          <h5 class="card-title text-center">Episodes</h5>
          <ul id="episodes" 
            style="max-height: 15rem; overflow-y: auto; background-color: #e8e8e8;"
            data-show-id="${showID}">
            </ul>
        </div>
      </div>`
  );
  $card.append($episodeList);
}
