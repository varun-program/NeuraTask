const scheduleTasks = (tasks) => {

    const priorityOrder = {
        high: 1,
        medium: 2,
        low: 3
    }

    const sortedTasks = tasks.sort((a, b) => {
        return priorityOrder[a.priority] - priorityOrder[b.priority]
    })

    let currentHour = 9

    const scheduled = sortedTasks.map(task => {
        const start = currentHour
        const end = currentHour + 1
        currentHour++

        return {
            ...task._doc,
            scheduledTime: `${start}:00 - ${end}:00`
        }
    })

    return scheduled
}

module.exports = scheduleTasks