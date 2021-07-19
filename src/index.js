//default headers
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36';
const safeHeaders = {
    'pragma': 'no-cache',
    'cache-control': 'no-cache',
    'upgrade-insecure-requests': '1',
    'user-agent': userAgent,
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'sec-fetch-site': 'none',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-user': '?1',
    'sec-fetch-dest': 'document',
    'accept-language': 'en-US,en;q=0.9'
};

const request = require('request-promise').defaults({
    simple: false,
    gzip: true,
    resolveWithFullResponse: true,
    maxRedirects: 1,
    followRedirect: false,
    headers: safeHeaders
});
const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
require('console-stamp')(console, 'HH:MM:ss.l');

//import tools
const { 
    formatProxy,
    sleep 
} = require('../utils/tools');
const config = require('../config/config');

//read and format proxies
let proxies = [];
fs.readFileSync(__dirname + '/../config/proxies.txt', 'utf-8')
    .split(/\r?\n/).forEach(line => proxies.push(line));
this.rawProxy = proxies[Math.floor(Math.random() * proxies.length)];
this.proxy = formatProxy(this.rawProxy);

//create DISCORD EMBED
const embed = new Discord.MessageEmbed()
    .setColor(config.colorHexCode)
    .setTimestamp(new Date().toISOString())
    .setFooter(config.embedFooter)

//[TOOLS]
//get footsites product details(product name, img, color) & send embed
async function fsQtBuilder(site, sku, embed, m, proxy) {
    try {
            const response = await request({
                    url: `https://www.${site}.com/product/~/${sku}.html`,
                    method: 'GET',
                    proxy: proxy,
            });
        sleep(5000);
        const dom = new JSDOM(response.body, 'html');
        var productName = dom.window.document.querySelector('span.ProductName-primary').textContent;
        var productNameAlt = dom.window.document.querySelector('span.ProductName-alt').textContent;
        var productColor = dom.window.document.querySelector('p.ProductDetails-form__label').textContent;

        //add product details to embed & send
        embed.setTitle(`${productName} — ${productNameAlt}`);
        embed.setURL(`https://www.${site}.com/product/~/${sku}.html`);
        embed.setDescription(productColor);
        embed.setThumbnail(`https://images.footlocker.com/is/image/EBFL2/${sku}?wid=300&hei=300`);
        embed.addField('Website', '```' + site + '```', true);
        embed.addField('Product Sku', '```' + sku + '```', true);
        embed.addField('Bot QuickTask', 
            `[Cyber](https://cybersole.io/dashboard/tasks?linkchange=${site}:${sku}) | [Wrath](http://localhost:32441/qt?input=https://www.${site}.com/product/~/${sku}.html) | [Prism](http://localhost:9099/footsites?store=${site}&sku=${sku}&platform=desktop) | [WhatBot](https://whatbot.club/redirect-qt?qt=whatbot://https://www.${site}.com/product/~/${sku}.html)`);
        sleep(3000);
        m.channel.send(embed);
        embed.fields = []; //clear embed fields (prevents double fields for next embed)
        embed.setURL('');
    } catch (error) {
        sleep(10000);
        this.rawProxy = proxies[Math.floor(Math.random() * proxies.length)];
        this.proxy = formatProxy(this.rawProxy);
        console.log('[FOOTSITES] Fetching site failed due to proxy or invalid inputs.');
        return fsQtBuilder(site, sku, embed, m, this.proxy)
    }
}

