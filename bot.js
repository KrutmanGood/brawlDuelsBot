const { Telegraf, Markup, session } = require('telegraf')
const bsClient = require("brawlstars-api.js")
const fs = require('fs').promises

const botToken = '5515444698:AAFPG1Fm-acI6yHfjtvTht8vkza_orfAkx8'
const brawlToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjhhZTc5MmI1LWU1YmItNGE4YS04Yzg1LTQ4Nzg5N2M2NThhMiIsImlhdCI6MTY1ODY3NzMyNSwic3ViIjoiZGV2ZWxvcGVyL2FkMDY4Zjc0LWVhMjgtYjlkOC1hMjk3LWZiZjcwYzAxZWQ2OSIsInNjb3BlcyI6WyJicmF3bHN0YXJzIl0sImxpbWl0cyI6W3sidGllciI6ImRldmVsb3Blci9zaWx2ZXIiLCJ0eXBlIjoidGhyb3R0bGluZyJ9LHsiY2lkcnMiOlsiMzcuNDUuNDIuMjEyIl0sInR5cGUiOiJjbGllbnQifV19.-xzengUHCPQxIluEbty8cYFnm4yv0g3nFnHXck2qx2PijrL3o3h_ybhxJAK2iE6NtWS3V6nceLNKy_giuMW-vQ'

const chatId = -1001690657208
// const myBrawlTag = '#22LPR8PG2'

const bot = new Telegraf(botToken)
const client = new bsClient(brawlToken)

bot.use(session())

const verifyButton = [
    [
        Markup.button.callback('☑️ Проверить', 'verifyButton'),
    ],
]

const correctAccount = [
    [
        Markup.button.callback('Да, это мой аккаунт', 'correctAccount'),
    ],
    [
        Markup.button.callback('Неа, хз кто это', 'notCorrectAccount'),
    ]
]

const menuButtons = [
    [
        Markup.button.callback('🎯 Создать дуэль', 'createDuel'), Markup.button.callback('📝 История дуэлей', 'duelsHistory'),
    ],
    [
        Markup.button.callback('🏆 Список лидеров', 'leaderList'),
    ]
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
        await ctx.telegram.sendMessage(messageInfo.from.id, `Чтобы создать дуэль, выбери нужный пункт в меню:`, {
            parse_mode: 'Markdown', 
            reply_markup: { keyboard: menuButtons, resize_keyboard: true, }
        })

        ctx.session.linkingAccount = false
    } else {
        if (messageInfo.chat.id !== chatId) {
            await ctx.telegram.sendMessage(messageInfo.from.id, '👋')
            await ctx.telegram.sendMessage(messageInfo.from.id, `*Привет, ${messageInfo.from.first_name}!*\n\nДавай привяжем твой игровой аккаунт.\n\nДля этого отправь мне свой игровой тег в формате _#XXXXXX_ или пришли сюда ссылку на добавление тебя в друзья.`, {
                parse_mode: 'Markdown'
            })

            ctx.session.verifyInProcess = true
        }
    }
})

