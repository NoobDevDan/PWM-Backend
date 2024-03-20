
class Player { 
    constructor(_playerId, _playerName, _avatarURL, _chipCount){
        this.id = _playerId; //will be auth id most likely
        this.name = _playerName; //display name
        this.chipCount = 5000; //current chips value
        this.currentHand = null; //array of 2 cards
        this.status = 'Spectating'; //[Spectating, Folded, Broke AF, Playing]
        this.lastAction = null; // [Checked, Called, Raised, All-in]
        this.lastBid = null; //0=Checked, otherwise amount of chips to pot
        this.avatarURL = _avatarURL; //URL to player profile pic
    }

    reset(){
        this.chipCount = 5000;
        this.currentHand = null;
        this.status = 'Spectating';
        this.lastAction = null;
        this.lastBid = null;
        return this;
    }

    setHand(hand){
        this.currentHand = hand;
        return this;
    }

    decreaseChipCount(chipValue){
        this.chipCount -= chipValue;
        return this;
    }

    increaseChipCound(chipValue){
        this.chipCount += chipValue;
        return this;
    }

    setStatus(stringVal){
        this.status = stringVal;
        return this;
    }

    setLastAction(stringVal){
        this.lastAction = stringVal;
        return this;
    }

    setLastBid(numVal){
        this.lastBid = numVal;
        return this;
    }
}

export default Player;
