import { React, useState, useContext, useEffect } from "react";
import Card from "./Card";
import Modal from "./Model";
import { WatchlistContext } from "../contexts/Watchlistcontext";

function Watchlist() {
  const { watchlist } = useContext(WatchlistContext);

  const [showModal, setShowModal] = useState(false);
  const [selectedAnime, setSelectedAnime] = useState(null);

  const handleCardClick = (anime) => {
    setSelectedAnime(anime);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className='explore' style={{ overflowX: "hidden", overflowY: "auto" }}>
      <h1
        style={{
          fontFamily: "Inter",
          fontWeight: 600,
          marginRight: "20px",
          marginBottom: "20px",
        }}
      >
        WatchList
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto auto auto auto",
          gap: "20px",
        }}
      >
        {watchlist.map((anime, index) => (
          <Card
            key={index}
            image={anime.images.jpg.large_image_url}
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

export default Watchlist;
