import React, { useState, useContext, useEffect } from "react";
import Card from "./Card";
import Modal from "./Model";
import { WatchlistContext } from "../contexts/Watchlistcontext";

function ForYou() {
  const { watchlist } = useContext(WatchlistContext);
  const [animeData, setAnimeData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedAnime, setSelectedAnime] = useState(null);

  const handleCardClick = (anime) => {
    setSelectedAnime(anime);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const sendWatchlistToBackend = (watchlist) => {
    fetch("http://127.0.0.1:8000/for-you", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ watchlist }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to send watch list to backend");
        }
        return response.json();
      })
      .then((data) => {
        setAnimeData(data);
      })
      .catch((error) => {
        console.error("Error sending watch list to backend:", error);
      });
  };

  useEffect(() => {
    sendWatchlistToBackend(watchlist);
  }, [watchlist]);

  return (
    <div className='for-you-container'>
      <h1 className='section-title'>For You</h1>
      <div className='anime-grid'>
        {animeData &&
          Object.entries(animeData).map(([title, animes]) => (
            <div key={title} className='anime-category'>
              <h2 className='category-title'> Because you liked {title}</h2>
              <div className='anime-list'>
                {animes.map((anime, index) => (
                  <Card
                    key={index}
                    image={anime.images?.jpg?.large_image_url || ""}
                    name={anime.title}
                    onClick={() => handleCardClick(anime)}
                  />
                ))}
              </div>
            </div>
          ))}
      </div>
      {showModal && (
        <Modal
          animeInfo={selectedAnime}
          isOpen={showModal}
          closeModal={closeModal}
        />
      )}
    </div>
  );
}

export default ForYou;
