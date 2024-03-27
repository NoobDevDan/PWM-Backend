import { game } from "../server.js";

class Player { 
    constructor(_playerId, _playerName, _avatarURL){
        this.id = _playerId; //will be auth id most likely
        this.name = _playerName; //display name
        this.chipCount = 5000; //current chips value
        this.currentHand = null; //array of 2 cards
        this.status = 'Inactive'; //[Folded, Inactive, Playing]
        this.lastAction = null; // [Checked, Bet, Called, Raised, All-in, Folded]
        this.amountBidThisRound = 0; //amount of chips committed to the pot this round
        this.avatarURL = _avatarURL; //URL to player profile pic
    }

    reset(){
        this.chipCount = 5000;
        this.currentHand = null;
        this.status = 'Inactive';
        this.amountBidThisRound = 0;
        return this;
    }

    async getHand(){
        let hand = await (game.deck.drawCards(2));
        this.currentHand = hand;
        return this.currentHand;
    }

    decreaseChipCount(chipValue){
        this.chipCount -= chipValue;
        return this.chipCount;
    }

    increaseChipCound(chipValue){
        this.chipCount += chipValue;
        return this.chipCount;
    }

    setStatus(stringVal){
        this.status = stringVal;
        return this.status;
    }

    setLastAction(stringVal){
        this.lastAction = stringVal;
        return this.lastAction;
    }

    setAmountBidThisRound(numVal){
        this.amountBidThisRound = numVal;
        return this.amountBidThisRound;
    }
}

export default Player;