bot.on('inline_query', async ctx => {
    ctx.session = ctx.session || {}

    const file = await fs.readFile('files/creators.txt', 'utf-8')

    const creatorsArray = file.split(' ')
    creatorsArray.pop()

    const correctCreator = creatorsArray.find(el => ctx.update.inline_query.from.id === +el)

    if (correctCreator) {
        let wins

        const fileWithLeaders = await fs.readFile('files/top.txt', 'utf-8')

        const leadersArray = fileWithLeaders.split(' ')
        leadersArray.pop()

        let correctLeader = leadersArray.find(el => {
            const Id = el.split('/')[1]
                
            return ctx.update.inline_query.from.id === +Id
        })

        if (correctLeader) {
            wins = correctLeader.split('/')[0]
        } else {
            wins = 0
        }

        const fileWithVerifyPlayers = await fs.readFile('files/verifyPlayers.txt', 'utf-8')

        const array = fileWithVerifyPlayers.split('&()&')
        array.pop()

        let correctProfile = array.find(el => {
            const Id = el.split('/')[0]
                
            return ctx.update.inline_query.from.id === +Id
        })

        let wasVerify = correctProfile.split('/')

        let string = JSON.parse(wasVerify[1])



        const duelButtons = [
            [
                Markup.button.callback('Принять вызов', `acceptDuelBtn/${ctx.update.inline_query.from.id}`)
            ],
        ]

        const results = [
            {
                type: 'article',
                id: '3',
                title: 'Пригласить в дуэль',
                description: 'Приглашение на дуэль отправится прямо в этот чат',
                input_message_content: {
                    message_text: `Го дуэль, я создал\n\nНик: *${string.name}*\nКубков: *${string.trophies}*🏆\nДуэлей выиграно: *${wins}*`,
                    parse_mode: 'Markdown'
                },
                reply_markup: { inline_keyboard: duelButtons },
                thumb_url: 'https://clashofclans-fun.com/wp-content/uploads/2022/01/unnamed.jpg',
            }
        ]

        ctx.answerInlineQuery(results, {
            cache_time: 0,
        })
    } else {
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

            message = message + `${number}. [${infoObj.name}](tg://user?id=${playerInfo[1]}) — ${playerInfo[0]}🏅\n`

            number = number + 1
        })

        const leaderList = [
            {
                type: 'article',
                id: '5',
                title: 'Список лидеров',
                description: 'Список пользователей с большим количеством побед в дуэлях',
                input_message_content: {
                    message_text: message,
                    parse_mode: 'Markdown',
                },
                thumb_url: 'https://clashofclans-fun.com/wp-content/uploads/2022/01/unnamed.jpg',
            }
        ]

        const file = await fs.readFile('files/battleHistory.txt', 'utf-8')

        const battlesArray = file.split(' ')
        battlesArray.pop()

        const correctBattles = battlesArray.filter( el => el.includes(ctx.update.inline_query.from.id) )

        if (correctBattles[0] !== undefined) {
            const finalCorrectBattlesArray = correctBattles.slice(0, 5)

            let message1 = `*Мои последние дуэли:*\n\n`
            let number = 1

            finalCorrectBattlesArray.forEach(async (el, elIndex) => {
                const elements = el.split('/')

                const fileWithVerifyPlayers = await fs.readFile('files/verifyPlayers.txt', 'utf-8')

                const verifyPLayers = fileWithVerifyPlayers.split('&()&')
                verifyPLayers.pop()

                const wasVerify1 = verifyPLayers.find(el => {
                    const id = el.split('/')[0]
                        
                    return +elements[0] === +id
                })

                if (wasVerify1) {
                    const wasVerify2 = verifyPLayers.find(el => {
                        const id = el.split('/')[0]
                            
                        return +elements[1] === +id
                    })

                    if (wasVerify2) {
                        let obj1 = wasVerify1.split('/')[1]
                        let obj2 = wasVerify2.split('/')[1]

                        obj1 = JSON.parse(obj1)
                        obj2 = JSON.parse(obj2)

                        const winner = elements[2] === '1' ? obj1 : obj2

                        message1 = message1 + `${number}. [${obj1.name}](tg://user?id=${elements[0]}) vs [${obj2.name}](tg://user?id=${elements[1]}) – победил ${winner.name}\n\n`
                        number = number + 1

                        if (finalCorrectBattlesArray.length - 1 === elIndex) {
                            const results = [
                                {
                                    type: 'article',
                                    id: '3',
                                    title: 'История дуэлей',
                                    description: 'Пришлёт в чат список твоих последних дуэлей',
                                    input_message_content: {
                                        message_text: message1,
                                        parse_mode: 'Markdown',
                                    },
                                    thumb_url: 'https://clashofclans-fun.com/wp-content/uploads/2022/01/unnamed.jpg',
                                }
                            ]

                            results.push(leaderList[0])

                            const file = await  fs.readFile('files/verifyPlayers.txt', 'utf-8')

                            const playersArray = file.split('&()&')
                            playersArray.pop()

                            const wasVerify = playersArray.find(el => {
                                const creatorId = el.split('/')[0]
                                    
                                return ctx.update.inline_query.from.id === +creatorId
                            })

                            if (wasVerify) {
                                ctx.answerInlineQuery(results, {
                                    cache_time: 0,
                                    switch_pm_text: 'Создать дуэль',
                                    switch_pm_parameter: 'hello',
                                })
                            } else {
                                ctx.answerInlineQuery(results, {
                                    cache_time: 0,
                                    switch_pm_text: 'Привязать аккаунт',
                                    switch_pm_parameter: 'hello1',
                                })
                            }
                        }
                    }
                }
            })
        } else {
            const fileWithVerifyPlayers = await fs.readFile('files/verifyPlayers.txt', 'utf-8')

            const verifyPLayers = fileWithVerifyPlayers.split('&()&')
            verifyPLayers.pop()

            const wasVerify = verifyPLayers.find(el => {
                const id = el.split('/')[0]
                    
                return ctx.update.inline_query.from.id === +id
            })

            if (wasVerify) {
                ctx.answerInlineQuery(leaderList, {
                    switch_pm_text: 'Создать дуэль',
                    switch_pm_parameter: '002'
                })
            } else {
                ctx.answerInlineQuery(leaderList, {
                    switch_pm_text: 'Привязать аккаунт', 
                    switch_pm_parameter: '01'
                })
            }
        }
    }

})

