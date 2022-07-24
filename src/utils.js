function getDate() {
    const date = new Date()

    let day = date.getDate()

    if (day <= 9) {
        day = '0' + day
    }

    let month = date.getMonth() + 1

    if (month <= 9) {
        month = '0' + month
    }

    const year = date.getFullYear()

    return `${day}.${month}.${year}`
}

function getTime() {
    const date = new Date()

    let hour = date.getHours()

    if (hour <= 9) {
        hour = '0' + hour
    }

    let minute = date.getMinutes()

    if (minute <= 9) {
        minute = '0' + minute
    }

    return `${hour}:${minute}`
}

module.exports = {
    getDate,
    getTime,
}