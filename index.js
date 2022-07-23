const { Telegraf, Markup, session } = require('telegraf')
const bsClient = require("brawlstars-api.js")
const fs = require('fs').promises

const botToken = '5515444698:AAFPG1Fm-acI6yHfjtvTht8vkza_orfAkx8'
const brawlToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6ImIwYzg5MDA2LTdmNTAtNDhhNy1hOGRkLTNlOWMwNWJhYzgxNiIsImlhdCI6MTY1ODUwNDkwMywic3ViIjoiZGV2ZWxvcGVyL2FkMDY4Zjc0LWVhMjgtYjlkOC1hMjk3LWZiZjcwYzAxZWQ2OSIsInNjb3BlcyI6WyJicmF3bHN0YXJzIl0sImxpbWl0cyI6W3sidGllciI6ImRldmVsb3Blci9zaWx2ZXIiLCJ0eXBlIjoidGhyb3R0bGluZyJ9LHsiY2lkcnMiOlsiMTc4LjEyMC4xNTUuOTkiXSwidHlwZSI6ImNsaWVudCJ9XX0.351L7_otDxQuECXQAqtRSpf6eFvo3hP0amKRhKY7Ppl5erMipl_V-PoXIKcEkMRf540MZ-Wioh4QGoG4pX_LJg'

const chatId = -1001690657208
// const myBrawlTag = '#22LPR8PG2'

const bot = new Telegraf(botToken)
const client = new bsClient(brawlToken)

bot.use(session())

const verifyButton = [
    [
        Markup.button.callback('Проверить', 'verifyButton'),
    ],
]

bot.start(async ctx => {
    ctx.session = ctx.session || {}

    ctx.session.linkingAccount = true
    ctx.session.linkingId = ctx.update.message.from.id

    const messageInfo = ctx.update.message

    const file = await fs.readFile('files/verifyPlayers.txt', 'utf-8')

    const verifyPLayers = file.split('&()&')
    verifyPLayers.pop()

    const wasVerify = verifyPLayers.find(el => {
        const creatorId = el.split('/')[0]
            
        return messageInfo.from.id === +creatorId
    })

    if (wasVerify) {
        await ctx.telegram.sendMessage(messageInfo.from.id, `Вы уже верифицировали свой аккаунт!`, {
            parse_mode: 'Markdown'
        })
    } else {
        if (messageInfo.chat.id !== chatId) {
            await ctx.telegram.sendSticker(messageInfo.from.id, 'CAACAgIAAx0CZMVhuAADG2LW3LHc6Nc8kBTAAgnIwYBUGghcAALJFgAE4UsR8c_jxT1ZvSkE')
            await ctx.telegram.sendMessage(messageInfo.from.id, `*Привет, ${messageInfo.from.first_name}!*\n\nBrawl Duels — бот для создания дуэлек по бравлу где угодно и когда угодно.\n\nИтак, для начала нужно привязать свой игровой аккаунт, для этого скиньте свой игровой тег:`, {
                parse_mode: 'Markdown'
            })

            ctx.session.verifyInProcess = true
        }
    }
})

