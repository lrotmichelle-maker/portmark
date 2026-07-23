start with introducing our users to campaign page. -> welcome back the user if user has ever checked the campaign page
like this{ welcome back, [username]! explore the latest campaigns to monitize your social media account }
for a new user, we can say { welcome to our campaign page! Check out the latest  deals available . monitize your social media account by completing a campaign }

design 
create campaign button should be below the intro or welcome message
 -color green

 the form it pops on clcik -
    logic - campaign name should not exceed 16 characters
          - should not have special characters
          - should not not end with a space or period
          - should not have icons or emojis
          -should not be empty
          - should not have consecutive spaces
          - should not have consecutive special characters
          - should not have consecutive periods
          - should not start with a space or period
          -if any of the above rules is broken, show a red error message below the input field

          - do default text should be in the form but lets use place holder text instead of default text
          - the text publish campaign should be in the center 

          add fields 
                     - for campaign start date, - if its a future campaign but don't allow user to use past date - disable the publish button, => allow users to join if is in a month time to start date, if its a past campaign, => show the campaign as expired and disable the join button
                     - for max payout & min payout 


          button logic & design
                 - should be disabled until all the rules are satisfied
                 - should be centered and green in color but no bg
                 - on touch / hover 
                    - should have a green background with white text
                    - should have a slight shadow effect
                    - should have a smooth transition effect for hover / touch state 

joined capaigns & manage campaigns should be changed to 
 - joined -> shouws campaigns that user has joined
            - allow user to leave the campaign if they want to
            - the campaig card should have thee leave button on the card itself
            - inse this page - users should be able to interact with the admin, provide feedback, ask questions, and get support for the campaign they have joined 
            - share screenshots of their work, and showcase their progress to the campaign admin and other participants. to be approved for payments

 - manage -> shows campaigns that user has created and can manage
          - allow user to edit the campaign details, update max & min payout amounts 
          - decrease less than 20% the agreed payout amount, and change the campaign start date if it has not yet started.
          - increase the payout amount by any percentage, and change the campaign start date to a future date if it has not yet started.
          - add approve button in the campaign card to approve the screenshots shared by the participants, and allow them to submit their work for payment approval
          - money should be released to the participants only after the admin has approved their work and submitted it for payment processing.
          - money should also be aproved by the admin just by clicking the approve button next to the user who has participate even though has not submitted the screen shots but probably working well like among the compitors
          - admin should be able to see the list of participants who have joined the campaign, their progress, and their submitted as well as those who vae not submitted work for approval.
          - we shall create a graph that sync the the progress of the participants and show the admin how well the campaign is performing in terms of engagement and completion rates.