//get shopify product details(product name, size, img, stock[shoepalace]) & send embed
async function getShopifyProduct(jsonLink, embed, m, proxy) {
    try {
            const response = await request({
                url: jsonLink,
                method: 'GET',
                proxy: proxy
            });
        sleep(1000);
        const productDetails = JSON.parse(response.body.split(";", 1)[0]);
        let shopSizes = Array();
        let shopVariants = Array();
        let shopStock = Array();
        let shopTotalStock = 0;

        //get and filter sizes, variants & stock
        productDetails.product.variants.forEach((variants) => {
            shopSizes.push(variants.title + "\n")
            shopVariants.push(variants.id + "\n")
            if (jsonLink.includes('shoepalace')) {
                var stock = variants.inventory_quantity;
                var formatStock = stock.toString().replace('-','');
                shopTotalStock+=parseInt(formatStock);
                shopStock.push(formatStock + "\n");
            }
        });
        let formatSizes = shopSizes.join(''); 
        let formatVariants = shopVariants.join(''); 
        let formatStock = shopStock.join(''); 

        //add product details to embed & send
        embed.setTitle(productDetails.product.title);
        embed.setURL(jsonLink.split('.json')[0]);
        embed.setDescription('**Total Stock —** ' + shopTotalStock);
        embed.setThumbnail(productDetails.product.images[0].src);
        embed.addField('Sizes', '```' + formatSizes + '```', true);
        embed.addField('Variants', '```' + formatVariants + '```', true);
        if (jsonLink.includes('shoepalace')) {
            embed.addField('Stock', '```' + formatStock + '```', true);
        }
        sleep(3000);
        m.channel.send(embed);
        embed.fields = []; //clear embed fields (prevents double fields for next embed)
        embed.setURL('');
    } catch {
        sleep(3000);
        this.rawProxy = proxies[Math.floor(Math.random() * proxies.length)];
        this.proxy = formatProxy(this.rawProxy);
        console.log('[SHOPIFY] Fetching site failed due to proxy or invalid inputs.');
        return getShopifyProduct(jsonLink,embed, m, this.proxy)
    }
}


//client local login (debug purposes)
client.login(config.discordBotToken);
//server (config vars)
// client.login(process.env.DJS_TOKEN);
client.on('ready', () => {
    console.log(`Login success as ${client.user.tag}.`);
});



//commands (on message/keyword)
client.on('message', (msg) => {
    const message = msg.content;
    if (msg.channel.type == 'dm') return; //restrict messages in direct messages


    //footsites quicktask builder command (!qt [site] [sku])
    if (message.startsWith('!qt')) {
        console.log('[' + msg.member.user.tag + '] ' + message);
        const site = message.split(' ')[1]; //get user input [site]
        const siteLowerCase = site.toLowerCase();
        const sku = message.split(' ')[2]; //get user input [sku]
        if (site, sku === undefined) {
            embed.setTitle('Error');
            embed.setDescription('Invalid input, use !qt [site] [sku].');
            embed.setThumbnail('https://i.imgur.com/TbLuxam.png');
            msg.channel.send(embed);
        } else if (['footlocker', 'footaction', 'champssports', 'eastbay'].includes(siteLowerCase)) {
            fsQtBuilder(site, sku, embed, msg, this.proxy);
        } else {
            embed.setTitle('Error');
            embed.setDescription('Invalid input, [sites] -> footlocker, footaction, champssports, eastbay');
            embed.setThumbnail('https://i.imgur.com/TbLuxam.png');
            msg.channel.send(embed);
        }
    }


    //shopify variant scraper command (!var [productlink])
    if (message.startsWith('!var')) {
        console.log('[' + msg.member.user.tag + '] ' + message);
        const inputLink = message.split(' ')[1]; //get user input [productlink]
        if (inputLink === undefined) {
            embed.setTitle('Error');
            embed.setDescription('Invalid input, use !var [productlink].');
            msg.channel.send(embed);
        } else if (inputLink.includes('?') || !inputLink.includes('.json')) {
            let jsonLink = inputLink.split('?')[0] + ('.json');
            getShopifyProduct(jsonLink, embed, msg, this.proxy);
        } else {
            getShopifyProduct(inputLink, embed, msg, this.proxy);
        }
    }


    //watch certain channel to notify users
    if (msg.channel.id === config.checkpointRoleID) { 
        for(var i = 0; i < msg.embeds.length; i++) {
            if (msg.embeds[i].title.includes('Checkpoint activated!')) { //(config for personal use)
                if (msg.embeds[i].author.name.includes('https://shoepalace.com/')) {
                    msg.channel.send(`<@&${config.pingRoleID}> **ShoePalace Checkpoint Up** — Watch <#${config.shopifyChannelID}> for **potential restocks.**`);
                } else if (msg.embeds[i].author.name.includes('https://shopnicekicks.com/')) {
                    msg.channel.send(`<@&${config.pingRoleID}> **ShopNiceKicks Checkpoint Up** — Watch <#${config.shopifyChannelID}> for **potential restocks.**`);
                }
            }
        }
    }

})