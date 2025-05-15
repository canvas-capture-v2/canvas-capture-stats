import type {CanvasAssignment, CanvasSubmission, DateStatistics} from "@canvas-capture-v2/canvas-capture-common";
import {add_time_strings, divide_time_strings, millis_to_time_string} from '@canvas-capture-v2/canvas-capture-common'

export const num_assignments_due_per_day = (assignments: CanvasAssignment[], start_date: Date, end_date: Date): number => {
    let num_assignments_due_per_day = 0
    let num_days = (((((new Date(end_date).getTime() - new Date(start_date).getDay()) / 1000) / 60) / 60) / 24)
    for (let i = 0; i < num_days; i++) {
        assignments.map((canvas_assignment) => {
            if (canvas_assignment.due_at !== undefined && canvas_assignment.due_at !== null) {
                if (canvas_assignment.unlock_at !== undefined && canvas_assignment.unlock_at !== null) {
                    if (new Date(canvas_assignment.unlock_at).getTime() > new Date(start_date).getTime() && new Date(end_date).getTime() > new Date(canvas_assignment.due_at).getTime()) {
                        num_assignments_due_per_day += 1
                    }
                } else if (new Date(canvas_assignment.created_at).getTime() > new Date(start_date).getTime() && new Date(end_date).getTime() > new Date(canvas_assignment.due_at).getTime()) {
                    num_assignments_due_per_day += 1
                }
            }
        })
    }
    return num_assignments_due_per_day
}

export const get_date_stats = (assignments: CanvasAssignment[], submissions: CanvasSubmission[], start_date: Date, end_date: Date) => {
    const date_stats: DateStatistics = {
        avg_num_assignments_due_per_day: 0,
        avg_time_assigned_to_due: "0 D 0 H 0 M 0 S 0 Ms",
        avg_time_last_past_due: "0 D 0 H 0 M 0 S 0 Ms",
        avg_time_last_to_grade: "0 D 0 H 0 M 0 S 0 Ms",
        avg_num_late: 0,
        avg_submissions: 0
    }
    if (assignments.length === 0 && submissions.length === 0) {
        return date_stats
    }
    if (submissions.length === 0) {
        date_stats.avg_num_late = num_assignments_due_per_day(assignments, start_date, end_date)
        return date_stats
    }
    assignments.map((assignment) => {
        const assignment_submissions = submissions.filter(submission => submission.assignment_id === assignment.id)
        if (assignment_submissions.length > 0) {
            let time_assigned_to_due = '0 D 0 H 0 M 0 S 0 Ms'
            let time_last_past_due = '0 D 0 H 0 M 0 S 0 Ms'
            let time_last_to_grade = '0 D 0 H 0 M 0 S 0 Ms'
            let latest_submission: CanvasSubmission = assignment_submissions[0]
            assignment_submissions.map((submission) => {
                date_stats.avg_num_late += submission.late || submission.missing || submission.excused ? 1 : 0
                date_stats.avg_submissions += 1
                if (submission.seconds_late > latest_submission.seconds_late) {
                    latest_submission = submission
                }
            })
            time_last_past_due = add_time_strings(time_last_past_due, millis_to_time_string(latest_submission.seconds_late * 1000))
            if (assignment.due_at !== undefined && assignment.due_at !== null) {
                if (assignment.unlock_at !== undefined && assignment.unlock_at !== null) {
                    time_assigned_to_due = millis_to_time_string(new Date(assignment.due_at).getTime() - new Date(assignment.unlock_at).getTime())
                } else {
                    time_assigned_to_due = millis_to_time_string(new Date(assignment.due_at).getTime() - new Date(assignment.created_at).getTime())
                }
                if (latest_submission && latest_submission.graded_at !== undefined && latest_submission.graded_at !== null) {
                    time_last_to_grade = millis_to_time_string(new Date(latest_submission.graded_at).getTime() - new Date(assignment.due_at).getTime())
                }
            }

            date_stats.avg_time_assigned_to_due = add_time_strings(date_stats.avg_time_assigned_to_due, time_assigned_to_due)
            date_stats.avg_time_last_past_due = add_time_strings(date_stats.avg_time_last_past_due, time_last_past_due)
            date_stats.avg_time_last_to_grade = add_time_strings(date_stats.avg_time_last_to_grade, time_last_to_grade)
        }
    })

    date_stats.avg_time_assigned_to_due = divide_time_strings(date_stats.avg_time_assigned_to_due, submissions.length)
    date_stats.avg_time_last_past_due = divide_time_strings(date_stats.avg_time_last_past_due, submissions.length)
    date_stats.avg_time_last_to_grade = divide_time_strings(date_stats.avg_time_last_to_grade, submissions.length)

    date_stats.avg_num_late = date_stats.avg_num_late / assignments.length
    date_stats.avg_submissions = date_stats.avg_submissions / submissions.length

    return date_stats
}