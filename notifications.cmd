Negotiations provider

so i have to create a negotiation provider then link it to the market, orders & offers to to track the state of each card. each card should be independent. Not to mix buy or counter with remaining cards on the market. Like if a user conters on card 1, he has 0 counters on card 2 unless he counters it too. Same as the buy.
then put the negotiation rules?

A buyer counter submit then waits for the seller’s response counter or accept but not to count counter b4 the seller responds. Update the value to that of the countered price then sent I to the seller.
a buyer has 3 times to counter counter 1 ; max is 40% off
counter 2 ; max is 30% off
counter 3 ; max is 15% off Response should be in less than 1day if no response update the card status to passed, then disable all the buttons & most card  content shouldd be gray if reject is clicked . Cancel the order there & then disable all the buttons and most card  content shouldd be gray & card status to declined
 A seller counter submit then waits for the buyer’s response counter or accept but not to count counter b4 the buyer responds, Update the value to that of the countered price then sent I to the buyer
a seller has 3 times to counter counter 1 ; max is 35% off
counter 2 ; max is 25% off
counter 3 ; max is 10% off
Response should be in less than 1day if no response update the card status to passed, then disable all the buttons & most card  content shouldd be gray if reject is clicked . Cancel the order there & then disable all the buttons and most card  content shouldd be gray Card status to declined

if negotiations not reached, cancle the order & offer for both side - card status time out
if the accepted button is clicked by the seller / buyer, the buyer  has 1day to make the payements or else cancle the order & offer for both sides, - card status time out
give a cooldown of 10mins b4 the buyer can buy or counter that product card with - card status time out
a buyer can click the buy button only 3 times a day on that card I if the payements have not been effected or rejected
 notification manager-
A buyer clicks buy button on the product in the market page, - send notification to the seller, increase the notification count show that exact card in the in the offers account of the buyer but orders in the sellers account - card status to buyer pending during payments. Then finalized if completed for both accounts {seller & buyer}  A buyer submit a counter on the product in the market page, - send notification to the seller, increase the notification count show that exact card in the in the offers account of the buyer but orders in the sellers account - card status to buyer pending, counter in the sellers account  or an ongoing negotiation  A buyer  submit a counter on the product in the offers page, - send notification to the seller, increase the notification count update that exact card in the in the offers account of the buyer the card state should change to pending  but orders in the sellers account with updated state to  counter. Remove the notification count if the seller reviews the it.card status to buyer pending, counter in the sellers account  A seller  submit a counter on the product in the offers page, - send notification to the buyer, increase the notification count update that exact card in the in the offers account of the buyer the card state should change to pending  but orders in the sellers account with updated state to  counter. Remove the count if the buyer reviews the it.card status to seller pending, counter in the buyer account