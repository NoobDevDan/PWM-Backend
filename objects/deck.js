class Deck {
    constructor(){
        this.deck = [];
        this.availableCards = [];
        this.getDeck();
    }

    async getDeck(){
        const response = await fetch(`https://www.deckofcardsapi.com/api/deck/new/draw/?count=52`);
        const data = await response.json();
        this.deck = data.cards;
        this.availableCards = this.shuffleDeck();
        return this;
    }
    
    shuffleDeck(){
        this.availableCards = this.deck;
        if(this.deck.length == 52){
            for(let i = this.availableCards.length -1 ; i > 0; i--){
                let j = Math.floor(Math.random() * (i+1));
                let k = this.availableCards[i];
                this.availableCards[i] = this.availableCards[j];
                this.availableCards[j] = k;
            }
        }
        return this.availableCards;
    }
    
    drawCards(numberOfCards){
        const cardsDrawn = [];
        for(let i = 0; i < numberOfCards; i++){
            let randNum = Math.floor(Math.random() * (this.availableCards.length));
            let card = this.availableCards[randNum];
            this.availableCards.splice(randNum,1);
            cardsDrawn.push(card);
        }
        return cardsDrawn;
    }
}

export default Deck;
