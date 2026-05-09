export default function NoticeBanner({ notice, errorMessage }) {
    if (!notice && !errorMessage) {
        return null
    }

    const isError = Boolean(errorMessage)

    return (
        <div
            className={`rounded-2xl px-4 py-3 text-sm font-medium ${isError ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                }`}
        >
            {errorMessage || notice}
        </div>
    )
}