bot.on('inline_query', async ctx => {
    ctx.session = ctx.session || {}

    const linkToGameroom = ctx.update.inline_query.query

    const fileWithLeaders = await fs.readFile('files/top.txt', 'utf-8')
    const fileWithVerifyPLayers = await fs.readFile('files/verifyPlayers.txt', 'utf-8')

    const verifyPlayersArray = fileWithVerifyPLayers.split('&()&')
    verifyPlayersArray.pop()

    const leadersArray = fileWithLeaders.split(' ')
    leadersArray.pop()

    const leadersList = leadersArray.sort()
    leadersList.reverse()

    const finalLeadersList = leadersList.slice(0, 10)

    let message = `*Список лидеров:*\n\n`

    let number = 1

    finalLeadersList.forEach(el => {
        const playerInfo = el.split('/')

        const correctPlayer = verifyPlayersArray.find(el => {
            const id = el.split('/')[0]
                
            return +playerInfo[1] === +id
        })

        const elements = correctPlayer.split('/')

        const infoObj = JSON.parse(elements[1])

        message = message + `${number}. [${infoObj.name}](tg://user?id=${playerInfo[1]}) — ${playerInfo[0]}🏆\n`

        number = number + 1
    })

    const leaderList = [
        {
            type: 'article',
            id: '2',
            title: 'Список команд',
            description: 'Список возможных команд бота',
            input_message_content: {
                message_text: `*Список команд:*\n\n@BrawlDuelsBot <ссылка на руму> — создать дуэль.`,
                parse_mode: 'Markdown',
            },
            // thumb_url: 'https://avatars.mds.yandex.net/i?id=ec1b502051433444316b04e9367e1237-2465206-images-thumbs&n=13',
        },
        {
            type: 'article',
            id: '1',
            title: 'Список лидеров',
            description: 'Список пользователей с большим количеством побед в дуэлях',
            input_message_content: {
                message_text: message,
                parse_mode: 'Markdown',
            },
            thumb_url: 'https://avatars.mds.yandex.net/i?id=ec1b502051433444316b04e9367e1237-2465206-images-thumbs&n=13',
        },
    ]

    ctx.answerInlineQuery(leaderList, {
        cache_time: 0,
        switch_pm_text: 'Привязать аккаунт',
        switch_pm_parameter: '1',
    })
    
    if (linkToGameroom.startsWith('https://link.brawlstars.com/invite/gameroom/ru?tag=') && linkToGameroom.length === 58) {
        const file = await fs.readFile('files/creators.txt', 'utf-8')

        const creatorsArray = file.split(' ')
        creatorsArray.pop()

        const correctCreator = creatorsArray.find(el => {
            return ctx.update.inline_query.from.id === +el
        })

        if (!correctCreator) {
            const file = await fs.readFile('files/verifyPlayers.txt', 'utf-8')

            const verifyPLayers = file.split('&()&')
            verifyPLayers.pop()

            const wasVerify = verifyPLayers.find(el => {
                const creatorId = el.split('/')[0]
                        
                return ctx.update.inline_query.from.id === +creatorId
            })

            if (wasVerify) {
                const duelButtons = [
                    [
                    Markup.button.callback('Принять вызов', `acceptDuelBtn/${ctx.update.inline_query.from.id}`)
                    ],
                    [
                        Markup.button.url('Перейти в лобби', `${ctx.update.inline_query.query}`)
                    ],
                    [
                        Markup.button.callback('Проверить результат дуэли', `checkResultBtn/${ctx.update.inline_query.from.id}`)
                ]
                ]

                const results = [
                    {
                        type: 'article',
                        id: '3',
                        title: 'Создать дуэльку',
                        description: 'Вы сможете пригласить кого-угодно на дуэльку в бравле',
                        input_message_content: {
                            message_text: `@${ctx.update.inline_query.from.username} ждет, пока кто-то примет его вызов.`,
                        },
                        reply_markup: { inline_keyboard: duelButtons },
                        thumb_url: 'https://avatars.mds.yandex.net/i?id=ec1b502051433444316b04e9367e1237-2465206-images-thumbs&n=13',
                    }
                ]
        
                await ctx.answerInlineQuery(results, {
                    cache_time: 0,
                    switch_pm_text: 'Привязать аккаунт',
                    switch_pm_parameter: '1',
                })
            }
        }          
    }
})

bot.on('chosen_inline_result', async ctx => {
    const file = await fs.readFile('files/creators.txt', 'utf-8')

    const newData = file + `${ctx.update.chosen_inline_result.from.id} `

    await fs.writeFile('files/creators.txt', newData)
}) 

