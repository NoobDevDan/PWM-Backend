import  Deck   from "./deck.js";
import Player from "./player.js";
import { log } from "node:console";

class Game{
    constructor(){
        this.deck = new Deck();
        this.flop = null;
        this.turn = null;
        this.river = null;
        this.indexOfCurrentPlayer = -2;
        this.currentPot = null;
        this.gameStarted = false;
        this.minimumBet = 50;
        this.currentRound = -1;
        this.playersJoined = [];
        this.bigBlind = 50;
        this.smallBlind = 25;
        this.smallBlindPlayerId = null;
        this.bigBlindPlayerId = null;
    }

    async reset(){
        this.deck = await (this.deck.newDeck());
        this.indexOfCurrentPlayer = null;
        this.currentPot = null;
        this.gameStarted = false;
        this.currentRound = -2;
        this.minimumBet = 50;
        this.flop = null;
        this.turn = null;
        this.river = null;
        this.bigBlind = 50;
        this.smallBlind = 25;
        this.smallBlindPlayerId = null;
        this.bigBlindPlayerId = null;
        this.playersJoined = this.playersJoined.map((player) => {
            let resetPlayer = player.reset();
            return resetPlayer;
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
                    this.smallBlind = this.smallBlind * 2;
                    this.bigBlind = this.bigBlind * 2;
                    this.indexOfCurrentPlayer = 0;
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
            return{...player, status:'Playing'};
        });
        this.indexOfCurrentPlayer = 0;
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