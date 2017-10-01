const Game = require('./Game');

/**
 * Class representing games in the postgreSQL database
 */

class SqlGames {
    /**
     * Create SqlGames
     * @param {Object} pgPool - represents sql connection pool
     * @param logger
     */
    constructor(pgPool, logger, sqlGameUser, sqlGameLabel){
        this._pgPool = pgPool;
        this._logger = logger;
        this._sqlGameUser = sqlGameUser;
        this._sqlGameLabel = sqlGameLabel;
    }

    /**
     * load games from the database
     * @return {Promise|Game[]} promise that resolves with an array of Games
     */
    load(){
        this._logger.info("SqlGames#load");

        return this._pgPool.query(`SELECT * FROM public.csld_game WHERE deleted <> true`)
        .then(result => {
            return this.convert(result);
        })
        .then(games => {
            return this._sqlGameUser.getCommunity(games);
        })
        .then(games => {
            return this._sqlGameLabel.getLabels(games);
        });
    }

    /**
     * converts games to instances of the Game class
     * @param {Object[]} games - array of games as received from the database
     * @return {Game[]} - array of instances of the Game class
     */
    convert(games){
        return games.rows.map(game => {
            return new Game(game.name, game.description, game.year, game.web, game.hours,
            game.days, game.players, game.men_role, game.women_role, game.both_role,
            game.amount_of_comments, game.amount_of_played, game.amount_of_ratings,
            game.average_rating, game.id);
        });
    }

    /**
     * clear the table and then save all the games anew
     * @param {Game[]} games Array of games to be saved
     */
    save(games){
        return this._pgPool.query(`TRUNCATE TABLE public.similar_games`)
        .then(() => {
            return games.forEach(game => {
              return game.similar.forEach(similarGame => {
                  return this._pgPool.query(`INSERT INTO public.similar_games (id_game1, id_game2, similarity_coefficient)
                  VALUES (${game.id}, ${similarGame.id}, ${similarGame.rating})`);
              });
            });
        });
    }
}

module.exports = SqlGames;
