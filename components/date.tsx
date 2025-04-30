
import { parseISO, format } from 'date-fns';
 
export default function Date({ date } : { date: Date }) {
  return <time>{format(date, 'LLLL d, yyyy HH:mm')}</time>;
}