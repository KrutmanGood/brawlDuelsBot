const { bot, client } = require('./bot.js')
const fs = require('fs').promises
const { CronJob } = require('cron')
const { getTime, getDate } = require('./src/utils.js')

async function checkForDuelsResult() {
    const duelsData = await fs.readFile('files/duelsInfo.txt', 'utf-8')
    const duelsArray = duelsData.split(' ')
    duelsArray.pop()

    duelsArray.forEach(async el => {
        const firstPlayerId = +el.split('/')[0]
        const secondPlayerId = +el.split('/')[1]

        const verifyPlayersData = await fs.readFile('files/verifyPlayers.txt', 'utf-8')
        const verifyPlayersArray = verifyPlayersData.split('&()&')
        verifyPlayersArray.pop()

        const correctProfile1 = verifyPlayersArray.find(el => {
            const id = el.split('/')[0]
            return firstPlayerId === +id
        })

        const correctProfile2 = verifyPlayersArray.find(el => {
            const id = el.split('/')[0]
            return secondPlayerId === +id
        })

        if (correctProfile1 && correctProfile2) {
            const objectPlayer1 = JSON.parse(correctProfile1.split('/')[1])
            const objectPlayer2 = JSON.parse(correctProfile2.split('/')[1])

            const playerData1 = await client.getPlayerBattles(objectPlayer1.tag)
            const playerData2 = await client.getPlayerBattles(objectPlayer2.tag)

            if (
                playerData1[0].battle.result !== playerData2[0].battle.result &&
                playerData1[0].battleTime === playerData2[0].battleTime
            ) {
                let winnerId

                if (playerData1[0].battle.result === 'victory') {
                    winnerId = firstPlayerId
                } else {
                    winnerId = secondPlayerId
                }

                const leadersData = await fs.readFile('files/top.txt', 'utf-8')
                let leaders = leadersData.split(' ')
                leaders.pop()

                let newLeaderInfo
                const fileWithDuelsInfo = await fs.readFile('files/duelsInfo.txt', 'utf-8')

                const correctLeaderInfoIndex = leaders.findIndex(el => {
                    const id = el.split('/')[1]
                    return +winnerId === +id
                })

                if (correctLeaderInfoIndex !== -1) {
                    const elements = leaders[correctLeaderInfoIndex].split('/')
                    const newScore = +elements[0] + 1
                    newLeaderInfo = `${newScore}/${elements[1]}`

                    leaders[correctLeaderInfoIndex] = newLeaderInfo
                } else {
                    const id = winnerId
                    const newScore = 1
                    newLeaderInfo = `${newScore}/${id}`

                    leaders.push(newLeaderInfo)
                }

                await fs.writeFile('files/top.txt', leaders.join(' ') + ' ')
    
                const duelsArray = fileWithDuelsInfo.split(' ')
                duelsArray.pop()
        
                const correctIndex1 = duelsArray.findIndex(el => {
                    const id = el.split('/')[0]
                    return winnerId === +id
                })
        
                if (correctIndex1 || correctIndex1 === 0) {
                    duelsArray.splice(correctIndex1, 1)
                }
        
                const newData1 = duelsArray.join(' ')
        
                await fs.writeFile('files/duelsInfo.txt', newData1)

                const battleHistory = await fs.readFile('files/battleHistory.txt', 'utf-8')

                const date = getDate()
                const time = getTime()

                const winnerIndex = winnerId === firstPlayerId ? '1' : '2'
                const newBattle = `${firstPlayerId}/${secondPlayerId}/${winnerIndex}/${date}/${time} `
                const newData3 = battleHistory + newBattle

                await fs.writeFile('files/battleHistory.txt', newData3)
            }
        }
    })
}

const job = new CronJob(
	'* * * * *',
	() => checkForDuelsResult(),
	null,
	true,
	'America/Los_Angeles'
);
// Use this if the 4th param is default value(false)
job.start()