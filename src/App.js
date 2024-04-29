import { useEffect, useState } from "react";
import StarRating from "./StarRating.js"
const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "f12dc4e4"
export default function App() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [query, setQuery] = useState("");
  const [selectMovie, setSelectMovie] = useState(null)
  const [watched, setWatched] = useState(function () {
    const localWatched = localStorage.getItem("watched")
    return JSON.parse(localWatched)
  });

  const handleAddWatchedMovie = (newObject) => {
    setWatched((watched) => [...watched, newObject])
    console.log("current watched movies after handleAddWatchedMovie =========", watched)
  }

  const handleDeleteWatchedMovie = (id) => {
    setWatched((watched) => watched.filter((movie) => { return movie.imdbID !== id }))
  }

  const handleSelectMovie = (id) => {
    // setSelectMovie((selectMovie) => id === selectMovie ? null : id);
    setSelectMovie((selectMovie) => { return selectMovie === id ? null : id })
  }

  const closeMovieDetail = () => {
    setSelectMovie(null)
  }

  useEffect(() => {
    const storeLocal = () => {
      console.log("watched is updated", watched)
      localStorage.setItem("watched", JSON.stringify(watched))
      console.log("watched from local storage==== ", localStorage.getItem("watched"))
    }
    storeLocal()
  }, [watched])

  useEffect(
    function () {
      const controller = new AbortController()
      async function fetchMovies() {
        try {
          setLoading(true)
          setError("")
          const resp = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&s=${query}`, { signal: controller.signal })
          if (!resp.ok) {
            throw new Error("Fetching failed")
          }
          const data = await resp.json()
          if (data.Response === "False") {
            throw new Error(data.Error)
          }
          setMovies(data.Search)
          setError("")
        }
        catch (e) {
          if (e.name !== "AbortError") { setError(e.message) }
        } finally {
          setLoading(false)
        }
      }
      if (query.length < 3) {
        setMovies([])
        return
      }
      fetchMovies()
      return function () {
        controller.abort()
      }
    }, [query]);



  return (
    <>
      <NavBar>
        <Search setQuery={setQuery} query={query} />
        <NumResult movies={movies} />
      </NavBar >

      <Main>
        <Box>
          {loading && (<Loader />)}
          {!loading && !error && (<MovieList movies={movies} handleSelectMovie={handleSelectMovie} />)}
          {error && (<ErrorMessage message={error} />)}
          {/* {loading ? (<Loader />) : (<MovieList movies={movies} />)} */}
        </Box>
        <Box>{selectMovie ? (<SelectedMovieDetail watched={watched} selectMovie={selectMovie} closeMovieDetail={closeMovieDetail} handleAddWatchedMovie={handleAddWatchedMovie} />) : (<WatchedMovies watched={watched} handleDeleteWatchedMovie={handleDeleteWatchedMovie} />)}</Box>
      </Main>
    </>
  );
}

function Loader() {
  return (
    <div><p className="loader">Loading</p></div>
  )
}

function ErrorMessage({ message }) {
  return (
    <p>
      <span>⛔️</span>{message}
    </p>
  )
}

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  )
}
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  )
}
function Search({ query, setQuery }) {

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  )
}
function NumResult({ movies }) {
  return (
    <>
      <p className="num-results">
        Found <strong>{movies.length}</strong> results
      </p>
    </>
  )
}


function Main({ movies, children }) {
  return (
    <main className="main">
      {children}

      {/* <BoxLeft movies={movies} />
      <BoxRight /> */}
    </main>
  )
}

function Box({ movies, children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  )
}

function MovieList({ movies, handleSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie, i) => (
        <Movie movie={movie} key={i} handleSelectMovie={handleSelectMovie} />
      ))}
    </ul>
  )
}
function Movie({ movie, handleSelectMovie }) {
  return (
    <li key={movie.imdbID} onClick={() => { handleSelectMovie(movie.imdbID) }}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  )
}

function WatchedMoviesSummary({ watched }) {
  const avgImdbRating = Math.round(average(watched.map((movie) => movie.imdbRating)) * 100) / 100
  const avgUserRating = Math.round(average(watched.map((movie) => movie.userRating)) * 100) / 100;
  const avgRuntime = Math.round(average(watched.map((movie) => movie.runtime)) * 100) / 100;
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  )
}
function WatchedMovies({ watched, handleDeleteWatchedMovie }) {

  return (
    <>
      <WatchedMoviesSummary watched={watched} />
      <WatchedMoviesList watched={watched} handleDeleteWatchedMovie={handleDeleteWatchedMovie} />
    </>
  )
}



function WatchedMoviesList({ watched, handleDeleteWatchedMovie }) {

  return (
    <ul className="list">
      {watched.map((movie) => (
        <li key={movie.imdbID}>
          <img src={movie.Poster} alt={`${movie.Title} poster`} />
          <h3>{movie.Title}</h3>
          <div>
            <p>
              <span>⭐️</span>
              <span>{movie.imdbRating}</span>
            </p>
            <p>
              <span>🌟</span>
              <span>{movie.userRating}</span>
            </p>
            <p>
              <span>⏳</span>
              <span>{movie.runtime} min</span>
            </p>
            <button className='btn-delete' onClick={() => { handleDeleteWatchedMovie(movie.imdbID) }}>X</button>
          </div>

        </li>
      )
      )}
    </ul>
  )
}

function SelectedMovieDetail({ watched, selectMovie, closeMovieDetail, handleAddWatchedMovie }) {
  const [movie, setMovie] = useState({})
  const [loading, setLoading] = useState(false)
  const [starRating, setStarRating] = useState("")
  // Assign the Title in movie to title var
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  const localAddWatchedMovie = () => {
    const newWatchedMovie = {
      Poster: poster,
      Title: title,
      Year: year,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      imdbID: selectMovie,
      userRating: starRating
    }
    handleAddWatchedMovie(newWatchedMovie)
    closeMovieDetail()
  }

  let isContainedInWatched = false
  watched.forEach(w => {
    if (w.imdbID === selectMovie) { isContainedInWatched = true }
  });

  useEffect(() => {
    if (title) {
      document.title = `movie | ${title}`
    }
    return function () {
      document.title = "Use Popcorn App"
    }
  }, [title])

  useEffect(() => {
    const escapeFun = (key) => {
      if (key.code === "Escape") {
        closeMovieDetail();
      }
    }
    const changeAppName = () => {
      document.addEventListener("keydown", escapeFun)
    }
    changeAppName()
    return function () {
      document.removeEventListener("keydown", escapeFun)
    }
  }, [closeMovieDetail])

  useEffect(() => {
    async function getSelectMovie() {
      setLoading(true)
      const resp = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&i=${selectMovie}`)
      const data = await resp.json()
      console.log(data)
      setMovie(data)
      setLoading(false)
    }

    getSelectMovie()
  }, [selectMovie])
  return (
    <>{loading ? (<Loader />) : (
      <>
        <header>
          <button className="btn-back" onClick={closeMovieDetail}>&larr;</button>
          <img src={poster} alt={`Poster of ${movie} movie`} />
          <div className="details-overview">
            <h2>{title}</h2>
            <p>
              {released} &bull; {runtime}
            </p>
            <p>{genre}</p>
            <p>
              <span>⭐️</span>
              {imdbRating} IMDb rating

            </p>
          </div>
        </header>
        <section>
          {!isContainedInWatched && (<>
            <div className="rating"><StarRating maxRating={10} size={24} onSetRating={setStarRating} /></div>
            {starRating && <button className='btn-add' onClick={localAddWatchedMovie}>+ Add to watched list</button>}
          </>)}

          <p><em>{plot}</em></p>

          <p>Starring {actors}</p>

          <p>Directed by {director}</p>
        </section>
      </>)}
    </>
  )
}