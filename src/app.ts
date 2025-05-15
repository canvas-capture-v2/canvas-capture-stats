import express from 'express'
import {get_grade_stats} from "./grade-stats.js";
import {get_date_stats} from "./date-stats.js";
import cors from 'cors';

const app = express()

app.use(express.json())
app.use(cors())


// @ts-ignore
app.post('/stats/both', async (req, res) => {
    if (req.body !== undefined && req.body !== null) {
        const body = await req.body
        const assignments = body.assignments
        const submissions = body.submissions
        const start_date = body.start_date
        const end_date = body.end_date
        const result = {
            score_statistics: get_grade_stats(submissions),
            date_statistics: get_date_stats(assignments, submissions, start_date, end_date)
        }
        return res.status(200).json(JSON.stringify(result))
    }
    return res.status(400).json()
})

// @ts-ignore
app.post('/stats/score', async (req, res) => {
    if (req.body !== undefined && req.body !== null) {
        const body = await req.body
        return res.status(200).json(JSON.stringify({score_statistics: get_grade_stats(body.submissions)}))
    }
})

console.log('Listening on 4002')
app.listen(4002)