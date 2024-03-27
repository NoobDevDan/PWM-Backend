import  Deck   from "./deck.js";
import { log } from "node:console";

class Game{
    constructor(){
        this.deck = new Deck();
        this.flop = null;
        this.turn = null;
        this.river = null;
        this.indexOfCurrentPlayer = -2;
        this.indexOfSmallBlindPlayer = null;
        this.indexOfBigBlindPlayer = null;
        this.currentPot = 0;
        this.gameStarted = false;
        this.minimumBet = 50;
        this.currentRound = -1;
        this.onlinePlayers = [];
        this.bigBlind = 50;
        this.smallBlind = 25;
    }

    async reset(){
        this.deck = await (this.deck.newDeck());
        this.indexOfCurrentPlayer = null;
        this.indexOfSmallBlindPlayer = null;
        this.indexOfBigBlindPlayer = null;
        this.currentPot = 0;
        this.gameStarted = false;
        this.currentRound = -2;
        this.minimumBet = 50;
        this.flop = null;
        this.turn = null;
        this.river = null;
        this.bigBlind = 50;
        this.smallBlind = 25;
        this.onlinePlayers = this.playersJoined.map((player) => {
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
                    this.currentPot = this.bigBlind + this.smallBlind;
                    this.onlinePlayers = this.onlinePlayers.map((player) => {
                        if(player.id == this.onlinePlayers[this.indexOfBigBlindPlayer].id){
                            let updates = {chipCount: player.chipCount -= this.bigBlind, amountBidThisRound: this.bigBlind};
                            return {...player, ...updates};
                        }

                        else if(player.id == this.onlinePlayers[this.indexOfSmallBlindPlayer].id){
                            let updates = {chipCount: player.chipCount -= this.smallBlind, amountBidThisRound: this.smallBlind};
                            return {...player, ...updates};
                        }

                        return player;
                    });
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
                    this.indexOfSmallBlindPlayer = this.playersJoined.length - 2;
                    this.indexOfBigBlindPlayer = this.playersJoined.length - 1;
                    await (this.newRound());
                    return this;
            }
        }

        else{
            this.error = "Game hasn't started yet";
        }
    }

    start(){
        if(this.onlinePlayers.length > 1){
            this.gameStarted = true;
            this.onlinePlayers = this.onlinePlayers.map((player) => {
                return{...player, status:'Playing'};
            });
            this.indexOfCurrentPlayer = 0;
            this.indexOfSmallBlindPlayer = this.onlinePlayers.length - 2;
            this.indexOfBigBlindPlayer = this.onlinePlayers.length - 1;
            return this;
        }

        else{
            log('WARN: Not Enough Players Online');
        }
        
    }

    addPlayer(player){
        if(this.getOnlinePlayer(player.id)){
            return false;
        }
        else{
            this.onlinePlayers.push(player);
            return true
        }
    }

    getOnlinePlayer(playerId){
        return this.onlinePlayers.find((player) => player.id == playerId);
    }
}

export default Game;