export default function MultilineText({ texts, className }: { texts: string[], className: string }) {
  return (
    <div className={`${className} flex flex-col md:flex-row`}>
      {texts.map((text, index) => (
        <div key={`${texts.join("")}-${text}`}>
          <span className="mr-1">{(index === texts.length - 1) ? text : `${text} -`}</span>
        </div>
      ))}
    </div>
  )
}