bot.action(/.+/, async ctx => {
    ctx.session = ctx.session || {}
    
    const callbackInfo = ctx.update.callback_query

    if (callbackInfo.data === 'verifyButton') {
        if (!ctx.session.verifyInProcess) {
            ctx.answerCbQuery('Бот все еще проверяет аккаунт, ожидайте!', { show_alert: true })
        } else {
            ctx.session.verifyInProcess = false

            ctx.answerCbQuery('Бот проверяет аккаунт, ожидайте', { show_alert: true })

        setTimeout(async () => {
            let playerInfo = await client.getPlayer(ctx.session.playerTag)
            const finalColor = playerInfo.nameColor

            if (finalColor === ctx.session.startNickColor) {
                ctx.telegram.sendMessage(callbackInfo.from.id, 'Мы не смогли убедиться, что это именно ваш аккаунт... Нажмите на «Повторить верификацию» для подачи повторной заявки')
            } else {
                const shortPlayerInfo = {
                    tag: playerInfo.tag,
                    name: playerInfo.name,
                    trophies: playerInfo.trophies,
                    expLevel: playerInfo.expLevel,
                }

                const stringInfo = JSON.stringify(shortPlayerInfo)

                const file = await fs.readFile('files/verifyPlayers.txt', 'utf-8')

                const newVerifyUser = `${callbackInfo.from.id}/${stringInfo}&()&`
                const newData = file + newVerifyUser

                await fs.writeFile('files/verifyPlayers.txt', newData)
    
                ctx.telegram.sendMessage(callbackInfo.from.id, 'Верификация прошла успешно!', {
                    parse_mode: 'Markdown',
                })
            }
        }, 60000)

        return
        }

    } else {
        const array = callbackInfo.data.split('/')

        if (array[0] === 'acceptDuelBtn') {
            const file = await fs.readFile('files/duelsInfo.txt', 'utf-8')

            const duel = file.split(' ')

            const wasClicked = duel.find(el => {
                const creatorId = el.split('/')[0]
                
                return array[1] === creatorId
            })

            if (wasClicked) {
                ctx.answerCbQuery('Дуэль уже принята!', { show_alert: true })
            } else {
                if (array[0] === 'acceptDuelBtn' && callbackInfo.from.id + '' !== array[1]) {
                    const file = await fs.readFile('files/verifyPlayers.txt', 'utf-8')

                    const verifyPLayers = file.split('&()&')
                    verifyPLayers.pop()

                    const wasVerify = verifyPLayers.find(el => {
                        const creatorId = el.split('/')[0]
                        
                        return callbackInfo.from.id === +creatorId
                    })

                    if (wasVerify) {
                        ctx.telegram.sendMessage(array[1], `Пользователь [${callbackInfo.from.first_name}](tg://user?id=${callbackInfo.from.id}) принял вашу дуэль.`, {
                            parse_mode: 'Markdown',
                        })
                        
                        const file = await fs.readFile('files/duelsInfo.txt', 'utf-8')

                        const newDuel = `${array[1]}/${callbackInfo.from.id} `
                        const newData = file + newDuel

                        await fs.writeFile('files/duelsInfo.txt', newData)
            
                        return
                    } else {
                        ctx.answerCbQuery('Вы не верифицировали свой аккаунт!', { show_alert: true })
                    }
                }
        
                if (array[0] === 'acceptDuelBtn' && callbackInfo.from.id + '' === array[1]) {
                    ctx.answerCbQuery('Вы не можете принять собственную дуэль!', { show_alert: true })
        
                    return
                }
            }
        }

        if (array[0] === 'checkResultBtn') {

            const file = await fs.readFile('files/duelsInfo.txt', 'utf-8')

            const duelInfo = file.split(' ')
            duelInfo.pop()

            const correctDuel = []

            duelInfo.forEach(el => {
                if (el.startsWith(array[1])) {
                    correctDuel.push(el)

                    return
                }
            })

            if (correctDuel) {
                const correctInfo = correctDuel[0].split('/')

                async function getBattleResult() {

                    const file = await fs.readFile('files/verifyPlayers.txt', 'utf-8')

                    const verifyPlayersArray = file.split('&()&')
                    verifyPlayersArray.pop()

                    const correctPlayers1 = []
                    const correctPlayers2 = []

                    verifyPlayersArray.forEach(el => {
                        elInfo = el.split('/')
                        
                        if (elInfo[0] === correctInfo[0]) {
                            const correctEl = JSON.parse(elInfo[1])
                            correctPlayers1.push(correctEl)
                        }

                        if (elInfo[0] === correctInfo[1]) {
                            const correctEl = JSON.parse(elInfo[1])
                            correctPlayers2.push(correctEl)
                        }
                    })

                    const resultBattle1 = await client.getPlayerBattles(correctPlayers1[0].tag)
                    const resultBattle2 = await client.getPlayerBattles(correctPlayers2[0].tag)

                    if (resultBattle1[0].battle.result === 'victory') {
                        ctx.telegram.sendMessage(chatId, `В дуэли ${correctPlayers1[0].name} vs ${correctPlayers2[0].name}, победу одержал ${correctPlayers1[0].name}`)

                        const file = await fs.readFile('files/top.txt', 'utf-8')

                        let leaders = file.split(' ')
                        leaders.pop()

                        const correctLeaderInfoIndex = leaders.findIndex(el => {
                            const correctId = el.split('/')[1]
                                
                            return +correctInfo[0] === +correctId
                        })

                        let newLeaderInfo 

                        if (correctLeaderInfoIndex !== -1) {
                            const elements = leaders[correctLeaderInfoIndex].split('/')
                            const newScore = +elements[0] + 1
                            newLeaderInfo = `${newScore}/${elements[1]}`

                            leaders[correctLeaderInfoIndex] = newLeaderInfo
                        } else {
                            const id = correctInfo[0]
                            const newScore = 1
                            newLeaderInfo = `${newScore}/${id}`

                            leaders.push(newLeaderInfo)
                        }

                        newLeaders = leaders.join(' ')

                        await fs.writeFile('files/top.txt', newLeaders + ' ')
                    }

                    if (resultBattle2[0].battle.result === 'victory') {
                        ctx.telegram.sendMessage(chatId, `В дуэли ${correctPlayers1[0].name} vs ${correctPlayers2[0].name}, победу одержал ${correctPlayers2[0].name}`)

                        const file = await fs.readFile('files/top.txt', 'utf-8')

                        let leaders = file.split(' ')
                        leaders.pop()

                        const correctLeaderInfoIndex = leaders.findIndex(el => {
                            const correctId = el.split('/')[1]
                                
                            return +correctInfo[1] === +correctId
                        })

                        let newLeaderInfo 

                        if (correctLeaderInfoIndex !== -1) {
                            const elements = leaders[correctLeaderInfoIndex].split('/')
                            const newScore = +elements[0] + 1
                            newLeaderInfo = `${newScore}/${elements[1]}`

                            leaders[correctLeaderInfoIndex] = newLeaderInfo
                        } else {
                            const id = correctInfo[1]
                            const newScore = 1
                            newLeaderInfo = `${newScore}/${id}`

                            leaders.push(newLeaderInfo)
                        }

                        newLeaders = leaders.join(' ')

                        await fs.writeFile('files/top.txt', newLeaders + ' ')
                    }

                    const fileWithCreators = await fs.readFile('files/creators.txt', 'utf-8')
                    
                    const creatorsArray = fileWithCreators.split(' ')
                    creatorsArray.pop()

                    const correctIndex = creatorsArray.findIndex(el => {
                        return +correctInfo[0] === +el
                    })

                    if (correctIndex || correctIndex === 0) {
                        creatorsArray.splice(correctIndex, 1)
                    }

                    const newData = creatorsArray.join(' ')

                    await fs.writeFile('files/creators.txt', newData + ' ')

                    ctx.telegram.sendMessage(chatId, `[lol](tg://user?id=5232252118)`, {
                        parse_mode: 'Markdown',
                    })
                }

                if (callbackInfo.from.id + '' === correctInfo[0]) {
                    getBattleResult()

                    return
                }

                if (callbackInfo.from.id + '' === correctInfo[1]) {
                    getBattleResult()

                    return
                } else {
                    ctx.answerCbQuery('Вы не являетесь участником этой дуэли!', { show_alert: true })
                }
            }
        }
    }
})

