import axios from "axios";
import { log } from "node:console";

class Deck {
    constructor(){
        this.success = null;
        this.deck_id = "new";
        this.shuffled = null;
        this.remaining = 0;
    }
    
    async newDeck(){
        var newDeck = await fetch(`https://www.deckofcardsapi.com/api/deck/${this.deck_id}/shuffle`).then((response) => response.json());
        
        this.deck_id = newDeck.deck_id;
        this.success = newDeck.success;
        this.shuffled = newDeck.shuffled;
        this.remaining = newDeck.remaining;
        return this;
    }
    
    async drawCards(numberOfCards){
        const cardsDrawn = await fetch(`https://www.deckofcardsapi.com/api/deck/${this.deck_id}/draw/?count=${numberOfCards}`).then((response) => response.json());
        if(cardsDrawn.success){
            this.remaining = cardsDrawn.remaining;
            return cardsDrawn.cards; //returns an array
        }
        return "ERROR";
    }
};

export default await Deck;
