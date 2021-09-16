import { Injectable } from '@angular/core';
import { ReserveService } from './reserve.service';


@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  rack: string[];

  constructor(private reserveService: ReserveService) { }

  placeLetters(lettersToPlace: string[]): boolean {
    //TODO: Place lettres sur le board; récupérer lettres du UIchevalet
    
    // Empty reserve
    if(this.reserveService.getLength() === 0)
      return false;
      
    // Less letters in reserve than letters placed
    if(this.reserveService.getLength() <= lettersToPlace.length){
      for(let i = 0; i < this.reserveService.getLength(); i++) {
        this.rack.push(this.reserveService.drawLetter());
      }
      return true;
    }

    // More letters in reserve than letters placed
    if(this.reserveService.getLength() <= lettersToPlace.length) {
      for(let i = 0; i < lettersToPlace.length; i++) {
        this.rack.push(this.reserveService.drawLetter());
      }
      return true;
    }
    
    return false;
  }

  exchangeLetters(lettersToExchange: string[]): boolean {
    if(this.reserveService.getLength() < 7){
      return false;
    }
    
    // Premièrement, le nombre de lettres demandées est pigé au hasard dans la réserve.
    for(let _ of lettersToExchange) {
      this.rack.push(this.reserveService.drawLetter());
    }
    
    // Ensuite, les lettres à rejeter sont remises à la réserve. 
    for(let letter of lettersToExchange){
      this.reserveService.putBackLetter(letter);
    }
    
    return true;
  }

  skipTurn(): boolean {
    return false;
  }
  
}