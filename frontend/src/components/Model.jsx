import React, { useEffect, useState, useContext } from "react";
import "./modal.css";
import play from "../assets/play.svg";
import { BiHeart } from "react-icons/bi";
import { WatchlistContext } from "../contexts/Watchlistcontext";
import LoadingAnimation from "./LoadingAnimation";
import Card from "./Card";
function Modal({ isOpen, closeModal, animeInfo }) {
  const [heartClicked, setHeartClicked] = useState(false);
  const { addToWatchlist, removeFromWatchlist } = useContext(WatchlistContext);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const sendMalIdToBackend = (animeInfo) => {
    fetch("http://127.0.0.1:8000/fetch-anime", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ animeInfo }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to send anime info to backend");
        }
        // Handle success response if needed
        // Call the second fetch function here
        sendMalIdToRecommend(animeInfo);
      })
      .catch((error) => {
        console.error("Error sending anime info to backend:", error);
      });
  };

  const sendMalIdToRecommend = (animeInfo) => {
    fetch("http://127.0.0.1:8000/recommend-anime", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ animeInfo }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to send anime info to backend");
        }
        return response.json();
        // Handle success response if needed
      })
      .then((data) => {
        console.log(data);
        const recommendations = data.recommendations;
        setRecommendations(recommendations);
        fetchAnimeDetailsAndUpdateRecommendations(recommendations);
        // setting loading Animation FOR 3 SEC
        setTimeout(() => {
          setLoading(false);
        }, 3000);

        console.log(recommendations);
      })
      .catch((error) => {
        console.error("Error sending anime info to backend:", error);
      });
  };
  const fetchAnimeDetailsAndUpdateRecommendations = async (recommendations) => {
    try {
      const updatedRecommendations = [];
      for (const recommendation of recommendations) {
        const response = await fetch(
          `https://api.jikan.moe/v4/anime/${recommendation.MAL_ID}`
        );
        if (!response.ok) {
          throw new Error(
            `Failed to fetch anime details for MAL ID ${recommendation.MAL_ID}`
          );
        }
        const data = await response.json();
        const imageUrl = data.data.images.jpg.large_image_url;
        updatedRecommendations.push({ ...recommendation, imageUrl });
        // Wait for 500 milliseconds before making the next request
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      setRecommendations(updatedRecommendations);
      console.log(updatedRecommendations);
    } catch (error) {
      console.error("Error fetching anime details:", error);
    }
  };
  // Call the function when the component mounts
  useEffect(() => {
    // Send mal_id to backend when component mounts
    console.log("Component rendered");

    sendMalIdToBackend(animeInfo);
    console.log(animeInfo);
  }, [animeInfo]);

  const handleOverlayClick = (event) => {
    if (event.target.classList.contains("modal-overlay")) {
      closeModal();
    }
  };
  const extractRating = (rating) => {
    return rating.substring(0, 6);
  };
  const extractduration = (rating) => {
    return rating.substring(0, 4);
  };
  const extractSynonyms = (synonyms) => {
    if (synonyms.length > 1) {
      return synonyms[0] + " " + synonyms[1];
    }
    return synonyms[0];
  };
  function extractGenreNames(genres) {
    return genres.map((genre) => genre.name);
  }

  const handleHeartClick = () => {
    const newHeartClicked = !heartClicked;
    setHeartClicked(newHeartClicked);
    sessionStorage.setItem("heartClicked", JSON.stringify(newHeartClicked));
    if (newHeartClicked) {
      addToWatchlist(animeInfo);
    }
    if (!newHeartClicked) {
      removeFromWatchlist(animeInfo.mal_id);
    }
  };

  useEffect(() => {
    const initialHeartClicked = sessionStorage.getItem("heartClicked");
    if (initialHeartClicked !== null) {
      setHeartClicked(JSON.parse(initialHeartClicked));
    }
  }, []);

  return (
    <div className='modal-overlay' onClick={handleOverlayClick}>
      <div className='modal-content' onClick={(e) => e.stopPropagation()}>
        <div className='modal-data'>
          <div className='anime-image'>
            {/*Anime  Image */}
            <img src={animeInfo.images.jpg.large_image_url} alt='Anime' />
          </div>

          {/*ANime Details */}
          <div className='anime-detail'>
            <div className='anime-title'>
              {animeInfo.title}
              <BiHeart
                onClick={handleHeartClick}
                className={heartClicked ? "heart-red bounce" : "heart"}
              />
            </div>

            <div className='anime-tags'>
              <div className='rating'>{extractRating(animeInfo.rating)}</div>
              <div className='score'>{animeInfo.score}</div>
              <div className='status'>{animeInfo.status}</div>
              <div className='type'> {animeInfo.type}</div>
              <div className='duration'>
                {extractduration(animeInfo.duration)}
              </div>
            </div>

            <div className='trailer'>
              <img src={play} alt='Play' />
              <div className='play'>
                <a
                  href={animeInfo.trailer.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='watch-trailer'
                >
                  Watch Trailer
                </a>
              </div>
            </div>

            <div className='synopsis'>{animeInfo.synopsis}</div>
          </div>

          <div className='other-detail'>
            <div className='details'>
              <span className='titles '>Japanese: </span>
              <span className='values'> {animeInfo.title_japanese}</span>
            </div>
            <div className='details'>
              <span className='titles'>Synonyms: </span>
              <span className='values'>
                {" "}
                {extractSynonyms(animeInfo.title_synonyms)}
              </span>
            </div>

            <div className='details'>
              <span className='titles'>Aired: </span>
              <span className='values'> {animeInfo.aired.string}</span>
            </div>

            <div className='details'>
              <span className='titles'>Premiered: </span>
              <span className='values'>
                {animeInfo.season} {animeInfo.year}
              </span>
            </div>

            <div className='details'>
              <span className='titles'>Source: </span>
              <span className='values'> {animeInfo.source}</span>
            </div>

            <div className='details'>
              <span className='titles'>Episodes: </span>
              <span className='values'> {animeInfo.episodes}</span>
            </div>

            <div className='details'>
              <span className='titles'>Duration: </span>
              <span className='values'>
                {" "}
                {extractduration(animeInfo.duration)}
              </span>
            </div>
            <hr></hr>
            <div className='details'>
              <span className='titles'>Genre: </span>
              <span className='values '>
                {" "}
                {extractGenreNames(animeInfo.genres).map((genre, index) => (
                  <span key={index} className='genre-item'>
                    {genre}
                  </span>
                ))}
              </span>
            </div>
            <hr></hr>

            <div className='details'>
              <span className='titles'>Studios: </span>
              <span className='values'>
                {" "}
                {animeInfo.studios.map((studio, index) => (
                  <span key={index} className='studio-item'>
                    <a
                      href={studio.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='watch-studio'
                    >
                      {studio.name}
                    </a>
                  </span>
                ))}
              </span>
            </div>

            <div className='details'>
              <span className='titles'>Producers: </span>
              <span className='values'>
                {animeInfo.producers.slice(0, 2).map((producer, index) => (
                  <span key={producer.mal_id}>
                    {producer.name}
                    {index !== 1 && <span>, </span>}
                  </span>
                ))}
              </span>
            </div>
          </div>
        </div>

        <div className='recommendation'>
          <div className='recom-head'>Watch Next</div>
          {loading ? (
            <div className='loading-container'>
              <LoadingAnimation />
            </div>
          ) : (
            // Render loading animation if recommendations are still loading
            <div className='recom-anime'>
              {recommendations.map((anime, index) => (
                <Card key={index} image={anime.imageUrl} name={anime.title} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Modal;
