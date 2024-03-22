import { log } from "node:console";

class Helper{

    constructor(){}

    removeCardsFromPlayer(player){
        return{
            id: player.id,
            name: player.name,
            chipCount: player.chipCount,
            status: player.status,
            lastAction: player.lastAction,
            amountBidThisRound: player.amountBidThisRound,
            avatarURL: player.avatarURL,
        }
    }
}

export default Helper;