bot.on('sticker', async ctx => {
    console.log(ctx.update.message)
})

bot.on('message', async ctx => {
    const messageInfo = ctx.update.message

    ctx.session = ctx.session || {}

    if (ctx.session.linkingAccount && ctx.session.linkingId === messageInfo.from.id) {
        const messageInfo = ctx.update.message
        let accountTag

        if (messageInfo.text.startsWith('#')) {
            accountTag = messageInfo.text.toUpperCase()
        } else {
            accountTag = '#' + messageInfo.text
            accountTag = accountTag.toUpperCase()
        }

        let playerInfo = null

        try {
            playerInfo = await client.getPlayer(accountTag)
        } catch (e) {
            console.error('Player info error', e)
        }

        if (!playerInfo) {
            return ctx.telegram.sendMessage(messageInfo.from.id, 'Неверный тэг!', {
                parse_mode: 'Markdown',
                // reply_markup: { inline_keyboard: verifyButton },
            })
        }
        
        ctx.session.playerTag = messageInfo.text
        const startNickColor = playerInfo.nameColor

        ctx.session.startNickColor = startNickColor

        if (startNickColor) {
            ctx.telegram.sendMessage(messageInfo.from.id, '*Бот нашел аккаунт!*\n\nНо, для большей достоверности, нам нужно убедиться, что это именно ваш аккаунт. Для этого вам нужно поменять цвет вашего никнейма и после этого нажать на кнопку ниже', {
                parse_mode: 'Markdown',
                reply_markup: { inline_keyboard: verifyButton },
            })

            return
        }

        ctx.session.linkingAccount = false
    } else {
        if (messageInfo.chat.id !== chatId) {

            const file = await fs.readFile('files/duelsInfo.txt', 'utf-8')

            const duels = file.split(' ')
            duels.pop()

            duels.forEach(el => {
                const duelInfo = el.split('/')

                if (duelInfo[2] === 'duelCreated' && duelInfo[0] === messageInfo.from.id + '') {
                    const link = messageInfo.text

                    ctx.telegram.sendMessage(duelInfo[1], `Ссылка на дуэль - ${link}`)
                }
            })
        }
    }
})

bot.launch()