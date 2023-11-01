const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initialiseDbandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at 3000!!!");
    });
  } catch (e) {
    console.log(`Server error ${e.message}`);
    process.exit(1);
  }
};

initialiseDbandServer();

//get method

const convertcase = (dbobj) => {
  return {
    movieName: dbobj.movie_name,
  };
};

app.get("/movies/", async (request, response) => {
  const movieslistquery = `SELECT movie_name FROM movie;`;
  const res1 = await db.all(movieslistquery);
  response.send(res1.map((eachmovie) => convertcase(eachmovie)));
});

//post method

app.post("/movies/", async (request, response) => {
  const moviedetails = request.body;
  const { directorId, movieName, leadActor } = moviedetails;
  const insertquery = `INSERT INTO movie (director_id, movie_name, lead_actor) 
  VALUES (
        ${directorId},
        '${movieName}',
        '${leadActor}'
    );`;
  const res2 = await db.run(insertquery);
  response.send("Movie Successfully Added");
});

//get method2
const convertcase1 = (dbobj1) => {
  let r = {
    movieId: dbobj1.movie_id,
    directorId: dbobj1.director_id,
    movieName: dbobj1.movie_name,
    leadActor: dbobj1.lead_actor,
  };
  return r;
};

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT
      *
    FROM
      movie
    WHERE movie_id = ${movieId};`;
  const movie = await db.all(getMovieQuery);

  response.send(...movie.map((num) => convertcase1(num)));
});

//put method
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const moviedetails1 = request.body;

  const { directorId, movieName, leadActor } = moviedetails1;
  const updatequery = `UPDATE movie SET 
        director_id = ${directorId}, 
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'
        WHERE movie_id = ${movieId};`;
  const res4 = await db.run(updatequery);
  response.send("Movie Details Updated");
});

//delete method
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deletequery = `DELETE FROM movie WHERE movie_id = ${movieId};`;
  const res5 = await db.run(deletequery);
  response.send("Movie Removed");
});

//get method for director table
const convertcase2 = (dbobj2) => {
  return {
    directorId: dbobj2.director_id,
    directorName: dbobj2.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const directorslistquery = `SELECT * FROM director;`;
  const res6 = await db.all(directorslistquery);
  response.send(res6.map((eachdirector) => convertcase2(eachdirector)));
});

//get movie and director
const convertcase3 = (dbobj3) => {
  return {
    movieName: dbobj3.movie_name,
  };
};

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const resultquery = `SELECT * FROM movie WHERE director_id = ${directorId};`;
  const res7 = await db.all(resultquery);
  response.send(res7.map((two) => convertcase3(two)));
});

module.exports = app;
