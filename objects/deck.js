import axios from "axios";
import { log } from "node:console";

export default {
    success: true,
    deck_id: "3e11x27nkc1l", //ToDo: set to 'new' after testing
    shuffled: true,
    remaining: 52,
    
    newDeck: async function(){
        var newDeck  = (await axios.get(`https://www.deckofcardsapi.com/api/deck/${this.deck_id}/shuffle`)).data;
        
        this.deck_id = newDeck.deck_id;
        this.success = newDeck.success;
        this.shuffled = newDeck.shuffled;
        this.remaining = newDeck.remaining;
        return this;
    },
    
    drawCards: async function(numberOfCards){
        const cardsDrawn = (await axios.get(`https://www.deckofcardsapi.com/api/deck/${this.deck_id}/draw/?count=${numberOfCards}`)).data;
        return cardsDrawn.cards; //returns an array
    }
};
