import  Deck  from "./deck.js";

class Game{
    constructor(){
        this.deck = null;
        this.flop = null;
        this.turn = null;
        this.river = null;
        this.currentPlayer = null;
        this.currentPot = null;
        this.gameStarted = false;
        this.roundStarted = false;
        this.playersJoined = [];
        this.error = "";
    }

    async reset(){
        this.deck = await Deck.newDeck();
        this.currentPlayer = null;
        this.currentPot = null;
        this.gameStarted = false;
        this.roundStarted = false;
    }

    async newRound(){
        if(this.gameStarted && !this.roundStarted){
            this.flop = await deck.drawCards(3);
            this.turn = (await deck.drawCards(1))[0]; //drawCards always returns an array even for 1 card
            this.river = (await deck.drawCards(1))[0];
            this.roundStarted = true;
            this.playersJoined.map(async player => {
                await player.drawHand();
            });
        }

        else{
            this.error = "Game hasn't started yet";
        }
    }

    async start(){
        this.Deck =  await Deck.newDeck();
        this.gameStarted = true;
        this.newRound();
    }

    addPlayer(player){
        if(!this.getJoinedPlayer(player.playerId)){
            this.playersJoined.push(player);
            return true
        }
        else{
            console.warn("WARN: Player is already in playersJoined")
            return false
        }
    }

    getJoinedPlayer(playerId){
        return this.playersJoined.find((player) => player.playerId == playerId);
    }
}

export default Game;