import type {CanvasSubmission, ScoreStatistic} from '@canvas-capture-v2/canvas-capture-common'


const percentile = (scores: number[], n: number) => {
    if (scores.length === 0 || n > 1 || n < 0) {
        return -1
    }
    const pos = (scores.length - 1) * n
    const ind = Math.floor(pos)
    const rem = pos - ind
    if (scores[ind + 1] !== undefined) {
        return scores[ind] + (rem * (scores[ind + 1] - scores[ind]))
    }
    return scores[ind]
}

export const get_grade_stats = (submissions: CanvasSubmission[]): ScoreStatistic => {
    if (submissions === undefined || submissions === null || submissions.length === 0) {
        return
    }
    const score_stats: ScoreStatistic = {
        min: 1000000,
        max: -1,
        mean: 0,
        upper_q: -1,
        median: -1,
        lower_q: -1
    }
    const scores: number[] = []
    submissions.map((submission) => {
        if (submission.score !== undefined) {
            scores.push(submission.score)
            score_stats.mean += submission.score
            if (submission.score < score_stats.min) {
                score_stats.min = submission.score
            }
            if (submission.score > score_stats.max) {
                score_stats.max = submission.score
            }
        }
    })
    if (scores.length === 0) {
        return score_stats
    }
    const sorted = scores.slice().sort()
    score_stats.upper_q = percentile(sorted, 0.75)
    score_stats.lower_q = percentile(sorted, 0.25)
    if (scores.length % 2 === 0) {
        score_stats.median = (sorted[(sorted.length / 2) - 1] + sorted[sorted.length / 2]) / 2
    } else {
        score_stats.median = sorted[Math.floor(sorted.length / 2)]
    }
    return score_stats
}