import  Deck   from "./deck.js";
import { log } from "node:console";

class Game{
    constructor(){
        this.deck = new Deck();
        this.flop = null;
        this.turn = null;
        this.river = null;
        this.currentPlayer = null;
        this.currentPot = null;
        this.gameStarted = false;
        this.currentRound = -1;
        this.playersJoined = [];
        this.error = "";
    }

    async reset(){
        this.deck = await (this.deck.newDeck());
        this.currentPlayer = null;
        this.currentPot = null;
        this.gameStarted = false;
        this.currentRound = -1;
        this.flop = null;
        this.turn = null;
        this.river = null;
        this.playersJoined((player) => {
            return player.reset();
        })
        return this;
    }

    async newRound(){
        if(this.gameStarted){
            this.currentRound += 1;
            switch(this.currentRound){
                case 0:
                    if(this.deck.remaining < 52){this.deck = await (this.deck.newDeck())};

                    // Use Promise.all to wait for all promises to resolve
                    this.playersJoined = await Promise.all(this.playersJoined.map(async (player) => {
                        if(player.status == 'Playing'){
                            // Assuming drawCards is an async function and returns a promise
                            const currentHand = await this.deck.drawCards(2);
                            return { ...player, currentHand: currentHand };
                        }
                        else{
                            return player;
                        }
                    }));
                    return this;
                case 1:
                    this.flop = await (this.deck.drawCards(3));
                    return this;
                case 2: 
                    this.turn = (await this.deck.drawCards(1))[0];
                    return this;
                case 3: 
                    this.river = (await this.deck.drawCards(1))[0];
                    return this;
                default:
                    this.currentRound = -1;
                    this.flop = null;
                    this.turn = null;
                    this.river = null;
                    await (this.newRound());
                    return this;
            }
        }

        else{
            this.error = "Game hasn't started yet";
        }
    }

    start(){
        this.gameStarted = true;
        this.playersJoined = this.playersJoined.map((player) => {
            player.setStatus('Playing');
            return player;
        })
        return this;
    }

    addPlayer(player){
        if(this.getJoinedPlayer(player.id)){
            console.warn("WARN: Player is already in playersJoined")
            return false;
        }
        else{
            this.playersJoined.push(player);
            return true
        }
    }

    getJoinedPlayer(playerId){
        return this.playersJoined.find((player) => player.id == playerId);
    }
}

export default await Game;