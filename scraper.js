const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    let links = getAllLinks(2400, 2419);
    await page.goto('https://optc-db.github.io/characters/#/search/')
    let all = []

    console.log('<<< Links >>>');
    console.log(links);
    let lima = links.length

    for(let i = 0; i < lima; i++){
        console.log("parse " + links[i].url + "...");
        let data = await singleDataScraper(page, links[i].url, links[i].id).catch((e) => { console.error(e); return null; });
        all.push(data);
    }

    // Save data to file
    console.log("saving as json file...");
    fs.writeFileSync('data.json', JSON.stringify(all));

    await browser.close();
})();

// Links
function getAllLinks(start, end){
    let list = []
    for(let i = start; i < end; i++){
        list.push({
            id: i,
            url: 'https://optc-db.github.io/characters/#/view/' + i
        });
    }
    return list
}

// data Scraper
async function singleDataScraper(page, url, unitID){
    await page.goto(url)
    await page.screenshot({path: 'test.png'});
    let data = await page.evaluate(() => {
        let data = {}
        let isDualUnit = (document.querySelector('div.stats-pane > table.table.table-striped > tbody > tr > th:nth-Child(1)').innerText === "Character 1 Class 1")
        console.log("extracting details...")
        //#region details
        data.unitName = unitName = document.querySelector('div.modal-content > div.modal-header').innerText
        data.dualunit = isDualUnit
        if(isDualUnit){
            let dualclass = (document.querySelector('div.stats-pane > table.table.table-striped > tbody > tr > th:nth-Child(1)').innerText === "Character 1 Class 1")
            data.class = [document.querySelector('div.stats-pane > table.table.table-striped > tbody > tr > td.ng-binding.ng-scope').innerText, 
            dualclass ? document.querySelector('div.stats-pane > table.table.table-striped > tbody > tr > td.ng-binding.ng-scope:nth-Child(2)').innerText : null]
            
            data.char2Class = [document.querySelector("table > tbody > tr:nth-Child(4) > td[ng-if='hybrid && dualunit']").innerText,
            document.querySelector('table > tbody > tr:nth-child(2) > td:nth-child(4)').innerText]

            data.dualCharClass = [document.querySelector('table > tbody > tr:nth-child(4) > td:nth-child(1)').innerText,
            document.querySelector('table > tbody > tr:nth-child(4) > td:nth-child(2)').innerText]
            
            data.isDualClass = dualclass
            data.type = document.querySelector('table > tbody > tr:nth-child(4) > td:nth-child(3)').innerText.split('/')
            data.rarity = document.querySelector('table > tbody > tr:nth-child(4) > td:nth-child(4)').innerText
            data.cost = document.querySelector('table > tbody > tr:nth-child(4) > td:nth-child(5)').innerText
            data.combo = document.querySelector('table > tbody > tr:nth-child(6) > td:nth-child(1)').innerText
            data.slots = document.querySelector('table > tbody > tr:nth-child(6) > td:nth-child(2)').innerText
            data.maxlv = document.querySelector('table > tbody > tr:nth-child(6) > td:nth-child(3)').innerText
            data.expToMax = document.querySelector('table > tbody > tr:nth-child(6) > td:nth-child(4)').innerText
        }else{
            let _dualclass = (document.querySelector('div.stats-pane > table.table.table-striped > tbody > tr > th:nth-Child(1)').innerText === "Class 1")
            data.class = [document.querySelector('div.stats-pane > table.table.table-striped > tbody > tr > td.ng-binding.ng-scope').innerText , 
            _dualclass ? document.querySelector('div.stats-pane > table.table.table-striped > tbody > tr > td.ng-binding.ng-scope:nth-Child(2)').innerText : null]
            
            data.isDualClass = _dualclass
            data.type = _dualclass ? document.querySelector('table > tbody > tr:nth-child(2) > td:nth-child(3)').innerText : document.querySelector('table > tbody > tr:nth-child(2) > td:nth-child(2)').innerText
            data.rarity = _dualclass ? document.querySelector('table > tbody > tr:nth-child(2) > td:nth-child(4)').innerText : document.querySelector('table > tbody > tr:nth-child(2) > td:nth-child(3)').innerText
            data.cost = _dualclass ? document.querySelector('table > tbody > tr:nth-child(2) > td:nth-child(5)').innerText : document.querySelector('table > tbody > tr:nth-child(2) > td:nth-child(4)').innerText
            data.combo = document.querySelector('table > tbody > tr:nth-child(4) > td:nth-child(1)').innerText
            data.slots = document.querySelector('table > tbody > tr:nth-child(4) > td:nth-child(2)').innerText
            data.maxlv = document.querySelector('table > tbody > tr:nth-child(4) > td:nth-child(3)').innerText
            data.expToMax = document.querySelector('table > tbody > tr:nth-child(4) > td:nth-child(4)').innerText
        }
        //#endregion
        console.log("extracting stats...");       
        //#region stats
        data.lv1Atk = document.querySelector('table > tbody > tr:nth-child(1) > td:nth-child(3)').innerText
        data.lv1HP = document.querySelector('table > tbody > tr:nth-child(1) > td:nth-child(2)').innerText
        data.lv1RCV = document.querySelector('table > tbody > tr:nth-child(1) > td:nth-child(4)').innerText
        data.atk = document.querySelector('div:nth-child(1) > table > tbody > tr:nth-child(2) > td:nth-child(3)').innerText
        data.hp = document.querySelector('div:nth-child(1) > table > tbody > tr:nth-child(2) > td:nth-child(2)').innerText
        data.rcv = document.querySelector('div:nth-child(1) > table > tbody > tr:nth-child(2) > td:nth-child(4)').innerText
        let hasLimitBreak = (document.querySelector('div:nth-child(1) > table > tbody > tr:nth-child(3) > td:nth-child(1)').innerText === "Limit Break")
        data.lbHp = hasLimitBreak ? document.querySelector('div:nth-child(1) > table > tbody > tr:nth-child(3) > td:nth-child(2)').innerText : null 
        data.lbAtk = hasLimitBreak ? document.querySelector('div:nth-child(1) > table > tbody > tr:nth-child(3) > td:nth-child(3)').innerText: null
        data.lbRcv =  hasLimitBreak ? document.querySelector('div:nth-child(1) > table > tbody > tr:nth-child(3) > td:nth-child(4)').innerText: null
        let haslimitBreakExpansion = hasLimitBreak ? ( document.querySelector('div:nth-child(1) > table > tbody > tr:nth-child(4) > td:nth-child(1)').innerText === "Limit Break Expansion"): false
        data.lbEHp = haslimitBreakExpansion ? document.querySelector('div:nth-child(1) > table > tbody > tr:nth-child(4) > td:nth-child(2)').innerText : null
        data.lbEAtk = haslimitBreakExpansion ? document.querySelector('div:nth-child(1) > table > tbody > tr:nth-child(4) > td:nth-child(3)').innerText : null
        data.lbERcv = haslimitBreakExpansion ? document.querySelector('div:nth-child(1) > table > tbody > tr:nth-child(4) > td:nth-child(4)').innerText : null
        //#endregion
        //#region captain
        // if(document.querySelector('div:nth-child(8) > table > tbody > tr:nth-child(1) > td:nth-child(2) > div').innerText != "None"){
        //     data.cptAbbility = isDualUnit ? "" : document.querySelector("div.modal-body > div > table > tbody > tr > td > div").innerText
        // let nodeList = document.querySelectorAll('div:nth-child(8) > table > tbody > tr:nth-child(1) > td:nth-child(2) > div > div')
        // data.char1Cpt = isDualUnit ? nodeList[9].innerText: null
        // data.char2Cpt = isDualUnit ? nodeList[10].innerText: null
        // data.dualCharCpt = isDualUnit ? nodeList[11].innerText: null
        // if(hasLimitBreak && data.char1Cpt === null){
        //     let i = 2
        //     data.lbSpecial = []
        //     do{
        //         if(nodeList[i].innerText != "None"){
        //             data.lbSpecial.push(nodeList[i].innerText)
        //             i ++;
        //         }else
        //             break;
                
        //     }
        //     while(nodeList.length > i)
        // }
        // }
        //#endregion

        console.log("extracting sailors...");
        // sailor 
        /// fehler !
        let hasSailorAbb = document.querySelector('div:nth-child(8) > table > tbody > tr:nth-child(2) > td:nth-child(1)').innerText === "Sailor Ability"
        if(hasSailorAbb){
            let i = 10
            let sailors = []
            data.sailorRaw = document.querySelector('body > div.popup.ng-scope.visible > div.inner-container.ng-scope > div > div > div > div.modal-body > div:nth-child(8) > table > tbody > tr:nth-child(2) > td:nth-child(2)').innerText
            while(document.querySelector('div:nth-child(8) > table > tbody > tr:nth-child(2) > td:nth-child(2) > div > div:nth-child(' + i + ')').innerText != "None"){
                sailors.push(document.querySelector('div:nth-child(8) > table > tbody > tr:nth-child(2) > td:nth-child(2) > div > div:nth-child(' + i + ')').innerText)
            }
            data.sailors = sailors
        }
        console.log("extracting swap...");
        // swap
        data.swapAbbility = isDualUnit ? document.querySelector('div:nth-child(8) > table > tbody > tr:nth-child(4) > td:nth-child(2) > strong').innerText : null;
        console.log("extracting special...");
        //#special
        try {
            data.specialName = isDualUnit ? document.querySelector('div:nth-child(8) > table > tbody > tr:nth-child(4) > td:nth-child(2) > strong').innerText : document.querySelector('div:nth-child(8) > table > tbody > tr:nth-child(3) > td:nth-child(2) > strong').innerText
            data.specialDetails = isDualUnit ? document.querySelector('div:nth-child(8) > table > tbody > tr:nth-child(4) > td:nth-child(2) > div').innerText : document.querySelector('div:nth-child(8) > table > tbody > tr:nth-child('+ hasSailorAbb ? 3 : 4 +') > td:nth-child(2) > div').innerText
            
            data.haseMultipleSpCds = (document.querySelector('div:nth-child(8) > table > tbody > tr:nth-child(4) > td:nth-child(1)').innerText != 'Cooldown')
            let specialCooldowns = haseMultipleSpCds ? isDualUnit ? document.querySelector('div:nth-child(8) > table > tbody > tr:nth-child(5) > td.ng-binding').innerText : document.querySelector('div:nth-child(8) > table > tbody > tr:nth-child(4) > td.ng-binding').innerText.split('\n') : null;
            let singleSpecialCooldown = specialCooldowns ? null : document.querySelector('div:nth-child(8) > table > tbody > tr:nth-child(4) > td.ng-binding').innerText
            if(data.specialCooldown === false){
                data.specialCooldown = [singleSpecialCooldown]
            }else{
                data.specialCooldown = []
                specialCooldowns.forEach(element => {
                    data.specialCooldown.push(element)
                });
            }
        } catch (error) {
        }
        //#endregion
        
        // evolutions
        let evoTo = {}
        let evoFrom = {}
        console.log("extracting alias...");
        // alias
        data.jpName = null
        data.frenchName = null
        data.enName = data.unitName
        console.log("extracting tags...");
        // tags
        let htmlTagTable = document.querySelectorAll('div > div > div > div.modal-body > div.tag-container')
        data.tags = htmlTagTable[0].innerText

        console.log("save data...");
        return data
    });

    data.unitID = unitID
    let stringID = ""
        if(data.unitID > 999)
            stringID = unitID
        else if(data.unitID > 99)
            stringID = "0" + unitID
        else if(data.unitID > 9)
            stringID = "00" + data.unitID
        else
            stringID = "000" + data.unitID
        
        data.unitImg = "https://onepiece-treasurecruise.com/wp-content/uploads/c" + stringID + ".png"
        data.unitIcon = "https://onepiece-treasurecruise.com/wp-content/uploads/f" + stringID + ".png"

    console.log(url + " was passed");
    return data
}