import "./App.css";
import Explore from "./components/Explore";
import SideBar from "./components/Sidebar";
import SearchBar from "./components/TopHeader";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Carousel from "./components/Carousel";
import ExploreAiring from "./components/ExploreAiring";
import Watchlist from "./components/WatchList";
import { WatchlistProvider } from "./contexts/Watchlistcontext";
import ForYou from "./components/ForYou";
function Home() {
  return (
    <>
      <div>
        <SideBar />
      </div>
      <div>
        <SearchBar />
      </div>
      <div>
        <Explore />
      </div>
      <div>
        <Carousel />
      </div>
      <div>
        <ExploreAiring />
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <div>
        <WatchlistProvider>
          <SideBar />
          <Routes>
            <Route path='/' exact element={<Home />} />
            <Route path='/watchlist' exact element={<Watchlist />} />
            <Route path='/for-you' exact element={<ForYou />} />
          </Routes>
        </WatchlistProvider>
      </div>
    </Router>
  );
}

export default App;
