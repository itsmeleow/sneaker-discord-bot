# sneaker discord bot/helper
 A small project I made for friends. There are very little features but it might be useful to someone in some way. You can easily build on this if you know NodeJS, adding any features and configuring to your needs.

### Requirements:
- NodeJS (Download https://nodejs.org/en/download/)
- GIT (Download https://git-scm.com/downloads)

## Usage 
1. Clone the repository using `git clone https://github.com/itsmeleow/sneaker-discord-bot`.
2. Navigate to the repository using a file manager or `cd sneaker-discord-bot` on your terminal/command prompt.
3. Open `config/config.json` and edit the file.
```json
{  
    "discordBotToken": "HIDDEN-FOR-PRIVACY-REPLACE-HERE",
    "colorHexCode": "#000000",
    "embedFooter": "@nucleisoftware",
    "pingRoleID": "REPLACE-ID-HERE",
    "checkpointChannelID": "REPLACE-ID-HERE", 
    "shopifyChannelID": "REPLACE-ID-HERE"
}
```
4. Add proxies to `config/proxies.txt`.
### Run: 
Download all the required dependencies.
```
npm install
```
Start the program.
```
node src/index.js
```
#### Done! If everything is setup correctly, your bot should be online and you should see: `Login success as [botTag].`

## Result
- !qt [site] [var]

    ![qt](https://i.imgur.com/BHGCpnQ.png)
- !var [productLink]

    ![var](https://i.imgur.com/vahIu1n.png)

#### Created by leo, feel free to contact me on discord for help 😄: leo-#0001