import { cardClass } from './ui'

export default function LoadingCard({ label = 'Loading ShowUp2Move...' }) {
    return (
        <div className={`${cardClass} px-6 py-12 text-center text-sm text-slate-600`}>
            {label}
        </div>
    )
}
