/**
 * This class corresponds to the csld_game_has_event table in the database
 */

class SqlGameEvents {

  /**
   * Create SqlGameEvents
   * @param {Object} pgPool - represents sql connection pool
   * @param logger - logger for logging
   */
    constructor(pgPool, logger){
        this._pgPool = pgPool;
        this._logger = logger;
    }

    /**
     * Matches events with games in the database
     * @param {Event} event - event to be matched
     * @param {number} eventId - id of the event that was just inserted into the database
     */
    matchGameEvent(event, eventId){
        return this.findGame(event)
        .then(gameId => {
            if(!gameId){
                return;
            }
            let insertSql = `INSERT INTO public.csld_game_has_event (game_id, event_id) VALUES (${gameId}, ${eventId})`;
            return this._pgPool.query(insertSql);
        });
    }

    /**
     * Find a game matching with the provided event
     * @param {Event} event - event that we want matched
     * @return {Proise|Number} promise that resolves with id of the game that matches with passed in event
     */
    findGame(event){
        let findGameSql = `SELECT * FROM public.csld_game WHERE name = '${event.name}'`;

        return this._pgPool.query(findGameSql)
        .then(result => {
            if (result.rows.length === 1){
                return result.rows[0].id;
            }
            return;
        });
    }
}

module.exports = SqlGameEvents;