bot.action(/.+/, async ctx => {
    ctx.session = ctx.session || {}
    
    const callbackInfo = ctx.update.callback_query

    if (callbackInfo.data === 'verifyButton') {
        let playerInfo

        try {
            playerInfo = await client.getPlayer(ctx.session.accountTag)
        } catch(e) {
            console.log(e)
        }

        const finalColor = playerInfo.nameColor

        if (finalColor === ctx.session.startNickColor) {
            ctx.answerCbQuery('Пока что изменений не заметил.\n\nОбычно задержка на серверах около 1 минуты, поэтому попробуй чуть позже нажать ещё раз', { show_alert: true })
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

            ctx.telegram.sendMessage(callbackInfo.from.id, 'Всё ок! Теперь я точно знаю, что аккаунт твой.\n\nНе забудь сменить цвет ника обратно.\n\nА вот и главное меню:', {
                parse_mode: 'Markdown',
                reply_markup: { keyboard: menuButtons, resize_keyboard: true }
            })
            ctx.telegram.deleteMessage(callbackInfo.from.id, ctx.session.foundedAccountId)
        }
    } 
    
    if (callbackInfo.data === 'correctAccount') {
        const foundedAccountId = ctx.session.foundedAccountId

        await ctx.telegram.editMessageText(callbackInfo.from.id, foundedAccountId, foundedAccountId, 'Найс! Теперь мне нужно убедиться, что это именно твой аккаунт.\n\nЗайди в игру и смени цвет своего ника на любой другой. Как только сделаешь это, вернись ко мне и нажми на кнопку проверки', {
            parse_mode: 'Markdown',
        })
        await ctx.telegram.editMessageReplyMarkup(callbackInfo.from.id, foundedAccountId, foundedAccountId, { inline_keyboard: verifyButton } )
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
                    const fileWithCreators = await fs.readFile('files/creators.txt', 'utf-8')
                        
                    const creatorsArray = fileWithCreators.split(' ')
                    creatorsArray.pop()
            
                    const correctIndex = creatorsArray.findIndex(el => {
                        return +array[1] === +el
                    })
            
                    if (correctIndex || correctIndex === 0) {
                        creatorsArray.splice(correctIndex, 1)
                    }
            
                    const newData = creatorsArray.join(' ')

                    await fs.writeFile('files/creators.txt', newData)

                    const file = await fs.readFile('files/verifyPlayers.txt', 'utf-8')

                    const verifyPLayers = file.split('&()&')
                    verifyPLayers.pop()

                    const wasVerify = verifyPLayers.find(el => {
                        const creatorId = el.split('/')[0]
                        
                        return callbackInfo.from.id === +creatorId
                    })

                    if (wasVerify) {
                        const file1 = await fs.readFile('files/linksToDuels.txt', 'utf-8')

                        const arrayWithLinks = file1.split(' ')
                        arrayWithLinks.pop()

                        const correctLink = arrayWithLinks.find(el => {
                            const creatorId = el.split('(*)')[0]
                            
                            return array[1] === creatorId
                        })

                        const justLink = correctLink.split('(*)')

                        ctx.telegram.sendMessage(+array[1], `Пользователь [${callbackInfo.from.first_name}](tg://user?id=${callbackInfo.from.id}) принял вашу дуэль.`, {
                            parse_mode: 'Markdown',
                        })

                        ctx.telegram.sendMessage(callbackInfo.from.id, `Ты принял дуэль, заходи: ${justLink[1]}\n\nУдачи в дуэли!`)
                        
                        const file = await fs.readFile('files/duelsInfo.txt', 'utf-8')

                        const newDuel = `${array[1]}/${callbackInfo.from.id} `
                        const newData = file + newDuel

                        await fs.writeFile('files/duelsInfo.txt', newData)

                        const fileWithLinks = await fs.readFile('files/linksToDuels.txt', 'utf-8')

                        const linksArray = fileWithLinks.split(' ')
                        linksArray.pop()

                        const correctLink1 = linksArray.findIndex(el => {
                            const id = el.split('(*)')[0]
                            return +array[1] === +id
                        })

                        if (correctLink1 || correctLink1 === 0) {
                            linksArray.splice(correctLink, 1)
                        }

                        const newData2 = linksArray.join(' ')

                        await fs.writeFile('files/linksToDuels.txt', newData2)
            
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

        if (array[0] === 'notCorrectAccount') {
            ctx.telegram.deleteMessage(callbackInfo.from.id, ctx.session.foundedAccountId)
            ctx.telegram.sendMessage(callbackInfo.from.id, 'Окей, пришли новый тег или ссылку на добавление в друзья:')

            ctx.session.linkingAccount = true
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
        ctx.session.linkingAccount = false

        let accountTag = messageInfo.text.toUpperCase()

        if (messageInfo.text.includes('https://link.brawlstars.com/invite/friend/')) {
            const tag = messageInfo.text.split('tag=')
            const finalTag = tag[1].split('&')

            accountTag = finalTag[0];
        }

        if (!messageInfo.text.startsWith('#')) {
            accountTag = '#' + accountTag
        }

        ctx.session.accountTag = accountTag

        let playerInfo = null

        try {
            playerInfo = await client.getPlayer(accountTag)
        } catch (e) {
            console.error('Player info error', e)
        }

        if (!playerInfo) {
            await ctx.telegram.sendMessage(messageInfo.from.id, 'Не получилось найти такой аккаунт. Давай по новой, Миша, всё фигня...\n\nПришли новый тег или ссылку на добавление в друзья:', {
                parse_mode: 'Markdown',
            })

            ctx.session.linkingAccount = true
        } else {
            ctx.session.linkingAccount = false

            const startNickColor = playerInfo.nameColor

            ctx.session.startNickColor = startNickColor

            if (startNickColor) {
                const foundedAccount = await ctx.telegram.sendMessage(messageInfo.from.id, `*Я нашел аккаунт:*\n\nТег: *${playerInfo.tag}*\nНик: *${playerInfo.name}*\nКоличество кубков: *${playerInfo.trophies}*\nУровень: *${playerInfo.expLevel}*\n\nВсё верно, это ты?`, {
                    parse_mode: 'Markdown',
                    reply_markup: { inline_keyboard: correctAccount },
                })

                ctx.session.foundedAccountId = foundedAccount.message_id

                return
            }
        }
    } else {
        if (messageInfo.text === '🎯 Создать дуэль') {
            const file = await fs.readFile('files/verifyPlayers.txt', 'utf-8')

            const verifyPLayers = file.split('&()&')
            verifyPLayers.pop()

            const wasVerify = verifyPLayers.find(el => {
                const Id = el.split('/')[0]
                        
                return messageInfo.from.id === +Id
            })

            if (wasVerify) {
                ctx.telegram.sendMessage(messageInfo.from.id, 'Создай в игре дружеское лобби и пришли сюда ссылку на вступление в него:')
            }

            ctx.session.link = true

            return
        }

        if (messageInfo.text === '📝 История дуэлей') {
            const file = await fs.readFile('files/battleHistory.txt', 'utf-8')

            const battlesArray = file.split(' ')
            battlesArray.pop()

            const correctBattles = battlesArray.filter( el => el.includes(messageInfo.from.id) )

            const finalCorrectBattlesArray = correctBattles.slice(0, 5)

            let message = `*Список последних сыгранных дуэлей:*\n\n`
            let number = 1

            finalCorrectBattlesArray.forEach(async (el, elIndex) => {
                const elements = el.split('/')

                const fileWithVerifyPlayers = await fs.readFile('files/verifyPlayers.txt', 'utf-8')

                const verifyPLayers = fileWithVerifyPlayers.split('&()&')
                verifyPLayers.pop()

                const wasVerify1 = verifyPLayers.find(el => {
                    const id = el.split('/')[0]
                        
                    return +elements[0] === +id
                })

                const wasVerify2 = verifyPLayers.find(el => {
                    const id = el.split('/')[0]
                    return +elements[1] === +id
                })

                let obj1 = wasVerify1.split('/')[1]
                let obj2 = wasVerify2.split('/')[1]

                obj1 = JSON.parse(obj1)
                obj2 = JSON.parse(obj2)

                const winner = elements[2] === '1' ? obj1 : obj2

                message = message + `${number}. [${obj1.name}](tg://user?id=${elements[0]}) vs [${obj2.name}](tg://user?id=${elements[1]}) – победил ${winner.name}\n\n`
                number = number + 1

                if (finalCorrectBattlesArray.length - 1 === elIndex) {
                    await ctx.telegram.sendMessage(messageInfo.from.id, message, {
                        parse_mode: 'Markdown',
                    })
                }
            })
        }

        if (ctx.session.link) {
            let link1 = messageInfo.text

            if (messageInfo.text.includes('https://link.brawlstars.com/invite/gameroom/ru?tag=') && !link1.startsWith('https://link.brawlstars.com/invite/gameroom/ru?tag=')) {
                const link = messageInfo.text.split('! ')
                const finalLink = link[1]

                link1 = finalLink
            }

            if (link1.startsWith('https://link.brawlstars.com/invite/gameroom/ru?tag=')) {
                const file = await fs.readFile('files/creators.txt', 'utf-8')
        
                const creatorsArray = file.split(' ')
                creatorsArray.pop()
        
                const correctCreator = creatorsArray.find(el => messageInfo.from.id === +el)

                if (!correctCreator) {
                    const file = await fs.readFile('files/creators.txt', 'utf-8')

                    const newData = file + `${messageInfo.from.id} `

                    await fs.writeFile('files/creators.txt', newData)

                    ctx.telegram.sendMessage(
                        messageInfo.from.id,
                        'Дуэль создана!\n\nТеперь ты можешь отправить её в любой чат в Телеграме. Для этого просто введи _@BrawlDuelsBot_ в любом чате и и выбери нужный пункт в открывшемся меню',
                        {
                            parse_mode: 'Markdown',
                        }
                    )
 
                    const file1 = await fs.readFile('files/linksToDuels.txt', 'utf-8')

                    const newData1 = file1 + `${messageInfo.from.id}(*)${link1} `

                    await fs.writeFile('files/linksToDuels.txt', newData1)

                    ctx.session.link = false
                }
            } else {
                ctx.telegram.sendMessage(messageInfo.from.id, 'Неверная ссылка! Введите ccылку заново:')

                ctx.session.link = true
            }

            return
        }
    }
})

bot.launch()

module.exports = {
    bot,
    client,
}