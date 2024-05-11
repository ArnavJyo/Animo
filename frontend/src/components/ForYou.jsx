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

  const fetchAnimeData = async () => {
    try {
      const cachedData = localStorage.getItem("animeData");
      if (cachedData) {
        setAnimeData(JSON.parse(cachedData));
      }

      const response = await fetch("http://127.0.0.1:8000/for-you", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ watchlist }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch anime data");
      }

      const data = await response.json();

      const animeDataWithImages = {};
      for (const [title, animes] of Object.entries(data)) {
        const animesWithImages = await Promise.all(
          animes.map(async (anime) => {
            try {
              const response = await fetch(
                `https://api.jikan.moe/v4/anime/${anime.MAL_ID}`
              );
              if (!response.ok) {
                throw new Error("Failed to fetch anime images");
              }
              const imageData = await response.json();
              const imageUrl = imageData.images?.jpg?.large_image_url || "";
              return { ...anime, imageUrl };
            } catch (error) {
              console.error("Error fetching anime images:", error);
              return { ...anime, imageUrl: "" };
            }
          })
        );
        animeDataWithImages[title] = animesWithImages;
      }

      setAnimeData(animeDataWithImages);
      localStorage.setItem("animeData", JSON.stringify(animeDataWithImages));
    } catch (error) {
      console.error("Error sending watch list to backend:", error);
    }
  };

  useEffect(() => {
    fetchAnimeData();
  }, []);

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
                    image={anime.imageUrl || ""}
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
