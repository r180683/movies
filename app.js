const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
let dbpath = path.join(__dirname, "moviesData.db");
let db = null;

const initailizeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
initailizeDBAndServer();

//API 1
//Returns a list of all movie names in the movie table

function convertIntoReponseMovies(movie) {
  return {
    movieName: movie.movie_name,
  };
}

app.get("/movies/", async (request, response) => {
  let getAllMoviesQuery = `SELECT movie_name FROM movie`;
  let allMovieNames = await db.all(getAllMoviesQuery);
  let responseMovies = [];
  for (let movie of allMovieNames) {
    responseMovies.push(convertIntoReponseMovies(movie));
  }
  response.send(responseMovies);
});

module.exports = app;

//API 2
//Creates a new movie in the movie table.

app.post("/movies/", async (request, response) => {
  let movieData = request.body;
  let { directorId, movieName, leadActor } = movieData;
  let postMovieQuery = `INSERT INTO movie(director_id,movie_name,lead_actor) VALUES
    (
        ${directorId},
        '${movieName}',
        '${leadActor}'
    )`;
  const r = await db.run(postMovieQuery);
  response.send(r);
});

//API 3
//Returns a movie based on the movie ID
function convertToResponsiveMovie(movie) {
  return {
    movieId: movie.movie_id,
    directorId: movie.director_id,
    movieName: movie.movie_name,
    leadActor: movie.lead_actor,
  };
}

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `SELECT * FROM movie WHERE movie_id=${movieId}`;
  const AMovie = await db.get(getMovieQuery);
  console.log(AMovie);
  const responsiveMovie = convertToResponsiveMovie(AMovie);
  response.send(responsiveMovie);
});

//API 4
//Updates the details of a movie in the movie table based on the movie ID

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const updatedMovie = request.body;
  const { directorId, movieName, leadActor } = updatedMovie;
  let updateMovieQuery = `UPDATE movie SET 
        director_id=${directorId},
        movie_name='${movieName}',
        lead_actor='${leadActor}'
        WHERE movie_id=${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//API 5
//Deletes a movie from the movie table based on the movie ID

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `DELETE FROM movie WHERE movie_id=${movieId}`;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

//API 6
//Returns a list of all directors in the director table

function convertToDirectorResponse(directorDetails) {
  return {
    directorId: directorDetails.director_id,
    directorName: directorDetails.director_name,
  };
}

app.get("/directors/", async (request, response) => {
  const getAllDirectorsQuery = `SELECT * FROM director`;
  const allDirectors = await db.all(getAllDirectorsQuery);
  const r = [];
  for (let directorDetails of allDirectors) {
    r.push(convertToDirectorResponse(directorDetails));
  }
  response.send(r);
});

//API 7
//Returns a list of all movie names directed by a specific director

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `SELECT movie_name FROM movie WHERE director_id=${directorId}`;
  const directorMovies = await db.all(getDirectorMoviesQuery);
  let dMovies = [];
  for (let movie of directorMovies) {
    dMovies.push(convertIntoReponseMovies(movie));
  }
  response.send(dMovies);
});
