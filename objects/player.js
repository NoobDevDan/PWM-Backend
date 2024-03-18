
class Player { 
    constructor(_playerId, _playerName, _chipCount){
        this.playerId = _playerId; //will be auth id most likely
        this.playerName = _playerName; //display name
        this.chipCount = _chipCount; //current chips value
        this.currentHand = null; //array of 2 cardsthis.bestHand = {rank: 0, cards: []}; //rank and array of best cards so far. format: {rank: 10, ["AH","KH","QH","JH","10H"]}
        this.isActive = false;
    }

    async setHand(){
        this.currentHand = (await deck.drawCards(2));
    }

    decreaseChipCount(chipValue){
        this.chipCount -= chipValue;
    }

    increaseChipCound(chipValue){
        this.chipCount += chipValue;
    }

    setIsActive(boolValue){
        this.isActive = boolValue;
    }
}

export default Player;
