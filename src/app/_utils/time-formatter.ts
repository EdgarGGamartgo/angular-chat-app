import { format, parseISO } from 'date-fns'

export const formatTime = (datetime: string): string => {
    return format(parseISO(datetime), "LLL d, HH:mm")
}