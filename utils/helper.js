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


    rankHand(cards){
        let highestCard = 0;
        let ranks = {'2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'10':10,'JACK':11,'QUEEN':12,'KING':13,'ACE':14};
        let suits = [];
        let values = [];
        let suitCounts = {};
        let valueCounts = {};
        let hasPair = false;
        let hasTrips = false;
        let hasQuads = false;
        let hasFlush = false;
        let hasStraight = false;

        cards.forEach((card) => {
            console.log(card);
            values.push(card.value);
            suits.push(card.suit);
        });

        suits.forEach(function(x) {suitCounts[x] = (suitCounts[x] || 0) + 1});
        values.forEach(function(x) {valueCounts[x] = (valueCounts[x] || 0) + 1});


        for(const [key, value] of Object.entries(valueCounts)){
            switch(value){
                case 1:
                    highestCard = highestCard < ranks[key] ? ranks[key] : highestCard;
                    log(highestCard);
                    break;
                case 2:
                    hasPair = true;
                    log('has 2 of a kind')
                    break;
                case 3:
                    hasTrips = true;
                    log('has 3 of a kind')
                    break;
                case 4: 
                    hasQuads = true;
                    log('has 4 of a kind')
                    break;
                default:
                    break;
            }
        }

        for(const [key, value] of Object.entries(suitCounts)){
            value == 5 ? hasStraight = false : null;
        }

        log(suitCounts);
        log(valueCounts);
        log(hasStraight);

        return 0;
    }
}

export default Helper;