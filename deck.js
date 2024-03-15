import axios from "axios";

export default {
    success: true,
    deck_id: "",
    shuffled: true,
    remaining: 52,
    
    getNewDeck: async function(){
        const newDeck = (await axios.get('https://www.deckofcardsapi.com/api/deck/3e11x27nkc1l/shuffle')).data; //replace deck_id in url with 'new' after testing
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
