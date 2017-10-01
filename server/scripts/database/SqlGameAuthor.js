/**
 *  This class corresponds to csld_game_has_author in the database
 */

 class SqlGameAuthor{

   /**
    * Create SqlGameAuthor
    * @param {Object} pgPool - represents sql connection pool
    * @param logger - logger for logging
    */
   constructor(pgPool, logger){
       this._pgPool = pgPool;
       this._logger = logger;
   }

   /**
    * finds authors assosiated with the game and adds them to game's authors
    * @param {Game[]} games Array of games to search authors for
    * @return {Promise|Game[]} - promise resolves with array of games with added values in their
    *   authors property
    */
   getAuthors(games){
       this._logger.info("SqlGameAuthor#getAuthors");

       return this._pgPool.query(`SELECT * FROM public.csld_game_has_author`)
       .then(result => {
           result.rows.forEach(row => {
               games
                   .filter(game => game.id === row.id_game)
                   .forEach(game => game.labels.push(row.id_user));
           });
           return games;
       });
   }

}

module.exports = SqlGameAuthor;
