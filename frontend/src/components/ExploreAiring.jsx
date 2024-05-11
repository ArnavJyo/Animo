import React, { useState, useEffect } from "react";
import Card from "./Card";
import Modal from "./Model";

function ExploreAiring() {
  const [topAiringAnime, setTopAiringAnime] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedAnime, setSelectedAnime] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cachedData = localStorage.getItem("topAiringAnime");
        if (cachedData) {
          setTopAiringAnime(JSON.parse(cachedData));
        }
        setLoading(false);

        const response = await fetch(
          "https://api.jikan.moe/v4/top/anime?filter=airing&sfw=true"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        setTopAiringAnime(data.data);
        localStorage.setItem("topAiringAnime", JSON.stringify(data.data));
      } catch (error) {
        console.error("Error fetching top airing anime:", error);
      }
    };

    fetchData();
  }, []);

  const handleCardClick = (anime) => {
    setSelectedAnime(anime);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };
  return (
    <div
      className='explore'
      style={{ overflowX: "hidden", overflowY: "auto", marginTop: "200px" }}
    >
      <h1
        style={{
          fontFamily: "Inter",
          fontWeight: 600,
          marginRight: "20px",
          marginBottom: "20px",
          marginTop: "25px",
        }}
      >
        Top Airing
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto auto auto auto",
          gap: "20px",
        }}
      >
        {topAiringAnime.map((anime, index) => (
          <Card
            key={index}
            image={anime.images.jpg.image_url}
            name={anime.title}
            onClick={() => handleCardClick(anime)}
          />
        ))}

        {showModal && (
          <Modal
            animeInfo={selectedAnime}
            isOpen={showModal}
            closeModal={closeModal}
          />
        )}
      </div>
    </div>
  );
}

export default ExploreAiring;
